import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { EventEmitter } from 'node:events';
import { Store } from '../src/store.mjs';
import { Engine } from '../src/engine.mjs';
import { projectKey } from '../src/config.mjs';
import { workerPrompt } from '../src/prompts.mjs';

const project=n=>({host:'fixture.local',namespace:'tests',repo:`repo-${n}`});
const brief={objectOutcome:'Read the supplied fixture',locationPrior:'Fresh isolated task',completeTodo:'Read and report actual value',authorityResources:'Local read-only',finishReturn:'Evidence of the value'};
const report={outcome:'no_delivery',summary:'Read-only unit completed',evidence:['fixture:value'],remaining:[],blocker:''};
function fixture(t,{maxWorkers=2,auto=false}={}) {
  const dir=mkdtempSync(join(tmpdir(),'repostew-harness-test-'));
  const config={...JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8')),runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..'),maxWorkers};
  const store=new Store(join(config.runtimeDir,'runtime.sqlite'));let engine;const processes=[];
  class FakeProcess extends EventEmitter {
    constructor(c,o){super();this.options=o;this.commands=[];this.isClosed=false;processes.push(this);}
    start(){return this;}
    getState(){return this.command('get_state');}
    async getAvailableThinkingLevels(){return (await this.command('get_available_thinking_levels')).levels;}
    setAutoRetry(enabled){return this.command('set_auto_retry',{enabled});}
    async prompt(message){return (await this.command('prompt',{message})).disposition;}
    async steer(message){return (await this.command('steer',{message})).disposition;}
    async command(type,args){
      this.commands.push({type,args});
      if(type==='get_state')return {model:{provider:this.options.model.provider,id:this.options.model.model},sessionFile:this.options.session};
      if(type==='get_available_thinking_levels')return {levels:['off','high','xhigh']};
      if(type==='prompt'&&auto)queueMicrotask(()=>{engine.report(this.options.env.REPOSTEW_RUN_ID,report);this.emit('record',{type:'agent_settled'});});
      return {disposition:'started'};
    }
    async close(){this.isClosed=true;const receipt={treeStopped:true,reason:'exited',exitCode:0};writeFileSync(this.options.receipt,JSON.stringify(receipt));return {code:0,receipt};}
  }
  engine=new Engine(config,store,{processFactory:(c,o)=>new FakeProcess(c,o)});
  engine.on('fatal',e=>{throw e;});
  engine.endpoint='http://127.0.0.1:1';
  engine.loadCampaign({id:'test',mandate:'Read isolated fixtures',allowedProjects:[],allowedHosts:['fixture.local'],workerMode:'read-only',continuous:false,revisitMs:60000,candidates:[]});
  store.set('mode','running');store.set('coordinator',{status:'complete',session:join(dir,'c1.jsonl'),noProgress:0});
  t.after(async()=>{await engine.shutdown();store.close();rmSync(dir,{recursive:true,force:true});});
  return {dir,config,store,engine,processes};
}
const settle=async()=>{for(let i=0;i<10;i++)await new Promise(r=>setTimeout(r,5));};

test('restart settles persisted accepted result exactly once after successful owned stop',async t=>{
  const {engine,store}=fixture(t);
  engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id,live]=[...engine.live][0];engine.report(id,report);
  await live.process.close();engine.live.clear();store.set('mode','paused');
  engine.reconcileRestart();engine.reconcileRestart();
  assert.equal(store.task('one').status,'no_delivery');
  assert.equal(store.task('one').attempts,1);
  assert.equal(store.run(id).recoveredReport,true);
  assert.equal(store.events(100,'c1').filter(e=>e.kind==='worker_result').length,1);
});

