# Codex

RepoStew also supplies a Codex CLI/local-app adapter: project-scoped native hooks
refresh the fixed contract and separate current facts, while read-only MCP tools
expose runtime/gh/OpenRig status. Configure the package's
`harnesses/codex/configure.mjs PROJECT_DIRECTORY PROFILE_JSON` explicitly; review
native hook trust and restart/reconnect before claiming activation. This preserves
other configuration, login, permissions and model choices. Runtime status must
distinguish server-registered tools from tools actually available in this session.
Search hooks reject common whole-state searches and replace oversized search
feedback without editing native history; use narrowly scoped native searches.
Native code mode/tool discovery and MCP configuration own tool selection and reload.
No Pi-style tool registry or continuation loop is emulated.

Codex Cloud/web needs its own execution-environment installation and authentication;
local files, localhost bridges and hook trust do not transfer. Supply the assembled
contract/current facts through the actual cloud task transport, report missing
capabilities honestly, and keep native task custody. T3-hosted Codex follows
[T3](t3.md), including its exposed tools and lifecycle.

Load the skill plugin; run the package's `scripts/configure-workers.py <workspace>` to create
a bound native Worker configuration. Pass its printed `agents.repostew_worker` CLI settings;
existing configuration and model/effort/permissions remain authoritative.

These capacity/close rules apply to Codex native spawn/follow-up/wait/close, not a host-owned backend
such as [T3](t3.md) merely because its provider is Codex. Use the actual backend's live limits and lifecycle.
Dispatch each assembled assignment once; eligible independent assignments may run concurrently.
Deliver only deltas on continuation; fill available authorized capacity before waiting.
`max_concurrent_threads_per_session` counts open spawned threads, including idle ones. Close unneeded
completed threads before refill; confirm cancellation/closure before assigning their writes elsewhere.
Native final delivery supplies the outcome; execution status alone never proves engineering completion.
Parent turn completion is not descendant termination. Use backend-confirmed writer/queued-stop facts
before replacement; do not assume closing a parent universally cancels children.

Native configuration: [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
