import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { projectKey, invariant } from './config.mjs';
const execute=promisify(execFile);
async function get(path) {
  try {
    const {stdout}=await execute('gh',['api','--method','GET',path],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true});
    return {ok:true,data:JSON.parse(stdout)};
  } catch(e) {
    const text=String(e.stderr??'');const status=Number(text.match(/HTTP\s+(\d{3})/)?.[1])||undefined;
    return {ok:false,status,category:status===403||status===429?'forge-access-or-rate-gate':status===404?'not-found':e.killed?'timeout':'execution-error'};
  }
}
function actor(a){return a?{login:a.login,type:a.type}:null;}
function textContent(data) {
  if(data?.encoding!=='base64'||typeof data.content!=='string')return undefined;
  const text=Buffer.from(data.content,'base64').toString('utf8');
  return {text:text.slice(0,20000),truncated:text.length>20000,sha:data.sha,path:data.path,htmlUrl:data.html_url};
}
export async function inspectRepository(project) {
  projectKey(project);invariant(project.host==='github.com','Initial C1 admission supports github.com only');
  const name=`${project.namespace}/${project.repo}`;const endpoint=`repos/${name}`;
  const metadata=await get(endpoint);if(!metadata.ok)return {requested:name,at:new Date().toISOString(),failure:metadata};
  const r=metadata.data;
  const result={requested:name,at:new Date().toISOString(),repository:{id:r.id,fullName:r.full_name,private:r.private,archived:r.archived,disabled:r.disabled,fork:r.fork,defaultBranch:r.default_branch,pushedAt:r.pushed_at,updatedAt:r.updated_at,license:r.license?.spdx_id??null,description:r.description,htmlUrl:r.html_url}};
  if(r.private||r.archived||r.disabled)return result;
  if(r.full_name.toLowerCase()!==name.toLowerCase()){result.nativeIdentityChanged=true;return result;}
  // Sequential, finite, read-only admission. A failed gate stops this batch; no
  // guessed alternate account, endpoint, or source is used to probe the limit.
  const calls=[['community',`${endpoint}/community/profile`],['commits',`${endpoint}/commits?per_page=5`],['pulls',`${endpoint}/pulls?state=closed&sort=updated&direction=desc&per_page=5`]];
  for(const [kind,path]of calls){
    const response=await get(path);
    if(!response.ok){result[`${kind}Failure`]=response;if(response.category==='forge-access-or-rate-gate'){result.failure=response;break;}continue;}
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
      if(response.ok)result[kind]=textContent(response.data);else{result[`${kind}Failure`]=response;if(response.category==='forge-access-or-rate-gate')result.failure=response;}
    }
  }
  return result;
}
