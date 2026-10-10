// Native Pi loader/session/prompt and official delegation backend; fixture children use no model.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const [piRoot, bundle, output] = process.argv.slice(2).map((path) => resolve(path));
const api = async (path) => import(pathToFileURL(join(piRoot, path)).href);
const { loadExtensions, createExtensionRuntime } = await api("dist/core/extensions/loader.js");
const { ExtensionRunner } = await api("dist/core/extensions/runner.js");
const { SessionManager } = await api("dist/core/session-manager.js");
const workspace = mkdtempSync(join(output, "pi-native-"));
const configured = spawnSync("rtk", ["python", join(bundle, "scripts/configure-workers.py"), workspace], { encoding: "utf8" });
assert.equal(configured.status, 0, configured.stderr);
const session = SessionManager.inMemory(workspace);
const runtime = createExtensionRuntime();
const messages = [];
runtime.appendEntry = (type, data) => session.appendCustomEntry(type, data);
runtime.sendUserMessage = (text) => messages.push(text);
const loaded = await loadExtensions([join(bundle, "extensions/pi.js")], workspace, undefined, runtime);
assert.deepEqual(loaded.errors, []);
const runner = new ExtensionRunner(loaded.extensions, runtime, workspace, session, undefined);
const errors = [];
runner.onError((error) => errors.push(error));
const commandContext = runner.createCommandContext();
await runner.emit({ type: "session_start", reason: "startup" });
await runner.getCommand("repostew-workspace").handler(workspace, commandContext);
assert.equal(messages.length, 0, "binding must not start a turn");
const boundEntry = session.getLeafId();
const prompt = () => runner.emitBeforeAgentStart("task", undefined, { cwd: workspace, sections: { native: "preserved" } });
const result = await prompt();
assert.equal(result.systemPromptOptions.sections.native, "preserved");
assert.ok(result.systemPromptOptions.sections.repostew.includes(JSON.stringify(realpathSync(workspace))));
const otherWorkspace = join(workspace, "other");
mkdirSync(otherWorkspace);
runtime.appendEntry = () => { throw new Error("session write failed"); };
await assert.rejects(runner.getCommand("repostew-workspace").handler(otherWorkspace, commandContext), /session write failed/);
assert.ok((await prompt()).systemPromptOptions.sections.repostew.includes(JSON.stringify(realpathSync(workspace))));
runtime.appendEntry = (type, data) => session.appendCustomEntry(type, data);
await runner.getCommand("repostew").handler("finite task", commandContext);
assert.equal(messages.length, 1);
assert.ok(messages[0].endsWith("finite task"));
session.resetLeaf();
await runner.emit({ type: "session_tree" });
assert.equal((await prompt()).systemPromptOptions.sections.repostew, undefined);
session.branch(boundEntry);
await runner.emit({ type: "session_tree" });
assert.ok((await prompt()).systemPromptOptions.sections.repostew);
await runner.emit({ type: "session_start", reason: "resume" });
assert.ok((await prompt()).systemPromptOptions.sections.repostew);
session.newSession();
await runner.emit({ type: "session_start", reason: "new" });
assert.equal((await prompt()).systemPromptOptions.sections.repostew, undefined);
assert.deepEqual(errors, []);

const official = await loadExtensions([join(piRoot, "examples/extensions/subagent/index.ts")], workspace);
assert.deepEqual(official.errors, []);
const tool = official.extensions[0].tools.get("subagent").definition;
const fixture = join(workspace, "child.cjs");
const log = join(workspace, "children.jsonl");
writeFileSync(fixture, `const fs = require('node:fs');
const log = ${JSON.stringify(log)};
fs.appendFileSync(log, JSON.stringify({ event: 'start', pid: process.pid, time: Date.now() })+'\\n');
if (process.argv.at(-1) === 'abort fixture') console.log(JSON.stringify({type:'message_end',message:{role:'user',content:'fixture started'}}));
setTimeout(() => {
console.log(JSON.stringify({type:'message_end',message:{role:'assistant',content:[{type:'text',text:'fixture final'}],stopReason:'stop',usage:{input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,cost:{input:0,output:0,cacheRead:0,cacheWrite:0,total:0}}}}));
fs.appendFileSync(log, JSON.stringify({ event: 'end', pid: process.pid, time: Date.now() })+'\\n');
}, 250);
`);
const originalScript = process.argv[1];
process.argv[1] = fixture;
const context = { cwd: workspace, hasUI: false, model: undefined, ui: {} };
try {
  const parallel = await tool.execute("parallel", {
    agentScope: "project", tasks: Array.from({ length: 6 }, () => ({ agent: "repostew-worker", task: "fixture" })),
  }, undefined, undefined, context);
  assert.equal(parallel.details.results.length, 6);
  assert.ok(parallel.details.results.every((result) => result.exitCode === 0));
  const events = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse);
  let active = 0, peak = 0;
  for (const event of events) { active += event.event === "start" ? 1 : -1; peak = Math.max(peak, active); }
  assert.equal(active, 0);
  assert.equal(peak, 4, "official backend must refill within its four-child cap");
  for (const { pid } of events.filter((event) => event.event === "start")) {
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  }
  const abort = new AbortController();
  const pending = tool.execute("abort", { agentScope: "project", agent: "repostew-worker", task: "abort fixture" }, abort.signal,
    () => abort.abort(), context);
  await assert.rejects(pending, /Subagent was aborted/);
  const all = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse);
  assert.equal(all.filter((event) => event.event === "start").length, 7, "abort must follow actual child startup");
  for (const { pid } of all.filter((event) => event.event === "start")) {
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  }
} finally { process.argv[1] = originalScript; }
console.log("Pi native loader/session/prompt passed; official backend six fixture children, cap/refill/process close/abort passed (no live model).");
