import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,writeFileSync,readFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { context,callTool } from './runtime.mjs';
import { hook } from './hooks.mjs';
import { configure } from './configure.mjs';
import { composeRoleGuidance, COORDINATOR_REFILL, WORKER_RETURN } from '../../skill/integrations/seat-guidance.js';

test('Codex and Pi share role obligations without adding a scheduler or duplicate guidance',()=>{
 const dir=mkdtempSync(join(tmpdir(),'repostew-parity-'));
 try {
  const contract=join(dir,'contract.md');writeFileSync(contract,'EXACT CONTRACT');
  for(const [role,guidance] of [['coordinator',COORDINATOR_REFILL],['worker',WORKER_RETURN]]) {
   const assembled=composeRoleGuidance('EXACT CONTRACT',role);
   assert.equal(composeRoleGuidance(assembled,role),assembled);
   assert.ok(context({workspace:dir,role,seatGuidance:contract}).includes(assembled));
   assert.equal(assembled.split(guidance).length,2);
  }
  assert.equal(composeRoleGuidance('EXACT CONTRACT','general'),'EXACT CONTRACT');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('current scope follows fixed contract and is reloaded without stale task state',()=>{
 const dir=mkdtempSync(join(tmpdir(),'repostew-codex-'));
 try{const facts=join(dir,'facts.md');writeFileSync(facts,'ONE PASS; MAIN QUEUE FROZEN');const p={version:1,workspace:dir,role:'coordinator',currentFacts:facts};assert.match(context(p),/MAIN QUEUE FROZEN/);writeFileSync(facts,'STOP');assert.match(context(p),/STOP/);}finally{rmSync(dir,{recursive:true,force:true});}
});
test('native hooks narrow searches and replace only oversized search feedback',()=>{
 const p={version:1,workspace:'D:/work',role:'worker'};
 assert.equal(hook({hook_event_name:'PreToolUse',tool_name:'grep',cwd:'D:/work',tool_input:{path:'state'}},p).hookSpecificOutput.permissionDecision,'deny');
 assert.deepEqual(hook({hook_event_name:'PreToolUse',tool_name:'Bash',cwd:'D:/work',tool_input:{command:'rtk proxy rg foo state/repositories/example/state.md'}},p),{});
 assert.deepEqual(hook({hook_event_name:'PreToolUse',tool_name:'Bash',cwd:'D:/work',tool_input:{command:'rtk proxy rg foo D:/work/state/repositories/example/state.md'}},p),{});
 assert.equal(hook({hook_event_name:'PreToolUse',tool_name:'Bash',cwd:'D:/work',tool_input:{command:'rtk proxy rg foo D:/work/state'}},p).hookSpecificOutput.permissionDecision,'deny');
 const event={hook_event_name:'PostToolUse',tool_name:'Bash',tool_input:{command:'rtk proxy rg foo exact.md'},tool_response:'a'.repeat(70000)};
 assert.equal(hook(event,p).decision,'block');assert.equal(event.tool_response.length,70000);
 assert.deepEqual(hook({...event,tool_input:{command:'rtk npm run build'}},p),{});
});
test('project installation is idempotent and preserves foreign configuration',()=>{
 const dir=mkdtempSync(join(tmpdir(),'repostew-codex-'));try{const file=join(dir,'input.json');writeFileSync(file,JSON.stringify({version:1,workspace:dir,role:'general'}));const a=configure(dir,file);const original=readFileSync(a.configPath,'utf8');configure(dir,file);assert.equal(readFileSync(a.configPath,'utf8'),original);writeFileSync(file,JSON.stringify({version:1,workspace:dir,role:'worker'}));assert.throws(()=>configure(dir,file),/Different existing/);assert.equal(readFileSync(a.configPath,'utf8'),original);}finally{rmSync(dir,{recursive:true,force:true});}
});
test('status never claims session activation or process clearance',async()=>{
 const p={workspace:'/work',role:'general'};assert.equal((await callTool('repostew_runtime_status',p)).automaticContinuation,false);assert.equal((await callTool('openrig_runtime_status',p)).processClearance,'unknown');
});
