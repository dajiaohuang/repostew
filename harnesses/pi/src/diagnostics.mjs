import {mkdirSync,appendFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';

export function diagnosticsDir(config) {
  const id=createHash('sha256').update(resolve(config.runtimeDir).toLowerCase()).digest('hex').slice(0,16);
  return config.diagnosticsDir??join(homedir(),'.repostew','diagnostics',id);
}
export function safeError(error) {
  const label=value=>typeof value==='string'&&/^[A-Za-z0-9_]{1,80}$/.test(value)?value:'Error';
  return {name:label(error?.name),code:label(error?.code),
    frames:String(error?.stack??'').split('\n').filter(line=>/^\s+at /.test(line)).slice(0,12)};
}
export function diagnostic(config,kind,details={}) {
  // Never include exception messages, provider output, prompts or credentials.
  try {
    const dir=diagnosticsDir(config);mkdirSync(dir,{recursive:true});
    appendFileSync(join(dir,'lifecycle.jsonl'),JSON.stringify({at:new Date().toISOString(),pid:process.pid,kind,...details})+'\n',{mode:0o600});
    return true;
  } catch {return false;} // diagnostics must not mask the original failure
}
