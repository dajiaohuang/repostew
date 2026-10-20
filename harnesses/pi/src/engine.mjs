import { randomUUID, createHash, randomBytes } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { invariant, safeId, projectKey, assignmentDir, nonempty, validateCampaign, validateConfig } from './config.mjs';
import { choosePool, classifyProviderFailure } from './routing.mjs';
import { PiProcess } from './rpc.mjs';
import { instructions, workerPrompt, coordinatorPrompt } from './prompts.mjs';
import { checkFreshEligibility, checkProjectExclusion } from './scope.mjs';
import { inspectRepository,readRepository } from './forge.mjs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadRole } from './roles.mjs';
import { piModule } from './pi-install.mjs';
import { todoStateFromBranch } from './pi/todo-state.mjs';
import {Subscriptions} from './subscriptions.mjs';
import {readPolicy} from './policy.mjs';
import {workflowFor,workflowTools} from './workflows.mjs';
import {validateSource,effectiveSource,captureSourcePage} from './sources.mjs';

const running=new Set(['starting','running','stopping']);
const isCoordinator=run=>run.role==='coordinator';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const now=()=>new Date().toISOString();
export class Engine extends EventEmitter {
  constructor(config,store,{processFactory=(c,o)=>new PiProcess(c,o),clock=Date.now,inspector=inspectRepository,repositoryReader=readRepository,sourceReader=captureSourcePage}={}) {
    super(); this.config=validateConfig({...config,...store.get('routingConfig')});this.store=store;this.processFactory=processFactory;this.clock=clock;
    this.live=new Map();this.tokens=new Map();this.pumping=false;this.pumpAgain=false;this.closing=false;
    this.endpoint=undefined;this.timer=undefined;this.subscriptions=new Subscriptions(store);
    this.inspector=inspector;
    this.repositoryReader=repositoryReader;
    this.sourceReader=sourceReader;this.sourcePending=new Map();
    if(!store.get('mode')) store.set('mode','paused');
    if(!store.get('routing')) store.set('routing',{});
    if(!store.coordinator('c1'))store.putCoordinator({id:'c1',mode:'running',status:'idle',session:join(config.runtimeDir,'c1-session.jsonl'),noProgress:0,nextWakeAt:0});
  }
  start(endpoint) {
    this.endpoint=endpoint; this.reconcileRestart();
    for(const task of this.store.tasks())if(task.runId&&['failed','blocked','interrupted','unknown'].includes(task.status))this.raiseIncident(this.store.run(task.runId),task.status);
    for(const c of this.store.coordinators())if(c.runId&&['blocked','interrupted','unknown'].includes(c.status))this.raiseIncident(this.store.run(c.runId),c.requiresReconciliation?'recovery-required':c.status);
    if(!this.store.get('governanceEventsBackfilled')) {
      for(const i of this.store.incidents())this.subscriptions.record({kind:'governance_attention',...i});
      for(const e of this.store.events(10000,null))if(e.kind==='worker_result')this.subscriptions.record({kind:e.kind,owner:e.owner,coordinatorId:null,...e.data});
      this.store.set('governanceEventsBackfilled',true);
    }
    this.timer=setInterval(()=>{try{this.heartbeat();}catch(e){this.fatal(e);}},this.config.heartbeatMs);
    this.timer.unref(); this.kick();
  }
  notify(kind,owner,data={},coordinatorId='c1') {const seq=this.store.event(kind,owner,data,coordinatorId);this.emit('change',{seq,kind,owner,coordinatorId,...data});return seq;}
  emit(name,...args) {
    if(name==='change'&&this.subscriptions) {
      const event=this.subscriptions.record(args[0]);
      queueMicrotask(()=>super.emit('governance-event',event));
    }
    return super.emit(name,...args);
  }
  coordinator(id='c1') {const c=this.store.coordinator(id);invariant(c,'Unknown coordinator');return c;}
  campaign(id='c1') {const c=this.coordinator(id);invariant(c.campaign,'No campaign loaded');return c.campaign;}
  taskCampaign(task) {return task.coordinatorId===null?task.authority:this.campaign(task.coordinatorId);}
  scopeRunning(id) {return this.store.get('mode')==='running'&&(id===null||this.coordinator(id).mode==='running');}
  occupiesWorkerSlot(task) {return running.has(task.status)||(task.status==='unknown'&&!this.store.run(task.runId)?.treeStopped);}
  occupiesCoordinatorSlot(c) {return running.has(c.status)||(c.status==='unknown'&&!this.store.run(c.runId)?.treeStopped);}
  status() {
    const tasks=this.store.tasks();const counts={};for(const t of tasks) counts[t.status]=(counts[t.status]??0)+1;
    const occupied={};for(const t of tasks) if(this.occupiesWorkerSlot(t)) occupied[t.poolId]=(occupied[t.poolId]??0)+1;
    return {mode:this.store.get('mode'),workspace:this.config.workspace,recordsRoot:join(this.config.workspace,'state/repositories'),workRoot:this.config.workRoot,campaign:this.store.get('campaign')?.id,coordinator:this.store.get('coordinator'),
      maxWorkers:this.config.maxWorkers,maxQueued:this.config.maxQueued,maxCoordinators:this.config.maxCoordinators,counts,occupied,
      pools:this.config.pools.map(p=>({...p,...this.store.get('routing')[p.id]})),
      candidatesRemaining:this.candidatesRemaining(),tasks:tasks.slice(-20).map(t=>({id:t.id,coordinatorId:t.coordinatorId,project:t.projectKey,status:t.status,pool:t.poolId,attempts:t.attempts,result:t.result,problem:t.problem,judgment:t.judgment,todo:t.todoSnapshot?.todos,todoSource:t.todoSnapshot?'Pi session (display projection)':t.plan?'legacy plan retained in history':undefined})),
      coordinators:this.store.coordinators().map(c=>({id:c.id,mode:c.mode,status:c.status,wait:c.wait??null,campaign:c.campaign?.id,workflow:c.campaign?.workflow,maxWorkers:c.maxWorkers??this.config.maxWorkers,runId:c.runId,problem:c.problem,requiresReconciliation:c.requiresReconciliation,candidatesRemaining:this.candidatesRemaining(c.id)})),
      pendingEvents:this.store.events(100).length,openIncidents:this.store.incidents().length,liveProcesses:this.live.size};
  }
  addCoordinator({id,campaign,model,maxWorkers}) {
    safeId(id,'coordinator id');invariant(!this.store.task(id),'Coordinator id collides with a Worker id');
    if(model)validateConfig({...this.config,coordinator:model});
    if(maxWorkers!==undefined)invariant(Number.isSafeInteger(maxWorkers)&&maxWorkers>=1&&maxWorkers<=this.config.maxWorkers,'Coordinator capacity must fit the global Worker limit');
    const existing=this.store.coordinator(id);
    if(existing?.campaign) {
      invariant(existing.campaign.fingerprint===digest(campaign)&&digest(existing.model??null)===digest(model??null)&&(existing.maxWorkers??null)===(maxWorkers??null),'Coordinator id reused with different configuration');
      return {id,duplicate:true,mode:existing.mode};
    }
    validateCampaign(campaign);
    this.validateSources(campaign);
    this.store.transaction(()=>{
      const {candidates,...metadata}=campaign;
      this.store.putCoordinator({id,mode:'paused',status:'idle',model,maxWorkers,session:join(this.config.runtimeDir,'coordinators',id,'session.jsonl'),noProgress:0,nextWakeAt:0,campaign:{...metadata,hasCandidateSnapshot:Boolean(candidates?.length),fingerprint:digest(campaign)}});
      if(candidates?.length)this.store.addCandidates(id,candidates,projectKey);
      this.notify('campaign_loaded',id,{campaign:campaign.id},id);
    });
    return {id,mode:'paused',candidates:campaign.candidates?.length??0};
  }
  loadCampaign(campaign) {
    validateCampaign(campaign);
    this.validateSources(campaign);
    invariant(this.store.get('mode')==='paused' && this.live.size===0,'Pause/drain current work before loading a campaign');
    const old=this.store.get('campaign');invariant(!old || old.id===campaign.id,'Use a distinct runtimeDir for a different campaign');
    const fingerprint=digest(campaign);
    if(old) invariant(old.fingerprint===fingerprint,'Campaign already exists; do not silently replace its authority');
    this.store.transaction(()=>{
      const {candidates,...metadata}=campaign;
      this.store.set('campaign',{...metadata,hasCandidateSnapshot:Boolean(candidates?.length),fingerprint});
      if(!old&&candidates?.length)this.store.addCandidates('c1',candidates,projectKey);
      if(!old)this.notify('campaign_loaded','c1',{campaign:campaign.id});
    });
    return {id:campaign.id,candidates:campaign.candidates?.length??0};
  }
  validateSources(campaign) {
    if(campaign.sources===undefined)return;
    invariant(Array.isArray(campaign.sources)&&campaign.sources.length<=50,'Specify at most 50 exact sources');
    const ids=new Set();
    for(const source of campaign.sources) {
      validateSource(source);invariant(!ids.has(source.id),'Duplicate source id');ids.add(source.id);
      if(source.project) {
        const allowed=campaign.allowedProjects.some(p=>projectKey(p)===projectKey(source.project))||campaign.allowedHosts.includes(source.project.host);
        invariant(allowed,'Source project is outside campaign authority');
      }
    }
  }
  coordinatorStatus(coordinatorId='c1') {
    // Pi's active session branch owns history and TODOs. The control UI may
    // display projections, but do not feed them back as a second agent memory.
    const {tasks,coordinator,coordinators,...current}=this.status();
    const c=this.coordinator(coordinatorId),owned=this.store.tasks(coordinatorId),counts={};
    for(const t of owned)counts[t.status]=(counts[t.status]??0)+1;
    return {...current,coordinatorId,campaign:c.campaign?.id,workflow:c.campaign?.workflow,scopeMode:c.mode,counts,
      candidatesRemaining:this.candidatesRemaining(coordinatorId),pendingEvents:this.store.events(100,coordinatorId).length,
      domainMaxWorkers:c.maxWorkers??this.config.maxWorkers,wait:c.wait??null,
      sources:(c.campaign?.sources??[]).map(s=>({id:s.id,kind:s.kind})),
      admission:{ready: this.store.tasks().filter(t=>t.status==='queued'&&!t.paused).length,limit:this.config.maxQueued,
        deferred:owned.filter(t=>t.status==='waiting-capacity').map(t=>t.id),maxDeferredPerOwner:1}};
  }
  candidatesRemaining(coordinatorId='c1') {
    return this.store.remainingCandidates(coordinatorId);
  }
  candidatePage(limit=10,coordinatorId='c1') {
    invariant(Number.isSafeInteger(limit)&&limit>=1&&limit<=20,'candidate page limit must be 1..20');
    return this.store.candidatePage(limit,coordinatorId).map(candidate=>{
      const key=projectKey(candidate.project??candidate),holder=this.store.tasks().find(t=>t.projectKey===key&&this.projectHeld(t));
      return holder?{...candidate,reservation:{taskId:holder.id,owner:holder.coordinatorId??'governance',status:holder.status}}:candidate;
    });
  }
  allowedProject(project,coordinatorId='c1') {
    const c=this.campaign(coordinatorId);const key=projectKey(project);
    const allowed=c.allowedProjects.some(p=>projectKey(p)===key)||c.allowedHosts.includes(project.host.toLowerCase());
    invariant(allowed,'Project is outside campaign authority');
    const exclusion=checkProjectExclusion(this.config,project);invariant(exclusion.ok,exclusion.reason);
    if(c.hasCandidateSnapshot)invariant(this.store.candidate(key,coordinatorId)&&!this.store.candidate(key,coordinatorId).disposition,'Project not present/eligible in the finite candidate snapshot');
    return key;
  }
  projectHeld(task) {
    if(task.status==='cancelled')return !task.reconciliation;
    if(!['delivered','no_delivery'].includes(task.status))return true;
    const run=task.runId&&this.store.run(task.runId);
    return !run?.treeStopped || (task.coordinatorId!==null&&!['delivered','no_delivery'].includes(task.judgment?.disposition));
  }
  enqueue(input,coordinatorId='c1') {
    invariant(this.scopeRunning(coordinatorId),'Dispatch is disabled while paused/draining/stopped');
    safeId(input.id);invariant(!this.store.coordinator(input.id),'Worker id collides with a coordinator id');
    const key=coordinatorId===null?projectKey(input.project):this.allowedProject(input.project,coordinatorId);
    if(coordinatorId===null){invariant(['read-only','engineering'].includes(input.workerMode),'Independent Worker needs explicit workerMode');const exclusion=checkProjectExclusion(this.config,input.project);invariant(exclusion.ok,exclusion.reason);}
    const brief={};for(const k of ['objectOutcome','locationPrior','completeTodo','authorityResources','finishReturn'])brief[k]=nonempty(input.brief?.[k],`brief.${k}`);
    const wrongRoot=`${this.config.workspace.replaceAll('\\','/')}/repostew_pi/state/repositories`.toLowerCase();
    invariant(!Object.values(brief).some(v=>v.replaceAll('\\','/').toLowerCase().includes(wrongRoot)),'Incorrect record root in brief: use the host recordsRoot from harness_status');
    const signature=digest({project:input.project,brief});const old=this.store.task(input.id);
    if(old){invariant(old.signature===signature&&old.coordinatorId===coordinatorId&&(coordinatorId!==null||old.authority.workerMode===input.workerMode),'Assignment id reused for different work');return {id:old.id,status:old.status,duplicate:true};}
    const tasks=this.store.tasks();
    const deferred=tasks.filter(t=>t.status==='queued'&&!t.paused).length>=this.config.maxQueued;
    if(deferred&&tasks.some(t=>t.coordinatorId===coordinatorId&&t.status==='waiting-capacity')) {
      if(coordinatorId!==null){const c=this.coordinator(coordinatorId);c.capacityObservedAt=now();this.store.putCoordinator(c);}
      return {id:input.id,accepted:false,status:'waiting-capacity',reason:'Ready queue and this owner admission slot are full. The existing deferred assignment is retained; wait for capacity or children. Do not create another id.'};
    }
    invariant(!tasks.some(t=>t.projectKey===key&&this.projectHeld(t)),'Project already has an unreleased assignment; use its owning task or reconcile it');
    const campaign=coordinatorId===null?{id:`direct-${input.id}`,mandate:brief.objectOutcome,workerMode:input.workerMode,workflow:input.workflow??'direct',allowedProjects:[input.project],allowedHosts:[]}:this.campaign(coordinatorId);
    if(campaign.freshMembership){const eligible=checkFreshEligibility(this.config.workspace,input.project,this.config);invariant(eligible.ok,eligible.reason);}
    if(campaign.requireAdmission)invariant(this.store.get(this.scopeKey('admission',key,coordinatorId))?.eligible,'Coordinator must inspect and admit this target before dispatch');
    if(campaign.requireAbsentProjectRoot)invariant(!existsSync(join(this.config.workspace,'state/repositories',key)),'Existing project root: touched/owned status is not clear; exclude from fresh campaign');
    const cwd=assignmentDir(this.config,input.project,input.id);
    const task={id:input.id,coordinatorId,project:input.project,projectKey:key,brief,signature,cwd,status:deferred?'waiting-capacity':'queued',createdAt:now(),attempts:0,continuations:0,reminders:0,...(coordinatorId===null?{authority:campaign}:{})};
    this.store.transaction(()=>{this.store.putTask(task);this.notify('assignment_queued',task.id,{project:key},coordinatorId);});
    this.kick();return {id:task.id,accepted:true,status:task.status,cwd};
  }
  skip(project,reason,evidence,coordinatorId='c1') {
    const key=this.allowedProject(project,coordinatorId);nonempty(reason,'reason');nonempty(evidence,'evidence');
    invariant(!this.store.tasks(coordinatorId).some(t=>t.projectKey===key&&!t.queueWithdrawn),'Cannot skip an assigned project');
    this.store.skipCandidate(key,{reason,evidence,at:now()},coordinatorId);
    return {project:key,disposition:'skipped'};
  }
  report(runId,report) {
    const run=this.store.run(runId);invariant(run&&running.has(run.status),'Run is not active');
    const outcomes=isCoordinator(run)?['wait','complete','blocked','continue']:['delivered','no_delivery','blocked','failed','continue'];
    invariant(outcomes.includes(report.outcome),'Invalid report outcome');nonempty(report.summary,'summary');
    invariant(Array.isArray(report.evidence)&&Array.isArray(report.remaining)&&typeof report.blocker==='string','Malformed report');
    for(const value of [...report.evidence,...report.remaining])nonempty(value,'report item',6000);
    if(['delivered','no_delivery'].includes(report.outcome))invariant(report.evidence.length>0&&!report.remaining.length&&!report.blocker.trim(),'Final delivery needs evidence and no remaining work/blocker');
    if(['blocked','failed'].includes(report.outcome))nonempty(report.blocker,'blocker');
    if(report.outcome==='continue')invariant(report.remaining.length>0&&!report.blocker.trim(),'Continuation needs feasible remaining work');
    if(report.outcome==='complete')invariant(!report.remaining.length&&!report.blocker.trim(),'Complete cannot have a remainder');
    if(report.userAction!==undefined){
      invariant(!isCoordinator(run),'User action belongs to the exact Worker result');
      invariant(['delivered','no_delivery'].includes(report.outcome),'User follow-up requires a completed Worker unit; a real creation barrier remains blocked');
      invariant(['cla','dco','other'].includes(report.userAction?.kind),'Invalid user action kind');
      nonempty(report.userAction.reference,'user action reference',2000);nonempty(report.userAction.action,'user action',2000);
      report={...report,userAction:{kind:report.userAction.kind,reference:report.userAction.reference,action:report.userAction.action}};
    }
    if(isCoordinator(run)) {
      const unjudged=this.store.events(100,run.coordinatorId).filter(e=>(run.eventIds??[]).includes(e.seq)&&e.kind==='worker_result'&&!this.store.decision(e.data.runId));
      invariant(!unjudged.length,`Judge each Worker result with harness_decide before settling: ${unjudged.map(e=>e.owner).join(', ')}`);
      if(report.waitFor!==undefined) {
        invariant(report.outcome==='wait','waitFor is only valid with wait');
        invariant(['capacity','children','external','time'].includes(report.waitFor.kind),'Invalid wait condition');
      }
      if(report.outcome==='wait') {
        const c=this.coordinator(run.coordinatorId),children=this.store.tasks(c.id).some(t=>running.has(t.status)||['queued','continuing','waiting-capacity'].includes(t.status));
        const kind=report.waitFor?.kind??(children?'children':c.capacityObservedAt?'capacity':undefined);
        invariant(kind,'Wait needs actual children, observed capacity pressure, or explicit external/time condition');
        if(kind==='children')invariant(children||this.store.events(100,c.id).some(e=>e.kind==='worker_result'),'No accepted children or pending results to wait for');
        if(kind==='capacity')invariant(c.capacityObservedAt||this.store.tasks().filter(t=>t.status==='queued'&&!t.paused).length>=this.config.maxQueued,'No capacity wait was observed');
        if(kind==='external')nonempty(report.blocker,'External wait reason');
        if(kind==='time')invariant(Number.isFinite(Date.parse(report.waitFor.until))&&Date.parse(report.waitFor.until)>this.clock(),'Time wait needs a future ISO date');
        report={...report,waitFor:{kind,...(kind==='time'?{until:report.waitFor.until}:{})}};
      }
    }
    const {requestId,...clean}=report;run.report=clean;run.reportAt=now();this.store.putRun(run);return {recorded:true,finalized:false};
  }
  activity(runId,tool) {
    const run=this.store.run(runId);invariant(run&&running.has(run.status),'Run no longer active');
    run.report=undefined;run.lastActivity=now();
    if(!tool.startsWith('harness_'))run.toolStarted=true;
    if(isCoordinator(run)&&['write','edit','bash','powershell'].includes(tool))run.mutationStarted=true;
    this.store.putRun(run);return {ok:true};
  }
  async agentAction(runId,token,action,body) {
    invariant(this.tokens.get(runId)===token,'Invalid run capability');
    const run=this.store.run(runId);invariant(run&&running.has(run.status),'Run no longer active');
    if(action==='activity')return this.activity(runId,body.tool);
    if(action==='status')return isCoordinator(run)?this.coordinatorStatus(run.coordinatorId):{mode:this.store.get('mode'),task:this.store.task(run.owner)};
    if(action==='report')return this.report(runId,body);
    if(action==='policy')return readPolicy(this.config,body,isCoordinator(run)?this.campaign(run.coordinatorId):this.taskCampaign(this.store.task(run.owner)));
    if(action==='repository')return this.repositoryRead(run,body);
    if(action==='task'){invariant(!isCoordinator(run),'Task view is for W');const {plan,planRevision,todoSnapshot,...task}=this.store.task(run.owner);return {...task,todo:'Use Pi todo list; session tool-result details are authoritative'};}
    invariant(isCoordinator(run),'Worker cannot dispatch, select, or message other workers');
    const coordinatorId=run.coordinatorId;
    if(action==='source')return this.sourceRead(coordinatorId,body,run);
    if(['dispatch','admit','skip','decide','message'].includes(action)||(action==='queue'&&body.action!=='list')){run.mutationStarted=true;this.store.putRun(run);}
    if(['decide','message'].includes(action))invariant(this.store.task(body.taskId)?.coordinatorId===coordinatorId,'Task belongs to a different owner');
    if(action==='inspect')return this.inspect(body.project,coordinatorId,body);
    if(action==='admit')return this.admit(body.project,body.reason,coordinatorId);
    if(action==='decide')return this.decide(body,coordinatorId);
    if(action==='dispatch')return this.enqueue(body,coordinatorId);
    if(action==='candidates')return this.candidatePage(body.limit,coordinatorId);
    if(action==='skip')return this.skip(body.project,body.reason,body.evidence,coordinatorId);
    if(action==='message')return this.sendMessage(body.taskId,body.message,`${runId}:${body.requestId}`);
    if(action==='queue')return this.manageQueue(body,coordinatorId,runId);
    throw new Error('Unknown agent action');
  }
  manageQueue(body,coordinatorId,runId) {
    const {action,taskId,reason,priority,requestId}=body;
    if(action==='list') {
      const {offset=0,limit=20}=body;
      invariant(Number.isSafeInteger(offset)&&offset>=0&&Number.isSafeInteger(limit)&&limit>=1&&limit<=50,'Invalid queue page');
      const tasks=this.store.tasks(coordinatorId).filter(t=>!['delivered','no_delivery','cancelled'].includes(t.status));
      return {total:tasks.length,nextOffset:offset+limit<tasks.length?offset+limit:null,
        tasks:tasks.slice(offset,offset+limit).map(t=>({id:t.id,project:t.projectKey,status:t.status,priority:t.queuePriority??0,paused:!!t.paused,
          pauseOwner:t.queuePauseOwner??(t.paused?'governance':null),runId:t.runId??null,attempts:t.attempts,
          projectHeld:this.projectHeld(t),occupiesSlot:this.occupiesWorkerSlot(t)}))};
    }
    invariant(['priority','pause','resume','withdraw'].includes(action),'Unknown queue action');
    nonempty(requestId,'queue requestId',200);nonempty(reason,'queue reason',2000);
    const id=`queue:${runId}:${requestId}`,signature=digest(body),prior=this.store.receipt(id);
    if(prior){invariant(prior.signature===signature,'Queue requestId reused');return prior.result;}
    invariant(this.scopeRunning(coordinatorId),'Queue changes disabled while paused/draining/stopped');
    const task=this.store.task(taskId);invariant(task?.coordinatorId===coordinatorId,'Task belongs to a different owner');
    invariant(!['delivered','no_delivery','cancelled'].includes(task.status),'Task is no longer pending');
    if(action==='priority'){
      invariant(['queued','waiting-capacity','continuing'].includes(task.status),'Only queued tasks can be reordered');
      invariant(Number.isSafeInteger(priority)&&priority>=-100&&priority<=100,'Priority must be -100..100');
      task.queuePriority=priority;
    } else if(action==='pause'){
      if(!task.paused){task.paused=true;task.queuePauseOwner=coordinatorId;}
    } else if(action==='resume'){
      invariant(task.paused&&task.queuePauseOwner===coordinatorId,'C can resume only its own queue pause');
      invariant(['queued','waiting-capacity','continuing'].includes(task.status),'Reconcile the exact run before resuming');
      if(task.status==='queued'&&this.store.tasks().filter(t=>t.status==='queued'&&!t.paused).length>=this.config.maxQueued){
        invariant(!this.store.tasks(coordinatorId).some(t=>t.id!==task.id&&t.status==='waiting-capacity'),'Owner deferred slot is full');
        task.status='waiting-capacity';
      }
      task.paused=false;delete task.queuePauseOwner;
    } else {
      invariant(['queued','waiting-capacity'].includes(task.status)&&task.attempts===0&&!task.runId&&!this.store.runs().some(r=>r.owner===task.id),'Withdrawal requires a never-started assignment');
      task.status='cancelled';task.queueWithdrawn=true;
      task.reconciliation={at:now(),decision:'withdraw',evidence:'Host verified zero attempts and no run; '+reason};
    }
    const result={id:task.id,status:task.status,paused:!!task.paused,priority:task.queuePriority??0,projectHeld:this.projectHeld(task)};
    this.store.transaction(()=>{
      this.store.putTask(task);this.store.saveReceipt(id,{signature,result});
      this.notify('queue_changed',task.id,{action,reason},coordinatorId);
    });
    this.kick();return result;
  }
  projectTodo(owner,state,role='worker') {
    // A UI projection only: branch-aware Pi tool results remain authoritative.
    const snapshot={todos:state.todos,nextId:state.nextId,at:now()};
    if(role==='coordinator'){const c=this.coordinator(owner);c.todoSnapshot=snapshot;this.store.putCoordinator(c);}
    else {const task=this.store.task(owner);task.todoSnapshot=snapshot;this.store.putTask(task);}
  }
  scopeKey(kind,key,coordinatorId) {return coordinatorId==='c1'?`${kind}:${key}`:`${kind}:${coordinatorId}:${key}`;}
  async sourceRead(coordinatorId,body,run) {
    invariant(!this.closing&&!this.storageFailed&&['starting','running'].includes(this.store.run(run.id)?.status),'Source owner is no longer active');
    const c=this.coordinator(coordinatorId),sources=c.campaign.sources??[];
    if(body.action==='list')return {sources,pass:c.completedPasses??0};
    invariant(body.action==='capture','Use list or capture');
    const source=sources.find(s=>s.id===body.sourceId);invariant(source,'Source is not in this campaign');
    const pass=c.completedPasses??0,key=`${pass}:${source.id}`,page=body.page??1;
    const gateKey=`source:${coordinatorId}:${source.id}`,gates=this.store.get('forgeGates')??{};
    const gate=this.store.get('forgeGate')??gates[source.host]??gates[gateKey];
    invariant(!gate,'Source has an unreconciled access/rate gate');
    c.sourceWindows??={};c.sourceWindows[key]??=this.clock();this.store.putCoordinator(c);
    const selected=effectiveSource(source,c.sourceWindows[key]);
    const pendingKey=`${coordinatorId}:${key}:${page}`;
    if(this.sourcePending.has(pendingKey))return this.sourcePending.get(pendingKey);
    run.mutationStarted=true;this.store.putRun(run);
    const promise=(async()=>{
      const result=await this.sourceReader(this.config,selected,{page,coordinatorId,pass},{shouldStop:()=>this.closing||this.storageFailed});
      if(this.closing||this.storageFailed)return {...result,coverageApplied:false};
      const active=this.store.run(run.id);
      // A stopped/settled turn cannot advance source positions. Its retained
      // receipt is reused on an explicitly authorized continuation.
      if(!active||!['starting','running'].includes(active.status))return {...result,coverageApplied:false};
      if(!result.failure) {
        const current=this.coordinator(coordinatorId);current.sourceCoverage??={};
        const previous=current.sourceCoverage[key];
        if(!previous||result.page>=previous.page)current.sourceCoverage[key]={complete:result.complete,page:result.page,rawPath:result.rawPath,indexPath:result.indexPath,sha256:result.indexSha256??result.sha256};
        this.store.putCoordinator(current);
        if(!previous||result.page>previous.page){active.sourceProgress=true;this.store.putRun(active);}
      }
      if(result.failure?.scope) {
        const current=this.store.get('forgeGates')??{};
        current[result.failure.scope==='host'?source.host:gateKey]={...result.failure,sourceId:source.id,coordinatorId,at:now()};
        this.store.set('forgeGates',current);
      }
      return result;
    })();
    this.sourcePending.set(pendingKey,promise);
    try{return await promise;}finally{this.sourcePending.delete(pendingKey);}
  }
  forgeGate(project) {
    const gates=this.store.get('forgeGates')??{};
    return this.store.get('forgeGate')??gates[project.host.toLowerCase()]??gates[projectKey(project)];
  }
  recordForgeFailure(project,failure) {
    if(!failure?.scope)return;
    const gates=this.store.get('forgeGates')??{},key=failure.scope==='host'?project.host.toLowerCase():projectKey(project);
    gates[key]={category:failure.category,status:failure.status,scope:failure.scope,at:now(),project:projectKey(project)};
    this.store.set('forgeGates',gates);
  }
  assertForgeReady(project) {
    const gate=this.forgeGate(project);
    invariant(!gate,`Forge reads paused for this ${gate?.scope??'legacy gate'}: ${gate?.category??''}; reconcile the actual access/rate gate`);
  }
  async inspect(project,coordinatorId='c1',{refresh=false,reason}={}) {
    const key=this.allowedProject(project,coordinatorId);this.assertForgeReady(project);
    if(refresh)nonempty(reason,'Changed input/evidence requiring fresh inspection',2000);
    const old=this.store.get(this.scopeKey('inspection',key,coordinatorId));if(old?.repository&&!old.failure&&!refresh)return old;
    const result=await this.inspector(project,this.config);
    this.store.set(this.scopeKey('inspection',key,coordinatorId),result);
    this.recordForgeFailure(project,result.failure);
    return result;
  }
  async repositoryRead(run,body) {
    const project=body.project??(!isCoordinator(run)?this.store.task(run.owner).project:undefined);
    invariant(project,'Exact project required');
    const campaign=isCoordinator(run)?this.campaign(run.coordinatorId):this.taskCampaign(this.store.task(run.owner));
    if(isCoordinator(run))this.allowedProject(project,run.coordinatorId);
    else invariant(projectKey(project)===this.store.task(run.owner).projectKey,'Worker repository reads are limited to its own project');
    const exclusion=checkProjectExclusion(this.config,project);invariant(exclusion.ok,exclusion.reason);
    this.assertForgeReady(project);
    const result=body.operation==='inspect'
      ? await this.inspector(project,this.config)
      : await this.repositoryReader(project,body,{...this.config,allowPrivate:campaign.allowedProjects.some(p=>projectKey(p)===projectKey(project))});
    this.recordForgeFailure(project,result.failure);
    return result;
  }
  admit(project,reason,coordinatorId='c1') {
    const key=this.allowedProject(project,coordinatorId);nonempty(reason,'admission reason',4000);
    const inspected=this.store.get(this.scopeKey('inspection',key,coordinatorId));invariant(inspected?.repository&&!inspected.failure,'A successful native inspection is required');
    const r=inspected.repository;
    const campaign=this.campaign(coordinatorId);
    const explicit=campaign.allowedProjects.some(p=>projectKey(p)===key);
    invariant((!r.private||explicit&&!campaign.freshMembership)&&!r.archived&&!r.disabled&&!inspected.nativeIdentityChanged,'Private unassigned, archived, disabled or renamed target cannot enter this campaign');
    const admission={eligible:true,reason,nativeId:r.id,at:now(),inspectionAt:inspected.at};this.store.set(this.scopeKey('admission',key,coordinatorId),admission);return admission;
  }
  decide({taskId,runId,disposition,reason,nextAction='',reconciliation=''},coordinatorId='c1') {
    invariant(this.store.task(taskId)?.coordinatorId===coordinatorId,'Task belongs to a different owner');
    const previous=this.store.decision(runId);
    if(previous){
      invariant(previous.taskId===taskId,'Result belongs to another task');
      if(previous.disposition===disposition&&previous.nextAction===nextAction)return {...previous,duplicate:true};
      invariant(disposition==='continue'&&previous.disposition!=='continue','Only an evidenced same-task continuation can supersede an earlier judgment');
    }
    const task=this.store.task(taskId);const run=this.store.run(runId);
    invariant(task&&run?.owner===taskId&&!running.has(run.status),'Decision must reference an exact completed Worker run');
    nonempty(reason,'judgment reason',6000);invariant(['delivered','no_delivery','continue','blocked','failed'].includes(disposition),'Invalid disposition');
    if(['delivered','no_delivery'].includes(disposition))invariant(run.report?.outcome===disposition&&run.treeStopped&&!run.failure,'Cannot accept a different, failed or uncertain reported outcome');
    const decision={taskId,runId,disposition,reason,nextAction,reconciliation,at:now(),...(previous?{supersedes:previous}:{})};
    if(disposition==='continue') {
      invariant(this.scopeRunning(coordinatorId),'Continuation is disabled while paused/draining/stopped');
      invariant(!this.store.tasks().some(other=>other.id!==task.id&&other.projectKey===task.projectKey&&this.projectHeld(other)),'Project reservation is held by another task');
      invariant(task.runId===runId&&run.treeStopped&&!['unknown','interrupted','cancelled'].includes(task.status),'Continuation needs the current stopped task; operator stops/unknowns require operator reconciliation');
      invariant((task.failures??0)<(task.recovery?.failureCeiling??3),'Three execution failures require owner diagnosis; no automatic fourth attempt');
      invariant(task.continuations<(task.recovery?.continuationCeiling??this.config.maxContinuations),'Same-task continuation budget exhausted; owner diagnosis required');
      nonempty(nextAction,'complete recovery remainder');nonempty(reconciliation,'stopped/effects reconciliation');
      task.continuations++;
      task.status='continuing';task.continuation=nextAction;task.reconciliation={evidence:reconciliation,at:now(),decision:'continue'};
    }
    task.judgment=decision;this.store.transaction(()=>{
      this.store.putTask(task);this.store.putDecision(runId,taskId,decision);this.notify('worker_judgment',taskId,{runId,disposition,reason,nextAction},coordinatorId);
      // Only captured-feedback handling asks the user. Submission-time follow-up
      // remains on the result for later notifications, without holding W open.
      if(['delivered','no_delivery'].includes(disposition)&&run.report?.userAction&&workflowFor(this.taskCampaign(task).workflow).userFollowup){
        const receiptId=`user-action:${runId}`;
        if(!this.store.receipt(receiptId)){
          this.store.saveReceipt(receiptId,{runId,taskId,at:now()});
          this.emit('change',{kind:'user_action_required',owner:taskId,coordinatorId,status:disposition,runId,treeStopped:true});
        }
      }
    });
    this.kick();return decision;
  }
  async sendMessage(taskId,message,requestId,kind='worker') {
    nonempty(message,'message');nonempty(requestId,'message requestId',200);
    const signature=digest({kind,taskId,message}),prior=this.store.receipt(requestId);
    if(prior){invariant(prior.signature===signature,'Message requestId reused for different delivery');return prior;}
    const task=kind==='coordinator'?this.store.coordinator(taskId):this.store.task(taskId);invariant(task,'Unknown task/coordinator');
    const live=task.runId&&this.live.get(task.runId);invariant(live&&!live.finishing,'Task is not accepting messages; no implicit restart');
    this.store.saveReceipt(requestId,{status:'delivery-unknown',taskId,kind,signature});
    const result=await live.process.steer(message);
    const value={status:result?.disposition??'queued',taskId,kind,signature};
    this.store.updateReceipt(requestId,value);return value;
  }
  kick() {
    if(this.closing)return;
    if(this.pumping){this.pumpAgain=true;return;}
    this.pumping=true;
    queueMicrotask(async()=>{
      try {do{this.pumpAgain=false;await this.pump();}while(this.pumpAgain&&!this.closing);}
      catch(e){this.fatal(e);}
      finally{this.pumping=false;}
    });
  }
  fatal(error) {
    // ENOSPC cannot be "fixed" by writing more status rows. Abort owned sessions.
    if(this.closing&&this.fatalError)return;
    this.fatalError=error;this.storageFailed=true;this.closing=true;clearInterval(this.timer);
    this.emit('fatal',error);
    for(const live of this.live.values())void live.process.close(true);
  }
  coordinatorWake(c) {
    if(!c.campaign||c.mode!=='running'||running.has(c.status)||['unknown','interrupted'].includes(c.status))return undefined;
    if(c.status==='complete'&&(!c.campaign.continuous||!c.nextWakeAt||c.nextWakeAt>this.clock()))return undefined;
    if(c.requiresReconciliation||(c.retryAt??0)>this.clock())return undefined;
    const events=this.store.events(100,c.id).filter(e=>!['assignment_queued','worker_judgment'].includes(e.kind));
    const actionable=events.some(e=>['worker_result','owner_delta','owner_reconciliation','admission_changed','recovery_expired'].includes(e.kind));
    if(c.wait?.kind==='external'&&!actionable)return undefined;
    if(c.status==='blocked'&&!c.wait&&!actionable)return undefined;
    const tasks=this.store.tasks(c.id),active=tasks.filter(t=>running.has(t.status)),queued=tasks.filter(t=>['queued','continuing','waiting-capacity'].includes(t.status));
    const queueRoom=this.store.tasks().filter(t=>t.status==='queued'&&!t.paused).length<this.config.maxQueued;
    if(c.wait?.kind==='capacity'&&!queueRoom&&!actionable)return undefined;
    if(['time','retry'].includes(c.wait?.kind)&&Date.parse(c.wait.until)>this.clock()&&!actionable)return undefined;
    const waitReady=c.wait?.kind==='capacity'&&queueRoom||['time','retry'].includes(c.wait?.kind)&&Date.parse(c.wait.until)<=this.clock();
    if(c.wait?.kind==='children'&&queued.length+active.length>0&&!actionable)return undefined;
    const needsInput=queueRoom&&this.candidatesRemaining(c.id)>0&&queued.length<Math.max(1,(c.maxWorkers??this.config.maxWorkers)-active.length);
    const scheduled=c.nextWakeAt>0&&c.nextWakeAt<=this.clock();
    return actionable||(!c.wait&&events.length)||needsInput||scheduled||waitReady||c.continuePending?{events,reason:actionable?'pending-events':waitReady?'wait-condition-ready':c.continuePending?'same-scope-continuation':needsInput?'authorized-refill':'due-revisit'}:undefined;
  }
  heartbeat() {
    // One service-level fallback. It routes retained facts to C only. It never
    // creates a Worker assignment, cancels work, clears a gate, or renews scope.
    if(this.closing||this.store.get('mode')!=='running')return {routed:[]};
    const routed=[];
    for(const c of this.store.coordinators()) {
      const wake=this.coordinatorWake(c);
      if(!wake||wake.events.length)continue; // equivalent delivery already queued
      this.notify('heartbeat_gap',c.id,{reason:wake.reason,message:'Review the retained authorized scope and actual capacity; select a complete unit only if feasible. Existing blockers, limits and pauses remain binding.'},c.id);
      routed.push(c.id);
    }
    this.store.set('lastHeartbeat',{at:now(),routed});
    // Normal scheduler resumes only already accepted queues and routed C turns.
    this.kick();return {routed};
  }
  nextWorker(tasks,occupied) {
    const eligible=tasks.filter(t=>{
      if(!['queued','continuing'].includes(t.status)||t.paused||!this.scopeRunning(t.coordinatorId))return false;
      const c=t.coordinatorId===null?undefined:this.coordinator(t.coordinatorId);
      if(c&&tasks.filter(x=>x.coordinatorId===c.id&&this.occupiesWorkerSlot(x)).length>=(c.maxWorkers??this.config.maxWorkers))return false;
      if(tasks.some(other=>other.id!==t.id&&other.projectKey===t.projectKey&&this.projectHeld(other)))return false;
      if(t.status==='queued')return true;
      const p=this.config.pools.find(p=>p.id===t.poolId),state=this.store.get('routing')[p?.id]??{};
      return p&&p.enabled&&!state.disabledReason&&(state.cooldownUntil??0)<=this.clock()&&(occupied[p.id]??0)<p.maxConcurrent;
    });
    const owners=[...new Set(tasks.map(t=>t.coordinatorId??'@independent'))];
    if(!eligible.length)return undefined;
    const previous=this.store.get('lastWorkerOwner'),index=owners.indexOf(previous);
    for(let offset=1;offset<=owners.length;offset++) {
      const owner=owners[(index+offset)%owners.length];
      const next=eligible.filter(t=>(t.coordinatorId??'@independent')===owner).sort((a,b)=>(b.queuePriority??0)-(a.queuePriority??0))[0];if(next)return next;
    }
  }
  async pump() {
    const mode=this.store.get('mode');if(mode!=='running'&&mode!=='draining')return;
    if(mode==='running') {
      this.promoteDeferred();
      while(this.store.tasks().filter(t=>this.occupiesWorkerSlot(t)).length<this.config.maxWorkers) {
        const tasks=this.store.tasks();const occupied={};
        for(const t of tasks)if(this.occupiesWorkerSlot(t))occupied[t.poolId]=(occupied[t.poolId]??0)+1;
        const next=this.nextWorker(tasks,occupied);
        if(!next)break;
        let pool,nextRouting;
        if(next.status==='continuing') {
          pool=this.config.pools.find(p=>p.id===next.poolId);
          const state=this.store.get('routing')[pool?.id]??{};
          if(!pool||!pool.enabled||state.disabledReason||(state.cooldownUntil??0)>this.clock()||(occupied[pool.id]??0)>=pool.maxConcurrent)break;
        } else {
          const chosen=choosePool(this.config.pools,this.store.get('routing'),occupied,this.clock());
          if(!chosen)break;pool=chosen.pool;nextRouting=chosen.routing;
        }
        this.reserve(next,pool,nextRouting);
        this.store.set('lastWorkerOwner',next.coordinatorId??'@independent');
        this.promoteDeferred();
      }
    }
    for(const c of this.store.coordinators())if(c.mode==='draining'&&!running.has(c.status)&&!this.store.tasks(c.id).some(t=>running.has(t.status))){c.mode='paused';this.store.putCoordinator(c);}
    if(mode==='draining'&&this.live.size===0){this.store.set('mode','paused');return;}
    if(mode!=='running')return;
    const coordinators=this.store.coordinators().sort((a,b)=>(a.lastStartedAt??0)-(b.lastStartedAt??0));
    for(const c of coordinators) {
      if(this.store.coordinators().filter(x=>this.occupiesCoordinatorSlot(x)).length>=this.config.maxCoordinators)break;
      const wake=this.coordinatorWake(c);if(wake)this.reserveCoordinator(wake.events,c.id);
    }
  }
  promoteDeferred() {
    while(this.store.tasks().filter(t=>t.status==='queued'&&!t.paused).length<this.config.maxQueued) {
      const candidates=this.store.tasks().filter(t=>t.status==='waiting-capacity'&&!t.paused&&this.scopeRunning(t.coordinatorId)).sort((a,b)=>(b.queuePriority??0)-(a.queuePriority??0));
      if(!candidates.length)return;
      const previous=this.store.get('lastAdmissionOwner');
      const task=candidates.find(t=>(t.coordinatorId??'@independent')!==previous)??candidates[0];
      this.store.transaction(()=>{task.status='queued';this.store.putTask(task);this.store.set('lastAdmissionOwner',task.coordinatorId??'@independent');});
    }
  }
  reserve(task,pool,routing) {
    const campaign=this.taskCampaign(task);
    if(task.recovery&&Date.parse(task.recovery.deadline)<=this.clock()) {
      task.status='blocked';task.problem='Prospective recovery phase expired';this.store.putTask(task);
      this.notify('recovery_expired',task.id,{runId:task.runId},task.coordinatorId);
      this.raiseIncident(this.store.run(task.runId),'recovery-required',`:phase:${task.recovery.at}`);return;
    }
    const exclusion=checkProjectExclusion(this.config,task.project);
    if(!exclusion.ok){task.status='blocked';task.problem=exclusion.reason;this.store.putTask(task);this.notify('admission_changed',task.id,{project:task.projectKey,reason:exclusion.reason},task.coordinatorId);return;}
    if(task.attempts===0&&campaign.freshMembership){
      const eligible=checkFreshEligibility(this.config.workspace,task.project,this.config);
      if(!eligible.ok){task.status='blocked';task.problem=eligible.reason;this.store.putTask(task);this.notify('admission_changed',task.id,{project:task.projectKey,reason:eligible.reason,neverStarted:true},task.coordinatorId);return;}
    }
    const run=this.newRun(task.id,pool,task.cwd,join(task.cwd,'session.jsonl'),'worker',task.coordinatorId);
    if(task.recovery)run.maxRunMs=Math.min(this.config.maxRunMs,Date.parse(task.recovery.deadline)-this.clock());
    task.status='starting';task.poolId=pool.id;task.runId=run.id;task.attempts++;task.updatedAt=now();
    task.result=undefined;task.problem=undefined;
    this.store.transaction(()=>{if(routing)this.store.set('routing',routing);this.store.putTask(task);this.store.putRun(run);});
    void this.launch(run,workerPrompt(task,campaign,this.config)).catch(e=>this.launchFailure(run,e));
  }
  reserveCoordinator(events,coordinatorId='c1') {
    const c=this.coordinator(coordinatorId);const cwd=join(this.config.runtimeDir,'coordinators',coordinatorId);mkdirSync(cwd,{recursive:true});
    const run=this.newRun(coordinatorId,c.model??this.config.coordinator,cwd,c.session,'coordinator',coordinatorId);
    invariant(events.every(e=>e.coordinator===coordinatorId),'Coordinator event routing mismatch');run.eventIds=events.map(e=>e.seq);
    run.beforeTasks=this.store.tasks(coordinatorId).length;run.beforeSkips=this.store.skippedCandidates(coordinatorId);
    c.status='starting';c.runId=run.id;c.nextWakeAt=0;c.lastStartedAt=this.clock();c.continuePending=false;
    const prompt=coordinatorPrompt(c.campaign,this.coordinatorStatus(coordinatorId),events);
    this.store.transaction(()=>{this.store.putRun(run);this.store.putCoordinator(c);});
    void this.launch(run,prompt).catch(e=>this.launchFailure(run,e));
  }
  launchFailure(run,error) {
    if(/ENOSPC|disk.*full/i.test(error.message)){this.fatal(error);return;}
    if(this.live.has(run.id)){void this.failRun(run.id,error.message);return;}
    // Failure before a managed process handle: retain UNKNOWN, never fabricate
    // an OS stop receipt or release this owner's project reservation.
    run.status='unknown';run.failure='Launch setup failed; owner reconciliation required';run.endedAt=now();run.treeStopped=false;
    this.store.transaction(()=>{this.store.putRun(run);if(isCoordinator(run))this.finishCoordinator(run,false);else this.finishWorker(run,false);});
    this.kick();
  }
  newRun(owner,model,cwd,session,role='worker',coordinatorId='c1') {
    const id=randomUUID();const dir=join(this.config.runtimeDir,'runs',id);mkdirSync(dir,{recursive:true});
    return {id,owner,role,coordinatorId,model,cwd,session,status:'starting',createdAt:now(),receipt:join(dir,'tree-stop.json'),toolStarted:false,reminders:0,continuations:0};
  }
  async launch(run,prompt) {
    const role=run.role;
    const token=randomBytes(32).toString('hex');this.tokens.set(run.id,token);
    const campaign=isCoordinator(run)?this.campaign(run.coordinatorId):this.taskCampaign(this.store.task(run.owner));
    const roleConfig=loadRole(this.config,role);
    const toolset=workflowTools(roleConfig.tools,role,campaign).join(',');
    const resourceEnv={};
    if(role==='worker') {
      const cache=join(run.cwd,'.cache');const temp=join(run.cwd,'.tmp');mkdirSync(temp,{recursive:true});
      const locations={GOCACHE:'go-build',GOMODCACHE:'go-mod',GOPATH:'go',npm_config_cache:'npm',npm_config_store_dir:'pnpm-store',COREPACK_HOME:'corepack',YARN_CACHE_FOLDER:'yarn',PIP_CACHE_DIR:'pip',UV_CACHE_DIR:'uv',UV_PYTHON_INSTALL_DIR:'uv-python',GRADLE_USER_HOME:'gradle',CARGO_HOME:'cargo',NUGET_PACKAGES:'nuget',DOTNET_CLI_HOME:'dotnet',XDG_CACHE_HOME:'xdg'};
      for(const [name,dir]of Object.entries(locations)){resourceEnv[name]=join(cache,dir);mkdirSync(resourceEnv[name],{recursive:true});}
      resourceEnv.TEMP=temp;resourceEnv.TMP=temp;
      resourceEnv.RUSTUP_AUTO_INSTALL='0';
    }
    const proc=this.processFactory({...this.config,maxRunMs:run.maxRunMs??this.config.maxRunMs},{owner:run.owner,cwd:run.cwd,session:run.session,model:run.model,receipt:run.receipt,
      tools:toolset,instructions:instructions(this.config,role,roleConfig,campaign),env:{...resourceEnv,REPOSTEW_HARNESS_URL:this.endpoint,REPOSTEW_RUN_TOKEN:token,REPOSTEW_RUN_ID:run.id,REPOSTEW_ROLE:role}});
    const live={process:proc,finishing:false,settled:false,error:undefined};
    live.finished=new Promise(resolve=>{live.resolveFinished=resolve;});this.live.set(run.id,live);
    proc.on('record',record=>{
      try {
        if(record.type==='message_end'&&record.message?.role==='assistant'&&['error','aborted'].includes(record.message.stopReason))live.error=record.message.errorMessage??record.message.stopReason;
        if(record.type==='tool_execution_end'&&record.toolName==='todo'&&record.result?.details)this.projectTodo(run.owner,record.result.details,role);
        if(record.type==='agent_settled')void this.settled(run.id).catch(e=>this.fatal(e));
      } catch(e){this.fatal(e);}
    });
    proc.on('fault',error=>{live.error=error.message;void this.failRun(run.id,error.message).catch(e=>this.fatal(e));});
    proc.on('exit',exit=>{if(!live.finishing)void this.finish(run.id,exit,live.error??'Unexpected Pi exit').catch(e=>this.fatal(e));});
    try {
      await proc.start();
      const state=await proc.getState();
      invariant(state.model?.provider===run.model.provider&&state.model?.id===run.model.model,'Pi selected a different model');
      const levels=await proc.getAvailableThinkingLevels();
      invariant(levels.includes(run.model.thinking),'Requested thinking level is unsupported');
      await proc.setAutoRetry(false);
      const current=this.store.run(run.id);if(current.status==='stopping')return;
      current.status='running';current.session=state.sessionFile??current.session;this.store.putRun(current);
      if(existsSync(current.session)) {
        const {SessionManager}=await piModule(this.config,'dist/core/session-manager.js');
        this.projectTodo(run.owner,todoStateFromBranch(SessionManager.open(current.session).getBranch()),role);
      }
      if(live.finishing||this.store.run(run.id).status==='stopping')return;
      if(isCoordinator(run)){const c=this.coordinator(run.coordinatorId);c.status='running';c.session=current.session;this.store.putCoordinator(c);}
      else {const t=this.store.task(run.owner);t.status='running';this.store.putTask(t);}
      const accepted=await proc.prompt(prompt);
      if(accepted==='handled')await this.failRun(run.id,'Task prompt was consumed without starting a model run');
    } catch(e) {await this.failRun(run.id,e.message);}
  }
  async settled(runId) {
    const live=this.live.get(runId);if(!live||live.finishing)return;
    const run=this.store.run(runId);live.settled=true;
    if(!live.error&&run.status!=='stopping'&&this.scopeRunning(run.coordinatorId)&&(!this.store.task(run.owner)?.paused||isCoordinator(run))) {
      if(!run.report&&run.reminders<this.config.missingReportReminders) {
        run.reminders++;this.store.putRun(run);live.settled=false;
        try {await live.process.prompt('Same assignment, no new authority: the last turn settled without a harness_result. Complete feasible remaining work or report the exact factual result/blocker now. Do not replay uncertain external writes.');return;}
        catch(e){live.error=e.message;}
      }
      if(!isCoordinator(run)&&run.report?.outcome==='continue') {
        const task=this.store.task(run.owner);const fingerprint=digest(run.report);
        if(task.continuations<(task.recovery?.continuationCeiling??this.config.maxContinuations)&&(!task.recovery||Date.parse(task.recovery.deadline)>this.clock())&&task.previousContinuation!==fingerprint) {
          task.continuations++;task.previousContinuation=fingerprint;task.continuation=run.report.remaining.join('\n');this.store.putTask(task);
          run.report=undefined;this.store.putRun(run);live.settled=false;
          try {await live.process.prompt(`Continue the SAME authorized task; prior limits/failures remain. Remaining work:\n${task.continuation}`);return;}
          catch(e){live.error=e.message;}
        } else live.error='Continuation limit or unchanged remainder; preserve progress for recovery';
      }
    }
    await this.closeRun(runId,false,live.error);
  }
  async failRun(runId,error) {
    const live=this.live.get(runId);if(!live||live.finishing)return;
    await this.closeRun(runId,true,error);
  }
  async closeRun(runId,abort,error) {
    const live=this.live.get(runId);if(!live)return;live.finishing=true;
    let exit;
    try{exit=await live.process.close(abort);}catch(e){exit={};error=`Owned process close failed (${e.code??e.name}); stop remains unknown`;}
    await this.finish(runId,exit,error);
  }
  async finish(runId,exit,error) {
    if(this.storageFailed){this.live.get(runId)?.resolveFinished();this.live.delete(runId);this.tokens.delete(runId);return;}
    const live=this.live.get(runId);if(!live)return;live.finishing=true;
    const run=this.store.run(runId);if(!running.has(run.status))return;
    this.live.delete(runId);this.tokens.delete(runId);
    const stopped=exit.receipt?.treeStopped===true;
    const cancelled=run.status==='stopping';run.status=stopped?'ended':'unknown';run.endedAt=now();run.treeStopped=stopped;
    run.failure=error??(!run.report&&!cancelled?'No final report':undefined);run.exit=exit;
    this.store.transaction(()=>{
      this.store.putRun(run);
      if(isCoordinator(run))this.finishCoordinator(run,cancelled);
      else this.finishWorker(run,cancelled);
    });
    live.resolveFinished();
    this.kick();
  }
  finishWorker(run,cancelled) {
    const task=this.store.task(run.owner);task.updatedAt=now();
    if(!run.treeStopped){task.status='unknown';task.problem='Owned process tree stop not established; no replacement';}
    else if(cancelled){task.status='interrupted';task.problem='Stopped by operator; reconcile effects before continuation';}
    else if(run.failure) {
      task.status='failed';task.problem=run.failure;
      task.failures=(task.failures??0)+1;
      const failure=classifyProviderFailure(run.failure,this.clock());const routing=this.store.get('routing');
      if(failure.kind!=='execution') {
        routing[task.poolId]={...routing[task.poolId],...failure};this.store.set('routing',routing);
        // Before any model tool executed, provider/transport failure has no task side effects.
        if(!run.toolStarted&&!run.report&&task.attempts<3&&!['authentication'].includes(failure.kind))task.status='queued';
      }
    } else {task.status=run.report.outcome;task.result=run.report;task.problem=undefined;if(task.status==='failed')task.failures=(task.failures??0)+1;}
    if(task.status==='continue'){
      if((!this.scopeRunning(task.coordinatorId)||task.paused)&&task.continuations<(task.recovery?.continuationCeiling??this.config.maxContinuations)){task.status='continuing';task.continuations++;task.continuation=run.report.remaining.join('\n');}
      else{task.status='failed';task.problem='Continuation not completed';}
    }
    this.store.putTask(task);
    this.notify('worker_result',task.id,{project:task.projectKey,status:task.status,result:task.result,problem:task.problem,runId:run.id,treeStopped:run.treeStopped,session:run.session,attempts:task.attempts,failures:task.failures??0},task.coordinatorId);
    if(['failed','blocked','unknown','interrupted'].includes(task.status))this.raiseIncident(run,task.status);
  }
  finishCoordinator(run,cancelled) {
    const c=this.coordinator(run.coordinatorId);const report=run.report;
    c.wait=undefined;c.continuePending=false;
    if(!run.treeStopped){c.status='unknown';c.problem='Coordinator process tree stop unknown';}
    else if(cancelled){c.status='interrupted';c.problem='Stopped by operator';}
    else if(run.failure||!report){
      c.status='blocked';c.problem=run.failure??'Missing coordinator result';
      c.failureStreak=(c.failureStreak??0)+1;c.failures=(c.failures??0)+1;
      const failure=classifyProviderFailure(c.problem,this.clock());
      c.retryAt=failure.cooldownUntil??0;
      c.requiresReconciliation=c.failureStreak>=3||failure.kind==='authentication'||run.mutationStarted===true;
      if(!c.requiresReconciliation){c.wait={kind:'retry',until:new Date(Math.max(c.retryAt,this.clock()+1000*c.failureStreak)).toISOString(),since:now()};}
    }
    else {
      c.failureStreak=0;c.retryAt=0;c.requiresReconciliation=false;
      this.store.consume(run.eventIds??[]);
      // queued assignment metadata does not need another C wake.
      this.store.consumeKind('assignment_queued',c.id);this.store.consumeKind('worker_judgment',c.id);
      this.store.consumeKind('queue_changed',c.id);
      const evidenceDelta=report.evidence.length>0&&digest(report.evidence)!==digest(c.result?.evidence??[]);
      const progress=run.sourceProgress||evidenceDelta||this.store.tasks(c.id).length>run.beforeTasks||this.store.skippedCandidates(c.id)>run.beforeSkips||this.store.runs().some(r=>!isCoordinator(r)&&r.coordinatorId===c.id&&this.store.decision(r.id)?.at>=run.createdAt);
      c.noProgress=progress?0:report.outcome==='wait'?(c.noProgress??0):(c.noProgress??0)+1;c.result=report;c.problem=undefined;
      const active=this.store.tasks(c.id).some(t=>running.has(t.status)||['queued','continuing','waiting-capacity'].includes(t.status));
      if(report.outcome==='complete') {
        const unresolved=this.store.tasks(c.id).some(t=>['unknown','interrupted','failed','blocked'].includes(t.status));
        const uncaptured=(c.campaign.sources??[]).some(source=>!c.sourceCoverage?.[`${c.completedPasses??0}:${source.id}`]?.complete);
        if(active||this.candidatesRemaining(c.id)>0||unresolved||uncaptured){c.status='idle';c.noProgress++;c.problem='Complete rejected: selected scope or registered source capture still remains';c.continuePending=true;}
        else {
          c.noProgress=0;
          c.passCompletedAt=now();c.completedPasses=(c.completedPasses??0)+1;
          if(c.campaign.continuous) {
            c.status='waiting';
            c.wait={kind:'time',until:new Date(this.clock()+c.campaign.revisitMs).toISOString(),since:now()};
          } else c.status='complete';
        }
      } else if(report.outcome==='blocked'){c.status='blocked';c.problem=report.blocker;c.wait={kind:'external',since:now()};}
      else if(report.outcome==='wait'){c.status='waiting';c.wait={...(report.waitFor??{kind:active?'children':'external'}),since:now()};}
      else {c.status='idle';c.continuePending=report.outcome==='continue';}
      if(c.noProgress>=3){c.status='blocked';c.requiresReconciliation=true;c.problem='Three coordinator turns without progress; assumption needs owner diagnosis';}
      const campaign=c.campaign;
      c.nextWakeAt=active||c.wait?0:(campaign.continuous?this.clock()+campaign.revisitMs:0);
      c.capacityObservedAt=undefined;
    }
    this.store.putCoordinator(c);
    if(['blocked','unknown','interrupted'].includes(c.status))this.raiseIncident(run,c.requiresReconciliation?'recovery-required':c.status);
    this.emit('change',{kind:'coordinator_result',owner:c.id,coordinatorId:c.id,status:c.status,result:report,problem:c.problem});
  }
  raiseIncident(run,category,suffix='') {
    const id=`run:${run.id}${suffix}`;
    if(this.store.incident(id))return;
    const incident={id,status:'open',category,owner:run.owner,role:run.role,coordinatorId:run.coordinatorId,runId:run.id,at:now(),
      recoveryOwner:run.coordinatorId??'governance',treeStopped:run.treeStopped===true,
      nextAction:['unknown','interrupted','recovery-required'].includes(category)?'Reconcile the exact stopped process and partial effects before any continuation.':'Review the exact result and retained limits; continue only a concrete feasible remainder.'};
    this.store.putIncident(incident);this.emit('change',{kind:'governance_attention',...incident});
  }
  reconcileRestart() {
    for(const run of this.store.runs().filter(r=>running.has(r.status))) {
      let receipt;try{receipt=JSON.parse(readFileSync(run.receipt,'utf8'));}catch{}
      if(receipt?.treeStopped&&receipt.exitCode===0&&run.report&&!run.failure&&run.status!=='stopping') {
        run.status='ended';run.treeStopped=true;run.endedAt=now();run.exit={receipt};run.recoveredReport=true;
        this.store.transaction(()=>{this.store.putRun(run);if(isCoordinator(run))this.finishCoordinator(run,false);else this.finishWorker(run,false);});
        continue; // settle an already accepted result, never replay the model or tools
      }
      run.status=receipt?.treeStopped?'ended':'unknown';run.treeStopped=receipt?.treeStopped===true;run.failure='Harness restarted during an unsettled run';this.store.putRun(run);
      if(isCoordinator(run)){const c=this.coordinator(run.coordinatorId);c.status=run.treeStopped?'interrupted':'unknown';c.problem=run.failure;this.store.putCoordinator(c);}
      else{const task=this.store.task(run.owner);task.status=run.treeStopped?'interrupted':'unknown';task.problem=run.failure;this.store.putTask(task);}
      this.notify('restart_reconciliation',run.owner,{runId:run.id,treeStopped:run.treeStopped},run.coordinatorId);
      this.raiseIncident(run,run.treeStopped?'interrupted':'unknown');
    }
    // A paused/stopped setting survives restart. Running may refill only untouched
    // queued independent work; interrupted projects retain their writer reservation.
  }
  async control(action,body={}) {
    if(['resume','pause','drain','stop'].includes(action)) {
      const target=body.target??{kind:'all'};
      invariant(['all','coordinator','worker'].includes(target.kind),'Invalid control target');
      const mode={resume:'running',pause:'paused',drain:'draining',stop:'stopped'}[action];
      if(target.kind==='all')this.store.set('mode',mode);
      else if(target.kind==='coordinator'){const c=this.coordinator(target.id);c.mode=mode;this.store.putCoordinator(c);}
      else {
        const t=this.store.task(target.id);invariant(t,'Unknown Worker');
        t.paused=action!=='resume';delete t.queuePauseOwner;this.store.putTask(t);
      }
      if(action==='stop')await this.stopTarget(target);
      this.kick();return {target,mode,globalMode:this.store.get('mode'),unknown:this.store.tasks().filter(t=>t.status==='unknown').map(t=>t.id),unknownCoordinators:this.store.coordinators().filter(c=>c.status==='unknown').map(c=>c.id)};
    }
    if(action==='wake') {
      const c=this.coordinator(body.coordinatorId??'c1');invariant(!['unknown','interrupted'].includes(c.status),'Reconcile C first');
      if(!running.has(c.status)){c.status='idle';c.wait=undefined;c.nextWakeAt=0;this.store.putCoordinator(c);}
      const seq=this.notify('owner_delta',c.id,{message:nonempty(body.message,'message')},c.id);this.kick();return {queued:true,coordinatorId:c.id,eventId:seq};
    }
    if(action==='coordinator-add')return this.addCoordinator(body.spec);
    if(action==='dispatch-independent')return this.enqueue(body.task,null);
    if(action==='dispatch')return this.enqueue(body.task,body.coordinatorId??'c1');
    if(action==='message')return this.sendMessage(body.target.id,body.message,body.messageId,body.target.kind);
    if(action==='decide-independent')return this.decide(body.decision,null);
    if(action==='routing') {
      invariant(Object.keys(body).every(k=>['action','pools','maxWorkers','maxCoordinators'].includes(k)),'Routing may only change pools and execution capacity');
      const next=validateConfig({...this.config,...body});
      this.config=next;const state=this.store.get('routing');
      for(const p of next.pools){state[p.id]??={assignments:0};state[p.id].credit=0;}
      this.store.set('routing',state);this.store.set('routingConfig',{pools:next.pools,maxWorkers:next.maxWorkers,maxCoordinators:next.maxCoordinators});this.kick();return {pools:next.pools,maxWorkers:next.maxWorkers,maxCoordinators:next.maxCoordinators};
    }
    if(action==='clear-provider') {
      nonempty(body.evidence,'provider recovery evidence');
      const state=this.store.get('routing');invariant(state[body.id],'Unknown pool');
      delete state[body.id].disabledReason;state[body.id].cooldownUntil=0;state[body.id].credit=0;this.store.set('routing',state);this.kick();return {cleared:body.id};
    }
    if(action==='clear-forge') {
      nonempty(body.evidence,'actual rate/access gate reconciliation');
      const gates=this.store.get('forgeGates')??{};
      const key=body.project?projectKey(body.project):body.source?`source:${body.source.coordinatorId}:${body.source.id}`:body.host?.toLowerCase();
      if(key){invariant(gates[key],'No scoped forge gate matches this target');delete gates[key];}
      else {
        invariant(Object.keys(gates).length<=1,'Name the affected project or host; unrelated forge gates remain held');
        for(const name of Object.keys(gates))delete gates[name];
        this.store.set('forgeGate',null);
      }
      this.store.set('forgeGates',gates);
      for(const c of this.store.coordinators())if(c.campaign)this.notify('owner_delta',c.id,{message:`Forge access gate reconciled: ${body.evidence}`},c.id);
      this.kick();return {cleared:key??'single-or-legacy-gate'};
    }
    if(action==='reconcile')return this.reconcile(body);
    if(action==='incident-resolve') {
      const issue=this.store.incident(body.id);invariant(issue,'Unknown incident');nonempty(body.evidence,'incident disposition evidence');
      issue.status='resolved';issue.resolution={at:now(),evidence:body.evidence};this.store.putIncident(issue);
      return {id:issue.id,status:issue.status,note:'This closes the alert only; it never changes task gates or resumes work.'};
    }
    throw new Error('Unknown control action');
  }
  async stopTarget(target) {
    const matches=run=>target.kind==='all'||(target.kind==='coordinator'?run.coordinatorId===target.id:!isCoordinator(run)&&run.owner===target.id);
    const jobs=[];
    for(const [id,live] of this.live) {
      const run=this.store.run(id);if(!matches(run))continue;
      if(live.finishing){jobs.push(live.finished);continue;}
      run.status='stopping';this.store.putRun(run);
      if(isCoordinator(run)){const c=this.coordinator(run.coordinatorId);c.status='stopping';this.store.putCoordinator(c);}
      else{const task=this.store.task(run.owner);task.status='stopping';this.store.putTask(task);}
      jobs.push(this.closeRun(id,true));
    }
    await Promise.all(jobs);
  }
  governance() {
    const s=this.status();
    return {mode:s.mode,maxWorkers:s.maxWorkers,maxCoordinators:s.maxCoordinators,maxQueued:s.maxQueued,counts:s.counts,occupied:s.occupied,pools:s.pools,
      coordinators:s.coordinators,independentWorkers:this.store.tasks(null).map(t=>({id:t.id,project:t.projectKey,status:t.status,paused:!!t.paused,runId:t.runId,attempts:t.attempts,failures:t.failures??0})),
      incidents:this.store.incidents(),forgeGates:this.store.get('forgeGates')??{},legacyForgeGate:this.store.get('forgeGate'),
      subscriptions:this.subscriptions.list(),lastHeartbeat:this.store.get('lastHeartbeat'),liveProcesses:s.liveProcesses};
  }
  async govern({requestId,action,...body}) {
    nonempty(requestId,'stable governance requestId',200);nonempty(action,'action',80);
    const id=`governance:${requestId}`,signature=digest({action,body}),prior=this.store.receipt(id);
    if(prior){invariant(prior.signature===signature,'Governance requestId reused with different action');return prior;}
    const started={requestId,signature,action,status:'started',at:now()};this.store.saveReceipt(id,started);
    try {
      const result=await this.control(action,body),receipt={...started,status:'completed',result,completedAt:now()};
      this.store.updateReceipt(id,receipt);return receipt;
    } catch(e) {
      // Never replay an ambiguous operation, including a partially completed Stop.
      const receipt={...started,status:'failed-or-unknown',error:e.message};
      if(!this.storageFailed)this.store.updateReceipt(id,receipt);
      throw e;
    }
  }
  reconcile({taskId,coordinatorId,runId,decision,evidence,message,recovery}) {
    nonempty(evidence,'reconciliation evidence');invariant(['continue','close'].includes(decision),'decision must be continue or close');
    if(coordinatorId||taskId==='c1') {
      const c=this.coordinator(coordinatorId??'c1');invariant(!running.has(c.status),'C is still running');
      if(runId!==undefined)invariant(c.runId===runId,'Coordinator run changed; reconcile the current exact run');
      const run=c.runId&&this.store.run(c.runId);let receipt;
      try{receipt=JSON.parse(readFileSync(run.receipt,'utf8'));}catch{}
      if(process.platform==='win32'&&run&&!run.treeStopped&&!receipt?.treeStopped&&!run.mutationStarted&&this.store.tasks(c.id).length===0) {
        // A first C with no dispatched tasks has only read/forge GET capability.
        // Exact owner+target absence, together with the private kill-on-close
        // Job, reconciles terminal-host death without fabricating its receipt.
        const script=fileURLToPath(new URL('../scripts/check-owned-processes.ps1',import.meta.url));
        const checked=JSON.parse(execFileSync('powershell.exe',['-NoProfile','-File',script,'-SessionPath',run.session,'-ReceiptPath',run.receipt],{encoding:'utf8',windowsHide:true}));
        if(checked.noMatchingOwnerOrTarget===true){run.treeStopped=true;run.stopReconciliation={basis:'exact owner and target absent; private kill-on-close Job; no Workers dispatched',...checked};this.store.putRun(run);}
      }
      invariant(!run||run.treeStopped||receipt?.treeStopped,'Coordinator tree stop not established');
      if(run&&!run.treeStopped&&receipt?.treeStopped){run.treeStopped=true;run.status='ended';run.stopReconciliation={at:now(),basis:'native stopped-tree receipt',evidence};this.store.putRun(run);}
      c.status=decision==='continue'?'idle':'complete';c.problem=undefined;c.noProgress=0;
      c.reconciliation={evidence,message,decision,at:now(),runId:c.runId};
      if(decision==='continue'){c.failureStreak=0;c.retryAt=0;c.requiresReconciliation=false;}
      this.store.putCoordinator(c);
      if(decision==='continue')this.notify('owner_reconciliation',c.id,{evidence,message},c.id);
    } else {
      const t=this.store.task(taskId);invariant(t&&!running.has(t.status),'Unknown or active task');
      invariant(['failed','blocked','interrupted','unknown'].includes(t.status),'Task does not need reconciliation');
      if(runId!==undefined)invariant(t.runId===runId,'Worker run changed; reconcile the current exact run');
      const run=this.store.run(t.runId);let receipt;try{receipt=JSON.parse(readFileSync(run.receipt,'utf8'));}catch{}
      invariant(run?.treeStopped||receipt?.treeStopped,'Owned process tree stop not established');
      if(!run.treeStopped&&receipt?.treeStopped){run.treeStopped=true;run.status='ended';run.stopReconciliation={at:now(),basis:'native stopped-tree receipt',evidence};this.store.putRun(run);}
      if(decision==='continue') {
        invariant(!this.store.tasks().some(other=>other.id!==t.id&&other.projectKey===t.projectKey&&this.projectHeld(other)),'Project reservation is held by another task');
        if(recovery){
          invariant(Number.isSafeInteger(recovery.additionalAttempts)&&recovery.additionalAttempts>=1&&recovery.additionalAttempts<=3,'Recovery grant must be 1..3 prospective attempts');
          invariant(Number.isFinite(Date.parse(recovery.deadline))&&Date.parse(recovery.deadline)>this.clock(),'Recovery grant needs a future deadline');
          nonempty(recovery.authority,'prospective recovery authority');
          t.recovery={...recovery,failureCeiling:(t.failures??0)+recovery.additionalAttempts,continuationCeiling:t.continuations+recovery.additionalAttempts,at:now(),previous:t.recovery};
        }
        invariant((t.failures??0)<(t.recovery?.failureCeiling??3),'Three failures require an explicit prospective recovery grant');
        invariant(t.continuations<(t.recovery?.continuationCeiling??this.config.maxContinuations),'Continuation budget exhausted; explicit prospective recovery grant required');
        t.continuations++;t.continuation=nonempty(message,'complete recovery remainder');
      }
      t.status=decision==='continue'?'continuing':'cancelled';t.reconciliation={evidence,at:now(),decision,runId:t.runId};
      this.store.putTask(t);this.notify('owner_reconciliation',taskId,{evidence,decision},t.coordinatorId);
    }
    this.kick();return {taskId,coordinatorId,decision};
  }
  async shutdown() {
    this.closing=true;clearInterval(this.timer);
    if(this.storageFailed){await Promise.all([...this.live.values()].map(live=>live.process.close(true)));await Promise.allSettled([...this.sourcePending.values()]);return;}
    await this.control('stop');
    await Promise.allSettled([...this.sourcePending.values()]);
  }
}
