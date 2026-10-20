# Receive governance events in your harness

The execution service stores metadata events and per-window delivery receipts
in its existing SQLite file. A window subscribes explicitly. Closing it leaves
C/W running; events accumulate for its next connection. No new scheduler or
governance agent is created by this feature.

Default notifications: incidents, required reconciliation, admission/recovery
blocks, independent W results, and completed/blocked C domains. Use `results`
instead of `attention` in a binding only if every C/W result is wanted. Private
report bodies, owner prompts and provider error text are never pushed.

## Pi: native current-session wake

```powershell
rtk pi --extension /path/to/repostew/harnesses/pi/src/governance-pi.mjs
```

Inside that Pi window run `/repostew-listen`. The extension binds to its native
session ID and sends a custom message with `triggerTurn: true` and native
`followUp` delivery. The model calls `repostew_event_ack` to confirm arrival.
`/repostew-listen off` disconnects the observer only. Switching/forking sessions
also disconnects it, preventing delivery to the wrong conversation. Reconnect
with the same session to retain its cursor. This is an explicitly loaded
governance extension; do not add it to Worker launches.

For a deliberately auto-listening launch, set
`REPOSTEW_GOVERNANCE_SUBSCRIBE=1` in that process. Set
`REPOSTEW_GOVERNANCE_CONFIG` only when using a different service configuration.
No global Pi settings are changed by installation.

## Claude Code: native Channel

Create a session UUID and use that same UUID in `--session-id` and the MCP
entry's `--target`. For example, put this in a dedicated MCP config file,
replacing `YOUR-SESSION-UUID`:

```json
{"mcpServers":{"repostew-events":{"command":"rtk","args":["proxy","node","/path/to/repostew/harnesses/pi/src/governance-mcp.mjs","--claude-channel","claude-governance-1","--target","YOUR-SESSION-UUID"]}}}
```

```powershell
rtk claude --session-id YOUR-SESSION-UUID --mcp-config D:/path/repostew-mcp.json --dangerously-load-development-channels server:repostew-events
```

This is Claude's documented custom-channel development opt-in, which presents
a confirmation in an interactive session. It does not bypass organization
policy or tool permissions. It cannot be activated by silently adding an MCP
server to an already-running ordinary window. Do not use `-p` for this custom
channel opt-in: Claude ignores the development flag there.

The server advertises `claude/channel` and sends
`notifications/claude/channel`. It restricts negotiation to supported 2025
protocol revisions because Claude's documented v2 client does not register
channels on revision 2026-07-28. A successful transport write is not receipt:
the model must call `repostew_event_ack`. If the host drops a notification,
that batch stays visibly pending and is not blindly resent.

## Codex: existing App Server thread

Bind the endpoint exposed by the owning Codex host and the exact **loaded**
thread ID. This adapter does not attach to an arbitrary standalone CLI process,
create/resume another copy of its session, start a daemon, or change permissions.
Example binding JSON (replace both endpoint and thread ID):

```json
{"id":"codex-governance-1","harness":"codex","target":"EXACT-LOADED-THREAD-ID","endpoint":"ws://127.0.0.1:PORT","filter":"attention","from":0}
```

```powershell
rtk proxy node /path/to/repostew/harnesses/pi/scripts/listen.mjs D:/path/codex-binding.json
```

It verifies `thread/read`, then uses native `turn/start` with `toolOutput`.
Codex can queue this into an active turn. The returned native turn ID is the
delivery receipt; it does not claim that the model finished handling the event.
For an authenticated endpoint, add `"tokenFile":"D:/path/existing-token-file"`
to the binding. The adapter privately reads the existing capability or signed
bearer token and supplies the Authorization header. Do not paste its value into
the binding or chat. Expired tokens remain an authentication blocker; no secret
is generated or refreshed for an existing host. If the host does not expose an
endpoint, keep the binding inactive. Codex labels WebSocket transport experimental.

## T3 Code: native thread-send transport

