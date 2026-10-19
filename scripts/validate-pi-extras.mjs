// Offline tests through the installed Pi loader/runner; no model, shell command or remote backend.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [piRoot, bundle, output] = process.argv.slice(2).map(path => resolve(path));
const api = async path => import(pathToFileURL(join(piRoot, path)).href);
const { validateToolArguments } = await api("node_modules/@earendil-works/pi-ai/dist/utils/validation.js");
const { loadExtensions, createExtensionRuntime } = await api("dist/core/extensions/loader.js");
const { ExtensionRunner } = await api("dist/core/extensions/runner.js");
const { SessionManager } = await api("dist/core/session-manager.js");
const workspace = mkdtempSync(join(output, "pi-extras-"));
const session = SessionManager.inMemory(workspace);
const runtime = createExtensionRuntime();
const messages = [];
runtime.appendEntry = (type, data) => session.appendCustomEntry(type, data);
runtime.sendUserMessage = (text, options) => messages.push({ text, options });
const loaded = await loadExtensions([join(bundle, "extensions/pi.js"), join(bundle, "extensions/pi-extras.js")], workspace, undefined, runtime);
assert.deepEqual(loaded.errors, []);
const runner = new ExtensionRunner(loaded.extensions, runtime, workspace, session, undefined);
const errors = [];
runner.onError(error => errors.push(error));
const ctx = runner.createCommandContext();
const context = overrides => Object.create(ctx, Object.fromEntries(Object.entries(overrides).map(([key, value]) => [key, { value }])));
const cmd = (name, args = "", context = ctx) => runner.getCommand(name).handler(args, context);
const tool = name => runner.getToolDefinition(name);
const call = async (name, params, signal, context = ctx) => tool(name).execute("test",
  validateToolArguments(tool(name), { type: "toolCall", id: "test", name, arguments: params }), signal, undefined, context);
const check = (outcome = "completed", extra = {}) => runner.emitBoundary(
  { type: "agent_before_settle", outcome },
  async () => ({ contextEntries: [], contextMessages: [], llmMessages: [], pendingMessages: [], canContinue: true, ...extra }),
);
const report = (outcome, overrides = {}) => call("repostew_result", {
  outcome, summary: "Test fact", evidence: ["fixture check"], remaining: [], blocker: "", resourceHandoff: "not applicable", ...overrides,
});
const start = () => cmd("repostew-goal", "finite fixture task, no external actions");
const prompt = sections => runner.emitBeforeAgentStart({ messageType: "user", prompt: "fixture" }, { cwd: workspace, sections });

await runner.emit({ type: "session_start", reason: "startup" });
await assert.rejects(start(), /bind/);
await runner.emitBeforeAgentStart({ messageType: "user", prompt: "[[repostew:worker;assignment=unbound]] no authority" }, { cwd: workspace, sections: {} });
assert.equal((await prompt({})).systemPromptOptions.sections.repostew_contract, undefined,
  "an assignment marker cannot arm role guidance without durable workspace binding");
await cmd("repostew-workspace", workspace);
assert.deepEqual(runner.getAllRegisteredTools().map(t => t.definition.name).sort(), ["repostew_read", "repostew_result"]);
assert.equal((await check()).continue, false, "loading must not start a completion loop");
assert.equal((await prompt({ repostew_goal: "stale" })).systemPromptOptions.sections.repostew_contract, undefined,
  "ordinary unmarked input must not activate a role contract");
await runner.emitBeforeAgentStart({ messageType: "user", prompt: "[[repostew:worker;assignment=task-1]] authorized work" }, { cwd: workspace, sections: {} });
assert.match((await prompt({})).systemPromptOptions.sections.repostew_contract ?? "", /Worker/,
  "explicit assignment marker arms Worker contract");
await runner.emitInput("ordinary follow-up", undefined, "interactive");
assert.equal((await prompt({})).systemPromptOptions.sections.repostew_contract, undefined,
  "fresh unmarked external input clears role contract");
