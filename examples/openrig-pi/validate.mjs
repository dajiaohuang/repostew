// Uses an installed Pi loader in a temporary profile. No model, daemon or forge calls.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) throw new Error('Usage: node validate.mjs <installed-pi-package-root>');
const piRoot = resolve(process.argv[2]);
const api = relative => import(pathToFileURL(join(piRoot, relative)).href);
const { loadExtensions, createExtensionRuntime } = await api('dist/core/extensions/loader.js');
const { ExtensionRunner } = await api('dist/core/extensions/runner.js');
const { SessionManager } = await api('dist/core/session-manager.js');
const scratch = mkdtempSync(join(tmpdir(), 'repostew-template-'));
const agentDir = join(scratch, 'agent');
mkdirSync(agentDir);
const profile = JSON.parse(readFileSync(join(here, 'profiles/coordinator.repostew.json'), 'utf8'));
profile.workspace = scratch;
profile.seatGuidance = join(here, 'contracts/coordinator.md');
profile.gh.configDir = join(scratch, 'existing-gh');
writeFileSync(join(agentDir, 'repostew.json'), JSON.stringify(profile));
const bridge = JSON.parse(readFileSync(join(here, 'profiles/coordinator.openrig-pi.json'), 'utf8'));
writeFileSync(join(agentDir, 'openrig-pi.json'), JSON.stringify(bridge));
const saved = Object.fromEntries(['PI_CODING_AGENT_DIR', 'GH_CONFIG_DIR', 'GH_PROMPT_DISABLED'].map(k => [k, process.env[k]]));
try {
  process.env.PI_CODING_AGENT_DIR = agentDir;
  delete process.env.GH_CONFIG_DIR;
  const runtime = createExtensionRuntime();
  runtime.getSettings = () => ({ defaultTools: ['read', 'bash'] });
  runtime.getActiveTools = () => ['read', 'bash'];
  runtime.getAllTools = () => ['read', 'bash'].map(name => ({ name }));
  const loaded = await loadExtensions([resolve(here, '../../skill/integrations/pi-repostew.js'), resolve(here, '../../skill/integrations/pi-openrig.js')], scratch, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const runner = new ExtensionRunner(loaded.extensions, runtime, scratch, SessionManager.inMemory(scratch), undefined);
  const errors = [];
  runner.onError(error => errors.push(error));
  await runner.emit({ type: 'session_start', reason: 'startup' });
  const status = await runner.getToolDefinition('repostew_runtime_status').execute('status', {}, undefined, undefined, runner.createToolContext('status'));
  assert.equal(status.details.version, '0.5.1');
  assert.equal(status.details.role, 'coordinator');
  assert.equal(status.details.automaticContinuation, false);
  assert.equal(status.details.approvalGate, false);
  assert.equal(process.env.GH_CONFIG_DIR, profile.gh.configDir);
  const prompt = await runner.emitBeforeAgentStart({ messageType: 'user', prompt: 'fixture only' }, { cwd: scratch, sections: { native: 'keep native prompt' } });
  assert.equal(prompt.systemPromptOptions.sections.native, 'keep native prompt');
  assert.ok(prompt.systemPromptOptions.sections.repostew.startsWith(readFileSync(profile.seatGuidance, 'utf8')));
  assert.match(prompt.systemPromptOptions.sections.repostew, /Coordinator capacity and continuation/);
  // The published profile's bound seats must agree with the minimal rig template.
  const rig = JSON.parse(readFileSync(join(here, 'rig.example.json'), 'utf8'));
  const seats = rig.pods.flatMap(pod => pod.members.map(member => `${pod.id}-${member.id}@${rig.name}`));
  assert.deepEqual(seats, [bridge.binding.observer, ...bridge.binding.seats]);
  assert.deepEqual(errors, []);
  console.log('PASS: native Pi loader, status, exact contract injection, prompt preservation and profile/rig binding; no model/network/runtime launch.');
} finally {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
