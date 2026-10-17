# Pi optional extras

RepoStew implements eight selected Pi example patterns as a small opt-in extension, not eight copied
plugins. Base binding stays in `extensions/pi.js`; enhancements live in `extensions/pi-extras.js`.
Only the base is in the package's Pi autoload manifest. Installation alone does not enable extras.
These are original RepoStew adaptations of the [official examples](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions), inspected with Pi 1.3.0.

## Load and use

From a built bundle, try one invocation without changing settings:

```sh
rtk pi -e ./dist/repostew -e ./dist/repostew/extensions/pi-extras.js
```

Bind `/repostew-workspace <directory>` first. The base `/repostew <task>` remains available without
extras. Tools and commands below require the extra entry; loading it starts no task or background work.
Do not copy the entire upstream examples directory into an auto-loaded extension directory.
The package's resource filters cannot expose an undeclared optional entry; load its exact file with `-e`.

- `/repostew-goal <authorized finite task>` starts one task with an end-of-run completion check.
- `/repostew-goal-stop` disarms that check only. Use the host Stop/cancel mechanism to interrupt tools
  or stop descendants; this command neither cancels work nor grants a replacement writer.
- `/repostew-steer <same-task delta>` and `/repostew-followup <same-task delta>` use native message
  delivery. They do not prepend the skill or reset continuation budgets. New ordinary external input
  disarms an old goal; explicitly queued steering/follow-up preserves its budget.
- `repostew_result` reports schema-declared structured output (`structuredContent`) as `complete`,
  `blocked` or `continue`, with summary, evidence references,
  remaining work, exact blocker and resource-handoff facts. It does not write state.md or terminate a
  model turn. A complete claim needs evidence and no remaining work/blocker; blocked needs a blocker;
  continue needs remaining work and no blocker. These are shape/consistency checks, not independent
  verification that evidence is true or acceptance criteria are satisfied. Keep protected bodies out.
- `repostew_read` delegates one explicit file/range to native `read` through `ctx.executeTool`, retaining
  native tool validation/hooks/permissions and cancellation. It requests at most 200 lines and shows at
  most 16 KiB/200 lines of text, plus a truncation notice. Images remain intact, not byte-capped. It
  returns a final result rather than forwarding partial text, drops unbounded native details/structured
  copies, and retains the native error outcome. Use native read or another explicit offset for more.
  There is no recursive search, bundled rg, shell interpolation, spill file or full-output archive.

## Explicit safety controls

- `/repostew-protect <path>` adds a write/edit-protected path. Relative paths resolve from the bound
  policy/state workspace, not an arbitrary current checkout; no argument lists the current roots.
  Matching uses canonical paths, existing ancestors and path boundaries, including a new file under
  a symlink. Merely sharing a string prefix does not match. Read is not blocked.
- `/repostew-confirm-shell on|off` toggles a heuristic confirmation for selected risky bash commands
  and native user-bash escapes. It starts **off**. When on, missing UI or rejection blocks; supported
  RPC confirmation is required for an RPC client. A positive UI answer does not expand task authority.

These are accident-prevention aids, **not a sandbox**: alternate tools, shell programs, hard links,
filesystem races and unrecognized commands are not confined. No new ACL, elevation or OS isolation is
provided. There is no default blanket `.git`/`node_modules` ban and no automatic deletion approval.
[Storage authority](../storage.md), [security/privacy](../security.md), role ownership and native permissions
still apply. User input cannot waive another project's writer, preservation, or private-channel gate.

Controls and the active goal are local to the current native session in memory. Session start/resume,
branch navigation and shutdown clear them; they are not restored from old branches or rearmed after a
restart. Re-enable explicit safety controls as needed. Base workspace binding alone remains durable.
Compaction does not reset the active goal's budget. No separate queue, goal file, task ledger or log is created.

## Completion and lifecycle

The check uses **agent_before_settle**, never agent_end. It appends a visibly labeled custom message,
not a fabricated user instruction, and preserves other extensions' proposed boundary entries.
At most **two** additional model requests can be requested for that explicitly started goal. An unchanged
report/missing report stops earlier. Other queued/native continuations are not overwritten or double-counted.
The limit bounds only RepoStew's extra requests, not the host's whole task or other extensions.

Do not continue after abort, error, failed tool activity, unavailable native continuation, or a reported
real blocker. Stop/settlement clears the goal. Exhausting the check records that completion is unestablished;
it never marks the task complete or automatically redispatches. Later tool activity invalidates an earlier
final report. Normal native repair already underway is not interrupted by this helper.

The helper cannot fix an incomplete assignment, missing capture, genuine external gate or a Supervisor's
micro-stage authorization. Original task/failure budgets and whole-mandate decisions remain authoritative.
A model can still omit or misreport facts; normal Worker engineering and Coordinator coverage duties remain.

## Eight patterns and deliberate adaptations

- `prompt-customizer.ts`: structured, small prompt sections; keep native sections and existing base binding.
- `input-transform-streaming.ts`: distinguish streaming deltas from fresh input; no Git prefetch, rule reload,
  input rewrite or budget restart during steering/follow-up.
- `send-user-message.ts`: explicit user delta commands use native delivery; automatic checks use custom entries.
- `structured-output.ts`: constrained factual results, without the example's `terminate:true` shortcut.
- `protected-paths.ts`: explicit canonical protected roots instead of broad hard-coded substring bans.
- `permission-gate.ts`: optional heuristic confirmation, no-UI denial, no inference of new authority.
- `tool-override.ts`: a separately named native-tool wrapper rather than replacing builtin read or copying
  a simplified reader that loses image/error/permission behavior; no access log.
- `truncated-tool.ts`: bounded native-read text instead of interpolated rg shell commands, synchronous scans,
  large output buffers and unrequested temporary copies.

## Compatibility and validation

Requires the Pi 1.3.0 API contracts used here: structured prompt sections, streamingBehavior, nested
`executeTool` returning `{ result, isError }`, boundary entries/canContinue/outcome and agent_settled.
The loader supplies `typebox`; it is an optional host peer, not a bundled runtime dependency.
Other Pi versions need explicit verification. OMP uses its separate entry and does not load these extras.

In [T3](t3.md), T3 still owns tasks, cancellation, queues and schedules. Verify its actual Pi runtime,
exact extension loading, command routing, RPC UI support and final settlement handling before enabling.
The local npm installation's version and offline tests do not prove the live T3 provider's compatibility.
Do not hot-reload running C/W, reinterpret agent_end as completion, create a Pi subagent backend, or
change model routing/permissions to make this helper work. Unsupported hosts keep the base integration.

Maintainers run `scripts/build-package.py`, `scripts/validate-package.py` and
`node scripts/validate-pi.mjs <installed-pi-package-root> <bundle> <existing-test-output-directory>`.
The Pi suite includes the extra-entry tests: base opt-in isolation, native loading/prompt preservation,
bounded continuation, stable reports/real blockers, abort/error/compaction/branch/reset behavior,
other-extension boundary entries, deltas, canonical protected paths/links, no-UI/RPC confirmation,
and nested read limits/Unicode/images/errors/cancellation. Tests make no model/provider calls;
RPC dialogs and nested error/limit responses are controlled fixtures; an actual native read is also
exercised. Neither constitutes a live T3 acceptance claim.
