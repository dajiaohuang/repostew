import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { projectKey, invariant } from './config.mjs';
const execute=promisify(execFile);
export function forgeKind(project,config={}) {
  if(project.host==='github.com')return 'github';
  if(project.host==='gitlab.com')return 'gitlab';
  const kind=config.forges?.[project.host];
  invariant(['github','gitlab'].includes(kind),'Configure this forge host or use its authorized native interface');
  return kind;
}
export function forgeFailure(error) {
  const text=String(error.stderr??'')+'\n'+String(error.stdout??'');
  const status=Number(text.match(/(?:HTTP(?:\/[\d.]+)?\s*|status(?: code)?[: ]+)(\d{3})/i)?.[1]??text.match(/\b(401|403|404|429)\s+(?:Unauthorized|Forbidden|Not Found|Too Many Requests)\b/i)?.[1])||undefined;
  const rate=status===429||status===403&&/rate.limit|secondary.rate|abuse.detection/i.test(text);
  const authentication=status===401;
  return {ok:false,status,
    category:rate?'forge-rate-gate':authentication?'forge-auth-gate':status===403?'forge-access-gate':status===404?'not-found':error.killed?'timeout':error.code==='ENOENT'?'missing-cli':'execution-error',
    ...(rate||authentication?{scope:'host'}:status===403?{scope:'project'}:{})};
}
export async function forgeGet(project,path,config={}) {
  const kind=forgeKind(project,config),cli=kind==='gitlab'?'glab':'gh';
  try {
    const {stdout}=await (config.execute??execute)('rtk',['proxy',cli,'api','--hostname',project.host,'--method','GET',path],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true});
    return {ok:true,data:JSON.parse(stdout)};
  } catch(e) {
    return forgeFailure(e);
  }
}
function actor(a){return a?{login:a.login,type:a.type}:null;}
function textContent(data) {
  if(data?.encoding!=='base64'||typeof data.content!=='string')return undefined;
  const text=Buffer.from(data.content,'base64').toString('utf8');
  return {text:text.slice(0,20000),truncated:text.length>20000,sha:data.sha,path:data.path,htmlUrl:data.html_url};
}
export async function inspectRepository(project,config={}) {
  projectKey(project);
  const get=path=>forgeGet(project,path,config);
  if(forgeKind(project,config)==='gitlab')return inspectGitLab(project,get);
  const name=`${project.namespace}/${project.repo}`;const endpoint=`repos/${name}`;
  const metadata=await get(endpoint);if(!metadata.ok)return {requested:name,at:new Date().toISOString(),failure:metadata};
  const r=metadata.data;
  const result={requested:name,at:new Date().toISOString(),repository:{id:r.id,fullName:r.full_name,private:r.private,archived:r.archived,disabled:r.disabled,fork:r.fork,defaultBranch:r.default_branch,pushedAt:r.pushed_at,updatedAt:r.updated_at,license:r.license?.spdx_id??null,description:r.description,htmlUrl:r.html_url,permissions:r.permissions,contributionAccess:'Operation-specific. Upstream push=false does not decide fork, PR or comment capability.'}};
  if(r.private||r.archived||r.disabled)return result;
  if(r.full_name.toLowerCase()!==name.toLowerCase()){result.nativeIdentityChanged=true;return result;}
  // Sequential, finite, read-only admission. A failed gate stops this batch; no
  // guessed alternate account, endpoint, or source is used to probe the limit.
  const calls=[['community',`${endpoint}/community/profile`],['commits',`${endpoint}/commits?per_page=5`],['pulls',`${endpoint}/pulls?state=closed&sort=updated&direction=desc&per_page=5`]];
  for(const [kind,path]of calls){
    const response=await get(path);
    if(!response.ok){result[`${kind}Failure`]=response;if(response.scope){result.failure=response;break;}continue;}
    const d=response.data;
    if(kind==='community')result.community={healthPercentage:d.health_percentage,files:d.files};
    if(kind==='commits')result.commits=d.map(x=>({sha:x.sha,date:x.commit?.committer?.date,subject:x.commit?.message?.split('\n')[0],author:actor(x.author),committer:actor(x.committer),htmlUrl:x.html_url}));
    if(kind==='pulls')result.recentClosedPulls=d.map(x=>({number:x.number,title:x.title,updatedAt:x.updated_at,mergedAt:x.merged_at,author:actor(x.user),htmlUrl:x.html_url}));
  }
  for(const kind of ['readme','contributing']) {
    const url=result.community?.files?.[kind]?.url;
    if(result.failure||!url)continue;
    const parsed=new URL(url);
    if(parsed.hostname==='api.github.com'&&parsed.pathname.toLowerCase().startsWith(`/${endpoint}/contents/`.toLowerCase())){
      const response=await get(parsed.pathname.slice(1)+parsed.search);
      if(response.ok)result[kind]=textContent(response.data);else{result[`${kind}Failure`]=response;if(response.scope)result.failure=response;}
    }
  }
  return result;
}

