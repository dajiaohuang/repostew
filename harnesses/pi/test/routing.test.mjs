import test from 'node:test';
import assert from 'node:assert/strict';
import { choosePool, classifyProviderFailure } from '../src/routing.mjs';
const pools=[{id:'a',priority:0,weight:3,maxConcurrent:4,enabled:true},{id:'b',priority:0,weight:1,maxConcurrent:4,enabled:true},{id:'backup',priority:1,weight:1,maxConcurrent:2,enabled:true}];
test('weighted routing yields exact 3:1 over complete periods, deterministic across restart',()=>{
  let state={};const chosen=[];
  for(let i=0;i<40;i++){const r=choosePool(pools,JSON.parse(JSON.stringify(state)),{},0);state=r.routing;chosen.push(r.pool.id);}
  assert.equal(chosen.filter(x=>x==='a').length,30);assert.equal(chosen.filter(x=>x==='b').length,10);assert.equal(chosen.includes('backup'),false);
});
test('capacity/cooldown/priority and disabled pools are enforced',()=>{
  assert.equal(choosePool(pools,{}, {a:4,b:4},0).pool.id,'backup');
  assert.equal(choosePool(pools,{a:{cooldownUntil:100},b:{disabledReason:'auth'}},{},50).pool.id,'backup');
  assert.equal(choosePool(pools,{}, {a:4,b:4,backup:2},0),undefined);
  assert.equal(choosePool(pools.map(p=>({...p,enabled:false})),{}, {},0),undefined);
});
test('cooldown recovery does not create historical deficit catch-up',()=>{
  let state={a:{credit:500,cooldownUntil:100}};
  for(let i=0;i<10;i++)state=choosePool(pools,state,{},50).routing;
  assert.equal(state.a.credit,0);
  const ids=[];for(let i=0;i<4;i++){const r=choosePool(pools,state,{},101);state=r.routing;ids.push(r.pool.id);}
  assert.equal(ids.filter(x=>x==='a').length,3);
});
test('provider failures preserve Retry-After and isolate auth failures',()=>{
  assert.equal(classifyProviderFailure('HTTP 429 Retry-After: 120',1000).cooldownUntil,121000);
  assert.equal(classifyProviderFailure('401 Unauthorized',0).kind,'authentication');
  assert.equal(classifyProviderFailure('test assertion failed',0).kind,'execution');
});
