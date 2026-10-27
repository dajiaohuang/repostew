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
  defaultModel: "keep-existing", extensions: ["keep-extension.js", "old-extension.js", join(bundle, "extensions/pi-native.js")],
  shellCommandPrefix: "export EXISTING_SETTING=1",
}));
const installer = join(bundle, "scripts/configure-pi.mjs");
const args = [installer, "--agent-dir", agentDir, "--workspace", fixture, "--role", "worker",
  "--seat-guidance", seatGuidance, "--mode", "combined",
  "--openrig-home", openrigHome,
  "--trust-projects", "--gh-config-dir", join(fixture, "GitHub CLI"),
  "--remove-extension", "old-extension.js"];
for (let i = 0; i < 2; i++) {
  const installed = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(installed.status, 0, installed.stderr);
}
const settings = JSON.parse(readFileSync(join(agentDir, "settings.json"), "utf8"));
assert.equal(settings.defaultModel, "keep-existing");
assert.deepEqual(settings.extensions, ["keep-extension.js", join(bundle, "extensions/pi-repostew.js"), join(bundle, "extensions/pi-openrig.js")]);
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
assert.deepEqual(JSON.parse(readFileSync(join(agentDir, "settings.json"), "utf8")).extensions,
  ["keep-extension.js", join(bundle, "extensions/pi-repostew.js")]);
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
  runtime.getSettings = () => settings;
  runtime.getActiveTools = () => settings.defaultTools;
  runtime.getAllTools = () => settings.defaultTools.map(name => ({ name }));
  const session = SessionManager.inMemory(fixture);
  const loaded = await loadExtensions([join(bundle, "extensions/pi-repostew.js"), join(bundle, "extensions/pi-openrig.js")], fixture, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const runner = new ExtensionRunner(loaded.extensions, runtime, fixture, session, undefined);
  const errors = [];
  runner.onError(e => errors.push(e));
  await runner.emit({ type: "session_start", reason: "startup" });
  const status = await runner.getToolDefinition("repostew_runtime_status").execute("status", {}, undefined, undefined, runner.createToolContext("status"));
  assert.equal(status.details.role, "worker");
  assert.equal(status.details.approvalGate, false);
  assert.equal(status.details.automaticContinuation, false);
  assert.equal(status.details.version, "0.5.1");
  assert.deepEqual(status.details.toolSelection.configured.entries, settings.defaultTools);
  assert.equal(status.details.toolSelection.intended, null);
  assert.equal(status.details.entrypoint, join(bundle, "extensions/pi-repostew.js"));
  assert.ok(runner.getToolDefinition("openrig_slots"));
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
  writeFileSync(join(agentDir, "openrig-pi.json"), JSON.stringify({ version: 1, binding: {
    url: binding.url, rig: binding.rig, observer: binding.coordinator, seats: workers,
  } }));
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
    const result = await runner.getToolDefinition("openrig_slots").execute("slots", {}, undefined);
    assert.deepEqual(result.details.slots.map(s => s.state), ["available", "waiting-reconciliation", "awaiting-observer", "occupied", "stopped", "available"]);
    assert.deepEqual(result.details.available, [workers[0], workers[5]]);
    assert.equal(result.details.processClearance, "unknown");
    assert.equal(result.details.nextAction, undefined);
    assert.equal(result.details.pendingCoordinatorItems, undefined);
    assert.deepEqual(result.details.pendingObserverItems.map(row => row.id), ["result"]);
    assert.deepEqual(result.details.slots[1].executingAssignments, []);
    assert.equal(result.details.slots[1].waitingObligations[0].blockedOn, "external:maintainer");
  } finally { globalThis.fetch = originalFetch; }
  assert.equal(loaded.extensions[0].handlers.has("tool_call"), false, "no extra approval interceptor");
  assert.equal(loaded.extensions[0].handlers.has("agent_before_settle"), false, "no custom continuation loop");
  assert.ok(runner.getCommand("repostew-reload"));
  let active = ["repostew_runtime_status"];
  runtime.getActiveTools = () => active;
  runtime.setActiveTools = names => { active = names; };
  runtime.getAllTools = () => [...settings.defaultTools, "repostew_runtime_status"].map(name => ({ name }));
  const notices = [];
  const commandContext = { ui: { notify(text) { notices.push(JSON.parse(text)); } } };
  await assert.rejects(() => runner.getCommand("repostew-restore-tools").handler("", commandContext), /Name the tools intended now/);
  assert.deepEqual(active, ["repostew_runtime_status"]);
  await runner.getCommand("repostew-restore-tools").handler("read", commandContext);
  assert.deepEqual(active, ["repostew_runtime_status", "read"]);
  assert.ok(settings.defaultTools.includes("bash"));
  assert.equal(active.includes("bash"), false, "configured but not currently intended remains disabled");
  assert.deepEqual(notices.at(-1).intended, ["read"]);
  await runner.getCommand("repostew-restore-tools").handler(settings.defaultTools.join(" "), commandContext);
  assert.ok(active.includes("repostew_runtime_status"));
  for (const name of settings.defaultTools) assert.ok(active.includes(name));
  runtime.getAllTools = () => [];
  const beforeRejectedRestore = [...active];
  await assert.rejects(() => runner.getCommand("repostew-restore-tools").handler("read", commandContext), /unregistered or hidden/);
  assert.deepEqual(active, beforeRejectedRestore);
  runtime.getAllTools = () => [{ name: "read", exposure: "hidden" }];
  await assert.rejects(() => runner.getCommand("repostew-restore-tools").handler("read", commandContext), /unregistered or hidden/);
  assert.deepEqual(active, beforeRejectedRestore);
  runtime.getAllTools = () => [...settings.defaultTools, "repostew_runtime_status"].map(name => ({ name }));
  active = ["repostew_runtime_status", "read"];
  runtime.setActiveTools = () => {}; // Pi may ignore a name it cannot activate.
  await assert.rejects(() => runner.getCommand("repostew-restore-tools").handler("bash", commandContext), /activation incomplete/);
  assert.equal(notices.at(-1).restored, false);
  assert.deepEqual(notices.at(-1).missing, ["bash"]);
  assert.deepEqual(errors, []);
} finally {
  for (const [key, value] of [["PI_CODING_AGENT_DIR", previous.agent], ["GH_CONFIG_DIR", previous.gh], ["GH_PROMPT_DISABLED", previous.prompt]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}


// Prove each layer loads without the other layer's profile, rules or host connection.
const modes = ["repostew", "openrig", "combined", "legacy"];
const savedEnv = { agent: process.env.PI_CODING_AGENT_DIR, gh: process.env.GH_CONFIG_DIR, prompt: process.env.GH_PROMPT_DISABLED };
const savedFetch = globalThis.fetch;
let networkCalls = 0;
globalThis.fetch = async () => { networkCalls++; throw new Error("No network expected during layer loading"); };
try {
  for (const mode of modes) {
    const dir = join(fixture, `mode-${mode}`);
    mkdirSync(dir);
    const genericGuidance = join(dir, "host-context.md");
    writeFileSync(genericGuidance, "Host-only context. Preserve native custody.");
    const appProfile = { version: 1, workspace: fixture, role: "coordinator", seatGuidance,
      gh: { configDir: join(dir, "app-gh") }, ...(mode === "legacy" ? { openrig: binding } : {}) };
    writeFileSync(join(dir, "repostew.json"), mode === "openrig" ? "malformed application data must not be read" : JSON.stringify(appProfile));
    writeFileSync(join(dir, "openrig-pi.json"), mode === "repostew" || mode === "legacy"
      ? "malformed bridge data must not be read" : JSON.stringify({ version: 1, seatGuidance: genericGuidance,
        binding: { url: binding.url, rig: binding.rig, observer: binding.coordinator, seats: binding.workers } }));
    process.env.PI_CODING_AGENT_DIR = dir;
    delete process.env.GH_CONFIG_DIR;
    delete process.env.GH_PROMPT_DISABLED;
    const runtime = createExtensionRuntime();
    runtime.getSettings = () => ({ defaultTools: ["read", "bash"] });
    runtime.getActiveTools = () => ["read"];
    runtime.getAllTools = () => [{ name: "read" }];
    const paths = (mode === "legacy" ? ["pi-native.js"] :
      [ ...(mode !== "openrig" ? ["pi-repostew.js"] : []), ...(mode !== "repostew" ? ["pi-openrig.js"] : []) ])
      .map(name => join(bundle, "extensions", name));
    const loaded = await loadExtensions(paths, fixture, undefined, runtime);
    assert.deepEqual(loaded.errors, [], mode);
    const runner = new ExtensionRunner(loaded.extensions, runtime, fixture, SessionManager.inMemory(fixture), undefined);
    const prompt = await runner.emitBeforeAgentStart({ messageType: "user", prompt: "fixture" },
      { cwd: fixture, sections: { native: "keep" } });
    assert.equal(prompt.systemPromptOptions.sections.native, "keep");
    if (mode === "openrig") {
      assert.equal(runner.getToolDefinition("repostew_runtime_status"), undefined);
      assert.equal(runner.getToolDefinition("repostew_gh_status"), undefined);
      assert.equal(prompt.systemPromptOptions.sections.repostew, undefined);
      assert.equal(prompt.systemPromptOptions.sections.openrig, readFileSync(genericGuidance, "utf8"));
      assert.equal(process.env.GH_CONFIG_DIR, undefined);
      assert.equal(process.env.GH_PROMPT_DISABLED, undefined);
    } else {
      assert.ok(runner.getToolDefinition("repostew_runtime_status"));
      assert.match(prompt.systemPromptOptions.sections.repostew, /Coordinator capacity and continuation/);
    }
    if (mode === "repostew") {
      assert.equal(runner.getToolDefinition("openrig_slots"), undefined);
      assert.equal(runner.getToolDefinition("repostew_openrig_slots"), undefined);
      assert.equal(prompt.systemPromptOptions.sections.openrig, undefined);
    }
    if (mode === "combined") {
      assert.equal(prompt.systemPromptOptions.sections.openrig, readFileSync(genericGuidance, "utf8"));
      assert.ok(runner.getToolDefinition("openrig_slots"));
      assert.equal(runner.getToolDefinition("repostew_openrig_slots"), undefined);
    }
    if (mode === "legacy") {
      assert.ok(runner.getToolDefinition("repostew_openrig_slots"));
      const status = await runner.getToolDefinition("openrig_runtime_status").execute("status", {}, undefined);
      assert.deepEqual(status.details.binding, { url: binding.url, rig: binding.rig,
        observer: binding.coordinator, seats: binding.workers });
      const blockedFetch = globalThis.fetch;
      globalThis.fetch = async url => ({ ok: true, json: async () => {
        const path = new URL(url).pathname;
        if (path === "/api/ps") return [{ name: binding.rig, rigId: "fixture" }];
        if (path.endsWith("/nodes")) return [];
        if (path === "/api/queue/list") return [{ qitemId: "legacy-result", state: "pending",
          sourceSession: binding.workers[0], destinationSession: binding.coordinator }];
        return { rows: [] };
      } });
      try {
        const snapshot = await runner.getToolDefinition("repostew_openrig_slots").execute("legacy", {}, undefined);
        assert.deepEqual(snapshot.details.pendingCoordinatorItems.map(row => row.id), ["legacy-result"]);
        assert.equal(snapshot.details.slots[0].state, "awaiting-coordinator");
        assert.equal(snapshot.details.nextAction, undefined);
      } finally { globalThis.fetch = blockedFetch; }
    }
    for (const extension of loaded.extensions) {
      assert.equal(extension.handlers.has("tool_call"), false);
      assert.equal(extension.handlers.has("agent_before_settle"), false);
    }
  }
  assert.equal(networkCalls, 0);
} finally {
  globalThis.fetch = savedFetch;
  for (const [key, value] of [["PI_CODING_AGENT_DIR", savedEnv.agent], ["GH_CONFIG_DIR", savedEnv.gh], ["GH_PROMPT_DISABLED", savedEnv.prompt]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}

// Explicit configuration modes must preserve unrelated data and reject incomplete combined setup before writes.
const bridgeOnly = join(fixture, "bridge-config");
const bindingPath = join(fixture, "binding.json");
writeFileSync(bindingPath, JSON.stringify({ url: binding.url, rig: binding.rig, observer: binding.coordinator, seats: binding.workers }));
let configured = spawnSync(process.execPath, [installer, "--mode", "openrig", "--agent-dir", bridgeOnly,
  "--openrig-binding", bindingPath], { encoding: "utf8" });
assert.equal(configured.status, 0, configured.stderr);
const bridgeSettings = JSON.parse(readFileSync(join(bridgeOnly, "settings.json"), "utf8"));
assert.deepEqual(bridgeSettings.extensions, [join(bundle, "extensions/pi-openrig.js")]);
assert.equal(bridgeSettings.shellCommandPrefix, undefined);
assert.equal(JSON.parse(configured.stdout).ghConfigDir, null);
const missingBinding = join(fixture, "missing-binding-profile");
configured = spawnSync(process.execPath, [installer, "--mode", "combined", "--agent-dir", missingBinding,
  "--workspace", fixture, "--role", "worker"], { encoding: "utf8" });
assert.notEqual(configured.status, 0);
const { existsSync } = await import("node:fs");
assert.equal(existsSync(missingBinding), false);
assert.equal(existsSync(join(bridgeOnly, "repostew.json")), false);
console.log("PASS: independent application, independent bridge, combined loading, legacy profile compatibility, facts-only snapshots and three explicit configuration modes; no model/network/runtime launch.");