await start();
assert.equal(messages.length, 1);
assert.ok(messages[0].text.includes("finite fixture task"));
await runner.emitInput(messages[0].text, undefined, "extension");
assert.ok((await prompt({ native: "keep" })).systemPromptOptions.sections.repostew_goal);
assert.equal((await prompt({ native: "keep" })).systemPromptOptions.sections.native, "keep");
const first = await check();
assert.equal(first.continue, true);
assert.equal(first.entries[0].type, "custom_message");
assert.match(first.entries[0].content, /not a new user instruction/);
assert.equal((await check()).continue, false, "unchanged missing result must not loop");

await start();
await report("continue", { remaining: ["step one"] });
assert.equal((await check()).continue, true);
await runner.emitInput("same-task steering", undefined, "interactive", "steer");
await runner.emitInput("same-task follow-up", undefined, "interactive", "followUp");
await report("continue", { remaining: ["step two"] });
assert.equal((await check()).continue, true);
await report("continue", { remaining: ["step three"] });
assert.equal((await check()).continue, false, "changing reports cannot exceed the two-continuation budget");
// Re-delivering an existing assignment identity must not refund its two-call budget.
await runner.emitBeforeAgentStart({ messageType: "user", prompt: "[[repostew:worker;assignment=spent-assignment]] same" }, { cwd: workspace, sections: {} });
await report("continue", { remaining: ["one"] });
assert.equal((await check()).continue, true);
await runner.emitBeforeAgentStart({ messageType: "user", prompt: "[[repostew:worker;assignment=spent-assignment]] same" }, { cwd: workspace, sections: {} });
await report("continue", { remaining: ["two"] });
assert.equal((await check()).continue, true);
await report("continue", { remaining: ["three"] });
assert.equal((await check()).continue, false);
await runner.emitBeforeAgentStart({ messageType: "user", prompt: "[[repostew:worker;assignment=spent-assignment]] same" }, { cwd: workspace, sections: {} });
assert.equal((await check()).continue, false, "repeated same-id assignment cannot rearm after exhaustion");
await cmd("repostew-goal-stop");
assert.equal((await check()).continue, false);
await start();
await report("continue", { remaining: ["unchanged"] });
assert.equal((await check()).continue, true);
await report("continue", { remaining: ["unchanged"] });
assert.equal((await check()).continue, false);

for (const outcome of ["aborted", "error"]) {
  await start();
  assert.equal((await check(outcome)).continue, false);
}
await start();
assert.equal((await check("completed", { canContinue: false })).continue, false);
assert.equal((await check("completed", { pendingMessages: [{ role: "user", content: "queued" }] })).continue, false);
await runner.emit({ type: "tool_result", toolName: "bash", isError: true });
assert.equal((await check()).continue, false);
await start();
const complete = await report("complete");
assert.equal(complete.terminate, undefined);
assert.deepEqual(complete.structuredContent, complete.details);
assert.equal(tool("repostew_result").parameters, tool("repostew_result").outputSchema);
assert.equal((await check()).continue, false);
await runner.emit({ type: "tool_result", toolName: "read", isError: false });
assert.equal((await check()).continue, true, "later tool activity invalidates an earlier final report");
await start();
await report("blocked", { blocker: "Required input unavailable", remaining: ["dependent step"] });
assert.equal((await check()).continue, false);
await assert.rejects(report("complete", { evidence: [] }), /evidence/);
await assert.rejects(report("complete", { evidence: [" "] }), /blank/);
await assert.rejects(report("complete", { remaining: ["unfinished"] }), /remaining/);
await assert.rejects(report("blocked"), /blocker/);
await assert.rejects(report("continue"), /remaining/);
await assert.rejects(report("invented-outcome"), /Validation failed/);
await assert.rejects(call("repostew_read", { path: "x", limit: 201 }), /Validation failed/);
await assert.rejects(call("repostew_read", { path: "x", offset: 0 }), /Validation failed/);
await assert.rejects(report("continue", { remaining: ["step"], blocker: "denied" }), /blocker/);
const aborted = new AbortController(); aborted.abort();
await assert.rejects(call("repostew_result", {}, aborted.signal));
await start();
await runner.emit({ type: "session_compact" });
assert.equal((await check()).continue, true, "compaction must not silently disarm/rearm the in-flight check");
await runner.emit({ type: "agent_settled", aborted: false });
assert.equal((await check()).continue, false);
assert.equal((await prompt({ repostew_goal: "stale" })).systemPromptOptions.sections.repostew_goal, undefined);
await start();
await runner.emitInput("fresh external task", undefined, "interactive");
assert.equal((await check()).continue, false, "ordinary fresh input must not inherit the old task's completion gate");
await start();
await runner.emit({ type: "session_start", reason: "resume" });
assert.equal((await check()).continue, false, "resume must not rearm an old goal");

