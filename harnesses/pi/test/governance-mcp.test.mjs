import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {serve} from '../src/server.mjs';

test('two independent MCP hosts share one service and deduplicated governance operations',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'repostew-mcp-'));
  const config={...JSON.parse(readFileSync(new URL('../config.example.json',import.meta.url),'utf8')),runtimeDir:join(dir,'runtime'),workRoot:join(dir,'work'),workspace:resolve('..')};
  const path=join(dir,'config.json');writeFileSync(path,JSON.stringify(config));
  const app=await serve(config);const clients=[];
  t.after(async()=>{for(const c of clients)await c.close();await app.close();rmSync(dir,{recursive:true,force:true});});
  for(const name of ['codex-like-host','claude-like-host']) {
    const client=new Client({name,version:'1.0.0'});
    const args=[resolve('src/governance-mcp.mjs'),'--config',path];
    const transport=new StdioClientTransport({command:name==='codex-like-host'?process.execPath:'rtk',args:name==='codex-like-host'?args:['proxy',process.execPath,...args],stderr:'pipe'});
    clients.push(client);await client.connect(transport);
  }
  const [a,b]=clients;
  const tools=await a.listTools();assert.equal(tools.tools.length,7);
  const decode=result=>{assert.ok(!result.isError,result.content?.[0]?.text);return result.structuredContent??JSON.parse(result.content[0].text);};
  const status=decode(await a.callTool({name:'repostew_start',arguments:{}}));assert.equal(status.reused,true);assert.equal(status.liveProcesses,0);
  const request={requestId:'fixture-add-alpha',command:{action:'coordinator-add',spec:{id:'alpha',campaign:{id:'alpha-scope',mandate:'No repository work; fixture only',allowedProjects:[],allowedHosts:['fixture.local'],workerMode:'read-only',continuous:false,revisitMs:60000}}}};
  const first=decode(await a.callTool({name:'repostew_command',arguments:request}));
  assert.equal(first.status,'completed');
  const again=decode(await b.callTool({name:'repostew_command',arguments:request}));assert.deepEqual(again,first);
  const receipt=decode(await b.callTool({name:'repostew_receipt',arguments:{requestId:request.requestId}}));assert.deepEqual(receipt,first);
  const state=decode(await b.callTool({name:'repostew_status',arguments:{}}));assert.equal(state.coordinators.find(c=>c.id==='alpha').mode,'paused');assert.equal(state.liveProcesses,0);
  const wrong=await b.callTool({name:'repostew_command',arguments:{...request,command:{action:'resume',target:{kind:'all'}}}});assert.equal(wrong.isError,true);
  assert.equal(app.store.get('mode'),'paused');assert.equal(app.store.coordinators().filter(c=>c.id==='alpha').length,1);
});
