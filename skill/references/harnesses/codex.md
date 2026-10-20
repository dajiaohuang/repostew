# Codex

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
