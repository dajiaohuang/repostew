import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {workflows,workflowTools} from '../src/workflows.mjs';
import {policySelection,policyDocument,readPolicy} from '../src/policy.mjs';
import {loadConfig} from '../src/config.mjs';
import {captureSourcePage,effectiveSource,processingOrder} from '../src/sources.mjs';
import {forgeFailure,readRepository,inspectRepository} from '../src/forge.mjs';
import {identities} from '../src/scope.mjs';
import {Store} from '../src/store.mjs';
import {Engine} from '../src/engine.mjs';

const base=()=>loadConfig(fileURLToPath(new URL('../config.example.json',import.meta.url)));
function fixture(t,cleanup=true) {
  const dir=mkdtempSync(join(tmpdir(),'repostew-workflows-'));
  const config={...base(),runtimeDir:join(dir,'runtime'),workspace:dir,workRoot:join(dir,'work')};
  if(cleanup)t.after(()=>rmSync(dir,{recursive:true,force:true}));
  return {dir,config};
}
function engineFixture(t,dependencies={}) {
  const {dir,config}=fixture(t,false),store=new Store(join(config.runtimeDir,'runtime.sqlite'));
  const engine=new Engine(config,store,dependencies);
  t.after(async()=>{await engine.shutdown();store.close();rmSync(dir,{recursive:true,force:true});});
  const campaign={id:'flows',mandate:'Isolated fixture only',allowedProjects:[],allowedHosts:['fixture.local'],workerMode:'read-only',workflow:'notifications',continuous:true,revisitMs:60000};
  engine.addCoordinator({id:'flows',campaign});
  const run={id:'fixture-run',owner:'flows',coordinatorId:'flows',role:'coordinator',status:'running',treeStopped:true,createdAt:new Date().toISOString(),beforeTasks:0,beforeSkips:0};
  store.putRun(run);
  return {dir,config,store,engine,run};
}
test('every workflow resolves full canonical forms and all selected action methods',()=>{
  const config=base();
  assert.equal(new Set(workflows.map(w=>w.id)).size,19);
  for(const flow of workflows) {
    for(const role of ['coordinator','worker']) {
      const selected=policySelection(config,role,{workflow:flow.id});
      assert.equal(selected.workflow,flow.id);
      assert.equal(selected.documents.find(d=>d.path==='SKILL.md').text,readFileSync(join(config.policyDir,'SKILL.md'),'utf8'));
      for(const path of [...selected.methods,...Object.values(selected.conditional).flat()])assert.ok(policyDocument(config,path).text.length>0,path);
      assert.ok(selected.documents.some(d=>d.path==='prompts/task.md'));
    }
  }
  assert.throws(()=>readPolicy(config,{action:'read',paths:['references/../../README.md']}),/canonical/);
  assert.throws(()=>readPolicy(config,{action:'read',paths:Array(9).fill('SKILL.md')}),/1..8/);
  assert.ok(workflowTools(['read'],'coordinator',{workflow:'disposition'}).includes('powershell'));
  assert.deepEqual(workflowTools(['read'],'coordinator',{workflow:'assigned'}),['read']);
  assert.deepEqual(workflowTools(['read','write','edit','bash','powershell'],'worker',{workerMode:'read-only'}),['read']);
});
const source={id:'notifications',kind:'github-notifications',host:'github.com',since:'2026-01-01T00:00:00Z',until:'2026-01-02T00:00:00Z'};
test('notification capture retains raw pages, includes read items and globally orders deduplicated IDs',async t=>{
  const {config}=fixture(t),calls=[];
  const page1=Array.from({length:50},(_,i)=>({id:String(i+1),updated_at:'2026-01-01T10:00:00Z',unread:false}));
  const page2=[{id:'2',updated_at:'2026-01-01T20:00:00Z',unread:true},{id:'51',updated_at:'2026-01-01T20:00:00Z',unread:false}];
  const get=async(_project,path)=>{calls.push(path);return {ok:true,data:calls.length===1?page1:page2};};
  const first=await captureSourcePage(config,source,{coordinatorId:'flows'},{get});
  assert.equal(first.complete,false);assert.equal(first.nextPage,2);
  assert.match(calls[0],/all=true/);assert.match(calls[0],/participating=false/);assert.match(calls[0],/per_page=50/);
  assert.deepEqual(JSON.parse(readFileSync(first.rawPath)),page1);
  const second=await captureSourcePage(config,source,{coordinatorId:'flows',page:2},{get});
  assert.equal(second.complete,true);assert.equal(second.uniqueCount,51);
  const index=JSON.parse(readFileSync(second.indexPath));
  assert.deepEqual(index.order.slice(0,2).map(x=>x.id),['51','2']);
  const again=await captureSourcePage(config,source,{coordinatorId:'flows',page:2},{get});
  assert.equal(again.reused,true);assert.equal(calls.length,2);
  writeFileSync(first.rawPath,'[]');
  await assert.rejects(captureSourcePage(config,source,{coordinatorId:'flows',page:2},{get}),/changed/);
});
test('incomplete search and mismatched mail provenance cannot claim complete coverage',async t=>{
  const {dir,config}=fixture(t);
  const result=await captureSourcePage(config,{id:'search',kind:'github-issues',host:'github.com',query:'repo:fixture/fixture'},{coordinatorId:'flows'},{get:async()=>({ok:true,data:{items:[],total_count:1001,incomplete_results:true}})});
  assert.equal(result.complete,false);assert.equal(result.limitReached,true);
  writeFileSync(join(dir,'mail.json'),JSON.stringify({provenance:{folder:'other'},items:[],complete:true}));
  const mail={id:'mail',kind:'capture-file',path:'mail.json',expectedProvenance:{folder:'github'}};
  await assert.rejects(captureSourcePage(config,mail,{coordinatorId:'flows'}),/provenance mismatch/);
  writeFileSync(join(dir,'mail.json'),JSON.stringify({provenance:{folder:'github'},items:[{id:'1'}],complete:true}));
  assert.equal((await captureSourcePage(config,mail,{coordinatorId:'flows'})).complete,true);
});
test('capture rejects missing pages and symlink escape; rolling windows stay exact',async t=>{
  const {dir,config}=fixture(t);
  await assert.rejects(captureSourcePage(config,source,{coordinatorId:'flows',page:2}),/ENOENT/);
  symlinkSync(config.policyDir,join(dir,'outside'),'junction');
  await assert.rejects(captureSourcePage(config,{id:'outside',kind:'capture-file',path:'outside/SKILL.md'},{coordinatorId:'flows'}),/selected workspace/);
  const at=Date.parse('2026-01-02T00:00:00Z');
  const rolling=effectiveSource({id:'roll',kind:source.kind,host:source.host,windowMs:60000},at);
  assert.equal(rolling.since,'2026-01-01T23:59:00.000Z');assert.equal(rolling.until,'2026-01-02T00:00:00.000Z');
  assert.deepEqual(processingOrder([{id:'1'},{id:'3'},{id:'1'}]).map(x=>x.id),['3','1']);
});
test('forge errors distinguish project denial, host rate/auth and missing capability',()=>{
  assert.equal(forgeFailure({stderr:'HTTP 403 Forbidden'}).scope,'project');
  assert.equal(forgeFailure({stderr:'403 Forbidden'}).scope,'project');
  assert.equal(forgeFailure({stderr:'HTTP 403 secondary rate limit'}).scope,'host');
  assert.equal(forgeFailure({stderr:'HTTP 401'}).category,'forge-auth-gate');
  assert.equal(forgeFailure({code:'ENOENT'}).category,'missing-cli');
});
test('GitLab nested identity uses encoded GET endpoints, with private content assignment gate',async()=>{
  const project={host:'gitlab.com',namespace:'group/subgroup',repo:'fixture'},calls=[];
  const execute=async(cmd,args)=>{
    calls.push({cmd,args});
    const path=args.at(-1);
    return {stdout:JSON.stringify(path.endsWith('group%2Fsubgroup%2Ffixture')
      ?{path_with_namespace:'group/subgroup/fixture',visibility:'private',default_branch:'main'}:[{iid:4}])};
  };
  await assert.rejects(readRepository(project,{operation:'issues'},{execute}),/explicit project/);
  const result=await readRepository(project,{operation:'issues'},{execute,allowPrivate:true});
  assert.equal(result.data[0].iid,4);
  assert.ok(calls.every(c=>c.cmd==='rtk'&&c.args.includes('glab')&&c.args.includes('GET')));
  assert.match(calls.at(-1).args.at(-1),/^projects\/group%2Fsubgroup%2Ffixture\/issues/);
  assert.ok(identities('https://gitlab.com/group/subgroup/fixture/-/issues/4',{host:'gitlab.com'}).has('group/subgroup/fixture'));
  assert.doesNotThrow(()=>identities('https://%bad'));
});
test('upstream push false remains operation-specific metadata',async()=>{
  const execute=async(_cmd,args)=>({stdout:JSON.stringify(args.at(-1)==='repos/fixture/example'?{id:1,full_name:'fixture/example',private:true,permissions:{push:false}}:{})});
  const result=await inspectRepository({host:'github.com',namespace:'fixture',repo:'example'},{execute});
  assert.equal(result.repository.permissions.push,false);
  assert.match(result.repository.contributionAccess,/does not decide fork/);
  assert.equal(result.failure,undefined);
});
test('continuous completion wakes only when due and never through pause; finite stays complete',t=>{
  let now=Date.now();const {engine,store,run}=engineFixture(t,{clock:()=>now});
  const c=store.coordinator('flows');c.mode='running';store.putCoordinator(c);
  run.report={outcome:'complete',summary:'Window handled',evidence:['fixture'],remaining:[],blocker:''};
  engine.finishCoordinator(run,false);
  let current=store.coordinator('flows');
  assert.equal(current.completedPasses,1);assert.equal(current.status,'waiting');
  assert.equal(engine.coordinatorWake(current),undefined);
  now+=60001;assert.ok(engine.coordinatorWake(current));
  current.mode='paused';assert.equal(engine.coordinatorWake(current),undefined);
  current.mode='running';current.campaign.continuous=false;store.putCoordinator(current);
  engine.finishCoordinator(run,false);assert.equal(store.coordinator('flows').status,'complete');
  assert.equal(engine.coordinatorWake(store.coordinator('flows')),undefined);
});
test('scoped forge gates leave unrelated projects runnable and failed inspection can refresh',async t=>{
  let calls=0;const {engine,store}=engineFixture(t,{inspector:async()=>++calls===1?{failure:{category:'execution-error'}}:{repository:{id:1}}});
  const a={host:'fixture.local',namespace:'group',repo:'a'},b={...a,repo:'b'};
  await engine.inspect(a,'flows');await engine.inspect(a,'flows');assert.equal(calls,2);
  await engine.inspect(a,'flows');assert.equal(calls,2);
  await assert.rejects(engine.inspect(a,'flows',{refresh:true}),/Changed input/);
  await engine.inspect(a,'flows',{refresh:true,reason:'Target changed'});assert.equal(calls,3);
  engine.recordForgeFailure(a,{category:'forge-access-gate',scope:'project',status:403});
  assert.throws(()=>engine.assertForgeReady(a),/paused/);assert.doesNotThrow(()=>engine.assertForgeReady(b));
  engine.recordForgeFailure(b,{category:'forge-rate-gate',scope:'host',status:429});
  await assert.rejects(engine.control('clear-forge',{evidence:'Fixture'}),/Name the affected/);
  await engine.control('clear-forge',{project:a,evidence:'Exact permission restored'});
  assert.ok(store.get('forgeGates')['fixture.local']);assert.equal(store.get('forgeGates')['fixture.local/group/a'],undefined);
});
test('source completion cannot regress on replay or advance after Stop',async t=>{
  let release;
  const {engine,store,run}=engineFixture(t,{sourceReader:async(_c,_s,{page})=>page===3?new Promise(resolve=>{release=resolve;}):{page,complete:page===2,rawPath:'fixture',sha256:'fixture',reused:page===1}});
  const c=store.coordinator('flows');c.campaign.sources=[source];store.putCoordinator(c);
  await engine.sourceRead('flows',{action:'capture',sourceId:source.id,page:2},run);
  await engine.sourceRead('flows',{action:'capture',sourceId:source.id,page:1},run);
  assert.equal(store.coordinator('flows').sourceCoverage['0:notifications'].complete,true);
  const pending=engine.sourceRead('flows',{action:'capture',sourceId:source.id,page:3},run);
  const stopped=store.run(run.id);stopped.status='stopping';store.putRun(stopped);
  release({page:3,complete:false,rawPath:'fixture',sha256:'fixture'});
  assert.equal((await pending).coverageApplied,false);
  assert.equal(store.coordinator('flows').sourceCoverage['0:notifications'].page,2);
  await assert.rejects(engine.sourceRead('flows',{action:'capture',sourceId:source.id,page:1},run),/no longer active/);
});
test('registered incomplete source blocks completion and evidence-only work counts as progress',t=>{
  const {engine,store,run}=engineFixture(t);
  const c=store.coordinator('flows');c.campaign.sources=[source];c.noProgress=2;store.putCoordinator(c);
  run.sourceProgress=true;run.report={outcome:'continue',summary:'Captured input',evidence:['page1'],remaining:['Handle'],blocker:''};
  engine.finishCoordinator(run,false);assert.equal(store.coordinator('flows').noProgress,0);
  run.report={outcome:'complete',summary:'Done',evidence:['page1'],remaining:[],blocker:''};
  engine.finishCoordinator(run,false);
  assert.equal(store.coordinator('flows').status,'idle');
  assert.match(store.coordinator('flows').problem,/capture still remains/);
});
