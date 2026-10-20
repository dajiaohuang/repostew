import {readFileSync, mkdirSync, writeFileSync, existsSync, realpathSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {invariant, safeId, within, projectKey} from './config.mjs';
import {forgeGet} from './forge.mjs';

export const sourceKinds=['github-notifications','github-issues','github-repositories','gitlab-issues','gitlab-merge-requests','url','capture-file'];
export function validateSource(source) {
  safeId(source.id,'source id');
  invariant(sourceKinds.includes(source.kind),'Unsupported source kind');
  if(source.kind==='url') {
    const url=new URL(source.url);
    invariant(url.protocol==='https:'&&!url.username&&!url.password,'Source URL must be HTTPS without credentials');
  } else if(source.kind==='capture-file') {
    invariant(typeof source.path==='string'&&source.path.length>0,'Exact captured input path required');
  } else {
    invariant(typeof source.host==='string'&&/^[a-zA-Z0-9.-]+$/.test(source.host),'Exact source host required');
    if(source.kind.startsWith('github-'))invariant(source.host==='github.com','GitHub source adapter currently targets github.com');
    if(['github-issues','github-repositories'].includes(source.kind))invariant(typeof source.query==='string'&&source.query.trim().length>0,'Exact authorized search query required');
    if(source.kind.startsWith('gitlab-')){projectKey(source.project);invariant(source.project.host===source.host,'Source project host must match');}
    if(source.kind==='github-notifications'||source.kind.startsWith('gitlab-')) {
      if(source.windowMs!==undefined)invariant(Number.isSafeInteger(source.windowMs)&&source.windowMs>=60000&&source.windowMs<=90*86400000,'Rolling source window must be 1 minute..90 days');
      else invariant(Number.isFinite(Date.parse(source.since))&&Number.isFinite(Date.parse(source.until))&&Date.parse(source.since)<Date.parse(source.until),'Finite source since/until required');
      invariant(!(source.windowMs!==undefined&&(source.since!==undefined||source.until!==undefined)),'Choose a fixed window or a rolling window');
    }
  }
  return source;
}
export function effectiveSource(source,at) {
  validateSource(source);
  const {windowMs,...fixed}=source;
  return windowMs===undefined?fixed:{...fixed,since:new Date(at-windowMs).toISOString(),until:new Date(at).toISOString()};
}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const idOf=item=>String(item.id??item.node_id??item.iid??item.url??'');
export function processingOrder(items) {
  const unique=new Map();
  for(const item of items) {
    const key=idOf(item);
    invariant(key,'Captured item is missing a native identity');
    const previous=unique.get(key);
    if(!previous||String(item.updated_at??'')>String(previous.updated_at??''))unique.set(key,item);
  }
  return [...unique.values()].sort((a,b)=>String(b.updated_at??'').localeCompare(String(a.updated_at??''))||
    idOf(b).localeCompare(idOf(a),'en',{numeric:true}));
}
export async function captureSourcePage(config,source,{page=1,coordinatorId,pass=0}={},dependencies={}) {
  validateSource(source);safeId(coordinatorId,'source owner');
  invariant(Number.isSafeInteger(page)&&page>=1&&page<=10000,'Source page must be 1..10000');
  const fingerprint=hash(JSON.stringify(source));
  const directory=join(config.runtimeDir,'coordinators',coordinatorId,'captures',source.id,`${pass}-${fingerprint.slice(0,16)}`);
  invariant(within(config.runtimeDir,directory),'Capture directory escapes runtime');
  const receiptPath=join(directory,`page-${page}.receipt.json`);
  if(existsSync(receiptPath)) {
    const receipt=JSON.parse(readFileSync(receiptPath,'utf8'));
    invariant(hash(readFileSync(receipt.rawPath))===receipt.sha256,'Retained source page changed');
    if(receipt.indexPath) {
      const bytes=readFileSync(receipt.indexPath);
      invariant(hash(bytes)===receipt.indexSha256,'Retained processing index changed');
      for(const prior of JSON.parse(bytes).pages)invariant(hash(readFileSync(prior.path))===prior.sha256,'Retained source page changed');
    }
    return {...receipt,reused:true};
  }
  if(page>1) {
    const prior=JSON.parse(readFileSync(join(directory,`page-${page-1}.receipt.json`),'utf8'));
    invariant(prior.nextPage===page,'Capture the exact pending next page before advancing');
  }
  let raw,items=[],complete=false,nextPage=null,limitReached=false,provenance;
  const get=dependencies.get??forgeGet;
  if(source.kind==='capture-file') {
    invariant(page===1,'Captured file is a single supplied snapshot');
    const file=realpathSync(resolve(config.workspace,source.path));
    invariant(within(realpathSync(config.workspace),file),'Captured input must remain in the selected workspace');
    const bytes=readFileSync(file);invariant(bytes.length<=8*1024*1024,'Captured input exceeds 8 MiB; use a bounded supplied batch');
    raw=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));
    invariant(raw.provenance&&typeof raw.provenance==='object'&&Array.isArray(raw.items)&&typeof raw.complete==='boolean','Capture file needs provenance, items and explicit complete');
    for(const [key,value] of Object.entries(source.expectedProvenance??{}))invariant(raw.provenance[key]===value,`Captured source provenance mismatch: ${key}`);
    items=processingOrder(raw.items);complete=raw.complete;
    provenance={...raw.provenance,inputSha256:hash(bytes)};
  } else if(source.kind==='url') {
    invariant(page===1,'A URL source captures only its exact page, not linked pages');
    const response=await (dependencies.fetch??fetch)(source.url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(30000)});
    if(!response.ok)return {sourceId:source.id,page,complete:false,failure:{category:'source-http',status:response.status,scope:'source'}};
    const chunks=[];let length=0;
    for await(const chunk of response.body){length+=chunk.length;invariant(length<=2*1024*1024,'Source page exceeds 2 MiB; select a bounded source');chunks.push(Buffer.from(chunk));}
    raw={url:source.url,text:Buffer.concat(chunks).toString('utf8')};complete=true;
    provenance={url:source.url,coverage:'Exact URL only; linked source expansion requires its own authorized selection.'};
  } else {
    const limit=source.kind==='github-notifications'?50:100;
    const query=new URLSearchParams({per_page:String(limit),page:String(page)});
    let endpoint;
    if(source.kind==='github-notifications') {
      query.set('all','true');query.set('participating','false');query.set('since',source.since);query.set('before',source.until);
      endpoint=`notifications?${query}`;
    } else if(source.kind.startsWith('github-')) {
      query.set('q',source.query);query.set('sort','updated');query.set('order','desc');
      endpoint=`search/${source.kind==='github-issues'?'issues':'repositories'}?${query}`;
    } else {
      query.set('state','all');query.set('order_by','updated_at');query.set('sort','desc');
      query.set('updated_after',source.since);query.set('updated_before',source.until);
      endpoint=`projects/${encodeURIComponent(`${source.project.namespace}/${source.project.repo}`)}/${source.kind==='gitlab-issues'?'issues':'merge_requests'}?${query}`;
    }
    const response=await get({host:source.host},endpoint,config);
    if(!response.ok)return {sourceId:source.id,page,complete:false,failure:response};
    raw=response.data;
    const values=Array.isArray(raw)?raw:raw.items;
    invariant(Array.isArray(values),'Unexpected native source page');
    items=processingOrder(values);
    const capped=!Array.isArray(raw)&&(raw.incomplete_results===true||raw.total_count>1000);
    limitReached=capped;
    const more=values.length===limit&&(Array.isArray(raw)||page*limit<Math.min(raw.total_count,1000));
    nextPage=more?page+1:null;
    complete=!more&&!capped;
    provenance={host:source.host,endpoint,window:source.since?{since:source.since,until:source.until}:undefined,
      totalCount:raw.total_count,incompleteResults:raw.incomplete_results};
  }
  const rawBytes=Buffer.from(JSON.stringify(raw));
  const rawPath=join(directory,`page-${page}-${hash(rawBytes).slice(0,16)}.json`);
  invariant(!dependencies.shouldStop?.(),'Source capture stopped before persistence');
  mkdirSync(directory,{recursive:true});
  if(!existsSync(rawPath))writeFileSync(rawPath,rawBytes,{flag:'wx',mode:0o600});
  // Preserve complete source bytes locally. Only metadata and input references
  // are returned to the orchestration database/event stream.
  const result={sourceId:source.id,page,capturedAt:new Date().toISOString(),rawPath,sha256:hash(rawBytes),count:items.length,
    processingIds:items.map(idOf),complete,nextPage,limitReached,provenance,
    coverage:'Capture is not handling. A terminal page completes the window only after every preceding page is retained; capped/incomplete searches remain incomplete.'};
  if(nextPage===null&&source.kind!=='url') {
    const all=[...items],pages=[];
    for(let n=1;n<page;n++) {
      const prior=JSON.parse(readFileSync(join(directory,`page-${n}.receipt.json`),'utf8'));
      const bytes=readFileSync(prior.rawPath);
      invariant(hash(bytes)===prior.sha256,'Retained source page changed');
      const parsed=JSON.parse(bytes);all.push(...(Array.isArray(parsed)?parsed:parsed.items));
      pages.push({page:n,path:prior.rawPath,sha256:prior.sha256});
    }
    pages.push({page,path:rawPath,sha256:result.sha256});
    const ordered=processingOrder(all);
    const index={sourceId:source.id,complete,pages,order:ordered.map(x=>({id:idOf(x),updatedAt:x.updated_at??null})),provenance};
    const bytes=Buffer.from(JSON.stringify(index)),indexPath=join(directory,`processing-${hash(bytes).slice(0,16)}.json`);
    if(!existsSync(indexPath))writeFileSync(indexPath,bytes,{flag:'wx',mode:0o600});
    result.indexPath=indexPath;result.indexSha256=hash(bytes);result.uniqueCount=ordered.length;
  }
  writeFileSync(receiptPath,JSON.stringify(result),{flag:'wx',mode:0o600});
  return result;
}
