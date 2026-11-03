import test from "node:test";
import assert from "node:assert/strict";
import { boundGrepContext, broadStateGrep, GREP_CONTEXT_MAX_BYTES } from "./pi-context-bound.js";

test("oversized single-line Unicode grep is bounded without changing source identity", () => {
  const original = { role: "toolResult", toolName: "grep", toolCallId: "exact-call", isError: true, timestamp: 42,
    content: [{type: "text", text: "界".repeat(40000)}], details: {duplicate: "x".repeat(80000)}, structuredContent: {duplicate: "x".repeat(80000)} };
  const before = JSON.stringify(original), observed = [];
  const result = boundGrepContext([original], value => observed.push(value));
  assert.equal(JSON.stringify(original), before);
  assert.ok(Buffer.byteLength(JSON.stringify(result[0])) < GREP_CONTEXT_MAX_BYTES);
  for (const key of ["role", "toolName", "toolCallId", "isError", "timestamp"]) assert.equal(result[0][key], original[key]);
  assert.equal(result[0].details, undefined);
  assert.equal(result[0].structuredContent, undefined);
  assert.equal(observed[0].bytes, Buffer.byteLength(before));
  assert.match(observed[0].sha256, /^[a-f0-9]{64}$/);
});
test("small grep and unrelated messages retain original objects", () => {
  const messages = [{role:"toolResult", toolName:"grep", content:[{type:"text", text:"small"}]},
    {role:"user", content:"x".repeat(100000)}, {role:"toolResult", toolName:"read", content:"x".repeat(100000)}];
  assert.equal(boundGrepContext(messages), messages);
});
test("whole-state grep is rejected across Windows path spellings, exact project reads remain usable", () => {
  const event = path => ({toolName:"grep", input:{path}});
  for(const path of ["D:/repo/repostew/state", "d:\\repo\\repostew\\STATE\\", "state", "x/../state"])
    assert.equal(broadStateGrep(event(path), "D:/repo/repostew", "D:/repo/repostew").block,true);
  assert.equal(broadStateGrep(event("."), "D:/repo/repostew", "D:/repo/repostew/state").block,true);
  for(const path of ["state/repositories/github.com/a/b", "state/index.json", "state-other", "D:/elsewhere/state"])
    assert.equal(broadStateGrep(event(path), "D:/repo/repostew", "D:/repo/repostew"),undefined);
  assert.equal(broadStateGrep({toolName:"read",input:{path:"state"}},"D:/repo/repostew","D:/repo/repostew"),undefined);
});
