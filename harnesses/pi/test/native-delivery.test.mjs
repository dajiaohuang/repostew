import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {deliverCodex,deliverT3} from '../src/native-delivery.mjs';

test('Codex adapter targets a loaded thread, sends native tool output and leaves permissions unchanged',async()=>{
  const sent=[];
  class Socket extends EventTarget {
    constructor(){super();queueMicrotask(()=>this.dispatchEvent(new Event('open')));}
    send(text){const m=JSON.parse(text);sent.push(m);if(m.id){const result=m.method==='initialize'?{}:m.method==='thread/read'?{thread:{id:'exact-thread',status:{type:'active'}}}:{turn:{id:'accepted-turn'}};queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({id:m.id,result})})));}}
    close(){}
  }
  const receipt=await deliverCodex({endpoint:'ws://127.0.0.1:12345',target:'exact-thread'},{text:'fixture',delivery:{id:'id'}},{WebSocketImpl:Socket});
  assert.match(receipt,/accepted-turn/);
  const turn=sent.find(m=>m.method==='turn/start');assert.deepEqual(turn.params,{threadId:'exact-thread',input:[],toolOutput:{name:'repostew_event',namespace:null,output:'fixture'}});
  assert.equal(sent.some(m=>['thread/start','thread/resume','turn/interrupt'].includes(m.method)),false);
});

test('Codex refuses unloaded or different owner and never starts competing sessions',async()=>{
  const sent=[];
  class Socket extends EventTarget {
    constructor(){super();queueMicrotask(()=>this.dispatchEvent(new Event('open')));}
    send(text){const m=JSON.parse(text);sent.push(m);if(m.id)queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({id:m.id,result:m.method==='initialize'?{}:{thread:{id:'exact',status:{type:'notLoaded'}}}})})));}
    close(){}
  }
  await assert.rejects(deliverCodex({endpoint:'ws://127.0.0.1:12345',target:'exact'},{text:'fixture'},{WebSocketImpl:Socket}),/not loaded/);
  assert.equal(sent.some(m=>m.method==='turn/start'),false);
});

test('T3 transport uses exact thread, queued mode and stable native idempotency key',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-t3-'));const path=join(dir,'native-call.mjs');
  writeFileSync(path,`const [verb,method,json]=process.argv.slice(2);const r=JSON.parse(json);if(verb!=='acp-mcp-call'||method!=='t3_thread_send'||r.threadId!=='thread-1'||r.mode!=='queue'||r.clientRequestId!=='repostew:t3-test:delivery-1')process.exit(2);console.log(JSON.stringify({structuredContent:{threadId:r.threadId,messageId:'native-receipt',delivery:'queued'}}));`);
  try {
    const receipt=await deliverT3({id:'t3-test',target:'thread-1',command:process.execPath,args:[path]},{text:'fixture',delivery:{id:'delivery-1'}});
    assert.match(receipt,/native-receipt/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('T3 webhook sends only routing IDs and waits for the native conversation receipt',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-hook-')),path=join(dir,'url');writeFileSync(path,'https://relay.t3.codes/v1/hooks/fixture');
  const original=globalThis.fetch;let sent;
  try {
    globalThis.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return {ok:true,status:202};};
    const result=await deliverT3({id:'sub',target:'thread',webhookUrlFile:path},{text:'DO NOT SEND BODY',delivery:{id:'delivery'}});
    assert.equal(result,undefined);assert.deepEqual(sent,{subscriptionId:'sub',deliveryId:'delivery',targetThreadId:'thread'});
  } finally {globalThis.fetch=original;rmSync(dir,{recursive:true,force:true});}
});
