---
name: repostew
description: Assemble scoped Workers for repository discovery, audits, contribution follow-up and authorized maintenance across capable multi-agent harnesses with direct Markdown state.
---

# RepoStew

RepoStew supplies policy, work methods and Worker construction; harness supplies execution,
tools, permissions and lifecycle. Coordinator assembles/coordinates; Workers complete assigned work.
Load rules by role, task form and actual action: reuse complete current text, batch missing startup reads,
and load conditional methods before their action. Links are navigation, not recursive reading orders.
Continue by delta; unchanged usable rules need no reread. See [assembly](references/worker-assembly.md).
Policy/state belong to the selected [workspace](references/workspace.md), not the package or checkout.
Authorized multi-device [shared state](references/shared-state.md) uses one native project directory under
state/repositories/<host>/<namespace>/<repo>/: root state.md is shared coordination; work/ holds local
work.md, notes, checkouts and temporary material, all ignored by Git. No root work/ or second current record.
Roles: [Supervisor](roles/supervisor.md) for whole-system governance; [Coordinator](roles/coordinator.md),
[Worker](roles/worker.md), [Maintainer](roles/maintainer.md) for assigned execution.
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
   and [provision/dispose resources](references/storage.md): Workers preserve, Coordinators execute
   bounded cleanup after handoff, Supervisor governs capacity. No expanded deletion authority.

## Common contract

- All new [security findings](references/security.md) use private reporting only, never public issues;
  retain protected evidence/blockers when a private channel or disclosure authority is unavailable.
- Apply user-selected exclusions in the applicable [forge reference](references/forges/README.md)
  before selecting or continuing work; preserve existing objects/history and action authority.
- Establish scope/authority; no permission or task follows from roles, membership, history or installation.
  Serial by default; delegation, parallelism, schedules and external actions require authorization.
- Act from actual use/contracts and [quality standards](references/contribution-value.md), without invented
  defects or necessity. Prohibit defensive programming; trust internal contracts, retain necessary boundary checks.
- One writer per project: its Worker writes shared state.md and local work/work.md; Coordinator owns
  global membership/navigation/positions. Serialize Git publication separately; never crawl local work as state.
  Preserve unrelated, dirty/unpushed/unknown/private work and recovery material.
- Dispatch each assignment sufficiently once; authorized independent work uses available backend capacity
  before waiting and refills per completion, not per batch. Priority is not a barrier; explicit stage gates
  keep their named scope. Finite batches/turns are not full-scope completion. Follow [orchestration](references/orchestration.md)
  for each wake's action decision, capacity, descendant lifecycle and drain/pause/cancel. Summaries do not
  replace feasible dispatch; explicitly authorized heartbeats belong to the Supervisor. Completed tasks release default Worker/model
  binding; reuse valid evidence, with short same-task continuation only where context remains suitable.
  Continue by delta, trust usable finals;
  no routine receipts/progress/readback loops.
  Coordinator checks assignment/coverage, Worker checks engineering. Capture-only and metadata-only work
  do not trigger audit/tests/publication. Reuse applicable evidence; deepen changes, unknowns or concrete risks.
  Preserve target-required checks, permission/privacy gates, ambiguous-effect reconciliation and safe preservation.
- Use direct Markdown, no custom runtime/queue/claims/database. Report coverage, outcomes, unfinished work and
  resource release accurately; execution status alone never proves completion.
