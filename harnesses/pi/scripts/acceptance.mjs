// Real Pi C1 + multi-W acceptance. Local read-only fixtures; no forge writes.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { loadConfig } from '../src/config.mjs';
import { serve } from '../src/server.mjs';

const config=loadConfig(resolve('config.local.json'));
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const root=resolve('artifacts',`native-${stamp}`);mkdirSync(root,{recursive:true});
Object.assign(config,{runtimeDir:join(root,'runtime'),workRoot:join(root,'work'),maxWorkers:2,maxQueued:4,maxRunMs:600000,heartbeatMs:1000});
const expectations={};const candidates=[];
for(let n=1;n<=6;n++){
  const value=randomBytes(8).toString('hex');const file=join(root,`fixture-${n}.txt`);writeFileSync(file,`fixture ${n}\nverification=${value}\n`);
  const project={host:'fixture.local',namespace:'acceptance',repo:`fixture-${n}`};expectations[project.repo]=value;
  candidates.push({project,evidence:`Read-only local fixture ${file}. Read its exact verification value and include it in harness_result.evidence. Complete unit is reading this one file and reporting its value; no code changes, network, cloning, state.md writes or shell. Finish outcome no_delivery with no remaining work.`,fixturePath:file});
}
writeFileSync(join(root,'expectations.json'),JSON.stringify(expectations,null,2));
const campaign={id:`acceptance-${Date.now()}`,mandate:'Run six complete local read-only fixture units, two Workers in parallel. Fetch candidates and dispatch each exactly once, using their supplied file path. Keep the ready queue supplied as workers complete. This is a native harness acceptance campaign, not repository engineering; harness_inspect/admit are NOT needed for fixture.local. Do not browse external targets, read old C1 context or write shared records. For each task use the five fields and demand exact verification value from the fixture in evidence. Exercise the Pi todo example: each Worker adds one read-fixture item, reads the fixture, toggles the item done, and calls terminating harness_result. Explicitly judge each received worker_result with harness_decide (no_delivery), integrate all six reports, then report complete. There is no further source. Do not ask user permission.',allowedProjects:candidates.map(c=>c.project),allowedHosts:[],workerMode:'read-only',continuous:false,revisitMs:60000,candidates};
const app=await serve(config);
let ended=false;const traces=[];
app.engine.on('change',e=>{
  traces.push({at:new Date().toISOString(),...e});
  console.log(JSON.stringify({kind:e.kind,owner:e.owner,status:e.status}));
});
const timer=setTimeout(async()=>{
  if(ended)return;ended=true;
  writeFileSync(join(root,'result.json'),JSON.stringify({pass:false,reason:'acceptance deadline',status:app.engine.status(),traces},null,2));
  await app.close();process.exitCode=1;
},600000);
async function check(){
  if(ended)return;
  const status=app.engine.status();
  if(status.coordinator.status==='complete'){
    ended=true;clearTimeout(timer);
    const tasks=app.store.tasks();
    const allEvidence=tasks.every(t=>t.status==='no_delivery'&&t.result.evidence.some(e=>e.includes(expectations[t.project.repo])));
    const pools=Object.fromEntries(config.pools.map(p=>[p.id,tasks.filter(t=>t.poolId===p.id).length]));
    const todoVerified=tasks.every(t=>t.todoSnapshot?.todos.length>0&&t.todoSnapshot.todos.every(item=>item.done));
    const pass=tasks.length===6&&allEvidence&&todoVerified&&pools.luna===3&&pools.flash===3&&app.engine.live.size===0;
    writeFileSync(join(root,'result.json'),JSON.stringify({pass,layer:'native Pi C1 + real Luna/Flash Workers, local read-only',todoVerified,pools,tasks:tasks.map(t=>({id:t.id,pool:t.poolId,status:t.status,result:t.result,todo:t.todoSnapshot,attempts:t.attempts})),runs:app.store.runs().map(r=>({id:r.id,owner:r.owner,treeStopped:r.treeStopped,status:r.status})),traces},null,2));
    console.log(JSON.stringify({pass,artifact:join(root,'result.json'),pools}));await app.close();process.exitCode=pass?0:1;
  }else if(status.coordinator.status==='blocked'&&app.engine.live.size===0){
    ended=true;clearTimeout(timer);
    writeFileSync(join(root,'result.json'),JSON.stringify({pass:false,reason:status.coordinator.problem,status,traces},null,2));
    console.log(JSON.stringify({pass:false,reason:status.coordinator.problem,artifact:join(root,'result.json')}));await app.close();process.exitCode=1;
  }
}
app.engine.on('change',()=>setTimeout(()=>void check(),10));
app.engine.loadCampaign(campaign);await app.engine.control('resume');
console.log(JSON.stringify({acceptanceStarted:true,root,models:config.pools.map(p=>`${p.provider}/${p.model}`)}));
