# Pi examples first

Implementation baseline: installed `@earendil-works/pi-coding-agent` **1.3.0**.
The reviewed upstream source hashes and adaptations are recorded in
[src/pi/SOURCES.json](src/pi/SOURCES.json); copied code retains the upstream MIT
[license](src/pi/LICENSE). The running service does not import or upgrade examples
automatically. `scripts/import-pi-examples.mjs` is an explicit maintainer operation.

| Mechanism | Pi implementation used | Project adaptation |
| --- | --- | --- |
| TODO and `/todos` UI | `examples/extensions/todo.ts`, copied to `src/pi/todo.ts` | Read old `harness_plan` tool results on the active branch as initial items. No mandatory stages or evidence/checkmark gate. |
| Session recovery | `examples/sdk/11-sessions.ts`, native `SessionManager.open().getBranch()` | Keep the existing assignment/session paths. Host status stores only a display projection. |
| Final structured output | `examples/extensions/structured-output.ts` | Keep the repository result fields and authenticated report endpoint; successful tool results return `terminate: true`. Rejected reports remain correctable. |
| Roles and tools | `examples/extensions/subagent/agents.ts`, native `parseFrontmatter` | Load only `agents/coordinator.md` and `agents/worker.md`; no global agent discovery. Model selection remains the campaign's explicit routing policy. |
| RPC transport | `examples/rpc-client.ts` and its native `RpcClient`/JSONL implementation | Inject the existing Windows-owned process launcher/stopper, configurable request timeout and bounded local stderr display. No custom request/JSONL implementation. |
| Messages and turn lifecycle | `examples/extensions/send-user-message.ts` semantics; native RPC `prompt`, `steer`, `followUp`, `clearQueue`, `abort`, `agent_settled` | C1 receives deduplicated project result events; W receives same-session deltas. No extra agent loop or custom compactor. |
| Model, auth, compaction, coding tools | Pi CLI/runtime | Use existing Pi configuration/auth; task-private cache environment, role tool lists, no shared settings changes. |

## Multi-C and cross-harness governance

Multiple C and independent W reuse the same Pi implementation above: explicit
role files, independent SessionManager paths, RpcClient transport, native
prompt/steer/abort/clearQueue, agent_settled events and structured termination.
There is no separate C or governance model loop, memory system or compactor.

The shared service adds only workspace execution responsibilities: coordinator
scope, durable event routing, fair shared capacity, global project reservations,
idempotent management commands and bounded recovery. The single heartbeat routes
existing gaps to C; it neither creates W assignments nor renews authority.

The external governance entry uses official MCP TypeScript SDK **2.3.1** stdio
and one shared typed command schema for MCP/CLI/HTTP. Clients hold no execution
database and never inherit C/W capabilities. Closing a governance client leaves
the service running. It can be invoked from any local MCP or shell-capable host.

References reviewed for design (not extra execution dependencies):

- Pi 1.3.0 `examples/extensions/subagent/index.ts`: separate process/context per
  role and explicit tool/model selection. Durable reservations and Windows-owned
  stopping remain the existing project adapter.
- [Codex app-server](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md):
  distinguish durable session identity from a running turn, correlate commands
  and asynchronous lifecycle notifications. Pi implements these runtime pieces here.
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents):
  explicit role/tool boundaries, independent contexts and preserved session recovery.
- [Official MCP SDK](https://ts.sdk.modelcontextprotocol.io/v2/): `McpServer`,
  `serveStdio`, schema validation and client transport; no custom JSON-RPC stack.

## Project adapters

The coordinator uses the same native Pi role loader, SessionManager, todo
extension, RPC queue and terminating structured-output mechanism as Workers.
Its wake and `harness_status` tool share a current-facts view: capacity, scope,
provider gates and event counts. Host copies of historical task results,
coordinator results and TODOs remain available to the operator UI but are not
fed back as a parallel agent memory. Pending result events retain exact run IDs
and evidence. Pi owns conversation restoration and compaction; no custom C
summary, memory database or compactor is introduced. Migration instructions
remain in the system contract rather than being repeated in every C wake.

Pi examples do not implement a durable finite repository campaign, weighted
provider scheduling, native project ownership, forge suitability, publication
policy or Windows descendant-stop receipts. Those remain explicit adapters in
`engine.mjs`, `routing.mjs`, `scope.mjs`, `forge.mjs`, `server.mjs`, `store.mjs` and
`owned_process.py`. They are not claimed to be Pi-native features.

The execution database retains assignments, dispatch reservations, result events
and stop evidence. It no longer owns the TODO state. Old plan data remains as
history; it is never rewritten or used to gate tools or completion. Native todo
tool-result details in the active Pi branch are authoritative. A branch switch
restores that branch's checklist; clearing the native checklist does not revive
the old one. Host `todoSnapshot` fields are disposable display projections.

## Verification and upgrades

`npm test` exercises the real Pi extension loader and SessionManager for branch
recovery, legacy migration and clear, plus structured result termination and role
loading. Existing tests retain capacity/refill, same-task continuation, Stop,
unknown-write and native Windows process-tree checks.

`npm run acceptance` uses real Pi C1 and both configured providers on six local
read-only fixture tasks, with two concurrent Workers. It checks actual fixture
values, example todo actions, result integration, provider distribution and stopped
trees. It does not establish repository engineering or hosted-CI acceptance.

For future customization: identify the corresponding Pi example or native API
first, then document the minimal project adaptation here. Do not add a separate
state machine when Pi already supplies the session/tool/queue behavior.