async function inspectGitLab(project,get) {
  const name=`${project.namespace}/${project.repo}`,endpoint=`projects/${encodeURIComponent(name)}`;
  const metadata=await get(endpoint);
  if(!metadata.ok)return {requested:name,at:new Date().toISOString(),failure:metadata};
  const r=metadata.data;
  const result={requested:name,at:new Date().toISOString(),repository:{
    id:r.id,fullName:r.path_with_namespace,private:r.visibility==='private',archived:r.archived,disabled:false,
    fork:!!r.forked_from_project,defaultBranch:r.default_branch,updatedAt:r.last_activity_at,
    description:r.description,htmlUrl:r.web_url,permissions:r.permissions,
    contributionAccess:'Evaluate the requested operation on this project; read access is not blanket write denial.',
  }};
  if(r.path_with_namespace?.toLowerCase()!==name.toLowerCase()){result.nativeIdentityChanged=true;return result;}
  if(result.repository.private||r.archived)return result;
  for(const [key,path] of [
    ['commits',`${endpoint}/repository/commits?per_page=5`],
    ['recentClosedPulls',`${endpoint}/merge_requests?state=closed&order_by=updated_at&sort=desc&per_page=5`],
  ]) {
    const response=await get(path);
    if(!response.ok){result[`${key}Failure`]=response;if(response.scope){result.failure=response;break;}continue;}
    result[key]=key==='commits'
      ? response.data.map(x=>({sha:x.id,date:x.committed_date,subject:x.title,htmlUrl:x.web_url}))
      : response.data.map(x=>({number:x.iid,title:x.title,updatedAt:x.updated_at,mergedAt:x.merged_at,author:x.author?{login:x.author.username}:null,htmlUrl:x.web_url}));
  }
  for(const path of ['README.md','CONTRIBUTING.md']) {
    if(result.failure||!r.default_branch)break;
    const response=await get(`${endpoint}/repository/files/${encodeURIComponent(path)}?ref=${encodeURIComponent(r.default_branch)}`);
    if(response.ok)result[path==='README.md'?'readme':'contributing']=textContent({...response.data,path:response.data.file_path,sha:response.data.blob_id,html_url:r.web_url});
    else if(response.scope)result.failure=response;
  }
  return result;
}

export async function readRepository(project,request,config={}) {
  projectKey(project);
  const kind=forgeKind(project,config),name=`${project.namespace}/${project.repo}`;
  const prefix=kind==='github'?`repos/${name}`:`projects/${encodeURIComponent(name)}`;
  const {operation,page=1,limit=30,number,path,ref}=request;
  invariant(Number.isSafeInteger(page)&&page>=1&&page<=10000,'Page must be 1..10000');
  invariant(Number.isSafeInteger(limit)&&limit>=1&&limit<=100,'Limit must be 1..100');
  const metadata=await forgeGet(project,prefix,config);
  if(!metadata.ok)return {failure:metadata};
  const actual=kind==='github'?metadata.data.full_name:metadata.data.path_with_namespace;
  invariant(actual?.toLowerCase()===name.toLowerCase(),'Native identity changed; reconcile the assigned project first');
  const isPrivate=kind==='github'?metadata.data.private:metadata.data.visibility==='private';
  invariant(!isPrivate||config.allowPrivate,'Private content requires an explicit project assignment');
  const query=new URLSearchParams({page:String(page),per_page:String(limit)});
  let endpoint;
  if(operation==='issues'||operation==='pulls') {
    const resource=operation==='issues'?'issues':kind==='github'?'pulls':'merge_requests';
    query.set('state','all');
    if(kind==='github'){query.set('sort','updated');query.set('direction','desc');}
    else {query.set('order_by','updated_at');query.set('sort','desc');}
    endpoint=`${prefix}/${resource}?${query}`;
  } else if(['issue','pull','issue-comments','pull-comments'].includes(operation)) {
    invariant(Number.isSafeInteger(number)&&number>0,'Native issue/PR/MR number required');
    const isPull=operation.startsWith('pull'),comments=operation.endsWith('comments');
    const resource=kind==='github'?(isPull&&!comments?'pulls':'issues'):(isPull?'merge_requests':'issues');
    endpoint=`${prefix}/${resource}/${number}${comments?`/${kind==='github'?'comments':'notes'}?${query}`:''}`;
  } else if(operation==='file') {
    invariant(typeof path==='string'&&path.length<=1000&&!path.startsWith('/')&&!path.includes('\\')&&!path.split('/').some(p=>p==='..'||p==='.'||p===''),'Exact repository-relative file path required');
    const reference=ref??metadata.data.default_branch;
    invariant(typeof reference==='string'&&reference.length>0,'Repository ref required');
    endpoint=kind==='github'
      ? `${prefix}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(reference)}`
      : `${prefix}/repository/files/${encodeURIComponent(path)}?ref=${encodeURIComponent(reference)}`;
  } else throw new Error('Unsupported read-only repository operation');
  const response=await forgeGet(project,endpoint,config);
  if(!response.ok)return {failure:response};
  return {project:projectKey(project),operation,page,at:new Date().toISOString(),data:response.data,
    ...(Array.isArray(response.data)?{pageFull:response.data.length===limit,nextPage:response.data.length===limit?page+1:null,coverage:'One native page only; follow nextPage before claiming complete capture.'}:{})};
}
