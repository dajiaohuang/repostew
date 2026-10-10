---
name: repostew
description: Assemble scoped Workers across capable multi-agent harnesses for repository discovery, audits, contribution reassessment, incremental feedback and recurring patrols with direct Markdown state.
---

# RepoStew

Harness supplies execution/tools; this skill supplies policy and Worker construction.
Read applicable files or complete current inline text; refresh only missing/changed
rules and volatile facts. Operational paths use the authoritative workspace root;
links use their containing file. Templates grant no authority.

## All flows

1. **Prepare and assemble:** establish outcome, scope, prior work, authority/resources;
   read [workspace](references/workspace.md), [Coordinator](roles/coordinator.md) or
   [Worker](roles/worker.md). Use [assembly](references/worker-assembly.md),
   [templates](prompts/README.md), [harness capabilities](references/harness.md) and
   [native forge CLI mappings](references/forges/README.md).
   [Orchestrate](references/orchestration.md): dispatch once, wait, integrate; continue
   by delta, hand off only after the prior writer ends, recover only concrete faults.
2. **Select work:** [discover/admit](references/work-forms/discovery.md),
   [audit new repositories](references/work-forms/new-repository.md),
   [reassess authored contributions](references/work-forms/contribution-reassessment.md),
   [handle incremental feedback](references/work-forms/incremental-feedback.md), or
   [run recurring passes](references/work-forms/recurring-patrol.md).
   [Capture followed issues](references/workflows/followed-issues.md),
   [notifications/selected mail](references/workflows/notifications.md), and
   [open/unfinished objects](references/workflows/open-objects.md) under separate positions.
3. **Investigate:** [trace actual use/documents](references/audit.md), establish
   [contribution evidence](references/contribution-value.md), discuss evidenced unsettled
   contracts, or [investigate/disclose security privately](references/security.md).
   Finish assigned audit coverage before grouped repairs; zero findings is valid.
4. **Deliver and follow up:** [repair, validate, publish](references/workflows/delivery.md)
   under [target/safety gates](references/safety.md); process feedback, consolidate or
   [withdraw within authority](references/reassessment.md). Prefer regular Open PRs;
   no companion issue or separate pre-publication review stage is required.
5. **Retain and finish:** update [minimal records; migrate only when authorized](references/records.md),
   [reconcile history/reclassify or recover](references/workflows/history.md),
   [publish reviewed backup](references/workflows/records-and-backup.md) only when requested,
   and [provision/dispose resources](references/storage.md) after every repository pass.
   Distinguish coverage, delivery, resolution and released/retained/failed resources.

## Mandatory boundaries

- Ordinary repair: supported use/calls -> concrete error -> violated contract;
  documentation: verifiable existing error. CI, cosmetic improvement and hypothetical
  risk do not qualify. Unconfirmed behavior needs discussion, not a repair verdict.
- [Implementation](references/contribution-value.md#code-implementation-prohibit-defensive-programming):
  prohibit defensive programming; trust internal contracts, fix at source, retain
  necessary external-boundary validation and contracted failures.
- Apply [suitability](references/suitability.md) and configured filters only.
  [Forge/repository rules](references/forges/README.md) stay scoped and
  outside shared prompts. Preserve dirty/unpushed/unknown/private work and recovery material.
- Serial by default; delegation/parallelism/schedules require authorization.
  Coordinator writes shared state, Worker writes its repository records; defer conflicts.
  Finish required reassessment before new-audit refill; complete the full selected scope.
- Trust usable final results; no routine progress/readback/retest loops. Direct Markdown
  only: no custom runtime, queue, claims, receipts or database. No inferred public/cleanup authority.
- [Patrol settings](references/patrols.md) remain in the scheduler; preserve paused jobs,
  selected-mail privacy, read/subscription state and exact positions. Reading is not resolution.
  Resource checks grant no cleanup authority; disposable release excludes self-owned repositories.
