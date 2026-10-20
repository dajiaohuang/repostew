import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {piModule} from '../src/pi-install.mjs';
import {todoStateFromBranch} from '../src/pi/todo-state.mjs';
import {loadRole} from '../src/roles.mjs';

const config=JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8'));
const message=(toolName,details)=>({role:'toolResult',toolCallId:'fixture',toolName,content:[{type:'text',text:'fixture'}],details,isError:false,timestamp:Date.now()});

test('real Pi todo extension restores active branch, migrates old results, and respects clear',async()=>{
  const {loadExtensions}=await piModule(config,'dist/core/extensions/loader.js');
  const {SessionManager}=await piModule(config,'dist/core/session-manager.js');
  const loaded=await loadExtensions([resolve('src/pi/todo.ts')],process.cwd());
  assert.deepEqual(loaded.errors,[]);
  const ext=loaded.extensions[0],tool=ext.tools.get('todo').definition;
  assert.ok(ext.commands.has('todos'));
  const session=SessionManager.inMemory(process.cwd());
  const old=session.appendMessage(message('harness_plan',{steps:[{title:'Read fixture',status:'completed'},{title:'Check result',status:'pending'}]}));
  const ctx={sessionManager:session};
  for(const handler of ext.handlers.get('session_start'))await handler({},ctx);
  let result=await tool.execute('list',{action:'list'});
  assert.deepEqual(result.details.todos.map(t=>t.done),[true,false]);
  session.appendMessage(message('todo',result.details));
  result=await tool.execute('toggle',{action:'toggle',id:2});
  session.appendMessage(message('todo',result.details));
  assert.equal(todoStateFromBranch(session.getBranch()).todos[1].done,true);
  session.branch(old);
  for(const handler of ext.handlers.get('session_tree'))await handler({},ctx);
  result=await tool.execute('list2',{action:'list'});
  assert.equal(result.details.todos[1].done,false,'future branch completion must not leak');
  result=await tool.execute('clear',{action:'clear'});
  session.appendMessage(message('todo',result.details));
  for(const handler of ext.handlers.get('session_start'))await handler({},ctx);
  result=await tool.execute('list3',{action:'list'});
  assert.deepEqual(result.details.todos,[],'clearing must not resurrect legacy plan');
});

for(const role of ['coordinator','worker'])test(`${role}: native structured result terminates only after accepted report`,async()=>{
  const {loadExtensions}=await piModule(config,'dist/core/extensions/loader.js');
  const keys=['REPOSTEW_HARNESS_URL','REPOSTEW_RUN_TOKEN','REPOSTEW_RUN_ID','REPOSTEW_ROLE'];
  const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const fetchBefore=globalThis.fetch;
  try {
    Object.assign(process.env,{REPOSTEW_HARNESS_URL:'http://fixture.invalid',REPOSTEW_RUN_TOKEN:'fixture',REPOSTEW_RUN_ID:'fixture',REPOSTEW_ROLE:role});
    const loaded=await loadExtensions([resolve('src/extension.mjs')],process.cwd());assert.deepEqual(loaded.errors,[]);
    const ext=loaded.extensions[0];assert.equal(ext.tools.has('harness_plan'),false);
    const report=ext.tools.get('harness_result').definition;
    assert.equal(ext.tools.has('harness_dispatch'),role==='coordinator');
    assert.equal(ext.tools.has('harness_queue'),role==='coordinator');
    if(role==='coordinator'){
      let sent;
      globalThis.fetch=async(url,options)=>{sent={url,body:JSON.parse(options.body)};return {ok:true,json:async()=>({tasks:[],total:0,nextOffset:null})};};
      const queue=await ext.tools.get('harness_queue').definition.execute('queue-call',{action:'list'});
      assert.equal(queue.terminate,undefined);assert.equal(sent.body.requestId,'queue-call');assert.ok(sent.url.endsWith('/queue'));
    }
    const params={outcome:role==='coordinator'?'wait':'no_delivery',summary:'Read fixture',evidence:['fixture'],remaining:[],blocker:''};
    globalThis.fetch=async()=>({ok:true,json:async()=>({recorded:true,finalized:false})});
    const result=await report.execute('result',params);assert.equal(result.terminate,true);assert.deepEqual(result.details.report,params);
    globalThis.fetch=async()=>({ok:false,json:async()=>({error:'Final delivery needs evidence'})});
    await assert.rejects(report.execute('rejected',params),/Final delivery needs evidence/);
  } finally {
    globalThis.fetch=fetchBefore;for(const k of keys)if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];
  }
});

test('role Markdown uses Pi frontmatter and explicit project tools',()=>{
  const c=loadRole(config,'coordinator'),w=loadRole(config,'worker');
  assert.equal(c.name,'coordinator');assert.ok(!c.tools.includes('bash'));assert.ok(w.tools.includes('todo'));assert.ok(w.tools.includes('bash'));
  assert.match(w.systemPrompt,/Pi's todo tool/);
});
