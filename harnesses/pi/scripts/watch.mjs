// Event subscription, not a status polling loop. Ctrl+C stops observation only.
import { readFileSync } from 'node:fs';
import { join,resolve } from 'node:path';
import { loadConfig } from '../src/config.mjs';
const config=loadConfig(resolve(process.argv[2]??'config.local.json'));
const control=JSON.parse(readFileSync(join(config.runtimeDir,'control.json'),'utf8'));
try {
  const response=await fetch(`${control.url}/events`,{method:'POST',headers:{authorization:`Bearer ${control.token}`,'content-type':'application/json'},body:'{}'});
  if(!response.ok)throw new Error(`Event subscription failed: ${response.status}`);
  let buffer='';const decoder=new TextDecoder();
  for await(const chunk of response.body){
    buffer+=decoder.decode(chunk,{stream:true});let index;
    while((index=buffer.indexOf('\n\n'))>=0){
      const event=buffer.slice(0,index);buffer=buffer.slice(index+2);
      const data=event.split('\n').find(x=>x.startsWith('data: '));
      if(data){const {seq,kind,owner,coordinatorId,status,mode,category}=JSON.parse(data.slice(6));console.log(JSON.stringify({seq,kind,owner,coordinatorId,status,mode,category}));}
    }
  }
} catch(e) {
  console.error(JSON.stringify({observerStopped:true,reason:e.cause?.code??e.code??e.message,next:'Inspect service status once if needed. This observer did not stop or restart any task.'}));
  process.exitCode=1;
}
