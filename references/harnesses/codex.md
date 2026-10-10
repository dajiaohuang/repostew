# Codex

Load the skill plugin; run the package's `scripts/configure-workers.py <workspace>` to create
a bound native Worker configuration. Pass its printed `agents.repostew_worker` CLI settings;
existing configuration and model/effort/permissions remain authoritative.

Use native spawn/follow-up/wait/close. Dispatch assembled scope once; deliver only deltas on continuation.
`max_concurrent_threads_per_session` counts open spawned threads, including idle ones. Close unneeded
completed threads before refill; confirm cancellation/closure before assigning their writes elsewhere.
Native final delivery supplies the outcome; execution status alone never proves engineering completion.

Native configuration: [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