const prior = { type: "custom", customType: "other-extension", data: { keep: true } };
loaded.extensions[0].handlers.set("agent_before_settle", [() => ({ entries: [prior] })]);
await start();
assert.deepEqual((await check()).entries[0], prior, "preserve other extensions' boundary entries");
loaded.extensions[0].handlers.delete("agent_before_settle");
await runner.emit({ type: "agent_settled", aborted: false });
await cmd("repostew-steer", "one delta");
await cmd("repostew-followup", "another delta");
assert.deepEqual(messages.slice(-2), [
  { text: "one delta", options: { deliverAs: "steer" } },
  { text: "another delta", options: { deliverAs: "followUp" } },
]);
assert.equal((await check()).continue, false);
await assert.rejects(cmd("repostew-goal", "busy", context({ isIdle: () => false })), /settle/);
await assert.rejects(cmd("repostew-protect", "x", context({ isIdle: () => false })), /settle/);

const protectedDir = join(workspace, "protected");
mkdirSync(protectedDir);
mkdirSync(join(workspace, "protected-other"));
writeFileSync(join(protectedDir, "existing.txt"), "fixture");
await cmd("repostew-protect", protectedDir);
const gate = (toolName, input) => runner.emitToolCall({ type: "tool_call", toolCallId: "gate", toolName, input });
for (const path of [join(protectedDir, "existing.txt"), join(protectedDir, "new", "file.txt"), join(protectedDir, "..", "protected", "x")]) {
  assert.equal((await gate("write", { path })).block, true);
  assert.equal((await gate("edit", { path })).block, true);
}
assert.notEqual((await gate("write", { path: join(workspace, "protected-other", "x") }))?.block, true);
assert.notEqual((await gate("read", { path: join(protectedDir, "existing.txt") }))?.block, true);
const alias = join(workspace, "alias");
symlinkSync(protectedDir, alias, process.platform === "win32" ? "junction" : "dir");
assert.equal((await gate("write", { path: join(alias, "new.txt") })).block, true);
assert.notEqual((await gate("bash", { command: "rm -rf fixture-only" }))?.block, true, "confirmation is not on by default");
await cmd("repostew-confirm-shell", "on");
for (const command of ["rm -rf fixture-only", "Remove-Item fixture-only -Recurse", "git reset --hard", "rd /s fixture-only"]) {
  assert.equal((await gate("bash", { command })).block, true, "no UI must deny, not hang or auto-approve");
}
assert.notEqual((await gate("bash", { command: "git status --short" }))?.block, true);
await assert.rejects(runner.emitUserBash({ type: "user_bash", command: "rm -rf fixture-only", excludeFromContext: false }), /confirmation/);
assert.equal(errors.pop().event, "user_bash", "native user-bash failure must block execution and be reported");
runner.setUIContext({ ...runner.getUIContext(), confirm: async () => false }, "rpc");
assert.equal((await gate("bash", { command: "rm -rf fixture-only" })).block, true);
runner.setUIContext({ ...runner.getUIContext(), confirm: async () => true }, "rpc");
assert.notEqual((await gate("bash", { command: "rm -rf fixture-only" }))?.block, true);
await cmd("repostew-confirm-shell", "off");

