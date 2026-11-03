import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadProfile, context } from './runtime.mjs';
export function configure(workspace, sourceProfile) {
  const profile=loadProfile(sourceProfile); context(profile);
  const root=dirname(fileURLToPath(import.meta.url));
  const directory=resolve(workspace,'.codex');mkdirSync(directory,{recursive:true});
  const profilePath=resolve(directory,'repostew/profile.json');mkdirSync(dirname(profilePath),{recursive:true});
  const desired=JSON.stringify(profile,null,2)+'\n';
  if(existsSync(profilePath)&&readFileSync(profilePath,'utf8')!==desired)throw new Error('Different existing RepoStew profile; reconcile it explicitly before configuring');
  const configPath=resolve(directory,'config.toml'),old=existsSync(configPath)?readFileSync(configPath,'utf8'):'';
  const stanza=`[mcp_servers.repostew]\ncommand = ${JSON.stringify(process.execPath)}\nargs = ${JSON.stringify([resolve(root,'mcp.mjs')])}\n[mcp_servers.repostew.env]\nREPOSTEW_CODEX_PROFILE = ${JSON.stringify(profilePath)}\n`;
  if(/\[mcp_servers\.repostew\]/.test(old)&&!old.includes(stanza))throw new Error('Different existing repostew MCP configuration; preserved');
  const hooksPath=resolve(directory,'hooks.json');const hooks=existsSync(hooksPath)?JSON.parse(readFileSync(hooksPath,'utf8')):{hooks:{}};hooks.hooks??={};
  // A quoted executable alone is a string expression in PowerShell. Resolve node
  // through the same launch PATH and keep arguments portable across native shells.
  const command=`node "${resolve(root,'hooks.mjs').replaceAll('\\','/')}" "${profilePath.replaceAll('\\','/')}"`;
  for(const event of ['SessionStart','UserPromptSubmit','PreToolUse','PostToolUse']) {
    const groups=hooks.hooks[event]||[];
    const own=groups.filter(g=>g.hooks?.some(h=>h.statusMessage==='RepoStew context and bounded search'));
    if(own.some(g=>g.hooks.some(h=>h.command!==command)))throw new Error('Different existing RepoStew hook; preserved');
    if(!own.length)groups.push({...(event.includes('ToolUse')?{matcher:'.*'}:{}),hooks:[{type:'command',command,timeout:20,additionalContextLimit:20000,statusMessage:'RepoStew context and bounded search'}]});
    hooks.hooks[event]=groups;
  }
  // All collision checks precede writes. Existing foreign configuration remains byte-preserved.
  writeFileSync(profilePath,desired);if(!old.includes(stanza))writeFileSync(configPath,old+'\n'+stanza);
  writeFileSync(hooksPath,JSON.stringify(hooks,null,2)+'\n');
  return {profilePath,configPath,hooksPath,restartRequired:true,hookTrust:'Review/trust through native Codex; configuration alone is not activation',globalConfigChanged:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  if(!process.argv[2]||!process.argv[3])throw new Error('Usage: configure.mjs PROJECT_DIRECTORY PROFILE_JSON');
  console.log(JSON.stringify(configure(resolve(process.argv[2]),resolve(process.argv[3]))));
}
