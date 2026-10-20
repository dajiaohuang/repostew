import {fileURLToPath} from 'node:url';
import {loadConfig} from './config.mjs';
import {call} from './server.mjs';
import {subscribe} from './event-client.mjs';

export default function(pi) {
  const config=loadConfig(process.env.REPOSTEW_GOVERNANCE_CONFIG??fileURLToPath(new URL('../config.local.json',import.meta.url)));
  let controller,binding;
  const stop=()=>{controller?.abort();controller=undefined;};
  pi.registerTool({name:'repostew_event_ack',label:'Acknowledge governance event',description:'Confirm receipt only. Does not resolve incidents or authorize work.',
    parameters:{type:'object',properties:{id:{type:'string'},deliveryId:{type:'string'}},required:['id','deliveryId'],additionalProperties:false},
    async execute(_id,args){if(args.id!==binding?.id)throw new Error('This session does not own that subscription');const result=await call(config,'subscription-ack',{...args,evidence:'Received by the bound Pi session through repostew_event_ack'});return {content:[{type:'text',text:'Receipt recorded; task gates unchanged.'}],details:result};}});
  const listen=async(args,ctx)=>{
    stop();if(args.trim()==='off'){ctx.ui.notify('RepoStew subscription disconnected; C/W continue.','info');return;}
    const target=ctx.sessionManager.getSessionId();
    binding={id:`pi-${target}`,harness:'pi',target,filter:'attention',from:0};
    controller=new AbortController();const signal=controller.signal;
    void subscribe(config,binding,async({delivery,text})=>{
      if(signal.aborted||ctx.sessionManager.getSessionId()!==target)throw new Error('Pi session binding changed');
      pi.sendMessage({customType:'repostew-governance',content:text,display:true,details:{deliveryId:delivery.id,subscriptionId:binding.id}},{triggerTurn:true,deliverAs:'followUp'});
      // The model's ack proves arrival, rather than assuming a queued message survived Stop.
    },{signal,onState:state=>ctx.ui.setStatus('repostew-events',`RepoStew: ${state}`)}).catch(e=>ctx.ui.notify(e.message,'error'));
  };
  pi.registerCommand('repostew-listen',{description:'Subscribe this governance session; use off to disconnect',handler:listen});
  pi.on('session_start',async(_event,ctx)=>{stop();if(process.env.REPOSTEW_GOVERNANCE_SUBSCRIBE==='1')await listen('',ctx);});
  pi.on('session_before_switch',stop);pi.on('session_before_fork',stop);pi.on('session_shutdown',stop);
}
