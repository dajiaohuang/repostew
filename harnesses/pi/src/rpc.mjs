import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RpcClient } from './pi/rpc-client.js';
import { serializeJsonLine } from './pi/jsonl.js';

// Based on Pi examples/rpc-client.ts. Pi owns request correlation, JSONL,
// queue commands and event subscriptions. This adapter owns only the Windows
// process tree/receipt and the explicit role's launch arguments.
export class PiProcess extends EventEmitter {
  constructor(config, options) {
    super(); this.config=config;this.options=options;this.closed=false;this.stderr='';
    this.exited=new Promise(resolve=>{this.resolveExit=resolve;});
    this.client=new RpcClient({
      cliPath:process.env.REPOSTEW_PI_CLI??config.piCli,cwd:options.cwd,provider:options.model.provider,model:options.model.model,
      timeoutMs:config.rpcTimeoutMs,env:{...options.env,PI_TELEMETRY:'0'},
      args:['--offline','--no-extensions','--no-mcp','--no-skills','--no-prompt-templates','--no-themes','--no-context-files',
        '--thinking',options.model.thinking,'--session',options.session,'--name',options.owner,
        '--extension',fileURLToPath(new URL('./extension.mjs',import.meta.url)),
        '--extension',fileURLToPath(new URL('./pi/todo.ts',import.meta.url)),
        '--append-system-prompt',options.instructions,'--tools',options.tools],
      spawnProcess:(_command,args,spawnOptions)=>this.spawnOwned(args,spawnOptions),
      stopProcess:()=>this.stopOwned(),
      onStderr:chunk=>{this.stderr=(this.stderr+chunk.toString('utf8')).slice(-16384);},
    });
    this.unsubscribe=this.client.onEvent(record=>{
      if(record.type==='extension_ui_request'&&record.method==='confirm') {
        this.child.stdin.write(serializeJsonLine({type:'extension_ui_response',id:record.id,confirmed:false}));
      }
      this.emit('record',record);
    });
  }
  spawnOwned(args,spawnOptions) {
    const {config:c,options:o}=this;
    const command=o.command??[process.execPath,...args];
    const owner=process.platform==='win32'?'./owned_process.py':'./owned_process_posix.py';
    this.child=spawn(c.python,['-B','-X','utf8',fileURLToPath(new URL(owner,import.meta.url)),
      '--receipt',o.receipt,'--parent',String(process.pid),'--seconds',String(c.maxRunMs/1000),'--',...command],{
      ...spawnOptions,windowsHide:true,
    });
    this.child.on('error',e=>this.emit('fault',e));
    this.child.on('close',(code,signal)=>{
      this.closed=true;let receipt;
      try{receipt=JSON.parse(readFileSync(o.receipt,'utf8'));}catch{}
      const result={code,signal,receipt};this.resolveExit(result);this.emit('exit',result);
    });
    return this.child;
  }
  async start(){await this.client.start();return this;}
  getState(){return this.client.getState();}
  getAvailableThinkingLevels(){return this.client.getAvailableThinkingLevels();}
  setAutoRetry(enabled){return this.client.setAutoRetry(enabled);}
  prompt(message){return this.client.prompt(message);}
  steer(message){return this.client.steer(message);}
  followUp(message){return this.client.followUp(message);}
  async stopOwned() {
    if(this.closed)return this.exited;
    this.child.stdin.end();
    let timer;
    const timeout=new Promise(resolve=>{timer=setTimeout(()=>resolve(undefined),this.config.shutdownTimeoutMs);});
    const result=await Promise.race([this.exited,timeout]);clearTimeout(timer);
    if(result)return result;
    // Exact owned wrapper only; missing receipt remains UNKNOWN.
    this.child.kill();return this.exited;
  }
  async close(abort=false) {
    if(abort&&!this.closed) {
      // Native Pi queues must be cleared before abort; abort alone may continue them.
      try{await this.client.clearQueue();await this.client.abort();}catch{}
    }
    await this.client.stop();this.unsubscribe();return this.exited;
  }
}
