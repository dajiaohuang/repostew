import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { projectKey } from './config.mjs';

const normalize=s=>s.replace(/\.git$/i,'').toLowerCase();
export function identities(text) {
  const values=new Set();
  for(const m of text.matchAll(/^\s*-\s+(?:https:\/\/github\.com\/)?([\w.-]+\/[\w.-]+)\s*$/gm))values.add(normalize(m[1]));
  for(const m of text.matchAll(/https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/g))values.add(normalize(m[1]));
  for(const m of text.matchAll(/`([\w.-]+\/[\w.-]+)`/g))values.add(normalize(m[1]));
  return values;
}
export function exclusions(text) {
  const owners=new Set([...text.split('## GitHub App')[0].matchAll(/https:\/\/github\.com\/([\w-]+)\)/g)].map(m=>m[1].toLowerCase()));
  return {owners,repos:identities(text)};
}
const indexes=['old-repositories.md','followed-repositories.md','maintained-repositories.md','unfinished.md','excluded-targets.md'];
const observedFiles=[
  'state/local-resources/c1-replacement-delivery-split-20261017/seen-native.md',
  'state/local-resources/c1-selection-screen-20261017/screen.md',
  'state/local-resources/coordinator-renewal-20261018/c1-summary.md',
  'state/local-resources/coordinator-renewal-20261018/c6-summary.md',
  'state/local-resources/coordinator-renewal-20261018/stop-and-allocation.md',
  'state/local-resources/coordinator-renewal-20261018/praisonai-direct.md',
  'state/discovered-repositories.md',
];
const manifestDirs=[
  'state/local-resources/c1-parallel-fill-20261017',
  'state/local-resources/c6-awesome-20261017',
];
function jsonIdentities(value,seen) {
  if(typeof value==='string') {
    if(/^[\w.-]+\/[\w.-]+$/.test(value))seen.add(normalize(value));
    return;
  }
  if(value&&typeof value==='object')for(const [key,v]of Object.entries(value)){
    if(/^[\w.-]+\/[\w.-]+$/.test(key))seen.add(normalize(key));
    // Exact identity fields and arrays; never parse arbitrary captured source bodies.
    if(Array.isArray(value)||['requested','native','nameWithOwner','identity','name','repo','repository','fullname','full_name','candidates','items','selected','prepared','data'].includes(key)||typeof v==='object')jsonIdentities(v,seen);
  }
}
export function buildSnapshot(workspace) {
  const provenance=[];const read=path=>{
    const bytes=readFileSync(join(workspace,path));provenance.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});return bytes.toString('utf8');
  };
  const current=[...identities(read('state/new-repositories.md'))];
  const excluded=exclusions(read('RepoStew_skills/references/forges/github/exclusions/agentscan.md'));
  const other=new Set();for(const file of indexes)if(existsSync(join(workspace,'state',file)))for(const name of identities(read(`state/${file}`)))other.add(name);
  const observed=new Set(['mervinpraison/praisonai']);
  for(const file of observedFiles)if(existsSync(join(workspace,file)))for(const name of identities(read(file)))observed.add(name);
  for(const dir of manifestDirs)if(existsSync(join(workspace,dir))) {
    // Only these two named, first-level metadata directories. No state Markdown crawl.
    for(const entry of readdirSync(join(workspace,dir),{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.json')&&!entry.name.endsWith('.request.json')&&!entry.name.endsWith('.result.json')){
      const path=`${dir}/${entry.name}`;const text=read(path);jsonIdentities(JSON.parse(text),observed);
    }
  }
  const counts={current:current.length,excluded:0,otherMembership:0,observed:0,existingRoot:0,eligible:0};
  const candidates=[];
  for(const name of current){
    const [namespace,repo]=name.split('/');
    if(excluded.owners.has(namespace)||excluded.repos.has(name)){counts.excluded++;continue;}
    if(other.has(name)){counts.otherMembership++;continue;}
    if(observed.has(name)){counts.observed++;continue;}
    if(existsSync(join(workspace,'state/repositories/github.com',name))){counts.existingRoot++;continue;}
    const project={host:'github.com',namespace,repo};
    try{projectKey(project);}catch{counts.excluded++;continue;}
    candidates.push({project,evidence:'Current new-list member; no native project root, other membership, observed assignment or exact AgentScan exclusion at snapshot. Native identity, target policy and contribution suitability remain Worker checks before engineering/publication.'});
  }
  // Prioritize software over link collections, without discarding either category.
  const docs=/awesome|bookmarks|cheatsheet|roadmap|(?:^|-)list(?:-|$)|(?:^|-)resources(?:-|$)/i;
  candidates.sort((a,b)=>Number(docs.test(a.project.repo))-Number(docs.test(b.project.repo))||`${a.project.namespace}/${a.project.repo}`.localeCompare(`${b.project.namespace}/${b.project.repo}`));
  counts.eligible=candidates.length;
  return {createdAt:new Date().toISOString(),counts,provenance,candidates,originalShardsAvailable:[1,2,3,4].map(n=>existsSync(join(workspace,`temp/new-repositories-shards-20261001/shard-${n}.md`)))};
}

export function checkFreshEligibility(workspace,project) {
  if(project.host!=='github.com')return {ok:false,reason:'Fresh C1 scope is GitHub only'};
  const name=`${project.namespace}/${project.repo}`.toLowerCase();
  const current=identities(readFileSync(join(workspace,'state/new-repositories.md'),'utf8'));
  if(!current.has(name))return {ok:false,reason:'No longer in authoritative new-list membership'};
  const excluded=exclusions(readFileSync(join(workspace,'RepoStew_skills/references/forges/github/exclusions/agentscan.md'),'utf8'));
  if(excluded.owners.has(project.namespace.toLowerCase())||excluded.repos.has(name))return {ok:false,reason:'Current exact AgentScan exclusion'};
  for(const file of indexes){const path=join(workspace,'state',file);if(existsSync(path)&&identities(readFileSync(path,'utf8')).has(name))return {ok:false,reason:`Current ${file} membership/record`};}
  if(existsSync(join(workspace,'state/repositories',projectKey(project))))return {ok:false,reason:'Native project root now exists; touched/writer collision'};
  return {ok:true};
}
