import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {EventEmitter} from 'node:events';
import {Store} from '../src/store.mjs';
import {Engine} from '../src/engine.mjs';

const project=n=>({host:'fixture.local',namespace:'multi',repo:`repo-${n}`});
const brief={objectOutcome:'Read fixture',locationPrior:'Isolated test',completeTodo:'Read and report',authorityResources:'Read-only local fixture',finishReturn:'Exact fixture evidence'};
const report={outcome:'no_delivery',summary:'Fixture read',evidence:['fixture-value'],remaining:[],blocker:''};
const campaign=id=>({id:`scope-${id}`,mandate:'Read supplied fixtures only',allowedProjects:[],allowedHosts:['fixture.local'],workerMode:'read-only',continuous:false,revisitMs:60000});
const settle=async()=>{for(let n=0;n<8;n++)await new Promise(r=>setTimeout(r,5));};
function fixture(t,{maxWorkers=4,maxCoordinators=2}={}) {
  const dir=mkdtempSync(join(tmpdir(),'repostew-multicw-'));
  const config={...JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8')),runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..'),maxWorkers,maxCoordinators};
  const store=new Store(join(config.runtimeDir,'runtime.sqlite')),processes=[];
  class Process extends EventEmitter {
    constructor(c,o){super();this.options=o;this.closed=false;this.prompts=[];this.steers=[];processes.push(this);}
    async start(){}
    async getState(){return {model:{provider:this.options.model.provider,id:this.options.model.model},sessionFile:this.options.session};}
    async getAvailableThinkingLevels(){return ['off','high','xhigh'];}
    async setAutoRetry(){}
    async prompt(text){this.prompts.push(text);return 'started';}
    async steer(text){this.steers.push(text);return {disposition:'queued'};}
    async close(abort){this.closed=true;this.aborted=abort;const receipt={treeStopped:true,targetReleased:true,exitCode:0};writeFileSync(this.options.receipt,JSON.stringify(receipt));return {code:0,receipt};}
  }
  const engine=new Engine(config,store,{processFactory:(c,o)=>new Process(c,o)});engine.endpoint='http://127.0.0.1:1';
  engine.on('fatal',e=>{throw e;});
  const add=(id,{runnable=false,maxWorkers}={})=>{
    engine.addCoordinator({id,campaign:campaign(id),maxWorkers});
    const c=store.coordinator(id);c.mode='running';c.status=runnable?'idle':'complete';store.putCoordinator(c);
  };
  const finish=async(owner,result=report)=>{const [runId,live]=[...engine.live].find(([id])=>store.run(id).owner===owner);engine.report(runId,result);live.process.emit('record',{type:'agent_settled'});await settle();return runId;};
  t.after(async()=>{await engine.shutdown();store.close();rmSync(dir,{recursive:true,force:true});});
  return {engine,store,processes,config,add,finish};
}

test('full admission retains one durable intent per owner and promotes it when capacity frees',async t=>{
  const {engine,store,config,add}=fixture(t,{maxWorkers:1});engine.config.maxQueued=1;
  add('alpha');add('beta');store.set('mode','running');
  engine.enqueue({id:'ready',project:project('ready'),brief},'alpha');
  const deferred=engine.enqueue({id:'deferred',project:project('deferred'),brief},'beta');
  assert.equal(deferred.status,'waiting-capacity');
  assert.equal(store.task('deferred').status,'waiting-capacity');
  const denied=engine.enqueue({id:'excess',project:project('excess'),brief},'beta');
  assert.equal(denied.accepted,false);assert.equal(store.task('excess'),undefined);
  assert.throws(()=>engine.enqueue({id:'conflict',project:project('deferred'),brief},'alpha'),/unreleased/);
  store.set('mode','running');engine.kick();await settle();
  assert.equal(store.task('ready').status,'running');
  assert.equal(store.task('deferred').status,'queued');
  assert.equal(store.tasks().length,2);
  engine.enqueue({id:'deferred',project:project('deferred'),brief},'beta');
  assert.equal(store.tasks().length,2);
});

