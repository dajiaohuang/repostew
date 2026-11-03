// Local stdio MCP transport. No credentials, scheduling or mutation tools.
import { createInterface } from 'node:readline';
import { loadProfile, toolDefinitions, callTool, VERSION } from './runtime.mjs';
export async function request(message) {
  if (message.method==='initialize') return {protocolVersion:message.params?.protocolVersion||'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'repostew',version:VERSION},instructions:'Use repostew_context for current scope; native host owns task custody and lifecycle.'};
  if (message.method==='ping') return {};
  if (message.method==='tools/list') return {tools:toolDefinitions};
  if (message.method==='tools/call') {
    try {const result=await callTool(message.params.name,loadProfile());return {content:[{type:'text',text:JSON.stringify(result)}],isError:false};}
    catch(e){return {content:[{type:'text',text:e.message}],isError:true};}
  }
  throw new Error('Unsupported method');
}
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const input=createInterface({input:process.stdin});
  for await (const line of input) {
    let message;
    try {message=JSON.parse(line);if(message.id===undefined)continue;const result=await request(message);process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message.id,result})+'\n');}
    catch(e){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message?.id??null,error:{code:-32603,message:e.message}})+'\n');}
  }
}