test('persisted result with nonzero exit remains interrupted and cannot be accepted',async t=>{
  const {engine,store}=fixture(t);
  engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id,live]=[...engine.live][0];engine.report(id,report);
  await live.process.close();engine.live.clear();
  writeFileSync(store.run(id).receipt,JSON.stringify({treeStopped:true,exitCode:1}));
  engine.reconcileRestart();
  assert.equal(store.task('one').status,'interrupted');
  assert.equal(store.run(id).recoveredReport,undefined);
});
test('C current facts exclude host history and TODO projections while UI retains them',t=>{
  const {engine,store}=fixture(t);
  const c=store.get('coordinator');
  c.result={summary:'old result'};c.todoSnapshot={todos:[{id:1,text:'old branch',done:true}]};
  store.set('coordinator',c);
  const ui=engine.status(),current=engine.coordinatorStatus();
  assert.equal(ui.coordinator.result.summary,'old result');
  assert.equal('coordinator' in current,false);
  assert.equal('tasks' in current,false);
  for(const key of ['mode','workspace','recordsRoot','workRoot','campaign','maxWorkers','maxQueued','counts','occupied','pools','candidatesRemaining','pendingEvents','liveProcesses'])assert.deepEqual(current[key],ui[key],key);
});
test('rejects invented project record root and repairs rendering of historical queued briefs',t=>{
  const {engine,config}=fixture(t);
  const wrong=config.workspace.replaceAll('\\','/')+'/repostew_pi/state/repositories/github.com/owner/repo/state.md';
  const badBrief={...brief,locationPrior:`Sole home: ${wrong}`};
  assert.throws(()=>engine.enqueue({id:'bad-records',project:project(1),brief:badBrief}),/Incorrect record root/);
  const rendered=workerPrompt({id:'old-queued',projectKey:'github.com/owner/repo',cwd:'fixture',brief:badBrief},{id:'test',workerMode:'engineering'},config);
  assert.ok(!rendered.includes(wrong));
  assert.ok(rendered.includes(config.workspace.replaceAll('\\','/')+'/state/repositories/github.com/owner/repo/state.md'));
});
test('reserves starting capacity, fills multiple waves, balances both providers',async t=>{
  const {engine,store,processes}=fixture(t);
  for(let i=0;i<6;i++)engine.enqueue({id:`task-${i}`,project:project(i),brief});
  await settle();assert.equal(processes.length,2);
  for(let wave=0;wave<3;wave++){
    const live=[...engine.live.entries()];assert.equal(live.length,2);
    for(const [id,p]of live){engine.report(id,report);p.process.emit('record',{type:'agent_settled'});}
    await settle();
  }
  assert.equal(store.tasks().filter(t=>t.status==='no_delivery').length,6);
  assert.deepEqual(store.tasks().map(t=>t.poolId),['luna','flash','luna','flash','luna','flash']);
  assert.equal(engine.live.size,0);
});
test('stable assignment id is idempotent and project writer cannot be duplicated',async t=>{
  const {engine,store}=fixture(t);const input={id:'one',project:project(1),brief};
  engine.enqueue(input);assert.equal(engine.enqueue(input).duplicate,true);assert.equal(store.tasks().length,1);
  assert.throws(()=>engine.enqueue({...input,brief:{...brief,completeTodo:'Different task'}}),/reused/);
  assert.throws(()=>engine.enqueue({...input,id:'two'}),/already has/);
  await settle();
});
test('C resumes the original task and session for omissions after an earlier judgment',async t=>{
  const {engine,store,processes}=fixture(t,{maxWorkers:1});
  engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [runId,live]=[...engine.live][0];
  engine.report(runId,{outcome:'blocked',summary:'Delivery route unavailable',evidence:['native gate'],remaining:['Repair local records'],blocker:'private route missing'});
  live.process.emit('record',{type:'agent_settled'});await settle();
  engine.decide({taskId:'one',runId,disposition:'blocked',reason:'Retain real external gate'});
  const correction={taskId:'one',runId,disposition:'continue',reason:'Safe record repair remains feasible independently',nextAction:'Repair only canonical records; retain private gate',reconciliation:'Stopped tree; no external writes; records are task-owned'};
  engine.decide(correction);assert.equal(engine.decide(correction).duplicate,true);await settle();
  assert.equal(store.tasks().length,1);assert.equal(store.task('one').attempts,2);assert.equal(store.task('one').continuations,1);
  assert.equal(processes[1].options.session,processes[0].options.session);
  assert.equal(processes[1].options.model.id,processes[0].options.model.id);
  assert.equal(store.decision(runId).supersedes.disposition,'blocked');
});
test('owner delta during active C is queued without replacing its run',async t=>{
  const {engine,store,processes}=fixture(t);
  engine.reserveCoordinator(store.events());await settle();
  const before=store.get('coordinator');const count=processes.length;
  await engine.control('wake',{message:'Use the five concise stages; retain current work'});await settle();
  assert.equal(store.get('coordinator').runId,before.runId);assert.equal(processes.length,count);
  assert.ok(store.events().some(e=>e.kind==='owner_delta'&&e.data.message.includes('five concise')));
});
test('worker dependency caches are task-private without changing auth home',async t=>{
  const {engine,processes,store}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const env=processes[0].options.env;const cwd=store.task('one').cwd;
  for(const name of ['GOCACHE','GOMODCACHE','GOPATH','npm_config_cache','PIP_CACHE_DIR','GRADLE_USER_HOME','CARGO_HOME','TEMP'])assert.ok(env[name].startsWith(cwd));
  assert.equal(env.HOME,undefined);assert.equal(env.USERPROFILE,undefined);
});
test('pause preserves a reported feasible remainder for same-task resume',async t=>{
  const {engine,store}=fixture(t,{maxWorkers:1});engine.enqueue({id:'one',project:project(1),brief});await settle();
  await engine.control('pause');const [id,live]=[...engine.live][0];
  engine.report(id,{outcome:'continue',summary:'Investigation complete; validation remains',evidence:['local patch'],remaining:['Run affected checks then submit'],blocker:''});
  live.process.emit('record',{type:'agent_settled'});await settle();assert.equal(store.task('one').status,'continuing');assert.equal(store.task('one').failures,undefined);
  await engine.control('resume');await settle();assert.equal(store.task('one').attempts,2);assert.match(store.task('one').continuation,/affected checks/);
});
test('three failed C turns cannot spin on the same unconsumed Worker event',async t=>{
  const {engine,store,processes}=fixture(t);
  engine.notify('worker_result','fixture-result',{runId:'fixture-ended',status:'failed'});
  engine.reserveCoordinator(store.events());await settle();
  for(let i=0;i<3;i++){await engine.failRun(store.get('coordinator').runId,'Same coordinator executor fault');await settle();}
  assert.equal(store.get('coordinator').failures,3);assert.equal(store.get('coordinator').requiresReconciliation,true);
  assert.equal(engine.live.size,0);const count=processes.length;
  await engine.control('wake',{message:'Generic new work is not fault diagnosis'});await settle();assert.equal(processes.length,count);
});
test('pause survives events and suppresses refill; explicit resume fills queued work',async t=>{
  const {engine,store,processes}=fixture(t,{maxWorkers:1});
  engine.enqueue({id:'one',project:project(1),brief});engine.enqueue({id:'two',project:project(2),brief});await settle();
  await engine.control('pause');const [id,live]=[...engine.live][0];engine.report(id,report);live.process.emit('record',{type:'agent_settled'});await settle();
  assert.equal(processes.length,1);assert.equal(store.task('two').status,'queued');
  await engine.control('resume');await settle();assert.equal(processes.length,2);
});
test('stop aborts owned work, preserves interruption, never resumes via heartbeat',async t=>{
  const {engine,store,processes}=fixture(t,{maxWorkers:1});engine.enqueue({id:'one',project:project(1),brief});await settle();
  await engine.control('stop');engine.kick();await settle();assert.equal(store.task('one').status,'interrupted');assert.equal(processes.length,1);assert.equal(store.get('mode'),'stopped');
});
test('missing result gets one reminder and cannot be claimed delivered',async t=>{
  const {engine,store}=fixture(t,{maxWorkers:1});engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id,live]=[...engine.live][0];live.process.emit('record',{type:'agent_settled'});await settle();assert.equal(engine.live.size,1);
  live.process.emit('record',{type:'agent_settled'});await settle();assert.equal(store.task('one').status,'failed');assert.match(store.task('one').problem,/No final report/);
});
test('post-report tool activity invalidates provisional completion',async t=>{
  const {engine,store}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id]=[...engine.live][0];engine.report(id,report);assert.ok(store.run(id).report);engine.activity(id,'write');assert.equal(store.run(id).report,undefined);assert.equal(store.run(id).toolStarted,true);
});
test('unknown tree stop holds project and requires actual receipt',async t=>{
  const {engine,store}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id]=[...engine.live][0];await engine.finish(id,{code:1},'transport lost');assert.equal(store.task('one').status,'unknown');
  assert.throws(()=>engine.reconcile({taskId:'one',decision:'continue',evidence:'operator statement',message:'resume'}),/stop not established/);
});
test('rate limit before any tool can retry safely; auth failure opens only its pool circuit',async t=>{
  const {engine,store}=fixture(t,{maxWorkers:1});engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id]=[...engine.live][0];await engine.failRun(id,'HTTP 429 Retry-After: 120');await settle();
  assert.equal(store.task('one').poolId,'flash');assert.equal(store.task('one').attempts,2);
  const [id2]=[...engine.live][0];engine.activity(id2,'read');await engine.failRun(id2,'401 Unauthorized');await settle();
  assert.equal(store.task('one').status,'failed');assert.match(store.get('routing').flash.disabledReason,/authentication/);
});
test('restart marks unsettled tasks interrupted or unknown, never blindly resends',async t=>{
  const {engine,store}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id,live]=[...engine.live][0];await live.process.close();engine.live.clear();engine.reconcileRestart();
  assert.equal(store.task('one').status,'interrupted');assert.equal(store.run(id).treeStopped,true);engine.kick();await settle();assert.equal(engine.live.size,0);
});
test('role capability cannot dispatch or expose other tasks through worker status',async t=>{
  const {engine}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id]=[...engine.live][0];const token=engine.tokens.get(id);
  await assert.rejects(engine.agentAction(id,token,'dispatch',{id:'bad',project:project(2),brief}),/Worker cannot/);
  const status=await engine.agentAction(id,token,'status',{});assert.equal(status.task.id,'one');assert.equal(status.tasks,undefined);
  await assert.rejects(engine.agentAction(id,'wrong','status',{}),/capability/);
});
test('project identities preserve nested namespaces and reject path escapes/device names',()=>{
  assert.equal(projectKey({host:'gitlab.com',namespace:'group/subgroup',repo:'work'}),'gitlab.com/group/subgroup/work');
  for(const repo of ['..','../outside','CON','nul.txt','x.','x\\y'])assert.throws(()=>projectKey({...project(1),repo}));
});
test('Pi TODO is a display projection, not an engineering or completion gate',async t=>{
  const {engine,store}=fixture(t);store.set('campaign',{...store.get('campaign'),requirePlan:true});engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [id,live]=[...engine.live][0];engine.activity(id,'write');
  live.process.emit('record',{type:'tool_execution_end',toolName:'todo',result:{details:{todos:[{id:1,text:'Read fixture',done:false}],nextId:2}}});
  engine.report(id,report);
  assert.equal(store.task('one').todoSnapshot.todos[0].done,false);
  assert.equal(store.task('one').plan,undefined);
  assert.equal(engine.status().tasks[0].todoSource,'Pi session (display projection)');
  await assert.rejects(engine.agentAction(id,engine.tokens.get(id),'plan',{steps:[]}),/Worker cannot/);
});
test('admission requires native inspection and rejects archived target',async t=>{
  const {engine,store}=fixture(t);store.set('campaign',{...store.get('campaign'),requireAdmission:true});
  assert.throws(()=>engine.enqueue({id:'one',project:project(1),brief}),/inspect and admit/);
  engine.inspector=async()=>({at:'now',repository:{id:123,private:false,archived:true,disabled:false}});
  await engine.inspect(project(1));assert.throws(()=>engine.admit(project(1),'Looks eligible'),/archived/);
  engine.inspector=async()=>({at:'now',repository:{id:124,private:false,archived:false,disabled:false}});
  await engine.inspect(project(2));engine.admit(project(2),'Active software; current target checks remain W duty');engine.enqueue({id:'two',project:project(2),brief});await settle();
  assert.equal(store.task('two').status,'running');
});
test('C cannot settle an unjudged Worker event or falsely accept execution failure',async t=>{
  const {engine,store}=fixture(t);engine.enqueue({id:'one',project:project(1),brief});await settle();
  const [workerId,live]=[...engine.live][0];engine.report(workerId,report);live.process.emit('record',{type:'agent_settled'});await settle();
  const events=store.events().filter(e=>e.kind==='worker_result');
  engine.reserveCoordinator(events);await settle();const c=store.get('coordinator');
  const final={outcome:'complete',summary:'Done',evidence:[],remaining:[],blocker:''};assert.throws(()=>engine.report(c.runId,final),/Judge each/);
  assert.throws(()=>engine.decide({taskId:'one',runId:workerId,disposition:'delivered',reason:'assumption'}),/Cannot accept/);
  engine.decide({taskId:'one',runId:workerId,disposition:'no_delivery',reason:'Exact fixture evidence; no engineering requested'});
  engine.report(c.runId,final);assert.ok(store.run(c.runId).report);
});
