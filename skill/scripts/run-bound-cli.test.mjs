import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('bound execution preserves caller identity and literal argument boundaries',t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'repostew-bound-cli-'));
  t.after(()=>{const real=fs.realpathSync(dir);assert.ok(real.startsWith(fs.realpathSync(os.tmpdir())+path.sep));fs.rmSync(real,{recursive:true,force:true});});
  const binding=path.join(dir,'binding.json');
  fs.writeFileSync(binding,JSON.stringify({command:process.execPath,args:['-e',
    'console.log(JSON.stringify({identity:process.env.OPENRIG_SESSION_NAME,marker:process.env.REPOSTEW_BOUND_MARKER,args:process.argv.slice(1)}))'],env:{REPOSTEW_BOUND_MARKER:'selected'}}));
  const runner=fileURLToPath(new URL('./run-bound-cli.mjs',import.meta.url));
  const result=spawnSync(process.execPath,[runner,binding,'literal $value','two words'],{
    env:{...process.env,OPENRIG_SESSION_NAME:'worker@example'},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.deepEqual(JSON.parse(result.stdout),{identity:'worker@example',marker:'selected',args:['literal $value','two words']});
});
