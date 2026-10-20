import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve the same installed Pi package as the configured CLI, never another
// global installation or an independently selected SDK version.
export function piRoot(config) {
  let dir=dirname(resolve(process.env.REPOSTEW_PI_CLI??config.piCli));
  for (;;) {
    const path=join(dir,'package.json');
    if(existsSync(path)&&JSON.parse(readFileSync(path,'utf8')).name==='@earendil-works/pi-coding-agent')return dir;
    const parent=dirname(dir);
    if(parent===dir)throw new Error('Configured piCli is not inside a Pi package');
    dir=parent;
  }
}
export function piModule(config,path) {
  return import(pathToFileURL(join(piRoot(config),path)).href);
}
