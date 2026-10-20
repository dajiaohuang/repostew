import {readFileSync, existsSync, realpathSync} from 'node:fs';
import {join, resolve, relative, isAbsolute, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {projectKey} from './config.mjs';
import {policyDocument} from './policy.mjs';

const normalize=s=>s.replace(/\.git$/i,'').toLowerCase();
export function identities(text,{host='github.com'}={}) {
  const values=new Set();
  for(const m of text.matchAll(/^\s*-\s+([\w.-]+(?:\/[\w.-]+)+)\s*$/gm))values.add(normalize(m[1]));
  for(const m of text.matchAll(/`([\w.-]+(?:\/[\w.-]+)+)`/g))values.add(normalize(m[1]));
  for(const m of text.matchAll(/https:\/\/[^\s`<>)]+/g)) {
    let url;
    try{url=new URL(m[0]);}catch{continue;}
    if(url.hostname.toLowerCase()!==host.toLowerCase())continue;
    const parts=url.pathname.replace(/^\/|\/$/g,'').split('/');
    const identity=host==='github.com'?parts.slice(0,2).join('/'):parts.slice(0,parts.indexOf('-')<0?undefined:parts.indexOf('-')).join('/');
    if(/^[\w.-]+(?:\/[\w.-]+)+$/.test(identity))values.add(normalize(identity));
  }
  return values;
}
export function exclusions(text) {
  const owners=new Set([...text.split('## GitHub App')[0].matchAll(/https:\/\/github\.com\/([\w-]+)\)/g)].map(m=>m[1].toLowerCase()));
  return {owners,repos:identities(text)};
}
const indexes=['old-repositories.md','followed-repositories.md','maintained-repositories.md','unfinished.md','excluded-targets.md'];
function currentExclusions(workspace,options) {
  return exclusions(policyDocument({workspace,...options},'references/forges/github/exclusions/agentscan.md').text);
}
export function checkProjectExclusion(config,project) {
  if(project.host.toLowerCase()!=='github.com')return {ok:true};
  const excluded=currentExclusions(config.workspace,config);
  const name=`${project.namespace}/${project.repo}`.toLowerCase();
  return excluded.owners.has(project.namespace.toLowerCase())||excluded.repos.has(name)
    ? {ok:false,reason:'Current exact AgentScan exclusion'}:{ok:true};
}
function readObserved(workspace,path) {
  const root=realpathSync(workspace),file=realpathSync(resolve(root,path)),delta=relative(root,file);
  if(isAbsolute(delta)||delta==='..'||delta.startsWith(`..${sep}`))throw new Error('Observed metadata path escapes workspace');
  return readFileSync(file);
}
export function buildSnapshot(workspace,{host='github.com',observedPaths=[],...options}={}) {
  const provenance=[];
  const read=path=>{
    const bytes=readObserved(workspace,path);
    provenance.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    return bytes.toString('utf8');
  };
  const current=[...identities(read('state/new-repositories.md'),{host})];
  const excluded=host==='github.com'?currentExclusions(workspace,options):{owners:new Set(),repos:new Set()};
  const other=new Set();
  for(const file of indexes)if(existsSync(join(workspace,'state',file))) {
    for(const name of identities(read(`state/${file}`),{host}))other.add(name);
  }
  // Only caller-selected metadata files are read. No dated private campaign
  // directories, hard-coded project identities, or recursive state traversal.
  const observed=new Set();
  for(const path of observedPaths)for(const name of identities(read(path),{host}))observed.add(name);
  const counts={current:current.length,excluded:0,otherMembership:0,observed:0,existingRoot:0,eligible:0};
  const candidates=[];
  for(const name of current) {
    const parts=name.split('/'),repo=parts.pop(),namespace=parts.join('/');
    if(excluded.owners.has(namespace)||excluded.repos.has(name)){counts.excluded++;continue;}
    if(other.has(name)){counts.otherMembership++;continue;}
    if(observed.has(name)){counts.observed++;continue;}
    const project={host,namespace,repo};
    try{projectKey(project);}catch{counts.excluded++;continue;}
    if(existsSync(join(workspace,'state/repositories',projectKey(project)))){counts.existingRoot++;continue;}
    candidates.push({project,evidence:'Current new-list member; no native project root, other membership, explicitly supplied observation or exact exclusion at snapshot. Native identity, target policy and suitability remain checks before engineering/publication.'});
  }
  const docs=/awesome|bookmarks|cheatsheet|roadmap|(?:^|-)list(?:-|$)|(?:^|-)resources(?:-|$)/i;
  candidates.sort((a,b)=>Number(docs.test(a.project.repo))-Number(docs.test(b.project.repo))||`${a.project.namespace}/${a.project.repo}`.localeCompare(`${b.project.namespace}/${b.project.repo}`));
  counts.eligible=candidates.length;
  return {createdAt:new Date().toISOString(),counts,provenance,candidates};
}
export function checkFreshEligibility(workspace,project,options={}) {
  const name=`${project.namespace}/${project.repo}`.toLowerCase();
  const current=identities(readFileSync(join(workspace,'state/new-repositories.md'),'utf8'),{host:project.host});
  if(!current.has(name))return {ok:false,reason:'No longer in authoritative new-list membership'};
  const exclusion=checkProjectExclusion({workspace,...options},project);
  if(!exclusion.ok)return exclusion;
  for(const file of indexes) {
    const path=join(workspace,'state',file);
    if(existsSync(path)&&identities(readFileSync(path,'utf8'),{host:project.host}).has(name))return {ok:false,reason:`Current ${file} membership/record`};
  }
  if(existsSync(join(workspace,'state/repositories',projectKey(project))))return {ok:false,reason:'Native project root now exists; touched/writer collision'};
  return {ok:true};
}
