import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Fleet,remoteCommand,validateFleet} from '../src/fleet.mjs';
const project={host:'github.com',namespace:'example',repo:'one'};
const machine=id=>({id,platform:'linux',sshHost:id,node:'node',gateway:'/opt/a b/gateway.mjs',config:'/opt/a b/config.json'});
const request=id=>({requestId:id,command:{action:'dispatch-independent',task:{id:'w1',project,workerMode:'read-only',brief:{objectOutcome:'inspect',locationPrior:'repo',completeTodo:'inspect',authorityResources:'read-only',finishReturn:'report'}}}});
function fixture(t,transport){const dir=mkdtempSync(join(tmpdir(),'fleet-test-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));return new Fleet({version:1,machines:[machine('a'),machine('b')]},dir,{transport});}
test('project reservation survives disconnect and coordinator restart; no replay',async t=>{
  let sends=0;const f=fixture(t,async()=>{sends++;throw Error('response lost');});await f.claim('a',project);
  assert.equal((await f.command('a',request('once'))).state,'unknown');
  const restarted=new Fleet(f.config,f.dir,{transport:f.transport});await restarted.command('a',request('once'));assert.equal(sends,1);
  await assert.rejects(restarted.claim('b',project),/belongs/);
  await assert.rejects(restarted.command('b',request('once')),/reused/);
});
test('receipt reconciliation is read-only and never resends a missing operation',async t=>{
  const calls=[];const f=fixture(t,async(_m,r)=>{calls.push(r.action);if(r.action==='command')throw Error('lost');return {status:'not-found'};});
  await f.claim('a',project);await f.command('a',request('missing'));assert.equal((await f.receipt('a','missing')).state,'unknown');
  await f.command('a',request('missing'));assert.deepEqual(calls,['command','receipt']);
});
test('command ID content mismatch and changed machine identity are rejected',async t=>{
  const f=fixture(t,async()=>({status:'completed'}));await f.claim('a',project);await f.command('a',request('done'));
  const changed=request('done');changed.command.task.brief.finishReturn='different';await assert.rejects(f.command('a',changed),/reused/);
  f.config.machines[0].sshHost='another';await assert.rejects(f.command('a',request('another')),/identity/);
});
test('explicit project scope is required for C; unregistered owners cannot resume',async t=>{
  const f=fixture(t,async()=>({status:'completed'}));
  await assert.rejects(f.command('a',{requestId:'resume',command:{action:'resume',target:{kind:'all'}}}),/registered/);
  const campaign={id:'campaign',mandate:'inspect',allowedHosts:['github.com'],allowedProjects:[],workerMode:'read-only',continuous:false,revisitMs:60000};
  await assert.rejects(f.command('a',{requestId:'add',command:{action:'coordinator-add',spec:{id:'c',campaign}}}),/explicit project/);
  await assert.rejects(f.command('a',request('unclaimed')),/Claim/);
});
test('parallel commands have one journal writer',async t=>{
  let release;const waiting=new Promise(r=>release=r);const f=fixture(t,async()=>{await waiting;return {status:'completed'};});await f.claim('a',project);
  const first=f.command('a',request('first'));await assert.rejects(f.claim('b',{...project,repo:'two'}),/EEXIST/);release();await first;
});
test('SSH command quotes paths for POSIX and Windows without putting task data in command line',()=>{
  const unix=remoteCommand({...machine('a'),gateway:"/tmp/a'b/$x.mjs"});assert.ok(unix.includes("'\\''"));assert.ok(unix.includes('$x.mjs'));
  const win=remoteCommand({...machine('win'),platform:'win32',gateway:"C:/a'b/$x.mjs",config:'C:/a b/c.json'});
  const decoded=Buffer.from(win.split(' ').at(-1),'base64').toString('utf16le');assert.ok(decoded.includes("'C:/a''b/$x.mjs'"));
  assert.throws(()=>validateFleet({version:1,machines:[{...machine('a'),sshHost:'-oProxyCommand=bad'}]}),/alias/);
});
