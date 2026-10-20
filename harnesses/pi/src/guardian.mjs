import {spawn} from 'node:child_process';
import {mkdirSync,openSync,writeFileSync,closeSync,readFileSync,unlinkSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {diagnostic,diagnosticsDir,safeError} from './diagnostics.mjs';
import {invariant} from './config.mjs';

export async function supervise(config,{launch=defaultLaunch}={}) {
  const dir=diagnosticsDir(config);mkdirSync(dir,{recursive:true});
  const lock=join(dir,'guardian.lock');
  if(existsSync(lock)) {
    const prior=JSON.parse(readFileSync(lock,'utf8'));
    let alive=true;try{process.kill(prior.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else throw e;}
    invariant(!alive,'Existing guardian is alive; reconcile it before replacement');unlinkSync(lock);
  }
  const fd=openSync(lock,'wx',0o600);writeFileSync(fd,JSON.stringify({pid:process.pid}));closeSync(fd);
  try {
    for(let attempt=0;attempt<2;attempt++) {
      // Startup and recovery both preserve explicit pause. Only governance may resume.
      diagnostic(config,'service-launch',{attempt,recovery:attempt>0});
      const result=await new Promise(resolve=>{
        let graceful=false;
        const child=launch(config,attempt);
        child.on('message',message=>{if(message?.type==='graceful-shutdown')graceful=true;});
        child.once('error',error=>resolve({graceful:false,error:safeError(error)}));
        child.once('exit',(code,signal)=>resolve({graceful,code,signal}));
      });
      diagnostic(config,'service-exit',{attempt,...result});
      if(result.graceful)break;
      if(attempt===1)diagnostic(config,'recovery-exhausted',{requiresOwner:true});
    }
  } finally {
    if(JSON.parse(readFileSync(lock,'utf8')).pid===process.pid)unlinkSync(lock);
  }
}
function defaultLaunch(config,attempt) {
  return spawn(process.execPath,[fileURLToPath(new URL('./cli.mjs',import.meta.url)),'serve','--paused',
    ...(attempt?['--recovery']:[]),'--config',config.configFile],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
}