test('C queue priority preserves cross-owner fairness; mutations are idempotent and scoped',t=>{
  const {engine,store,add}=fixture(t);add('alpha');add('beta');store.set('mode','running');
  for(const [id,owner] of [['a1','alpha'],['a2','alpha'],['b1','beta']])engine.enqueue({id,project:project(id),brief},owner);
  const body={action:'priority',taskId:'a2',priority:50,reason:'Ready fixture first',requestId:'sort'};
  const first=engine.manageQueue(body,'alpha','run');
  assert.deepEqual(engine.manageQueue(body,'alpha','run'),first);
  assert.throws(()=>engine.manageQueue({...body,priority:60},'alpha','run'),/reused/);
  assert.throws(()=>engine.manageQueue({...body,taskId:'b1',requestId:'cross'},'alpha','run'),/different owner/);
  assert.equal(engine.nextWorker(store.tasks(),{}).id,'a2');
  store.set('lastWorkerOwner','alpha');assert.equal(engine.nextWorker(store.tasks(),{}).id,'b1');
  const page=engine.manageQueue({action:'list',limit:1},'alpha','run');
  assert.equal(page.total,2);assert.equal(page.nextOffset,1);assert.equal(page.tasks[0].id,'a1');
  store.set('mode','paused');
});

test('C pause frees admission room but cannot override a later operator pause',async t=>{
  const {engine,store,add}=fixture(t);add('alpha');store.set('mode','running');engine.config.maxQueued=1;
  engine.enqueue({id:'a1',project:project('a1'),brief},'alpha');
  engine.manageQueue({action:'pause',taskId:'a1',reason:'Dependency not ready',requestId:'p'},'alpha','run');
  engine.enqueue({id:'a2',project:project('a2'),brief},'alpha');
  const resumed=engine.manageQueue({action:'resume',taskId:'a1',reason:'Dependency ready',requestId:'r'},'alpha','run');
  assert.equal(resumed.status,'waiting-capacity');
  engine.manageQueue({action:'pause',taskId:'a1',reason:'Hold',requestId:'p2'},'alpha','run');
  await engine.control('pause',{target:{kind:'worker',id:'a1'}});
  assert.throws(()=>engine.manageQueue({action:'resume',taskId:'a1',reason:'Cannot override',requestId:'r2'},'alpha','run'),/only its own/);
  store.set('mode','paused');
  assert.throws(()=>engine.manageQueue({action:'pause',taskId:'a2',reason:'Stopped scope',requestId:'p3'},'alpha','run'),/disabled/);
});

test('withdrawal is never-started only, retains history and returns candidate to selection',t=>{
  const {engine,store,add}=fixture(t);add('alpha');store.set('mode','running');
  const p=project('candidate');store.addCandidates('alpha',[{project:p}],x=>[x.host,x.namespace,x.repo].join('/'));
  engine.enqueue({id:'a1',project:p,brief},'alpha');
  assert.equal(engine.candidatesRemaining('alpha'),0);
  engine.manageQueue({action:'withdraw',taskId:'a1',reason:'Reselect later',requestId:'w'},'alpha','run');
  assert.equal(store.task('a1').status,'cancelled');assert.equal(engine.projectHeld(store.task('a1')),false);
  assert.equal(engine.candidatesRemaining('alpha'),1);assert.equal(engine.candidatePage(10,'alpha').length,1);
  engine.enqueue({id:'a2',project:p,brief},'alpha');
  const task=store.task('a2');task.attempts=1;store.putTask(task);
  assert.throws(()=>engine.manageQueue({action:'withdraw',taskId:'a2',reason:'Unsafe',requestId:'w2'},'alpha','run'),/never-started/);
  store.set('mode','paused');
});

