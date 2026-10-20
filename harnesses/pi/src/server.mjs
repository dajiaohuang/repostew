import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, openSync, writeFileSync, closeSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Store } from './store.mjs';
import { Engine } from './engine.mjs';
import { invariant } from './config.mjs';
import {governanceRequestSchema} from './governance-schema.mjs';
import {diagnostic,safeError} from './diagnostics.mjs';

function equal(a,b) {const aa=Buffer.from(a??'');const bb=Buffer.from(b??'');return aa.length===bb.length&&timingSafeEqual(aa,bb);}
async function jsonBody(req) {
  let bytes=0;const chunks=[];
  for await(const c of req){bytes+=c.length;if(bytes>2*1024*1024)throw new Error('Request exceeds 2 MiB');chunks.push(c);}
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}
function acquireLock(dir) {
  const path=join(dir,'server.lock');mkdirSync(dir,{recursive:true});
  if(existsSync(path)) {
    const prior=JSON.parse(readFileSync(path,'utf8'));
    let alive=true;try{process.kill(prior.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else throw e;}
    invariant(!alive,'A harness process still owns this runtime (or PID identity is uncertain)');
    unlinkSync(path);
  }
  const fd=openSync(path,'wx',0o600);writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));closeSync(fd);
  return ()=>{const current=JSON.parse(readFileSync(path,'utf8'));if(current.pid===process.pid)unlinkSync(path);};
}
export async function serve(config,options={}) {
  const unlock=acquireLock(config.runtimeDir);
  const store=new Store(join(config.runtimeDir,'runtime.sqlite'));
  const engine=new Engine(config,store,options);
  const adminToken=randomBytes(32).toString('hex');
  const server=createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
    try {
      invariant(req.method==='POST','POST required');
      invariant(!req.headers.origin,'Browser-origin requests are not accepted');
      const auth=req.headers.authorization?.replace(/^Bearer /,'');const body=await jsonBody(req);
      let result;
      const match=req.url?.match(/^\/agent\/([a-f0-9-]+)\/([a-z-]+)$/);
      if(match)result=await engine.agentAction(match[1],auth,match[2],body);
      else {
        invariant(equal(auth,adminToken),'Authentication required');
        if(req.url==='/subscription-events') {
          invariant(engine.subscriptions.get(body.id),'Unknown subscription');
          res.setHeader('Content-Type','text/event-stream; charset=utf-8');res.setHeader('Connection','keep-alive');
          const send=()=>{if(!res.destroyed)res.write('event: available\ndata: {}\n\n');};
          engine.on('governance-event',send);
          const ack=id=>{if(id===body.id)send();};engine.on('subscription-ack',ack);
          const ping=setInterval(()=>{if(!res.destroyed)res.write(': heartbeat\n\n');},15000);ping.unref();
          res.on('close',()=>{clearInterval(ping);engine.off('governance-event',send);engine.off('subscription-ack',ack);});send();return;
        }
        if(req.url==='/subscription-register')result=engine.subscriptions.register(body);
        else if(req.url==='/subscription-claim')result=engine.subscriptions.claim(body.id);
        else if(req.url==='/subscription-ack'){result=engine.subscriptions.ack(body);engine.emit('subscription-ack',body.id);}
        else if(req.url==='/subscription-reconcile'){result=engine.subscriptions.reconcile(body);engine.emit('subscription-ack',body.id);}
        else if(req.url==='/subscription-status')result=engine.subscriptions.get(body.id)??{missing:true};
        else if(req.url==='/events') {
          res.setHeader('Content-Type','text/event-stream; charset=utf-8');res.setHeader('Connection','keep-alive');
          res.write(`event: ready\ndata: ${JSON.stringify({mode:store.get('mode')})}\n\n`);
          const send=event=>{if(!res.destroyed)res.write(`event: change\ndata: ${JSON.stringify(event)}\n\n`);};
          engine.on('change',send);
          const ping=setInterval(()=>{if(!res.destroyed)res.write(': heartbeat\n\n');},15000);ping.unref();
          res.on('close',()=>{clearInterval(ping);engine.off('change',send);});return;
        }
        else if(req.url==='/status')result=engine.status();
        else if(req.url==='/governance')result=engine.governance();
        else if(req.url==='/governance-command') {
          const {requestId,command}=governanceRequestSchema.parse(body);
          result=await engine.govern({requestId,...command});
        }
        else if(req.url==='/governance-receipt')result=store.receipt(`governance:${body.requestId}`)??{requestId:body.requestId,status:'not-found'};
        else if(req.url==='/inspect-owner') {
          invariant(['coordinator','worker'].includes(body.target?.kind),'Invalid inspect target');
          const owner=body.target.kind==='coordinator'?store.coordinator(body.target.id):store.task(body.target.id);
          invariant(owner,'Unknown owner');result={owner,run:owner.runId?store.run(owner.runId):undefined};
        }
        else if(req.url==='/campaign')result=engine.loadCampaign(body);
        else if(req.url==='/campaign-file')result=engine.loadCampaign(JSON.parse(readFileSync(body.path,'utf8').replace(/^\uFEFF/,'')));
        else if(req.url==='/dispatch')result=engine.enqueue(body);
        else if(req.url==='/message')result=await engine.sendMessage(body.taskId,body.message,body.requestId);
        else if(req.url==='/control')result=await engine.control(body.action,body);
        else throw new Error('Unknown endpoint');
      }
      res.end(JSON.stringify(result));
    } catch(e) {
      if(/ENOSPC|disk.*full/i.test(e.message))engine.fatal(e);
      res.statusCode=/Authentication|capability/.test(e.message)?403:400;
      res.end(JSON.stringify({error:e.message}));
    }
  });
  server.requestTimeout=60000;server.headersTimeout=10000;
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const url=`http://127.0.0.1:${server.address().port}`;
  const controlPath=join(config.runtimeDir,'control.json');
  writeFileSync(controlPath,JSON.stringify({url,token:adminToken,pid:process.pid}),{mode:0o600});
  if(options.startPaused)store.set('mode','paused');
  engine.start(url);
  if(options.recovery) {
    engine.subscriptions.record({kind:'service_recovered_paused',requiresOwner:true});
    diagnostic(config,'service-recovered-paused');
  }
  let closing;
  const close=()=>closing??=(async()=>{
    await engine.shutdown();
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
    store.close();
    try{unlinkSync(controlPath);}catch(e){if(e.code!=='ENOENT')throw e;}
    unlock();
  })();
  engine.on('fatal',e=>{
    // Do not log provider text, auth headers or task bodies in service diagnostics.
    diagnostic(config,'engine-fatal',safeError(e));
    process.exitCode=1;
    void close().catch(()=>{});
  });
  return {engine,store,server,url,close};
}

export async function call(config,route,body={},options={}) {
  const control=JSON.parse(readFileSync(join(config.runtimeDir,'control.json'),'utf8'));
  invariant(/^http:\/\/127\.0\.0\.1:\d+$/.test(control.url),'Unexpected control endpoint');
  const response=await fetch(`${control.url}/${route}`,{method:'POST',headers:{authorization:`Bearer ${control.token}`,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(options.timeoutMs??120000)});
  const result=await response.json();if(!response.ok)throw new Error(result.error);return result;
}
