import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {supervise} from '../src/guardian.mjs';
import {call} from '../src/server.mjs';

test('native service crash restores control paused without dispatching or replaying operations',{skip:process.platform!=='win32',timeout:20000},async t=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-service-recovery-')),children=[];
  const config={...JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8')),
    runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..'),diagnosticsDir:join(dir,'diagnostics'),configFile:join(dir,'config.json')};
  writeFileSync(config.configFile,JSON.stringify(config));
  let supervising;
  t.after(async()=>{for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');await supervising;rmSync(dir,{recursive:true,force:true});});
  supervising=supervise(config,{launch:(c,attempt)=>{
    const child=spawn(process.execPath,[fileURLToPath(new URL('../src/cli.mjs',import.meta.url)),'serve','--paused',
      ...(attempt?['--recovery']:[]),'--config',c.configFile],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
    children.push(child);return child;
  }});
  const ready=async pid=>{
    for(let n=0;n<100;n++){
      try{
        const control=JSON.parse(readFileSync(join(config.runtimeDir,'control.json'),'utf8'));
        if(control.pid===pid)return await call(config,'status',{}, {timeoutMs:300});
      }catch{}
      await new Promise(r=>setTimeout(r,50));
    }
    throw new Error('Owned service did not become ready');
  };
  await ready(children[0].pid);
  await call(config,'control',{action:'resume'});
  assert.equal((await call(config,'status')).mode,'running');
  children[0].kill('SIGKILL');
  for(let n=0;n<100&&children.length<2;n++)await new Promise(r=>setTimeout(r,50));
  assert.equal(children.length,2);
  const recovered=await ready(children[1].pid);
  assert.equal(recovered.mode,'paused');assert.equal(recovered.tasks.length,0);
  await call(config,'subscription-register',{id:'recovery-test',harness:'t3',target:'test',filter:'attention',from:0});
  const packet=await call(config,'subscription-claim',{id:'recovery-test'});
  assert.ok(packet.delivery.events.some(e=>e.kind==='service_recovered_paused'));
  children[1].kill('SIGKILL');await supervising;
  assert.equal(children.length,2);
});