test('pausing unknown task preserves its reservation while independent owned work can run',async t=>{
  const {engine,store,add}=fixture(t,{maxWorkers:2});add('alpha');store.set('mode','running');
  engine.enqueue({id:'uncertain',project:project('uncertain'),brief},'alpha');
  const task=store.task('uncertain');task.status='unknown';task.attempts=1;task.runId='missing-stop';store.putTask(task);
  engine.manageQueue({action:'pause',taskId:'uncertain',reason:'Isolate pending stop evidence',requestId:'p'},'alpha','run');
  assert.equal(engine.occupiesWorkerSlot(store.task('uncertain')),true);
  assert.equal(engine.projectHeld(store.task('uncertain')),true);
  assert.throws(()=>engine.manageQueue({action:'resume',taskId:'uncertain',reason:'Unsafe',requestId:'r'},'alpha','run'),/Reconcile/);
  engine.enqueue({id:'independent',project:project('independent'),brief},'alpha');
  await settle();
  assert.equal(store.task('independent').status,'running');assert.equal(store.task('uncertain').status,'unknown');
});

test('capacity wait observes global capacity while external waits ignore it',async t=>{
  const {engine,store,config,add}=fixture(t);engine.config.maxQueued=1;
  add('alpha');add('beta');store.set('mode','running');
  engine.enqueue({id:'ready',project:project('ready'),brief},'beta');
  store.consume(store.events(100,'alpha').map(e=>e.seq));
  const c=store.coordinator('alpha');c.status='waiting';c.wait={kind:'capacity'};store.putCoordinator(c);
  assert.equal(engine.coordinatorWake(c),undefined);
  const task=store.task('ready');task.status='running';store.putTask(task);
  assert.ok(engine.coordinatorWake(c));
  c.wait={kind:'external'};store.putCoordinator(c);
  assert.equal(engine.coordinatorWake(c),undefined);
  store.set('mode','paused');
});

test('completed CLA notification releases W and project while one metadata reminder reaches governance',async t=>{
  const {engine,store,add,finish}=fixture(t);add('notifications');
  const c=store.coordinator('notifications');c.campaign.workflow='captured-feedback';store.putCoordinator(c);
  store.set('mode','running');
  engine.subscriptions.register({id:'cla-notification',harness:'t3',target:'fixture',from:'now'});
  engine.enqueue({id:'cla-review',project:project('cla-review'),brief},'notifications');await settle();
  const userAction={kind:'cla',reference:'https://fixture.invalid/pr/1#cla',action:'User decides whether to sign'};
  const runId=await finish('cla-review',{...report,userAction});
  assert.equal(store.task('cla-review').status,'no_delivery');
  assert.equal(engine.occupiesWorkerSlot(store.task('cla-review')),false);
  assert.equal(engine.subscriptions.claim('cla-notification').delivery,null,'wait for C acceptance before notifying');
  const decision={taskId:'cla-review',runId,disposition:'no_delivery',reason:'Assessment complete; personal decision follows'};
  engine.decide(decision,'notifications');engine.decide(decision,'notifications');
  assert.equal(engine.projectHeld(store.task('cla-review')),false);
  assert.equal(store.incidents().length,0);
  const packet=engine.subscriptions.claim('cla-notification');
  assert.equal(packet.delivery.events.filter(e=>e.kind==='user_action_required').length,1);
  assert.ok(!JSON.stringify(packet.delivery).includes('User decides'));
  assert.deepEqual(store.task('cla-review').result.userAction,userAction);
  engine.enqueue({id:'later-work',project:project('cla-review'),brief},'notifications');
});

test('engineering submission can finish with CLA follow-up without immediate personal-action alert',async t=>{
  const {engine,store,add,finish}=fixture(t);add('fresh');store.set('mode','running');
  engine.subscriptions.register({id:'engineering-cla',harness:'t3',target:'fixture',from:'now'});
  engine.enqueue({id:'submitted',project:project('submitted'),brief},'fresh');await settle();
  const runId=await finish('submitted',{outcome:'delivered',summary:'All assigned PRs submitted',evidence:['https://fixture.invalid/pr/1'],remaining:[],blocker:'',
    userAction:{kind:'cla',reference:'https://fixture.invalid/pr/1#cla',action:'Personal signature decision during notification follow-up'}});
  engine.decide({taskId:'submitted',runId,disposition:'delivered',reason:'Submission complete'},'fresh');
  assert.equal(engine.projectHeld(store.task('submitted')),false);
  assert.equal(engine.subscriptions.claim('engineering-cla').delivery,null);
});