// Native nested execution is stubbed here: preserve delegation, parameters, abort and error semantics.
let request;
const image = { type: "image", data: "fixture", mimeType: "image/png" };
runner.executeToolFn = async (_parent, ...args) => {
  request = args;
  return { result: { content: [{ type: "text", text: "中".repeat(10000) }, image], details: { body: "not copied" }, structuredContent: { body: "not copied" } }, isError: false };
};
const readCtx = runner.createToolContext("test");
const controller = new AbortController();
const bounded = await call("repostew_read", { path: "explicit.txt", offset: 2 }, controller.signal, readCtx);
assert.equal(request[0], "read");
assert.deepEqual(request[1], { path: "explicit.txt", offset: 2, limit: 200 });
assert.equal(request[2].signal, controller.signal);
assert.ok(Buffer.byteLength(bounded.content[0].text) <= 16384);
assert.ok(!bounded.content[0].text.includes("\ufffd"));
assert.deepEqual(bounded.content[1], image);
assert.equal(bounded.details.textTruncated, true);
assert.equal(bounded.structuredContent, undefined);
assert.equal(bounded.details.body, undefined);
assert.match(bounded.content.at(-1).text, /not a complete-file result/);
runner.executeToolFn = async () => ({ result: { content: [{ type: "text", text: "denied" }] }, isError: true });
const errorRead = await call("repostew_read", { path: "x" }, undefined, readCtx);
assert.equal(errorRead.isError, true);
runner.executeToolFn = async () => { throw new Error("host failed"); };
await assert.rejects(call("repostew_read", { path: "x" }, undefined, readCtx), /host failed/);
await assert.rejects(call("repostew_read", { path: "x" }, aborted.signal, readCtx));
runner.executeToolFn = async () => ({ result: { content: [{ type: "text", text: Array(300).fill("line").join("\n") }] }, isError: false });
const multiline = await call("repostew_read", { path: "x" }, undefined, readCtx);
assert.equal(multiline.content[0].text.split("\n").length, 200);
assert.equal(multiline.details.textTruncated, true);

// Exercise the bounded wrapper against an actual native read implementation (no provider).
const { createReadTool } = await api("dist/core/tools/read.js");
const nativeRead = createReadTool(workspace);
const actualPath = join(workspace, "actual-read.txt");
writeFileSync(actualPath, "first\nsecond\nthird\n");
runner.executeToolFn = async (parent, name, args, options) => {
  assert.equal(name, "read");
  const blocked = await gate(name, args);
  if (blocked?.block) return { result: { content: [{ type: "text", text: blocked.reason }], details: {} }, isError: true };
  return { result: await nativeRead.execute(`${parent}/0`, args, options.signal), isError: false };
};
const actual = await call("repostew_read", { path: actualPath, offset: 2, limit: 1 }, undefined, readCtx);
assert.match(actual.content[0].text, /second/);
assert.ok(!actual.content[0].text.includes("first"));
assert.equal(actual.isError, false);
// Cancellation after a slow/ignoring host response must still propagate.
const lateAbort = new AbortController();
runner.executeToolFn = async () => { lateAbort.abort(); return { result: { content: [] }, isError: false }; };
await assert.rejects(call("repostew_read", { path: "x" }, lateAbort.signal, readCtx));

await start();
session.resetLeaf();
await runner.emit({ type: "session_tree" });
assert.equal((await check()).continue, false);
await assert.rejects(start(), /bind/);
assert.equal((await prompt({ repostew_extras: "stale" })).systemPromptOptions.sections.repostew_extras, undefined);
assert.notEqual((await gate("write", { path: join(protectedDir, "existing.txt") }))?.block, true, "controls are intentionally session-local, not durable authorization");
assert.deepEqual(errors, []);
console.log("Pi extras: native load, scope/prompt, bounded settle, reports, deltas, guard paths/links, RPC/no-UI confirmation, nested read bounds/error/abort passed (offline; no live T3/model test).");
