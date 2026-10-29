import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const [bindingFile,...args]=process.argv.slice(2);
if(!bindingFile)throw Error('Usage: node run-bound-cli.mjs binding.json ...args');
const file=path.resolve(bindingFile),binding=JSON.parse(fs.readFileSync(file,'utf8'));
if(typeof binding.command!=='string'||!Array.isArray(binding.args)||!binding.args.every(x=>typeof x==='string'))
  throw Error('Binding requires command and string args');
const result=spawnSync(binding.command,[...binding.args,...args],{
  cwd:binding.cwd?path.resolve(path.dirname(file),binding.cwd):path.dirname(file),
  env:{...process.env,...binding.env},stdio:'inherit',windowsHide:true,shell:false
});
if(result.error){console.error(result.error.message);process.exitCode=1;}
else process.exitCode=result.status??1;
