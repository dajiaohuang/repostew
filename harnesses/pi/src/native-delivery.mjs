import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync} from 'node:fs';
const exec=promisify(execFile);

export async function deliverT3(binding,packet) {
  if(binding.webhookUrlFile) {
    const url=readFileSync(binding.webhookUrlFile,'utf8').trim();
    const parsed=new URL(url);
    if(parsed.origin!=='https://relay.t3.codes'||!parsed.pathname.startsWith('/v1/hooks/'))throw new Error('Expected native T3 Connect webhook URL');
    let response;
    try {response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({subscriptionId:binding.id,deliveryId:packet.delivery.id,targetThreadId:binding.target}),signal:AbortSignal.timeout(20000)});}
    catch {throw new Error('T3 webhook delivery outcome unknown; inspect the pending receipt before retrying');}
    if(!response.ok)throw new Error(`T3 webhook HTTP ${response.status}; delivery held`);
    // HTTP acceptance alone does not prove the bound conversation received it.
    // The native webhook turn acknowledges the exact local pending delivery.
    return undefined;
  }
  if(!binding.command||!Array.isArray(binding.args))throw new Error('T3 native acp-mcp-call command and argument prefix required');
  const request={threadId:binding.target,mode:'queue',clientRequestId:`repostew:${binding.id}:${packet.delivery.id}`,message:packet.text};
  let stdout;
  try {({stdout}=await exec(binding.command,[...binding.args,'acp-mcp-call','t3_thread_send',JSON.stringify(request)],{windowsHide:true,timeout:30000,maxBuffer:1024*1024,env:{...process.env,...binding.env}}));}
  catch(e){throw new Error(`T3 native transport failed (${e.code??'unknown'}); delivery held for reconciliation`);}
  const raw=JSON.parse(stdout);const result=raw.structuredContent??raw;
  if(raw.isError||result.threadId!==binding.target||!result.messageId)throw new Error('T3 send receipt missing or target mismatch; delivery held');
  return `T3 native messageId=${result.messageId}; delivery=${result.delivery}`;
}

// An existing owner's endpoint and exact loaded thread are mandatory. Never
// resume another process's thread or spawn a competing Codex session.
export async function deliverCodex(binding,packet,{WebSocketImpl=WebSocket}={}) {
  if(!/^ws:\/\/127\.0\.0\.1:\d+(\/.*)?$/.test(binding.endpoint??''))throw new Error('Explicit local Codex App Server WebSocket endpoint required');
  const options=binding.tokenFile?{headers:{Authorization:`Bearer ${readFileSync(binding.tokenFile,'utf8').trim()}`}}:[];
  const ws=new WebSocketImpl(binding.endpoint,options);const pending=new Map();let next=0;
  const request=(method,params)=>new Promise((resolve,reject)=>{const id=++next;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`Codex ${method} response unknown; inspect exact thread`));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({jsonrpc:'2.0',id,method,params}));});
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
  const fail=()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Codex connection lost; delivery held'));}pending.clear();};
  ws.addEventListener('close',fail);ws.addEventListener('error',fail);
  try {
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Codex connection timeout')),10000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Codex endpoint unavailable'));},{once:true});});
    await request('initialize',{clientInfo:{name:'repostew_governance',version:'2.1.0'}});
    ws.send(JSON.stringify({jsonrpc:'2.0',method:'initialized',params:{}}));
    const read=await request('thread/read',{threadId:binding.target,includeTurns:false});
    if(read.thread?.id!==binding.target||read.thread.status?.type==='notLoaded')throw new Error('Codex target is not loaded by this endpoint; attach in its owning harness first');
    const result=await request('turn/start',{threadId:binding.target,input:[],toolOutput:{name:'repostew_event',namespace:null,output:packet.text}});
    if(!result.turn?.id)throw new Error('Codex turn receipt missing; delivery held');
    return `Codex App Server accepted turn=${result.turn.id}`;
  } finally {ws.close();fail();}
}
