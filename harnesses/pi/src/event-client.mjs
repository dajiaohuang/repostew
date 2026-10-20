import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {call} from './server.mjs';
import {deliveryText} from './subscriptions.mjs';

// One durable claim at a time. An uncertain send is held, never blindly replayed.
export async function subscribe(config,binding,deliver,{signal,onState=()=>{},stayConnected=false}={}) {
  let failures=0;
  while(!signal?.aborted) {
    try {
      await call(config,'subscription-register',binding);
      const control=JSON.parse(readFileSync(join(config.runtimeDir,'control.json'),'utf8'));
      if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(control.url))throw new Error('Unexpected service endpoint');
      const response=await fetch(`${control.url}/subscription-events`,{method:'POST',headers:{authorization:`Bearer ${control.token}`,'content-type':'application/json'},body:JSON.stringify({id:binding.id}),signal});
      if(!response.ok)throw new Error(`Subscription HTTP ${response.status}`);
      onState('connected');failures=0;
      const decoder=new TextDecoder();let buffer='';
      for await(const chunk of response.body) {
        buffer+=decoder.decode(chunk,{stream:true});let boundary;
        while((boundary=buffer.indexOf('\n\n'))>=0) {
          const block=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
          if(!block.startsWith('event: available'))continue;
          let next;
          do {
            next=await call(config,'subscription-claim',{id:binding.id});
            if(next.held){onState('receipt-required');break;}
            if(next.delivery) {
              if(signal?.aborted)return; // claim remains visible for exact reconciliation
              const evidence=await deliver({subscription:next.subscription,delivery:next.delivery,text:deliveryText(next.subscription,next.delivery)});
              if(evidence)await call(config,'subscription-ack',{id:binding.id,deliveryId:next.delivery.id,evidence});
              else {onState('awaiting-native-receipt');break;}
            }
          }while(next.more||next.delivery);
        }
      }
      throw new Error('Event stream disconnected');
    } catch(e) {
      if(signal?.aborted)return;
      onState(`disconnected: ${e.code??e.message}`);
      // Reconnect only the read subscription. The durable pending claim fences sends.
      if(++failures>=3&&!stayConnected)throw new Error('Three subscription connection failures; inspect service and binding before reconnecting');
      await delay(Math.min(30000,1000*failures),undefined,{signal}).catch(()=>{});
    }
  }
}
