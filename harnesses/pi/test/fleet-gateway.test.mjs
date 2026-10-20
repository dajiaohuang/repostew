import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {serve} from '../src/server.mjs';
import {loadConfig} from '../src/config.mjs';
const gateway=fileURLToPath(new URL('../src/fleet-gateway.mjs',import.meta.url));
function invoke(file,id,body){return new Promise((yes,no)=>{
  const child=spawn(process.execPath,[gateway,'--config',file,'--machine',id],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  let output='';child.stdout.on('data',x=>output+=x);child.stderr.resume();child.on('error',no);child.on('close',code=>{try{yes({code,...JSON.parse(output)});}catch(e){no(e);}});child.stdin.end(JSON.stringify(body));
});}
test('native stdio gateway reaches isolated service, keeps auth local, and rejects wrong enrollment',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'fleet-gateway-'));
  const raw={...JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8')),runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..'),piCli:resolve('unused-fixture-cli.js')};
  const file=join(dir,'config.json');writeFileSync(file,JSON.stringify(raw));const app=await serve(loadConfig(file));
  t.after(async()=>{await app.close();rmSync(dir,{recursive:true,force:true});});
  writeFileSync(join(raw.runtimeDir,'machine.json'),JSON.stringify({id:'fixture',platform:process.platform}));
  const doctor=await invoke(file,'fixture',{action:'doctor'});assert.equal(doctor.code,0);assert.equal(doctor.result.platform,process.platform);
  const status=await invoke(file,'fixture',{action:'status'});assert.equal(status.code,0);assert.equal(app.engine.live.size,0);
  const rejected=await invoke(file,'other',{action:'status'});assert.equal(rejected.code,1);
  const token=JSON.parse(readFileSync(join(raw.runtimeDir,'control.json'),'utf8')).token;assert.ok(!JSON.stringify(status).includes(token));
  const watcher=spawn(process.execPath,[gateway,'--config',file,'--machine','fixture'],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  watcher.stderr.resume();const stopped=new Promise(r=>watcher.once('close',r));
  const firstEvent=new Promise((yes,no)=>{
    let text='';
    watcher.stdout.on('data',x=>{
      text+=x;
      if(text.includes('\n')){try{yes(JSON.parse(text.split('\n')[0]));}catch(e){no(e);}}
    });
    watcher.once('error',no);
    watcher.once('close',()=>no(Error('watch ended before first event')));
  });
  watcher.stdin.end(JSON.stringify({action:'watch'}));
  const event=await firstEvent;assert.equal(event.machineId,'fixture');assert.equal(event.result.kind,'connected');assert.ok(!JSON.stringify(event).includes(token));watcher.kill();await stopped;
  const command={requestId:'fixture-pause',command:{action:'pause',target:{kind:'all'}}};
  const applied=await invoke(file,'fixture',{action:'command',request:command});assert.equal(applied.result.status,'completed');
  const receipt=await invoke(file,'fixture',{action:'receipt',requestId:'fixture-pause'});assert.deepEqual(receipt.result,applied.result);
  assert.equal(app.engine.live.size,0);
});
