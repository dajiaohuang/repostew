import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {assemble} from './assemble-seat-context.mjs';

function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'repostew-context-'));
  t.after(()=>{const real=fs.realpathSync(dir);assert.ok(real.startsWith(fs.realpathSync(os.tmpdir())+path.sep));fs.rmSync(real,{recursive:true,force:true});});
  fs.writeFileSync(path.join(dir,'policy.md'),'# Worker\nUse [method](method.md).\n');
  fs.writeFileSync(path.join(dir,'facts-input.md'),'Project example/one; owner first; unresolved write KEEP_UNKNOWN.\n');
  const manifest=path.join(dir,'manifest.json');
  fs.writeFileSync(manifest,JSON.stringify({fixedSources:['policy.md'],factsFile:'facts-input.md',outputDir:'rendered'}));
  return {dir,manifest};
}

test('facts remain separate and a changed task leaves the fixed contract unchanged',t=>{
  const {dir,manifest}=fixture(t),first=assemble(manifest);
  const contract=fs.readFileSync(path.join(dir,'rendered/contract.md'),'utf8');
  assert.ok(!contract.includes('example/one'));
  assert.ok(contract.includes(path.join(dir,'method.md').replaceAll('\\','/')));
  assert.ok(fs.readFileSync(path.join(dir,'rendered/startup.txt'),'utf8').includes('KEEP_UNKNOWN'));
  const startup=fs.readFileSync(path.join(dir,'rendered/startup.txt'),'utf8');
  assert.ok(startup.includes('Canonical current facts: '+path.join(dir,'facts-input.md').replaceAll('\\','/')));
  assert.ok(startup.includes('never overwrite newer facts'));
  fs.writeFileSync(path.join(dir,'facts-input.md'),'Project example/two; owner second; prior write still KEEP_UNKNOWN.\n');
  const second=assemble(manifest);
  assert.equal(first.contractSha256,second.contractSha256);
  assert.notEqual(first.factsSha256,second.factsSha256);
  assert.notEqual(first.startupSha256,second.startupSha256);
  assert.equal(second.status,'rendered-not-activated');
});

test('refuses using mutable facts as fixed policy',t=>{
  const {dir,manifest}=fixture(t);
  fs.writeFileSync(manifest,JSON.stringify({fixedSources:['facts-input.md'],factsFile:'facts-input.md',outputDir:'rendered'}));
  assert.throws(()=>assemble(manifest),/facts cannot be a fixed source/);
});

test('refuses an output that would overwrite an input',t=>{
  const {dir,manifest}=fixture(t);
  fs.copyFileSync(path.join(dir,'policy.md'),path.join(dir,'contract.md'));
  fs.writeFileSync(manifest,JSON.stringify({fixedSources:['contract.md'],factsFile:'facts-input.md',outputDir:'.'}));
  assert.throws(()=>assemble(manifest),/overwrite an input/);
});
