#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {loadConfig,safeId,invariant} from './config.mjs';
import {call} from './server.mjs';
import {governanceRequestSchema} from './governance-schema.mjs';

// SSH authenticates the OS account. Control tokens stay on that computer.
const args=process.argv.slice(2),get=key=>args[args.indexOf(key)+1];
let machineId;
try{
  invariant(args.includes('--machine')&&args.includes('--config'),'machine and config required');
  machineId=safeId(get('--machine'));const config=loadConfig(get('--config'));
  const identity=JSON.parse(readFileSync(join(config.runtimeDir,'machine.json'),'utf8'));
  invariant(identity.id===machineId&&identity.platform===process.platform,'Machine enrollment mismatch');
  let input='',bytes=0;for await(const chunk of process.stdin){bytes+=chunk.length;invariant(bytes<=2*1024*1024,'Request too large');input+=chunk;}
  const request=JSON.parse(input);let result;
  if(request.action==='watch'){
    const control=JSON.parse(readFileSync(join(config.runtimeDir,'control.json'),'utf8'));
    invariant(/^http:\/\/127\.0\.0\.1:\d+$/.test(control.url),'Unexpected local endpoint');
    const abort=new AbortController();for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>abort.abort());
    process.stdout.on('error',()=>abort.abort());
    const response=await fetch(`${control.url}/events`,{method:'POST',headers:{authorization:`Bearer ${control.token}`,'content-type':'application/json'},body:'{}',signal:abort.signal});
    invariant(response.ok,'Event subscription failed');
    const decoder=new TextDecoder();let buffer='';
    for await(const chunk of response.body){buffer+=decoder.decode(chunk,{stream:true});invariant(buffer.length<2*1024*1024,'Event frame too large');let end;
      while((end=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,end);buffer=buffer.slice(end+2);const data=block.split('\n').find(line=>line.startsWith('data: '));if(!data)continue;
        const e=JSON.parse(data.slice(6));const event={kind:e.kind??'connected',owner:e.owner,status:e.status,mode:e.mode};
        const line=JSON.stringify({machineId,platform:process.platform,result:event})+'\n';
        if(!process.stdout.write(line))await new Promise((yes,no)=>{process.stdout.once('drain',yes);process.stdout.once('error',no);});
      }
    }
    result={kind:'disconnected'};
  }else if(request.action==='doctor'){
    const python=spawnSync(config.python,['--version'],{encoding:'utf8',timeout:5000,windowsHide:true});
    result={node:process.version,platform:process.platform,arch:process.arch,pythonReady:python.status===0,processOwner:process.platform==='win32'?'windows-job':'posix-process-group',fullTreeContainment:process.platform==='win32',gateway:fileURLToPath(import.meta.url)};
  }else if(request.action==='status')result=await call(config,'governance');
  else if(request.action==='receipt'){invariant(typeof request.requestId==='string'&&request.requestId.length<=200,'Invalid receipt ID');result=await call(config,'governance-receipt',{requestId:request.requestId});}
  else if(request.action==='command')result=await call(config,'governance-command',governanceRequestSchema.parse(request.request));
  else throw new Error('Unsupported fleet gateway action');
  console.log(JSON.stringify({machineId,platform:process.platform,result}));
}catch{console.log(JSON.stringify({machineId,platform:process.platform,error:'Gateway rejected request or local service unavailable; inspect this machine locally'}));process.exitCode=1;}
