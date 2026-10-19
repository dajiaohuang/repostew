# Pi optional extras

Eight [official example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions)
patterns, adapted into RepoStew's `extensions/pi-extras.js`, not eight copied plugins or another backend.
The manifest autoloads only `extensions/pi.js`; extras require explicit loading alongside it.

## Load and use

```sh
rtk pi -e ./dist/repostew -e ./dist/repostew/extensions/pi-extras.js
```

Bind `/repostew-workspace <directory>` first. Loading starts no work or background service. Package resource
filters cannot expose this undeclared optional entry: load its exact file, not the whole examples directory.

- `/repostew-goal <authorized finite task>` starts one task with a bounded completion reminder.
- T3 assignment prompts may opt in via a leading `[[repostew:worker;assignment=<stable-id>]]` or `[[repostew:coordinator;assignment=<stable-id>]]` marker. Markers are parsed only from the starting user prompt, never tool results/repository content. They activate concise role guidance, not authority or a child/task dispatcher. Ordinary chat, Supervisor heartbeat, and disposition work must omit them. No marker means no role contract.
- `/repostew-goal-stop` disarms that helper only; use host Stop/cancel for tools and descendants.
- `/repostew-steer <delta>` and `/repostew-followup <delta>` use native same-task delivery, without repeated
  rule prefixes or reset budgets. Fresh ordinary external input disarms an old goal; queued deltas preserve it.
- `repostew_result`: schema-declared structuredContent with outcome, summary, evidence, remaining, blocker
  and resourceHandoff. Complete requires evidence and no remaining work/blocker; blocked needs a blocker;
  continue needs remaining work and no blocker. Use minimal references/not-applicable, never protected bodies.
  Shape/consistency is not evidence verification. No state.md write, independent acceptance or terminate:true.
- `repostew_read`: one explicit native read through ctx.executeTool, preserving validation/hooks/permissions,
  cancellation and error outcome. At most 200 requested lines and 16 KiB/200 text lines plus a notice;
  images stay intact, not byte-capped. Final output only; unbounded native details/structured copies are dropped.
  Choose another offset/native read for more. No recursive search, rg, shell interpolation, spill or archive.

## Explicit safety controls

`/repostew-protect <path>` adds a canonical write/edit-protected root; no argument lists roots. Relative paths
use the bound workspace. Matching includes existing ancestors/symlinks and new children, not string prefixes.
Reads remain allowed. `/repostew-confirm-shell on|off` toggles heuristic bash/user-bash confirmation; default off.
When on, denial or unavailable UI blocks. RPC requires working dialog forwarding; confirmation grants no authority.

Alternate tools, shell programs, hard links, races and unrecognized commands are not confined. No OS sandbox,
ACL/elevation, blanket .git/node_modules ban or automatic cleanup permission. [Storage](../storage.md) and
[security](../security.md) remain binding. Controls/goals are in-memory: session start/resume, branch navigation
and shutdown clear them; re-enable explicit controls as needed. Only base workspace binding is durable.
Compaction retains the current goal budget. No parallel state file, task ledger, queue or access log.

## Completion and lifecycle

Use agent_before_settle, not agent_end. Role contracts are explicitly prompt-marker scoped; C guidance acts only on supplied native scope/capacity/in-flight facts and cannot infer occupancy. Append a visible custom message, never fabricated user authority;
preserve other extensions' entries/continuations. Request at most **two** extra model calls per explicit goal,
stopping earlier for unchanged/missing reports. This caps this helper, not the host/other extensions' work.
No continuation after abort/error, failed tool activity, unavailable continuation or a reported real blocker.
Settlement clears the goal; later tool activity invalidates an earlier final report. At the limit record
unestablished completion, not success or redispatch. Normal native repair already underway is not interrupted.
A helper cannot repair missing authority/input, override real gates or compensate for micro-stage assignments;
original budgets, Worker engineering and Coordinator coverage obligations remain authoritative.

## Eight patterns and deliberate adaptations

- prompt-customizer: small structured sections, preserving native/base instructions.
- input-transform-streaming: distinguish deltas from fresh input; no prefetch/rewrite/rule reload.
- send-user-message: explicit user commands use native delivery; automatic reminders use custom entries.
- structured-output: constrained factual results without a terminating shortcut.
- protected-paths: explicit canonical roots rather than broad hard-coded substring bans.
- permission-gate: opt-in heuristics, no-UI denial, no implied permission.
- tool-override: separately named native wrapper, not a simplified replacement reader or access logger.
- truncated-tool: bounded native text rather than synchronous/interpolated shell scans and extra raw copies.

## Compatibility and validation

Uses Pi **1.3.0** contracts: structured prompt sections, streamingBehavior, executeTool's `{ result, isError }`,
boundary entries/canContinue/outcome and agent_settled. Host-supplied typebox is an optional peer, not bundled.
Verify other versions explicitly. OMP uses its separate entry. For T3, apply its
[Pi lifecycle mapping](t3.md#when-the-provider-is-pi); offline Pi tests are not hosted acceptance.

Run build-package.py, validate-package.py and
`node scripts/validate-pi.mjs <installed-pi-package-root> <bundle> <existing-test-output-directory>`.
Tests cover opt-in isolation, native loading/schema/prompt, loop bounds/blockers, abort/errors, branch/reset/
compaction, other boundary entries, deltas, canonical paths/links, no-UI/RPC confirmation and bounded reads.
An actual native read is exercised; RPC/error/limit responses use fixtures. No live model/provider tests.
