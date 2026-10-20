import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const wrapper=fileURLToPath(new URL('../src/owned_process.py',import.meta.url));
const windows=process.platform==='win32';
function run(t,script,seconds=5){
  const dir=mkdtempSync(join(tmpdir(),'repostew-job-test-'));const receipt=join(dir,'receipt.json');
  const child=spawn('python',['-B','-X','utf8',wrapper,'--receipt',receipt,'--parent',String(process.pid),'--seconds',String(seconds),'--',process.execPath,'-e',script],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',c=>stdout+=c);child.stderr.on('data',c=>stderr+=c);
  const done=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr,receipt:JSON.parse(readFileSync(receipt,'utf8'))}));});
  t.after(()=>rmSync(dir,{recursive:true,force:true}));return {child,done,dir};
}
test('native Job transparently relays stdin/stdout and proves stopped tree',{skip:!windows},async t=>{
  const {child,done}=run(t,"process.stdin.pipe(process.stdout)");child.stdin.end('中文\nsecond\n');const r=await done;
  assert.equal(r.stdout,'中文\nsecond\n');assert.equal(r.receipt.treeStopped,true);assert.equal(r.receipt.targetReleased,true);assert.equal(r.code,0);
});
test('native timeout terminates descendant, not just direct process',{skip:!windows},async t=>{
  const {child,done}=run(t,"require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit'});setInterval(()=>{},1000)",0.8);
  child.stdin.end();const r=await done;assert.equal(r.receipt.reason,'deadline');assert.equal(r.receipt.treeStopped,true);assert.equal(r.code,1);
});
test('native normal parent exit also cleans still-running descendants',{skip:!windows},async t=>{
  const {child,done}=run(t,"const p=require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});p.unref();process.exit(0)");
  child.stdin.end();const r=await done;assert.equal(r.receipt.treeStopped,true);assert.equal(r.code,0);
});