When T3 Connect provides a native webhook, a binding may instead contain
`webhookUrlFile` pointing to the returned URL stored locally. Create the webhook
bound to the intended existing thread with an event-only trigger; it has no
interval and no next scheduled run. The listener posts only subscription,
delivery and target-thread IDs, never event/report bodies. The native webhook
turn verifies those IDs against the local pending record before acknowledging.
HTTP success alone does not advance the subscription cursor. Keep the URL file
private: the native URL token authorizes invocation.

Bind only the intended governance conversation; retain its delivery cursor when reconnecting.

T3 can deliver into its existing thread with native `t3_thread_send`, queued
mode, and a stable `clientRequestId`. Supply the host's supported local
`acp-mcp-call` transport and the exact T3 thread ID:

```json
{"id":"t3-governance-1","harness":"t3","target":"EXACT-T3-THREAD-ID","command":"PATH-TO-T3_ACP_MCP_NODE","args":["OPTIONAL-T3_ACP_MCP_ENTRYPOINT"],"env":{"ELECTRON_RUN_AS_NODE":"1"},"filter":"attention","from":0}
```

Omit the optional entrypoint from `args` when the standalone binary does not
use one. Credentials remain in the host's existing environment; never copy
them into this file. Run the same `scripts/listen.mjs` command with this file.
The adapter checks the returned target and message ID. It never creates a T3
thread, changes schedules, or interrupts an active turn.

An MCP tool being available to a model does **not** imply a background process
can call it. Without the host's supported local transport, this adapter remains
unbound. There is no reverse-engineered HTTP endpoint or terminal typing fallback.

## Delivery and recovery

Each subscription has one immutable harness/target binding, a cursor and at
most one pending batch. The service atomically claims a batch before sending.
Concurrent observers cannot send that batch twice. Disconnection before a claim
leaves events available for replay. Disconnection during/after sending leaves
the pending batch held until a native receipt or explicit reconciliation.
This trades automatic uncertain redelivery for avoiding duplicate model turns.

Inspect without changing anything:

```powershell
rtk proxy node /path/to/repostew/harnesses/pi/src/cli.mjs subscription SUBSCRIPTION-ID
```

MCP has the equivalent `repostew_subscription` tool. A Pi/Claude window can
acknowledge its received ID with `repostew_event_ack`. After separately checking
the exact target, an operator may submit a JSON file:

```json
{"id":"SUBSCRIPTION-ID","deliveryId":"EXACT-PENDING-ID","decision":"received","evidence":"Exact native message/turn receipt or target conversation evidence"}
```

```powershell
rtk proxy node /path/to/repostew/harnesses/pi/src/cli.mjs subscription-reconcile D:/path/decision.json
```

`retry` instead of `received` requires evidence of non-delivery. It makes the
same unconsumed events available again; an elapsed timeout is not such evidence.
Acknowledgement advances only this subscription's cursor. It never consumes
C events, closes incidents, resumes tasks or changes authority.

The read stream reconnects with bounded backoff; use `--stay-connected` to keep reconnecting after service downtime. A service restart is recovered by re-reading its local
control reference; secrets are not printed. No client owns a second task DB.

## Evidence and remaining host setup

- Real Pi RPC process: event-triggered model turn, exact acknowledgement tool
  receipt, and native owned-tree stop passed.
- Real Codex App Server: second-connection delivery to an existing loaded
  fixture thread returned a native turn ID. This proves acceptance, not completed
  governance handling or attachment to the user's current CLI window.
- Claude: official MCP SDK client verified Channel capability, notification,
  held-until-ack and subsequent receipt. Interactive Claude account/policy opt-in
  was not performed for the user.
- T3: native-call argument/receipt contract and event-only webhook delivery tested.

Sources: installed Pi 1.3.0 extension APIs and send-message example;
[Codex App Server](https://learn.chatgpt.com/docs/app-server);
[Claude Channels reference](https://code.claude.com/docs/en/channels-reference)
and [session opt-in](https://code.claude.com/docs/en/channels); the current
T3-owned `t3_thread_send` tool contract.
