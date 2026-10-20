import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync,renameSync,fsyncSync} from 'node:fs';
import {resolve,dirname,join,posix,win32} from 'node:path';
import {safeId,projectKey,invariant} from './config.mjs';
import {governanceRequestSchema} from './governance-schema.mjs';

export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function validateFleet(config) {
  invariant(config.version===1&&Array.isArray(config.machines),'Invalid fleet configuration');
  const ids=new Set();
  for(const m of config.machines){
    safeId(m.id);invariant(!ids.has(m.id),'Duplicate machine ID');ids.add(m.id);
    invariant(['win32','linux','darwin'].includes(m.platform),'Unsupported platform');
    invariant(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,100}$/.test(m.sshHost),'Use an SSH config host alias');
    const paths=m.platform==='win32'?win32:posix;
    for(const key of ['gateway','config'])invariant(typeof m[key]==='string'&&paths.isAbsolute(m[key])&&!/[\r\n\0]/.test(m[key]),`Absolute remote ${key} required`);
    invariant(m.node==='node'||(typeof m.node==='string'&&paths.isAbsolute(m.node)&&!/[\r\n\0]/.test(m.node)),'node must be node or an absolute executable path');
  }
  return config;
}
const sh=s=>`'${s.replaceAll("'","'\\''")}'`;
const ps=s=>`'${s.replaceAll("'","''")}'`;
export function remoteCommand(machine){
  const args=[machine.node,machine.gateway,'--config',machine.config,'--machine',machine.id];
  if(machine.platform!=='win32')return args.map(sh).join(' ');
  const script=`& ${args.map(ps).join(' ')}; exit $LASTEXITCODE`;
  return `powershell.exe -NoLogo -NoProfile -NonInteractive -EncodedCommand ${Buffer.from(script,'utf16le').toString('base64')}`;
}
export function remote(machine,request,{timeoutMs=130000,spawnImpl=spawn,onEvent}={}){
  return new Promise((accept,reject)=>{
    const child=spawnImpl('ssh',['-T','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-o','ServerAliveInterval=15','-o','ServerAliveCountMax=2',machine.sshHost,remoteCommand(machine)],{stdio:['pipe','pipe','pipe'],windowsHide:true});
    child.stdout.setEncoding('utf8');
    let output='',size=0,settled=false;
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):accept(value);};
    const timer=timeoutMs?setTimeout(()=>{child.kill();finish(new Error('SSH timeout: operation outcome unknown; inspect receipt, do not resend'));},timeoutMs):undefined;
    const decode=line=>{const reply=JSON.parse(line);invariant(reply.machineId===machine.id&&reply.platform===machine.platform,'Remote machine/platform mismatch');invariant(!reply.error,reply.error??'Remote error');return reply.result;};
    child.stdout.on('data',chunk=>{
      size+=chunk.length;output+=chunk;
      if(onEvent){try{let end;while((end=output.indexOf('\n'))>=0){const line=output.slice(0,end);output=output.slice(end+1);if(line.trim())onEvent({machineId:machine.id,event:decode(line)});}size=Buffer.byteLength(output);}catch(e){child.kill();finish(e);}}
      if(size>8*1024*1024){child.kill();finish(new Error('SSH response exceeded 8 MiB; outcome unknown'));}
    });
    child.stderr.resume(); // SSH/provider diagnostics can contain private paths. Never copy them into shared output.
    child.stdin.on('error',()=>{});
    child.on('error',()=>finish(new Error('SSH could not start; inspect local transport')));
    child.on('close',code=>{if(code!==0)return finish(new Error('Remote request failed; inspect machine and receipt before retrying'));
      try{finish(null,onEvent?{disconnected:true}:decode(output));}catch(e){finish(e);}
    });
    child.stdin.end(JSON.stringify(request));
  });
}

