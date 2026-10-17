// Validate RepoStew's base and optional Pi integrations; no subagent plugins or model calls.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [piRoot, bundle, output] = process.argv.slice(2).map((path) => resolve(path));
const api = async (path) => import(pathToFileURL(join(piRoot, path)).href);
const { loadExtensions, createExtensionRuntime } = await api("dist/core/extensions/loader.js");
const { ExtensionRunner } = await api("dist/core/extensions/runner.js");
const { SessionManager } = await api("dist/core/session-manager.js");
const workspace = mkdtempSync(join(output, "pi-native-"));
const session = SessionManager.inMemory(workspace);
const runtime = createExtensionRuntime();
const messages = [];
runtime.appendEntry = (type, data) => session.appendCustomEntry(type, data);
runtime.sendUserMessage = (text) => messages.push(text);
const loaded = await loadExtensions([join(bundle, "extensions/pi.js")], workspace, undefined, runtime);
assert.deepEqual(loaded.errors, []);
assert.equal(loaded.extensions[0].tools.size, 0, "base entry must not silently load extras");
const runner = new ExtensionRunner(loaded.extensions, runtime, workspace, session, undefined);
const errors = [];
runner.onError((error) => errors.push(error));
const commandContext = runner.createCommandContext();
await runner.emit({ type: "session_start", reason: "startup" });
await runner.getCommand("repostew-workspace").handler(workspace, commandContext);
assert.equal(messages.length, 0, "binding must not start a turn");
const boundEntry = session.getLeafId();
const prompt = (sections = { native: "preserved" }) => runner.emitBeforeAgentStart(
  { messageType: "user", prompt: "task", images: undefined },
  { cwd: workspace, sections },
);
const result = await prompt();
assert.equal(result.systemPromptOptions.sections.native, "preserved");
assert.ok(result.systemPromptOptions.sections.repostew.includes(JSON.stringify(realpathSync(workspace))));
const otherWorkspace = join(workspace, "other");
mkdirSync(otherWorkspace);
const busyContext = Object.create(commandContext, { isIdle: { value: () => false } });
await runner.getCommand("repostew-workspace").handler(otherWorkspace, busyContext);
assert.ok((await prompt()).systemPromptOptions.sections.repostew.includes(JSON.stringify(realpathSync(workspace))));
await runner.getCommand("repostew").handler("must not dispatch while busy", busyContext);
assert.equal(messages.length, 0);
runtime.appendEntry = () => { throw new Error("session write failed"); };
await assert.rejects(runner.getCommand("repostew-workspace").handler(otherWorkspace, commandContext), /session write failed/);
assert.ok((await prompt()).systemPromptOptions.sections.repostew.includes(JSON.stringify(realpathSync(workspace))));
runtime.appendEntry = (type, data) => session.appendCustomEntry(type, data);
await runner.getCommand("repostew").handler("finite task", commandContext);
assert.equal(messages.length, 1);
assert.ok(messages[0].endsWith("finite task"));
session.resetLeaf();
await runner.emit({ type: "session_tree" });
assert.equal((await prompt({ repostew: "stale" })).systemPromptOptions.sections.repostew, undefined);
session.branch(boundEntry);
await runner.emit({ type: "session_tree" });
assert.ok((await prompt()).systemPromptOptions.sections.repostew);
await runner.emit({ type: "session_start", reason: "resume" });
assert.ok((await prompt()).systemPromptOptions.sections.repostew);
session.newSession();
await runner.emit({ type: "session_start", reason: "new" });
assert.equal((await prompt()).systemPromptOptions.sections.repostew, undefined);
assert.deepEqual(errors, []);

console.log("Pi native loader/session/prompt passed (no subagent plugin, delegation or live model test).");
await import("./validate-pi-extras.mjs");
