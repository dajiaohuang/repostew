#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {loadFleet} from '../src/fleet.mjs';
import {loadConfig,safeId} from '../src/config.mjs';
const [action,file,id,argument]=process.argv.slice(2);
const json=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
try{
  let result;
  if(action==='enroll'){
    const c=loadConfig(file);safeId(id);mkdirSync(c.runtimeDir,{recursive:true});
    const identity={id,platform:process.platform,arch:process.arch,enrolledAt:new Date().toISOString()};
    writeFileSync(join(c.runtimeDir,'machine.json'),JSON.stringify(identity,null,2),{flag:'wx',mode:0o600});result=identity;
  }else if(['status','doctor','claim','command','receipt','registry','watch'].includes(action)){
    const fleet=loadFleet(resolve(file));
    if(action==='watch')result=await fleet.watch(id,event=>console.log(JSON.stringify(event)));
    else if(action==='registry')result=fleet.read();
    else if(action==='claim')result=await fleet.claim(id,json(argument));
    else if(action==='command')result=await fleet.command(id,json(argument));
    else if(action==='receipt')result=await fleet.receipt(id,argument);
    else result=await fleet[action](id);
  }else throw new Error('Usage: fleet.mjs enroll NODE_CONFIG ID | doctor/status/watch/claim/command/receipt FLEET_CONFIG MACHINE [JSON_FILE|REQUEST_ID] | registry FLEET_CONFIG');
  console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
