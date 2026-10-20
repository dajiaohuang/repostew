#!/usr/bin/env node
// Official MCP SDK stdio adapter. It owns no scheduler, sessions or database.
import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {z} from 'zod';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadConfig} from './config.mjs';
import {call} from './server.mjs';
import {ensureService} from './service-start.mjs';
import {governanceRequestSchema,inspectTargetSchema} from './governance-schema.mjs';
import {subscribe} from './event-client.mjs';
import {readPolicy} from './policy.mjs';

const index=process.argv.indexOf('--config');
const config=loadConfig(index>=0?resolve(process.argv[index+1]):fileURLToPath(new URL('../config.local.json',import.meta.url)));
const channelIndex=process.argv.indexOf('--claude-channel');
const channelId=channelIndex>=0?process.argv[channelIndex+1]:undefined;
const targetIndex=process.argv.indexOf('--target');
const target=targetIndex>=0?process.argv[targetIndex+1]:undefined;
if(channelId&&!target)throw new Error('Claude channel needs an explicit --target session ID');
const output=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const guarded=fn=>async args=>{try{return output(await fn(args));}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}};

serveStdio(()=>{
  const server=new McpServer({name:'repostew-governance',version:'2.2.0'}, {
    ...(channelId?{capabilities:{experimental:{'claude/channel':{}}},supportedProtocolVersions:['2025-11-25','2025-06-18']}:{}),
    instructions:'Manage the existing local RepoStew service from any harness. Start/reuse the service explicitly; connecting does not launch agents. Use stable request IDs and inspect receipts after uncertainty. Pause/Stop and unknown-write gates remain binding. C/W sessions are executed by Pi, independently of this governance client. Never create overlapping project writers or infer authority from installation.'
  });
  server.registerTool('repostew_status',{description:'Read bounded governance facts, C domains, independent W, capacity and unresolved incidents. No polling loop.',inputSchema:z.object({}).strict(),annotations:{readOnlyHint:true,openWorldHint:false}},guarded(()=>call(config,'governance')));
  server.registerTool('repostew_workflows',{description:'List the full Skill workflow catalog or read complete canonical policy documents. Uses local Skill files; does not start execution or grant authority.',inputSchema:z.object({action:z.enum(['list','read']),paths:z.array(z.string().min(1).max(300)).min(1).max(8).optional()}).strict(),annotations:{readOnlyHint:true,openWorldHint:false}},guarded(args=>readPolicy(config,args)));
  server.registerTool('repostew_inspect',{description:'Read one exact owner and current run for diagnosis/reconciliation. May contain private local task results; do not publish.',inputSchema:inspectTargetSchema,annotations:{readOnlyHint:true,openWorldHint:false}},guarded(args=>call(config,'inspect-owner',args)));
  server.registerTool('repostew_command',{description:'Apply an explicitly authorized governance action: add a paused C, dispatch independent W, scoped pause/drain/stop/resume, steer, reconcile, or adjust capacity. A repeated requestId retrieves its original receipt; it never repeats a mutation. Resume never clears interrupted/unknown gates. Closing an incident does not resume its task.',inputSchema:governanceRequestSchema,annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true,openWorldHint:false}},guarded(args=>call(config,'governance-command',args)));
  server.registerTool('repostew_receipt',{description:'Reconcile an uncertain governance operation by its original requestId. not-found is not evidence of external-write failure.',inputSchema:z.object({requestId:z.string().min(1).max(200)}).strict(),annotations:{readOnlyHint:true,openWorldHint:false}},guarded(args=>call(config,'governance-receipt',args)));
  server.registerTool('repostew_start',{description:'Start the single local service if absent, or reuse it. Does not create C/W or resume paused work. An existing unreachable process blocks replacement.',inputSchema:z.object({}).strict(),annotations:{readOnlyHint:false,idempotentHint:true,openWorldHint:false}},guarded(()=>ensureService(config)));
  server.registerTool('repostew_event_ack',{description:'Confirm a governance notification reached this conversation. Does not resolve an incident or resume work.',inputSchema:z.object({id:z.string(),deliveryId:z.string()}).strict()},guarded(args=>{
    if(channelId&&args.id!==channelId)throw new Error('Wrong channel subscription');
    return call(config,'subscription-ack',{...args,evidence:'Bound governance client explicitly acknowledged notification receipt'});
  }));
  server.registerTool('repostew_subscription',{description:'Inspect a durable event subscription, including an unconfirmed delivery.',inputSchema:z.object({id:z.string()}).strict(),annotations:{readOnlyHint:true}},guarded(args=>call(config,'subscription-status',args)));
  if(channelId) {
    const controller=new AbortController();
    server.server.oninitialized=()=>{void subscribe(config,{id:channelId,harness:'claude',target,filter:'attention',from:0},async packet=>{
      await server.server.notification({method:'notifications/claude/channel',params:{content:packet.text,meta:{subscription_id:channelId,delivery_id:packet.delivery.id}}});
      // Transport success is not receipt: Claude must call repostew_event_ack.
    },{signal:controller.signal,onState:state=>process.stderr.write(JSON.stringify({subscription:channelId,state})+'\n')}).catch(e=>process.stderr.write(JSON.stringify({subscription:channelId,error:e.message})+'\n'));};
    server.server.onclose=()=>controller.abort();
  }
  return server;
});
