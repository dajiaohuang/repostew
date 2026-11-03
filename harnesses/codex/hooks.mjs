import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadProfile, context, MAX_CONTEXT_BYTES } from './runtime.mjs';
import { broadStateGrep } from '../../skill/integrations/pi-context-bound.js';
export function hook(event, profile) {
  const name=event.hook_event_name;
  if (['SessionStart','UserPromptSubmit'].includes(name)) return {hookSpecificOutput:{hookEventName:name,additionalContext:context(profile)}};
  const args=event.tool_input||{};
  const command=args.command||args.cmd||'';
  const search=/(^|[\s;|])(?:rg|grep)(?:\s|$)/.test(command) || /(?:^|__)grep$/.test(event.tool_name||'');
  if(name==='PreToolUse') {
    const direct=broadStateGrep({toolName:'grep',input:args},profile.workspace,event.cwd);
    // Catch common shell spellings without pretending to parse every shell language.
    const paths=[profile.workspace.replaceAll('\\','/')+'/state',profile.workspace.replaceAll('/','\\')+'\\state'];
    const absoluteRoot=paths.some(p=>new RegExp('(?:^|\\s)["\']?'+p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\\\/]?["\']?(?:\\s|$)','i').test(command));
    const rootSearch=search && (absoluteRoot || (event.cwd?.replaceAll('\\','/').toLowerCase()===profile.workspace.replaceAll('\\','/').toLowerCase() && /(?:^|\s)["']?(?:\.\/|\.\\)?state[\\/]?["']?(?:\s|$)/.test(command)));
    if(direct||rootSearch)return {hookSpecificOutput:{hookEventName:name,permissionDecision:'deny',permissionDecisionReason:direct?.reason||'Search the exact project/file or bounded native index, not the entire state root.'}};
  }
  if(name==='PostToolUse' && search) {
    const raw=JSON.stringify(event.tool_response??null),bytes=Buffer.byteLength(raw);
    if(bytes>MAX_CONTEXT_BYTES)return {decision:'block',reason:`Oversized search output omitted from model context (${bytes} UTF-8 bytes, SHA256 ${createHash('sha256').update(raw).digest('hex')}). Original native tool result is unchanged. This is not complete evidence; repeat a narrower bounded search.`};
  }
  return {};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {const event=JSON.parse(readFileSync(0,'utf8'));console.log(JSON.stringify(hook(event,loadProfile(process.argv[2]||process.env.REPOSTEW_CODEX_PROFILE))));}
  catch(e){process.stderr.write(`RepoStew hook: ${e.message}\n`);process.exitCode=1;}
}