test('real creation-time signature barrier remains blocked and retains project',async t=>{
  const {engine,store,add,finish}=fixture(t);add('fresh');store.set('mode','running');
  engine.enqueue({id:'unsent',project:project('unsent'),brief},'fresh');await settle();
  const runId=store.task('unsent').runId;
  const blocked={outcome:'blocked',summary:'Creation rejected by platform',evidence:['creation response'],remaining:['Submission not created'],blocker:'Actual creation-time signature requirement'};
  assert.throws(()=>engine.report(runId,{...blocked,userAction:{kind:'cla',reference:'ref',action:'sign'}}),/completed Worker/);
  await finish('unsent',blocked);
  assert.equal(store.task('unsent').status,'blocked');assert.equal(engine.projectHeld(store.task('unsent')),true);
});

test('valid child waits do not count as failed progress and paused deferred work stays retained',async t=>{
  const {engine,store,config,add,finish}=fixture(t);engine.config.maxQueued=1;add('alpha');store.set('mode','running');
  engine.enqueue({id:'ready',project:project('ready'),brief},'alpha');
  engine.enqueue({id:'deferred',project:project('deferred'),brief},'alpha');
  store.set('mode','paused');
  engine.reserveCoordinator(store.events(100,'alpha'),'alpha');await settle();
  const c=store.coordinator('alpha');c.noProgress=2;store.putCoordinator(c);
  await finish('alpha',{outcome:'wait',summary:'Wait for existing assignments',evidence:[],remaining:[],blocker:'',waitFor:{kind:'children'}});
  assert.equal(store.coordinator('alpha').noProgress,2);
  assert.equal(store.coordinator('alpha').status,'waiting');
  assert.equal(store.task('deferred').status,'waiting-capacity');
  assert.equal(engine.live.size,0);
});

test('two C and independent W share capacity fairly and preserve separate sessions',async t=>{
  const {engine,store,add,processes}=fixture(t,{maxWorkers:3});add('alpha');add('beta');store.set('mode','running');
  for(let i=0;i<3;i++)engine.enqueue({id:`alpha-${i}`,project:project(`a${i}`),brief},'alpha');
  engine.enqueue({id:'beta-one',project:project('b'),brief},'beta');
  engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);
  await settle();
  assert.equal(engine.live.size,3);
  assert.deepEqual(store.tasks().filter(t=>t.status==='running').map(t=>t.coordinatorId).sort(),[null,'alpha','beta'].sort());
  assert.equal(new Set(processes.map(p=>p.options.session)).size,3);
  assert.ok(processes.every(p=>!p.options.tools.split(',').includes('bash')));
});

test('cross-C capabilities cannot judge or message another C or standalone W',async t=>{
  const {engine,store,add}=fixture(t);add('alpha');add('beta');store.set('mode','running');
  engine.enqueue({id:'beta-one',project:project('b'),brief},'beta');
  engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);
  engine.reserveCoordinator(store.events(100,'alpha'),'alpha');await settle();
  const run=store.coordinator('alpha').runId,token=engine.tokens.get(run);
  for(const taskId of ['beta-one','direct-one']) {
    await assert.rejects(engine.agentAction(run,token,'message',{taskId,message:'wrong owner',requestId:'x'}),/different owner/);
    await assert.rejects(engine.agentAction(run,token,'decide',{taskId,runId:'x'}),/different owner/);
    await assert.rejects(engine.agentAction(run,token,'queue',{action:'pause',taskId,reason:'Wrong owner',requestId:taskId}),/different owner/);
  }
  const status=await engine.agentAction(run,token,'status',{});
  assert.equal(status.coordinatorId,'alpha');assert.equal(status.tasks,undefined);assert.equal(status.coordinators,undefined);
  assert.deepEqual(status.counts,{});
});

