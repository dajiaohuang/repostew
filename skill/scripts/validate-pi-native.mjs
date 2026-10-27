// Exercise the real Pi loader/session/prompt interfaces without model calls.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
const [piRoot, bundle, output] = process.argv.slice(2).map(p => resolve(p));
const api = p => import(pathToFileURL(join(piRoot, p)).href);
const { loadExtensions, createExtensionRuntime } = await api("dist/core/extensions/loader.js");
const { ExtensionRunner } = await api("dist/core/extensions/runner.js");
const { SessionManager } = await api("dist/core/session-manager.js");
const fixture = mkdtempSync(join(output, "native-profile-"));
const agentDir = join(fixture, "agent");
mkdirSync(agentDir);
const openrigHome = join(fixture, "openrig");
const officialSkills = join(openrigHome, "plugins/openrig-core/skills");
mkdirSync(officialSkills, { recursive: true });
const seatGuidance = join(fixture, "seat-contract.md");
writeFileSync(seatGuidance, "Configured role: worker. Preserve this assigned seat contract and dependency installation authority.");
const binding = { url: "http://127.0.0.1:17433", rig: "fixture", coordinator: "c@fixture", workers: ["w@fixture"] };
writeFileSync(join(agentDir, "repostew.json"), JSON.stringify({ version: 1, workspace: fixture,
  role: "worker", seatGuidance, openrig: binding, retainedCustomField: "keep" }));
writeFileSync(join(agentDir, "settings.json"), JSON.stringify({
  defaultModel: "keep-existing", extensions: ["keep-extension.js", "old-extension.js"],
  shellCommandPrefix: "export EXISTING_SETTING=1",
}));
const installer = join(bundle, "scripts/configure-pi.mjs");
const args = [installer, "--agent-dir", agentDir, "--workspace", fixture, "--role", "worker",
  "--seat-guidance", seatGuidance,
  "--openrig-home", openrigHome,
  "--trust-projects", "--gh-config-dir", join(fixture, "GitHub CLI"),
  "--remove-extension", "old-extension.js"];
for (let i = 0; i < 2; i++) {
  const installed = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(installed.status, 0, installed.stderr);
}
const settings = JSON.parse(readFileSync(join(agentDir, "settings.json"), "utf8"));
assert.equal(settings.defaultModel, "keep-existing");
assert.deepEqual(settings.extensions, ["keep-extension.js", join(bundle, "extensions/pi-native.js")]);
assert.equal(settings.defaultProjectTrust, "always");
assert.deepEqual(settings.skills, [officialSkills]);
const profile = JSON.parse(readFileSync(join(agentDir, "repostew.json"), "utf8"));
assert.equal(profile.seatGuidance, seatGuidance);
assert.deepEqual(profile.openrig, binding);
assert.equal(profile.retainedCustomField, "keep");
const changedGuidance = join(fixture, "changed-contract.md");
writeFileSync(changedGuidance, "replacement contract");
const replaced = spawnSync(process.execPath, [installer, "--agent-dir", agentDir, "--workspace", fixture,
  "--role", "worker", "--seat-guidance", changedGuidance], { encoding: "utf8" });
assert.equal(replaced.status, 0, replaced.stderr);
assert.equal(JSON.parse(readFileSync(join(agentDir, "repostew.json"), "utf8")).seatGuidance, changedGuidance);
const beforeMissing = readFileSync(join(agentDir, "repostew.json"), "utf8");
const missing = spawnSync(process.execPath, [installer, "--agent-dir", agentDir, "--workspace", fixture,
  "--role", "worker", "--seat-guidance", join(fixture, "missing-contract.md")], { encoding: "utf8" });
assert.notEqual(missing.status, 0);
assert.equal(readFileSync(join(agentDir, "repostew.json"), "utf8"), beforeMissing);
writeFileSync(join(agentDir, "repostew.json"), JSON.stringify(profile));
assert.equal(settings.shellCommandPrefix.match(/BEGIN REPOSTEW GH/g).length, 1);
assert.ok(settings.shellCommandPrefix.startsWith("export EXISTING_SETTING=1"));
for (const tool of ["read", "bash", "powershell", "edit", "write", "grep", "find", "ls", "codemode", "tool_search"])
  assert.ok(settings.defaultTools.includes(tool));

