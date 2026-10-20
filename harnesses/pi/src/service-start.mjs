import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {call} from './server.mjs';
import {invariant} from './config.mjs';
import {diagnosticsDir} from './diagnostics.mjs';
const execute=promisify(execFile);

export async function ensureService(config) {
  try {const status=await call(config,'governance',{}, {timeoutMs:1500});return {started:false,reused:true,...status};}catch{}
  // An unreachable existing owner is a recovery problem, not launch authority.
  for(const path of [join(config.runtimeDir,'server.lock'),join(config.runtimeDir,'control.json'),join(diagnosticsDir(config),'guardian.lock')]) {
    if(!existsSync(path))continue;
    const {pid}=JSON.parse(readFileSync(path,'utf8'));let alive=true;
    try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else throw e;}
    invariant(!alive,'Existing service process is unreachable; reconcile it before replacement');
  }
  invariant(['win32','linux','darwin'].includes(process.platform),'Unsupported execution platform');
  if(process.platform==='win32'){
    const script=fileURLToPath(new URL('../scripts/start.ps1',import.meta.url));
    await execute('powershell.exe',['-NoProfile','-File',script,'-ConfigPath',resolve(config.configFile),'-RuntimePath',config.runtimeDir],{windowsHide:true,timeout:15000});
  }else{
    const child=spawn(process.execPath,[fileURLToPath(new URL('./cli.mjs',import.meta.url)),'guard','--config',resolve(config.configFile)],{detached:true,stdio:'ignore'});
    await new Promise((yes,no)=>{child.once('spawn',yes);child.once('error',no);});child.unref();
  }
  // Readiness checks are bounded and read-only. A failed launch is never retried.
  for(let attempt=0;attempt<20;attempt++) {
    try{const status=await call(config,'governance',{}, {timeoutMs:1000});return {started:true,...status};}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error('Service launch accepted but readiness is unknown. Inspect its exact runtime before retrying.');
}
