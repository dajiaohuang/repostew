import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
const wrapper=fileURLToPath(new URL('../src/owned_process_posix.py',import.meta.url));
const supported=['linux','darwin'].includes(process.platform);
test('native POSIX owner relays IO but never upgrades group cleanup to full-tree proof',{skip:!supported},async t=>{
  const dir=mkdtempSync(join(tmpdir(),'fleet-posix-')),receipt=join(dir,'receipt.json');t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const child=spawn('python3',['-B',wrapper,'--receipt',receipt,'--parent',String(process.pid),'--seconds','5','--',process.execPath,'-e','process.stdin.pipe(process.stdout)'],{stdio:['pipe','pipe','pipe']});
  let output='';child.stdout.on('data',c=>output+=c);child.stderr.resume();const done=new Promise((yes,no)=>{child.on('error',no);child.on('close',yes);});child.stdin.end('native-posix');assert.equal(await done,0);assert.equal(output,'native-posix');
  const result=JSON.parse(readFileSync(receipt,'utf8'));assert.equal(result.groupStopped,true);assert.equal(result.treeStopped,false);
});
