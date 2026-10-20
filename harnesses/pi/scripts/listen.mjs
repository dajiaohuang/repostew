import {readFileSync,appendFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadConfig} from '../src/config.mjs';
import {subscribe} from '../src/event-client.mjs';
import {deliverT3,deliverCodex} from '../src/native-delivery.mjs';
const binding=JSON.parse(readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''));
const config=loadConfig(binding.config??fileURLToPath(new URL('../config.local.json',import.meta.url)));
if(!['t3','codex'].includes(binding.harness))throw new Error('Use the Pi extension or Claude Channel for their in-session delivery');
const controller=new AbortController();for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>controller.abort());
const {id,harness,target,filter='attention',from=0}=binding;
const log=value=>{const line=JSON.stringify({at:new Date().toISOString(),subscription:id,...value});if(process.argv.includes('--background-log'))appendFileSync(join(dirname(resolve(process.argv[2])),`${id}.observer.jsonl`),line+'\n');else console.log(line);};
try {await subscribe(config,{id,harness,target,filter,from},packet=>(harness==='t3'?deliverT3:deliverCodex)(binding,packet),{signal:controller.signal,stayConnected:process.argv.includes('--stay-connected'),onState:state=>log({state})});}
catch(e){log({error:e.message});process.exitCode=1;}
