// Native Pi integration: two C domains, their W, and two independent W.
// Local read-only fixtures only; no source/forge/production writes.
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {loadConfig} from '../src/config.mjs';
import {serve} from '../src/server.mjs';

const config=loadConfig(resolve('config.local.json'));
const root=resolve('artifacts',`native-multicw-${new Date().toISOString().replace(/[:.]/g,'-')}`);mkdirSync(root,{recursive:true});
Object.assign(config,{runtimeDir:join(root,'runtime'),workRoot:join(root,'work'),maxWorkers:2,maxCoordinators:2,maxQueued:8,maxRunMs:300000,heartbeatMs:5000});
const expected={},domainCandidates={alpha:[],beta:[]},independent=[];
for(const owner of ['alpha','beta',null])for(let n=1;n<=2;n++) {
  const id=`${owner??'direct'}-${n}`,value=randomBytes(8).toString('hex'),path=join(root,`${id}.txt`);writeFileSync(path,`verification=${value}\n`);
  const project={host:'fixture.local',namespace:owner??'direct',repo:id};expected[id]={value,owner};
  const evidence=`Read only ${path}, include its exact verification value in harness_result.evidence. Add a Pi todo item, read the file, toggle it done, then report no_delivery with empty remaining and blocker. No shell, network, cloning, project records or other writes.`;
  if(owner)domainCandidates[owner].push({project,evidence,fixturePath:path});
  else independent.push({id,project,workerMode:'read-only',workflow:'fixture',brief:{objectOutcome:'Read one local verification fixture',locationPrior:path,completeTodo:evidence,authorityResources:'Local read-only acceptance only; no delegation or external actions',finishReturn:'Exact file verification value in evidence, no_delivery, no remainder'}});
}
writeFileSync(join(root,'expected.json'),JSON.stringify(expected,null,2));
const app=await serve(config);let finished=false;const traces=[];
const overlap=(runs,role)=>{
  const points=runs.filter(r=>r.role===role).flatMap(r=>[[Date.parse(r.createdAt),1],[Date.parse(r.endedAt),-1]]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  let live=0,peak=0;for(const [,delta] of points){live+=delta;peak=Math.max(peak,live);}return peak;
};
async function end(reason) {
  if(finished)return;finished=true;clearTimeout(deadline);
  const tasks=app.store.tasks(),runs=app.store.runs(),coordinators=app.store.coordinators().filter(c=>c.campaign);
  const outcomes=tasks.map(t=>({id:t.id,repo:t.project.repo,coordinatorId:t.coordinatorId,status:t.status,pool:t.poolId,attempts:t.attempts,result:t.result,todo:t.todoSnapshot}));
  const exact=tasks.length===6&&tasks.every(t=>t.status==='no_delivery'&&expected[t.project.repo]?.owner===t.coordinatorId&&t.result.evidence.some(e=>e.includes(expected[t.project.repo].value)));
  const todo=tasks.every(t=>t.todoSnapshot?.todos.length>0&&t.todoSnapshot.todos.every(item=>item.done));
  const maxC=overlap(runs,'coordinator'),maxW=overlap(runs,'worker');
  const pass=!reason&&exact&&todo&&coordinators.length===2&&coordinators.every(c=>c.status==='complete')&&new Set(coordinators.map(c=>c.session)).size===2&&runs.every(r=>r.treeStopped)&&app.engine.live.size===0&&maxC===2&&maxW===2;
  const result={pass,reason,layer:'native Pi: two C domains plus two independent W, local read-only fixtures',exact,todo,maxC,maxW,outcomes,coordinators:coordinators.map(c=>({id:c.id,status:c.status,session:c.session})),runs:runs.map(r=>({id:r.id,owner:r.owner,role:r.role,coordinatorId:r.coordinatorId,status:r.status,treeStopped:r.treeStopped,createdAt:r.createdAt,endedAt:r.endedAt})),traces};
  writeFileSync(join(root,'result.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({pass,reason,maxC,maxW,artifact:join(root,'result.json')}));
  await app.close();process.exitCode=pass?0:1;
}
const deadline=setTimeout(()=>void end('10-minute native acceptance deadline'),600000);
app.engine.on('change',event=>{
  traces.push({at:new Date().toISOString(),kind:event.kind,owner:event.owner,coordinatorId:event.coordinatorId,status:event.status});
  console.log(JSON.stringify({kind:event.kind,owner:event.owner,coordinatorId:event.coordinatorId,status:event.status}));
  setTimeout(()=>{
    if(finished)return;
    const cs=app.store.coordinators().filter(c=>c.campaign),tasks=app.store.tasks();
    if(cs.length===2&&cs.every(c=>c.status==='complete')&&tasks.length===6&&tasks.every(t=>['no_delivery','delivered','failed','blocked','unknown'].includes(t.status)))void end();
    else if(app.engine.live.size===0&&cs.some(c=>c.requiresReconciliation||['blocked','unknown','interrupted'].includes(c.status)))void end('Coordinator recovery gate');
  },10);
});
for(const id of ['alpha','beta']) {
  app.engine.addCoordinator({id,maxWorkers:1,campaign:{id:`acceptance-${id}`,workflow:'fixture',mandate:`Own only domain ${id}. Read harness_candidates and dispatch both local fixture tasks exactly once. Do not inspect/admit fixture.local or browse external sources. Each W must use native Pi todo, read its exact fixture value and report no_delivery. Judge each received worker_result with harness_decide, adopt exact evidence, refill within capacity, and report complete after both own tasks finish. Other domain and independent tasks belong to other owners. Do not write records or call shell.`,allowedProjects:domainCandidates[id].map(c=>c.project),allowedHosts:[],workerMode:'read-only',continuous:false,revisitMs:60000,candidates:domainCandidates[id]}});
  await app.engine.control('resume',{target:{kind:'coordinator',id}});
}
await app.engine.control('resume');
for(const task of independent)app.engine.enqueue(task,null);
console.log(JSON.stringify({nativeAcceptanceStarted:true,root,coordinators:2,independentWorkers:2,maxWorkers:2}));
