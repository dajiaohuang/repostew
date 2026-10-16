# Recurring patrol work form

Input: authorized sources/positions, unfinished pass, existing cadence/activation and permitted concurrency.
Load [patrols](../patrols.md), selected source workflow and orchestration. Coordinator owns successive passes;
Workers receive finite [incremental batches](incremental-feedback.md), never unbounded watching.
A wakeup does not reload all rules or rerun unchanged engineering. Capture owners validate source coverage;
Workers handle assigned object deltas. Reuse completed capture and evidence, refresh volatile head/CI as needed.
Finish the same source/scope's unfinished pass before stacking a new one; independent complete batches
can run while other capture continues. Advance positions only under their own full capture/handling-or-retention
gates. Finite batches do not end a larger authorized selection; dispatch/refill before native waiting.
Preserve private/read/subscription boundaries and paused/retired jobs; cadence is not coverage evidence.
Apply [drain/pause/cancel semantics](../orchestration.md#drain-pause-cancel-and-replacement) when directed;
retain exact unfinished scope/blockers/retry. Missing capture is a targeted recovery task, not a blanket stop.
