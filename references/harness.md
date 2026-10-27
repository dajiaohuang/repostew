# Harness integration

Adapters: [Pi](harnesses/pi.md) with [optional extras](harnesses/pi-extras.md),
[Codex](harnesses/codex.md); hosted orchestration: [T3](harnesses/t3.md)
and [OpenRig native queue orchestration](harnesses/openrig.md).
Other skill-capable hosts use the same contract. RepoStew supplies policy/assignments, not a fixed vendor,
agent hierarchy or replacement execution backend. Keep API names, events, flags and version limits here
or in adapters, not generic roles, methods or templates.

## Capabilities depend on the selected work

- **Instructions/data:** accessible current rules and the actual policy/state workspace; bind the assigned
  project home, not merely cwd. Shared state.md is authoritative; local work/ is not inherited/published context.
- **Execution/permissions:** actual tools, modes, tool availability and required settings. Missing access or
  explicitly requested capability is a blocker; do not silently substitute or interpret approval mode as isolation.
- **Delegation/capacity:** actual backend, accepted/queued/occupied limits, release and descendant semantics.
  Model/provider identity does not select a backend. Parallelism, top-level conversations and jobs need authority.
- **Results/continuation:** map activity end, final settlement, owned task result and live descendants separately.
  Use events or supported waits; batch-only backends refill at batch return. Preserve original task scope/budgets
  through helpers, compaction and context transfer. Adapter-required result fields never create new work.
- **Stop/handoff:** map cancellation requests to actual writer/queued/process stop proof before replacement.
  A parent final is not descendant termination; a wait timeout is not a tool deadline. Check each API's units
  and interruption behavior. Close completed contexts only when the backend's lifecycle/capacity requires it.
- **Schedules:** use the native authorized scheduler, preserving activation/paused state. Manual work does not
  resume jobs. No watcher, receipt service or plugin pool to emulate unsupported orchestration.

## Context and workspace mapping

Apply [assembly](worker-assembly.md) and [orchestration](orchestration.md); do not restate their scheduling
policy in each adapter. Establish inheritance, shared access, result relay and continuation only when unknown
or changed. Keep credentials, models, quotas, cadence and identifiers in authorized workspace/host configuration.

## Limits and compatibility claims

Without delegation, combine responsibilities and execute serially where permitted; explicitly required
unsupported behavior remains blocked. No emulated backend or inferred permission. Source failure remains
unknown coverage; failed publication does not change destination. Portability is not certification:
verify the actual loading, instructions, tools/permissions, result/stop behavior and state/source operations
needed by the assignment. Optional helpers need explicit enablement; do not hot-reload active writers.
