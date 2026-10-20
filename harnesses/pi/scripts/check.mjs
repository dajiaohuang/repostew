import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
for(const dir of ['src','src/pi','scripts','test']) {
  for(const entry of readdirSync(dir,{withFileTypes:true})) {
    if(!entry.isFile()||!/\.(mjs|js)$/.test(entry.name))continue;
    const result=spawnSync(process.execPath,['--check',resolve(dir,entry.name)],{stdio:'inherit',windowsHide:true});
    if(result.status!==0)process.exit(result.status??1);
  }
}
console.log('JavaScript syntax checks passed');
