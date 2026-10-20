#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadConfig } from './config.mjs';
import { serve, call } from './server.mjs';
import {ensureService} from './service-start.mjs';
import {governanceRequestSchema} from './governance-schema.mjs';
import {diagnostic,safeError} from './diagnostics.mjs';
import {supervise} from './guardian.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);const configIndex=args.indexOf('--config');
const configPath=configIndex>=0?args.splice(configIndex,2)[1]:resolve(root,'config.local.json');
const [command,...rest]=args;
const jsonFile=path=>JSON.parse(readFileSync(resolve(path),'utf8').replace(/^\uFEFF/,''));
const target=parts=>parts.length?{kind:parts[0],id:parts[1]}:{kind:'all'};
try {
  if(command==='init') {
    if(existsSync(configPath))throw new Error('Configuration exists; edit it explicitly');
    writeFileSync(configPath,readFileSync(resolve(root,'config.example.json')),{flag:'wx'});
    console.log(JSON.stringify({created:configPath,mode:'paused',next:'Edit configuration, then serve'}));
  } else if(command==='mcp') {
    await import('./governance-mcp.mjs');
  } else if(command==='help'||!command) {
    console.log(`RepoStew Pi harness\nnode src/cli.mjs <command> [--config path]\n\ninit                    Create config.local.json, never overwrite\nserve                   Start local control service; preserves pause/stop\nstatus                  Show tasks, provider distribution and blockers\nload campaign.json      Load one finite campaign while idle/paused\nresume                  Enable dispatch and refill in the loaded campaign\npause                   Disable dispatch/refill; accepted turns may finish\ndrain                   Finish active turns then enter paused\nstop                    Clear queues, abort and stop all owned process trees\nwake message.txt        Deliver a C1 delta, without restarting active C1\nmessage ID message.txt  Steer one active Worker, no implicit restart\nrouting routing.json    Apply pools/maxWorkers to new dispatches only\nclear-provider ID       Clear a repaired provider's circuit/cooldown\nreconcile decision.json Record stop/effect evidence before task continuation\ndispatch task.json      Submit one complete task within loaded authority\n\nNo credentials belong in configuration or command arguments. Secrets stay in Pi's existing auth store.`);
    console.log(`\nCross-harness governance (one shared service/database):\nstart                         Start/reuse service; never implicitly resume\nmcp                           Standard MCP stdio entry for any MCP host\ngovernance                    Bounded domain/capacity/incident view\nadd-c spec.json                Add an explicitly scoped, initially paused C\ndirect task.json               Dispatch a standalone W (explicit workerMode)\ncommand operation.json        Execute {requestId,command}; idempotent receipt\nreceipt REQUEST_ID            Read original operation outcome\ninspect coordinator|worker ID Read exact owner and current run\npause|drain|stop|resume [coordinator|worker ID]  Scoped control\nwake [C_ID] message.txt        Queue one C delta without replacement\nclear-provider ID evidence.txt Reopen a diagnosed provider circuit\n\nConnecting MCP never creates agents or another service. Work requires explicit assignment.\n`);
  } else {
    const config=loadConfig(configPath);
    const govern=async(command,requestId=randomUUID())=>{
      const request=governanceRequestSchema.parse({requestId,command});
      process.stderr.write(JSON.stringify({requestId})+'\n');
      return call(config,'governance-command',request);
    };
    if(command==='guard') {
      await supervise(config);
    } else if(command==='serve') {
      if(!['win32','linux','darwin'].includes(process.platform))throw new Error('Unsupported execution platform');
      process.on('uncaughtExceptionMonitor',error=>diagnostic(config,'uncaught-exception',safeError(error)));
      const app=await serve(config,{startPaused:rest.includes('--paused'),recovery:rest.includes('--recovery')});
      diagnostic(config,'service-ready',{mode:app.engine.store.get('mode')});
      app.engine.on('change',e=>console.log(JSON.stringify({at:new Date().toISOString(),kind:e.kind,owner:e.owner,status:e.status})));
      console.log(JSON.stringify({ready:true,pid:process.pid,mode:app.engine.store.get('mode'),config:configPath}));
      let stopping=false;
      for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(!stopping){stopping=true;void app.close().then(()=>{process.send?.({type:'graceful-shutdown'});process.exit(0);}).catch(()=>process.exit(1));}});
    } else {
      let result;
      if(command==='status')result=await call(config,'status');
      else if(command==='start')result=await ensureService(config);
      else if(command==='governance')result=await call(config,'governance');
      else if(command==='receipt')result=await call(config,'governance-receipt',{requestId:rest[0]});
      else if(command==='inspect')result=await call(config,'inspect-owner',{target:target(rest)});
      else if(command==='subscription')result=await call(config,'subscription-status',{id:rest[0]});
      else if(command==='subscription-reconcile')result=await call(config,'subscription-reconcile',jsonFile(rest[0]));
      else if(command==='command'){const request=governanceRequestSchema.parse(jsonFile(rest[0]));result=await govern(request.command,request.requestId);}
      else if(command==='add-c')result=await govern({action:'coordinator-add',spec:jsonFile(rest[0])});
      else if(command==='direct')result=await govern({action:'dispatch-independent',task:jsonFile(rest[0])});
      else if(command==='load')result=await call(config,'campaign-file',{path:resolve(rest[0])});
      else if(command==='dispatch')result=await govern({action:'dispatch',coordinatorId:rest[1]??'c1',task:jsonFile(rest[0])});
      else if(command==='message')result=await govern({action:'message',target:{kind:'worker',id:rest[0]},message:readFileSync(rest[1],'utf8'),messageId:randomUUID()});
      else if(command==='wake')result=await govern({action:'wake',coordinatorId:rest.length>1?rest[0]:'c1',message:readFileSync(rest.at(-1),'utf8')});
      else if(command==='routing'||command==='reconcile')result=await govern({...jsonFile(rest[0]),action:command});
      else if(command==='clear-provider')result=await govern({action:command,id:rest[0],evidence:readFileSync(rest[1],'utf8')});
      else if(command==='clear-forge')result=await govern({action:command,evidence:readFileSync(rest[0],'utf8')});
      else if(['resume','pause','drain','stop'].includes(command))result=await govern({action:command,target:target(rest)});
      else throw new Error(`Unknown command: ${command}`);
      console.log(JSON.stringify(result,null,2));
    }
  }
} catch(e) {
  if(['serve','guard'].includes(command)){
    try{diagnostic(loadConfig(configPath),'startup-failure',safeError(e));}catch{}
  }
  console.error(e.message);process.exitCode=1;
}
