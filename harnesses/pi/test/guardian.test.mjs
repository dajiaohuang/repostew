import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdtempSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {supervise} from '../src/guardian.mjs';
import {safeError,diagnostic} from '../src/diagnostics.mjs';

function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'repostew-guardian-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  return {runtimeDir:join(dir,'unavailable-runtime'),diagnosticsDir:dir};
}
test('guardian performs one recovery only and records outside unavailable runtime',async t=>{
  const config=fixture(t),attempts=[];
  await supervise(config,{launch:(c,attempt)=>{
    attempts.push(attempt);const child=new EventEmitter();
    queueMicrotask(()=>child.emit('exit',1,null));return child;
  }});
  assert.deepEqual(attempts,[0,1]);
  const records=readFileSync(join(config.diagnosticsDir,'lifecycle.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(records.at(-1).kind,'recovery-exhausted');
  assert.equal(existsSync(config.runtimeDir),false);
  assert.equal(existsSync(join(config.diagnosticsDir,'guardian.lock')),false);
});
test('explicit service shutdown never restarts and live guardian excludes another owner',async t=>{
  const config=fixture(t);let count=0,release;
  const running=supervise(config,{launch:()=>{
    count++;const child=new EventEmitter();release=()=>{child.emit('message',{type:'graceful-shutdown'});child.emit('exit',0,null);};return child;
  }});
  await assert.rejects(supervise(config),/guardian is alive/);
  release();await running;assert.equal(count,1);
});
test('diagnostic drops exception body and keeps native error code',t=>{
  const config=fixture(t),error=new Error('SECRET provider body');
  error.code='ENOSPC';diagnostic(config,'fault',safeError(error));
  const text=readFileSync(join(config.diagnosticsDir,'lifecycle.jsonl'),'utf8');
  assert.ok(text.includes('ENOSPC'));assert.ok(!text.includes('SECRET'));
});