test('global project ownership fences C-C and C-independent conflicts, then releases an accepted result',async t=>{
  const {engine,store,add,finish}=fixture(t);add('alpha');add('beta');store.set('mode','running');
  engine.enqueue({id:'first',project:project('shared'),brief},'alpha');
  assert.throws(()=>engine.enqueue({id:'second',project:project('shared'),brief},'beta'),/unreleased/);
  assert.throws(()=>engine.enqueue({id:'standalone',project:project('shared'),brief,workerMode:'read-only'},null),/unreleased/);
  await settle();const runId=await finish('first');
  assert.throws(()=>engine.enqueue({id:'second',project:project('shared'),brief},'beta'),/unreleased/);
  engine.decide({taskId:'first',runId,disposition:'no_delivery',reason:'Exact local fixture completed'},'alpha');
  engine.enqueue({id:'second',project:project('shared'),brief},'beta');await settle();
  assert.equal(store.task('second').status,'running');
  const resumed={taskId:'first',runId,disposition:'continue',reason:'old followup',nextAction:'read',reconciliation:'old receipt'};
  // Once another owner has the project, the prior task must not reacquire it.
  assert.throws(()=>engine.decide(resumed,'alpha'),/another|held|reservation/);
});

test('targeted C Stop leaves other C and standalone processes running; heartbeat cannot revive it',async t=>{
  const {engine,store,add}=fixture(t);add('alpha');add('beta');store.set('mode','running');
  engine.enqueue({id:'alpha-one',project:project('a'),brief},'alpha');
  engine.enqueue({id:'beta-one',project:project('b'),brief},'beta');
  engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);await settle();
  await engine.control('stop',{target:{kind:'coordinator',id:'alpha'}});
  assert.equal(store.task('alpha-one').status,'interrupted');assert.equal(store.task('beta-one').status,'running');assert.equal(store.task('direct-one').status,'running');
  const runs=store.runs().length;engine.heartbeat();engine.heartbeat();await settle();
  assert.equal(store.runs().length,runs);assert.equal(store.coordinator('alpha').mode,'stopped');
  assert.equal(engine.governance().incidents[0].owner,'alpha-one');
});

test('C concurrency limit and domain event routing do not consume another domain results',async t=>{
  const {engine,store,add,finish}=fixture(t,{maxCoordinators:1});add('alpha',{runnable:true});add('beta',{runnable:true});store.set('mode','running');engine.kick();await settle();
  assert.equal(store.coordinators().filter(c=>c.status==='running').length,1);
  assert.equal(store.coordinator('alpha').status,'running');
  const betaEvents=store.events(100,'beta').map(e=>e.seq);
  await finish('alpha',{outcome:'complete',summary:'Empty finite scope completed',evidence:[],remaining:[],blocker:''});
  assert.equal(store.coordinator('beta').status,'running');assert.deepEqual(store.events(100,'beta').map(e=>e.seq),betaEvents);
  assert.notEqual(store.coordinator('alpha').session,store.coordinator('beta').session);
});

test('heartbeat routes one deduplicated C gap, creates no W assignment and respects explicit pause',async t=>{
  const {engine,store,add}=fixture(t);add('alpha',{runnable:true});
  const c=store.coordinator('alpha');c.campaign.continuous=true;c.nextWakeAt=Date.now()-100;store.putCoordinator(c);
  store.consume(store.events(100,'alpha').map(e=>e.seq));store.set('mode','running');
  assert.deepEqual(engine.heartbeat().routed,['alpha']);assert.deepEqual(engine.heartbeat().routed,[]);
  assert.equal(store.tasks().length,0);assert.equal(store.events(100,'alpha').filter(e=>e.kind==='heartbeat_gap').length,1);
  await engine.control('pause');await settle();const runs=store.runs().length;engine.heartbeat();await settle();assert.equal(store.runs().length,runs);
});

