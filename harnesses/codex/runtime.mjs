import { composeRoleGuidance } from '../../skill/integrations/seat-guidance.js';
import { readFileSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readOpenRigSlots } from '../../skill/integrations/openrig-facts.js';

export const VERSION = '0.1.0';
export const MAX_CONTEXT_BYTES = 65536;
const run = promisify(execFile);
export function loadProfile(file = process.env.REPOSTEW_CODEX_PROFILE) {
  if (!file) throw new Error('Set REPOSTEW_CODEX_PROFILE to an explicit local profile');
  const profile = JSON.parse(readFileSync(file, 'utf8'));
  if (profile.version !== 1 || !isAbsolute(profile.workspace) || !['general','coordinator','worker'].includes(profile.role)) throw new Error('Invalid RepoStew Codex profile');
  for (const field of ['seatGuidance','currentFacts']) if (profile[field] && !isAbsolute(profile[field])) throw new Error(`${field} must be absolute`);
  return profile;
}
export function context(profile) {
  const texts = [
    'RepoStew Codex integration. Current user scope and facts override historical task snapshots. This integration assigns no work and creates no scheduler, queue, model or permission policy.',
    `Role: ${profile.role}; workspace: ${profile.workspace}. Use the selected host native lifecycle and queue. Keep configured, registered, currently available and human-intended tools distinct. MCP registration is not proof that this session loaded a tool.`,
    'Use native editing, shell, search, code mode and tool discovery where present. Preserve active extras; restore only explicitly intended tools through native configuration and reconnect. Do not emulate Pi commands or assume a reload changes an already running session.',
    'Use existing gh login through non-secret configuration paths; never copy credentials. Bound searches to the exact project/file. Do not recursively search the workspace state root. Oversized search output is incomplete evidence; narrow and repeat the search.',
    composeRoleGuidance(profile.seatGuidance ? readFileSync(profile.seatGuidance,'utf8') : `Read ${resolve(profile.skillRoot || profile.workspace + '/RepoStew_skills/skill','SKILL.md')} and only applicable references.`, profile.role),
    profile.currentFacts ? '\nCURRENT TASK FACTS (take precedence over stale contract continuation/source directions):\n'+readFileSync(profile.currentFacts,'utf8') : '',
  ];
  const text=texts.join('\n\n');
  if (Buffer.byteLength(text)>MAX_CONTEXT_BYTES) throw new Error('Assembled context exceeds 64 KiB; supply a concise current contract/facts file');
  return text;
}
export const toolDefinitions = [
  ['repostew_runtime_status','Inspect non-secret adapter/profile facts; session tool activation remains native.'],
  ['repostew_context','Read the current fixed contract and current facts; no stale prompt cache.'],
  ['repostew_gh_status','Read existing gh login identity without credentials.'],
  ['openrig_runtime_status','Inspect explicit OpenRig binding; no task clearance or reservation.'],
  ['openrig_slots','Read native OpenRig seats/queue facts for the explicit local binding.'],
].map(([name,description])=>({name,description,inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false}}));
export async function callTool(name, profile) {
  if (name==='repostew_context') return {context:context(profile)};
  if (name==='repostew_runtime_status') return {adapter:'repostew-codex',version:VERSION,role:profile.role,workspace:profile.workspace,seatGuidance:profile.seatGuidance||null,currentFacts:profile.currentFacts||null,registeredByServer:toolDefinitions.map(x=>x.name),activeInSession:'unknown: inspect native MCP/tool discovery',intended:'not inferred',automaticContinuation:false,approvalGate:false};
  if (name==='openrig_runtime_status') return {binding:profile.binding||null,reservation:false,processClearance:'unknown',automaticContinuation:false};
  if (name==='openrig_slots') return readOpenRigSlots(profile.binding);
  if (name==='repostew_gh_status') {
    const env={...process.env,GH_PROMPT_DISABLED:'1'};
    if (profile.gh?.configDir && !env.GH_CONFIG_DIR) env.GH_CONFIG_DIR=profile.gh.configDir;
    try { const r=await run('gh',['api','user','--jq','.login'],{env,windowsHide:true,timeout:20000,maxBuffer:4096});const login=r.stdout.trim();return {authenticated:/^[A-Za-z0-9-]+$/.test(login),login:/^[A-Za-z0-9-]+$/.test(login)?login:'',exitCode:0}; }
    catch(e){return {authenticated:false,login:'',exitCode:typeof e.code==='number'?e.code:null};}
  }
  throw new Error('Unknown tool');
}
