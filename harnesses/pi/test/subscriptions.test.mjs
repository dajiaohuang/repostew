import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';
import {Store} from '../src/store.mjs';
import {Subscriptions} from '../src/subscriptions.mjs';
import {serve,call} from '../src/server.mjs';
import {subscribe} from '../src/event-client.mjs';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {z} from 'zod';
const base=JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8'));
const until=async fn=>{for(let i=0;i<100;i++){if(fn())return;await delay(20);}throw new Error('Expected event did not arrive');};

test('durable claims prevent duplicate windows and preserve unknown sends across restart',()=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-events-'));let store=new Store(join(dir,'test.sqlite'));let s=new Subscriptions(store);
  try {
    s.register({id:'pi-test',harness:'pi',target:'session1',from:0});
    s.record({kind:'worker_result',owner:'direct',coordinatorId:null,result:{private:'MUST NOT PUSH'},problem:'SECRET'});
    const a=s.claim('pi-test');assert.equal(a.delivery.events.length,1);assert.equal(JSON.stringify(a).includes('SECRET'),false);assert.equal(JSON.stringify(a).includes('MUST NOT PUSH'),false);
    assert.equal(s.claim('pi-test').held,true);
    store.close();store=new Store(join(dir,'test.sqlite'));s=new Subscriptions(store);
    assert.equal(s.claim('pi-test').held,true);
    assert.throws(()=>s.register({id:'pi-test',harness:'pi',target:'different'}),/binding changed/);
    assert.throws(()=>s.ack({id:'pi-test',deliveryId:'wrong',evidence:'received'}),/does not match/);
    s.ack({id:'pi-test',deliveryId:a.delivery.id,evidence:'native receipt'});
    s.ack({id:'pi-test',deliveryId:a.delivery.id,evidence:'duplicate receipt'});
    assert.equal(s.claim('pi-test').delivery,null);
    s.record({kind:'governance_attention',owner:'c1',category:'blocked'});
    assert.equal(s.claim('pi-test').delivery.events.length,1);
  }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});

test('SSE subscription catches disconnected events and ack releases subsequent batches',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-sse-'));const config={...base,runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..')};
  const app=await serve(config);const binding={id:'t3-test',harness:'t3',target:'exact-thread',from:0};let controller=new AbortController(),received=[];
  const start=()=>subscribe(config,binding,async p=>{received.push(p.delivery.id);return 'native receipt';},{signal:controller.signal});
  let job=start();t.after(async()=>{controller.abort();await job;await app.close();rmSync(dir,{recursive:true,force:true});});
  app.engine.emit('change',{kind:'governance_attention',owner:'c1'});await until(()=>received.length===1);
  await until(()=>!app.engine.subscriptions.get(binding.id).pending);controller.abort();await job;
  app.engine.emit('change',{kind:'worker_result',owner:'direct',coordinatorId:null,status:'no_delivery'});
  controller=new AbortController();job=start();await until(()=>received.length===2);
  assert.equal(new Set(received).size,2);assert.equal(app.store.get('mode'),'paused');assert.equal(app.engine.live.size,0);
});

test('Claude channel uses native notification and requires explicit model receipt',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-channel-'));const config={...base,runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..')};
  const path=join(dir,'config.json');writeFileSync(path,JSON.stringify(config));const app=await serve(config);
  const client=new Client({name:'channel-contract-test',version:'1'});const messages=[];
  t.after(async()=>{await client.close();await app.close();rmSync(dir,{recursive:true,force:true});});
  client.setNotificationHandler('notifications/claude/channel',{params:z.object({content:z.string(),meta:z.record(z.string(),z.string())})},n=>messages.push(n));
  await client.connect(new StdioClientTransport({command:process.execPath,args:[resolve('src/governance-mcp.mjs'),'--config',path,'--claude-channel','claude-test','--target','fixture-session'],stderr:'pipe'}));
  assert.ok(client.getServerCapabilities().experimental['claude/channel']);
  app.engine.emit('change',{kind:'governance_attention',owner:'c1',category:'blocked'});
  await until(()=>messages.length===1);const deliveryId=messages[0].meta.delivery_id;
  assert.equal(app.engine.subscriptions.get('claude-test').pending.id,deliveryId);
  const result=await client.callTool({name:'repostew_event_ack',arguments:{id:'claude-test',deliveryId}});assert.ok(!result.isError);
  assert.equal(app.engine.subscriptions.get('claude-test').pending,null);
  assert.equal(app.store.get('mode'),'paused');
});