const previous = { agent: process.env.PI_CODING_AGENT_DIR, gh: process.env.GH_CONFIG_DIR, prompt: process.env.GH_PROMPT_DISABLED };
process.env.PI_CODING_AGENT_DIR = agentDir;
delete process.env.GH_CONFIG_DIR;
try {
  const runtime = createExtensionRuntime();
  runtime.getActiveTools = () => settings.defaultTools;
  runtime.getAllTools = () => settings.defaultTools.map(name => ({ name }));
  const session = SessionManager.inMemory(fixture);
  const loaded = await loadExtensions([join(bundle, "extensions/pi-native.js")], fixture, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const runner = new ExtensionRunner(loaded.extensions, runtime, fixture, session, undefined);
  const errors = [];
  runner.onError(e => errors.push(e));
  await runner.emit({ type: "session_start", reason: "startup" });
  const status = await runner.getToolDefinition("repostew_runtime_status").execute("status", {}, undefined, undefined, runner.createToolContext("status"));
  assert.equal(status.details.role, "worker");
  assert.equal(status.details.approvalGate, false);
  assert.equal(status.details.automaticContinuation, false);
  assert.equal(status.details.version, "0.4.6");
  assert.equal(status.details.entrypoint, join(bundle, "extensions/pi-native.js"));
  assert.ok(runner.getToolDefinition("repostew_openrig_slots"));
  assert.equal(status.details.ghConfigDir, join(fixture, "GitHub CLI"));
  const prompt = await runner.emitBeforeAgentStart({ messageType: "user", prompt: "continue assigned work" },
    { cwd: fixture, sections: { native: "preserve" } });
  assert.equal(prompt.systemPromptOptions.sections.native, "preserve");
  assert.match(prompt.systemPromptOptions.sections.repostew, /Configured role: worker/);
  assert.match(prompt.systemPromptOptions.sections.repostew, /dependency installation/);
  assert.doesNotMatch(prompt.systemPromptOptions.sections.repostew, /Coordinator capacity and continuation/);
  writeFileSync(join(agentDir, "repostew.json"), JSON.stringify({ ...profile, role: "coordinator" }));
  const coordinatorPrompt = await runner.emitBeforeAgentStart({ messageType: "user", prompt: "register result" },
    { cwd: fixture, sections: { native: "preserve" } });
  assert.match(coordinatorPrompt.systemPromptOptions.sections.repostew, /dependency installation/);
  assert.match(coordinatorPrompt.systemPromptOptions.sections.repostew, /Source order is selection order, not completion order/);
  assert.match(coordinatorPrompt.systemPromptOptions.sections.repostew, /one dispatch is not the stopping condition/);
  const originalFetch = globalThis.fetch;
  const workers = ["free", "waiting", "result", "busy", "stopped", "terminal"].map(x => `${x}@fixture`);
  writeFileSync(join(agentDir, "repostew.json"), JSON.stringify({ ...profile, role: "coordinator", openrig: { ...binding, workers } }));
  const nodes = workers.map(canonicalSessionName => ({ canonicalSessionName, sessionStatus: "running", startupStatus: "ready",
    activityState: { activity: "idle-at-prompt", needsInput: { count: 0 } }, agentActivity: { state: "idle" }, assignedWorkCount: 0 }));
  nodes[4].intentionallyStopped = true;
  const rows = [
    { qitemId: "wait", state: "blocked", destinationSession: workers[1], blockedOn: "external:maintainer" },
    { qitemId: "result", state: "pending", sourceSession: workers[2], destinationSession: binding.coordinator },
    { qitemId: "busy", state: "in-progress", destinationSession: workers[3] },
    { qitemId: "stop", state: "in-progress", destinationSession: workers[4] },
    { qitemId: "old", state: "handed-off", destinationSession: workers[5] },
  ];
  globalThis.fetch = async url => ({ ok: true, json: async () => {
    const path = new URL(url).pathname;
    if (path === "/api/ps") return [{ name: "fixture", rigId: "fixture" }];
    if (path.endsWith("/nodes")) return nodes;
    if (path === "/api/queue/list") return rows;
    return { rows: [] };
  } });
  try {
    const result = await runner.getToolDefinition("repostew_openrig_slots").execute("slots", {}, undefined);
    assert.deepEqual(result.details.slots.map(s => s.state), ["available", "waiting-reconciliation", "awaiting-coordinator", "occupied", "stopped", "available"]);
    assert.deepEqual(result.details.available, [workers[0], workers[5]]);
    assert.equal(result.details.processClearance, "unknown");
    assert.deepEqual(result.details.slots[1].executingAssignments, []);
    assert.equal(result.details.slots[1].waitingObligations[0].blockedOn, "external:maintainer");
  } finally { globalThis.fetch = originalFetch; }
  assert.equal(loaded.extensions[0].handlers.has("tool_call"), false, "no extra approval interceptor");
  assert.equal(loaded.extensions[0].handlers.has("agent_before_settle"), false, "no custom continuation loop");
  assert.ok(runner.getCommand("repostew-reload"));
  let active = ["repostew_runtime_status"];
  runtime.getActiveTools = () => active;
  runtime.setActiveTools = names => { active = names; };
  await runner.getCommand("repostew-restore-tools").handler("", { ui: { notify() {} } });
  assert.ok(active.includes("repostew_runtime_status"));
  for (const name of settings.defaultTools) assert.ok(active.includes(name));
  runtime.getAllTools = () => [];
  const beforeRejectedRestore = [...active];
  await assert.rejects(() => runner.getCommand("repostew-restore-tools").handler("", { ui: { notify() {} } }), /not registered/);
  assert.deepEqual(active, beforeRejectedRestore);
  assert.deepEqual(errors, []);
} finally {
  for (const [key, value] of [["PI_CODING_AGENT_DIR", previous.agent], ["GH_CONFIG_DIR", previous.gh], ["GH_PROMPT_DISABLED", previous.prompt]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
console.log("PASS: native Pi load, unified slot tool, seat contract/binding preservation, official skill default, settings idempotency and no approval/continuation hooks.");