// This journal is transport/ownership metadata only. Each node's existing engine
// remains authoritative for task execution, runs, effects, and stop receipts.
export class Fleet {
  constructor(config,directory,{transport=remote}={}){this.config=validateFleet(config);this.dir=resolve(directory);this.transport=transport;mkdirSync(this.dir,{recursive:true});}
  machine(id){const m=this.config.machines.find(m=>m.id===id);invariant(m,'Unknown machine');const previous=this.read().bindings[id];invariant(!previous||previous===digest(m),'Machine connection changed; reconcile identity before replacing its binding');return m;}
  read(){try{return JSON.parse(readFileSync(join(this.dir,'fleet.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return {version:1,bindings:{},projects:{},owners:{},operations:{}};throw e;}}
  async locked(fn){
    const lock=join(this.dir,'fleet.lock');const fd=openSync(lock,'wx',0o600);
    try{writeFileSync(fd,JSON.stringify({pid:process.pid,at:new Date().toISOString()}));fsyncSync(fd);return await fn();}
    finally{closeSync(fd);unlinkSync(lock);}
  }
  save(state){const file=join(this.dir,'fleet.json'),temp=file+'.tmp';const fd=openSync(temp,'w',0o600);try{writeFileSync(fd,JSON.stringify(state,null,2));fsyncSync(fd);}finally{closeSync(fd);}renameSync(temp,file);}
  bind(state,m){const hash=digest(m);invariant(!state.bindings[m.id]||state.bindings[m.id]===hash,'Machine connection changed; reconcile identity before replacing its binding');state.bindings[m.id]=hash;}
  async status(id){return this.transport(this.machine(id),{action:'status'});}
  async doctor(id){return this.transport(this.machine(id),{action:'doctor'});}
  async watch(id,onEvent){return this.transport(this.machine(id),{action:'watch'},{timeoutMs:0,onEvent});}
  async claim(id,project){return this.locked(async()=>{const m=this.machine(id),s=this.read(),key=projectKey(project);this.bind(s,m);invariant(!s.projects[key]||s.projects[key]===id,'Project belongs to another machine; no automatic failover');s.projects[key]=id;this.save(s);return {project:key,machineId:id};});}
  scope(state,m,command){
    const own=p=>invariant(state.projects[projectKey(p)]===m.id,'Claim project on this machine before dispatch');
    const owner=(kind,id)=>invariant(state.owners[`${kind}:${id}`]===m.id,'Owner is not registered on this machine');
    const add=(kind,id)=>{const key=`${kind}:${id}`;invariant(!state.owners[key],'Owner ID already reserved');state.owners[key]=m.id;};
    if(command.action==='coordinator-add'){
      const c=command.spec.campaign;invariant(c.allowedHosts.length===0&&c.allowedProjects.length>0,'Fleet C requires explicit project scope; host-wide discovery is not enabled');c.allowedProjects.forEach(own);
      for(const candidate of c.candidates??[])invariant(c.allowedProjects.some(p=>projectKey(p)===projectKey(candidate.project)),'Candidate outside coordinator scope');
      add('coordinator',command.spec.id);
    }else if(['dispatch','dispatch-independent'].includes(command.action)){
      own(command.task.project);if(command.coordinatorId)owner('coordinator',command.coordinatorId);add('worker',command.task.id);
    }else if(command.action==='resume'){
      invariant(command.target.kind!=='all','Fleet resume requires one registered C/W');owner(command.target.kind,command.target.id);
    }else if(command.target&&command.target.kind!=='all')owner(command.target.kind,command.target.id);
    else if(command.coordinatorId)owner('coordinator',command.coordinatorId);
    else if(command.taskId)owner('worker',command.taskId);
    else if(command.decision?.taskId)owner('worker',command.decision.taskId);
  }
  async command(id,raw){
    const request=governanceRequestSchema.parse(raw),m=this.machine(id),key=digest(request.requestId),signature=digest({machine:m,request});
    return this.locked(async()=>{
      const s=this.read();this.bind(s,m);const prior=s.operations[key];
      if(prior){invariant(prior.signature===signature,'Operation ID reused with different machine or command');return prior;}
      this.scope(s,m,request.command);
      const op={machineId:id,requestId:request.requestId,signature,state:'unknown',at:new Date().toISOString()};
      s.operations[key]=op;this.save(s); // durable before any network write
      try{op.receipt=await this.transport(m,{action:'command',request});op.state=op.receipt.status==='completed'?'completed':'unknown';}
      catch{op.state='unknown';op.next='Read the original remote receipt. Do not resend or transfer ownership.';}
      this.save(s);return op;
    });
  }
  async receipt(id,requestId){return this.locked(async()=>{
    const m=this.machine(id),s=this.read();this.bind(s,m);const op=s.operations[digest(requestId)];invariant(op?.machineId===id,'Unknown operation for machine');
    op.receipt=await this.transport(m,{action:'receipt',requestId});op.state=op.receipt.status==='completed'?'completed':'unknown';this.save(s);return op;
  });}
}
export function loadFleet(file){const config=validateFleet(JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,'')));return new Fleet(config,resolve(dirname(file),config.runtimeDir??'.fleet'));}