test('standalone result/failure routes to governance without inventing a C parent',async t=>{
  const {engine,store}=fixture(t);store.set('mode','running');
  engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);await settle();
  const run=store.task('direct-one').runId;engine.activity(run,'read');await engine.failRun(run,'fixture execution fault');await settle();
  assert.equal(store.task('direct-one').status,'failed');assert.equal(store.events(100,'c1').length,0);
  const issue=engine.governance().incidents[0];assert.equal(issue.recoveryOwner,'governance');assert.equal(issue.runId,run);
  assert.equal(engine.live.size,0);
});

test('governance request replay returns original receipt and rejects changed body',async t=>{
  const {engine,store}=fixture(t);const request={requestId:'one-operation',action:'coordinator-add',spec:{id:'alpha',campaign:campaign('alpha')}};
  const first=await engine.govern(request),again=await engine.govern(request);
  assert.deepEqual(again,first);assert.equal(store.coordinators().filter(c=>c.id==='alpha').length,1);
  await assert.rejects(engine.govern({...request,spec:{id:'beta',campaign:campaign('beta')}}),/reused/);
  const ambiguous={requestId:'uncertain',action:'message',target:{kind:'worker',id:'missing'},message:'hello',messageId:'msg'};
  await assert.rejects(engine.govern(ambiguous),/Unknown/);
  assert.equal((await engine.govern(ambiguous)).status,'failed-or-unknown');
});

test('three failures need prospective recovery grant, old counters and exact-run guard survive',async t=>{
  const {engine,store}=fixture(t);store.set('mode','running');engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);await settle();
  const runId=store.task('direct-one').runId;await engine.failRun(runId,'fixture execution fault');await settle();
  const task=store.task('direct-one');task.failures=3;store.putTask(task);
  const request={taskId:task.id,runId,decision:'continue',evidence:'Stopped exact fixture; no external writes',message:'Read remaining fixture'};
  assert.throws(()=>engine.reconcile({...request,runId:'stale'}),/run changed/);
  assert.throws(()=>engine.reconcile(request),/prospective recovery grant/);
  engine.reconcile({...request,recovery:{additionalAttempts:1,deadline:new Date(Date.now()+60000).toISOString(),authority:'Explicit owner recovery for this fixture'}});await settle();
  const continued=store.task(task.id);assert.equal(continued.failures,3);assert.equal(continued.attempts,2);assert.equal(continued.recovery.failureCeiling,4);
  assert.equal(store.run(continued.runId).session,store.run(runId).session);
});

test('launch setup failure is isolated as UNKNOWN while another accepted Worker starts',async t=>{
  const {engine,store}=fixture(t,{maxWorkers:2});const factory=engine.processFactory;
  engine.processFactory=(config,options)=>{if(options.owner==='broken')throw new Error('fixture launcher setup failed');return factory(config,options);};
  store.set('mode','running');
  engine.enqueue({id:'broken',project:project('broken'),brief,workerMode:'read-only'},null);
  engine.enqueue({id:'healthy',project:project('healthy'),brief,workerMode:'read-only'},null);await settle();
  assert.equal(store.task('broken').status,'unknown');assert.equal(store.task('healthy').status,'running');
  assert.equal(engine.closing,false);assert.equal(engine.governance().incidents[0].category,'unknown');
});

test('Stop waits for an already-settling owned process before returning',async t=>{
  const {engine,store}=fixture(t);store.set('mode','running');engine.enqueue({id:'direct-one',project:project('d'),brief,workerMode:'read-only'},null);await settle();
  const runId=store.task('direct-one').runId,live=engine.live.get(runId),close=live.process.close.bind(live.process);
  let release;const closing=new Promise(resolve=>{release=resolve;});
  live.process.close=async(...args)=>{await closing;return close(...args);};
  engine.report(runId,report);live.process.emit('record',{type:'agent_settled'});
  let stopped=false;const stop=engine.control('stop').then(()=>{stopped=true;});
  await settle();assert.equal(stopped,false);release();await stop;
  assert.equal(engine.live.size,0);assert.equal(store.run(runId).treeStopped,true);
});
