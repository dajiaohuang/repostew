# Recurring patrol work form

Input: authorized sources/positions, unfinished pass, existing cadence/activation and permitted concurrency.
Load [patrols](../patrols.md), selected source workflow and orchestration. Coordinator owns successive passes;
Workers receive finite [incremental batches](incremental-feedback.md), never unbounded watching.
Finish unfinished pass first; advance independent positions after full capture/handling-or-retention.
Preserve private/read/subscription boundaries and paused/retired jobs; cadence is not coverage evidence.
Explicit drain/pause overrides refill; retain exact unfinished scope/blockers/retry.
