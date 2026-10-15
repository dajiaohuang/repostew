---
name: repostew
description: Assemble scoped Workers for repository discovery, audits, contribution follow-up and authorized maintenance across capable multi-agent harnesses with direct Markdown state.
---

# RepoStew

RepoStew supplies policy, work methods and Worker construction; harness supplies execution,
tools, permissions and lifecycle. Coordinator assembles/coordinates; Workers complete assigned work.
Read applicable canonical files or complete current inline text; continue by delta.
Policy/state belong to the selected [workspace](references/workspace.md), not the package or checkout.
Roles: [Coordinator](roles/coordinator.md), [Worker](roles/worker.md), [Maintainer](roles/maintainer.md).
Wording: [prompts](prompts/README.md); native access: [harness](references/harness.md), [forges](references/forges/README.md).

## All flows

1. **Prepare and assemble:** establish outcome, scope, prior work, authority/resources;
   [assemble](references/worker-assembly.md) role/form/methods; [orchestrate](references/orchestration.md)
   dispatch, wait, integrate, continue, hand off and recover.
2. **Select work:** [discover/admit](references/work-forms/discovery.md),
   [audit new repositories](references/work-forms/new-repository.md),
   [reassess authored contributions](references/work-forms/contribution-reassessment.md),
   [handle incremental feedback](references/work-forms/incremental-feedback.md), or
   [run recurring passes](references/work-forms/recurring-patrol.md).
   [Capture followed issues](references/workflows/followed-issues.md),
   [notifications/selected mail](references/workflows/notifications.md), and
   [open/unfinished objects](references/workflows/open-objects.md); [configure patrols](references/patrols.md).
3. **Investigate:** [trace actual use/documents](references/audit.md), establish
   [contribution evidence](references/contribution-value.md), discuss evidenced unsettled
   contracts, or [investigate/disclose security privately](references/security.md).
4. **Deliver and follow up:** [repair, validate, publish](references/workflows/delivery.md)
   under [target/safety gates](references/safety.md); process feedback, consolidate or
   [withdraw within authority](references/reassessment.md). [Maintain](references/workflows/maintain.md)
   managed/self-owned repositories: triage issues, review/amend/merge PRs, audit and revise code/docs/CI/tests.
5. **Retain and finish:** update [minimal records; migrate only when authorized](references/records.md),
   [reconcile history/reclassify or recover](references/workflows/history.md),
   [publish reviewed backup](references/workflows/records-and-backup.md),
   and [provision/dispose resources](references/storage.md).

## Common contract

- All new [security findings](references/security.md) use private reporting only, never public issues;
  retain protected evidence/blockers when a private channel or disclosure authority is unavailable.
- Apply user-selected exclusions in the applicable [forge reference](references/forges/README.md)
  before selecting or continuing work; preserve existing objects/history and action authority.
- Establish scope/authority; no permission or task follows from roles, membership, history or installation.
  Serial by default; delegation, parallelism, schedules and external actions require authorization.
- Act from actual use/contracts and [quality standards](references/contribution-value.md), without invented
  defects or necessity. Prohibit defensive programming; trust internal contracts, retain necessary boundary checks.
- Keep one writer per affected resource: Coordinator owns shared state, Workers repository records.
  Preserve unrelated, dirty/unpushed/unknown/private work and recovery material.
- Dispatch sufficiently once, continue by delta, trust usable finals; no routine receipts/progress/readback loops.
- Use direct Markdown, no custom runtime/queue/claims/database. Report coverage, outcomes, unfinished work and
  resource release accurately; execution status alone never proves completion.
