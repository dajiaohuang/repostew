# Recurring patrol work form

Input: authorized sources/positions, unfinished pass, cadence/activation and permitted concurrency.
Coordinator loads [patrols](../patrols.md), the selected source workflow and orchestration for successive passes;
Workers receive complete finite [incremental batches](incremental-feedback.md), including direct publication, not timer briefs.
A frozen input window restricts recapture, not in-window engineering. Read-only S heartbeats are not patrol execution.
Capture owners establish source coverage; Workers reuse capture and inspect assigned head/feedback deltas.
Finish the same source/scope's unfinished pass before stacking another; independent complete inputs may proceed.
Advance positions only after their full capture and handling/reliable retention gates. A finite batch does
not finish the whole selection; refill before waiting. Missing capture needs targeted recovery, not a global stop.
Preserve private/read/subscription boundaries and paused/retired jobs; cadence is not coverage or authority.
Apply [stop semantics](../orchestration.md#drain-pause-cancel-and-replacement); retain unfinished scope and exact retry conditions.
