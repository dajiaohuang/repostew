---
name: repostew
description: Assemble scoped Workers for repository discovery, audits, contribution follow-up and authorized maintenance across capable multi-agent harnesses with direct Markdown state.
---

# RepoStew

RepoStew supplies policy, work methods and Worker construction; harness supplies execution,
tools, permissions and lifecycle. Coordinator owns whole-scope coordination only, with no approval or
engineering-acceptance authority; Worker owns a complete
bounded unit. Supervisor adds cross-domain governance only when assigned; serial work may combine roles.
Load rules by role, task form and actual action: reuse complete current text, batch missing startup reads,
and load conditional methods before their action. Links are navigation, not recursive reading orders.
Continue by delta; unchanged usable rules need no reread. Use one role contract and [five-field task](prompts/task.md);
forms add only input/coverage differences. See [assembly](references/worker-assembly.md).
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
   dispatch, wait, integrate, continue and hand off; use [bounded execution recovery](references/execution-recovery.md)
   for ordinary tool faults and missing setup, without erasing failures or bypassing true prohibitions.
2. **Select work:** [discover and process new repositories](references/work-forms/discovery.md),
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
   and [provision/dispose resources](references/storage.md): Workers establish delivery/preservation or
   abandonment facts, authorized execution owners release within their existing scope, Coordinators only
   coordinate ownership and record outcomes, and Supervisor governs capacity. Explicit loss acceptance
   may enable a [minimal-retention campaign](references/storage.md#minimal-retention-campaign); no inferred authority.

## Common contract

- All new [security findings](references/security.md) use private reporting only, never public issues;
  retain protected evidence/blockers without a private channel or disclosure authority unless explicit
  category/scope-specific abandonment applies; delivered local material follows [storage](references/storage.md).
- Apply user-selected exclusions in the applicable [forge reference](references/forges/README.md)
  before selecting or continuing work; preserve existing objects/history and action authority.
- Establish scope/authority; no permission or task follows from roles, membership, history or installation.
  Serial by default; delegation, parallelism, schedules and external actions require authorization.
- Act from actual use/contracts and [quality standards](references/contribution-value.md), without invented
  defects or necessity. Prohibit defensive programming; trust internal contracts, retain necessary boundary checks.
- One writer per project: its assigned writer writes shared state.md and local work/work.md; Coordinator owns
  global membership/navigation/positions and records resource outcomes from the authorized execution owner.
  Serialize Git only within one project/checkout/shared index; independent repository Workers publish directly.
  Workspace policy/shared-state Git alone uses its designated publisher. Never crawl local work as state. Preserve unrelated work and existing
  recovery material. Local retention follows [storage's three paths](references/storage.md#choose-the-release-path):
  delivered/preserved, explicitly abandoned, or retained with concrete blockers. Confidentiality is not
  permanent local retention; abandonment never substitutes for ownership or reporting authority.
- Use task isolation, whole-unit estimates and stage capacity checks, not mandatory hard quotas; preserve
  real user/platform limits and stop affected writes on ENOSPC. See [setup](references/execution-recovery.md).
- Assign complete bounded units once, not one tool/test step at a time. Workers advance feasible authorized
  stages through direct submission; Coordinators record reported delivery and scope/coverage, with no approval
  or engineering acceptance. Missing or contradictory facts return to the original Worker for explanation.
  Local patches or read-only inventories do not finish engineering. Follow [orchestration](references/orchestration.md)
  for act/wait/block/finish on active task/event turns, independent refill and stopped-writer handoff.
  [Event-driven refill](references/refill.md) is primary; the single authorized S heartbeat may route a deduplicated
  concrete gap to C only, never direct W, engineering, cleanup, file writes or new scope.
  A turn, structured reply or finite batch does not prove whole-scope completion. Reuse evidence/context
  where suitable without binding future units or resetting budgets. No receipts, routine readback or polling.
- Ordinary contribution units include direct Worker publication; no central publication gateway.
  Apply explicit user terms/signing authorization through the official process using true identity and facts;
  do not add Coordinator approval or fabricate required declarations.
- Code Workers prepare the test environment and run tests only when the target requires testing;
  otherwise proceed to submission. Autonomously agree to required terms/CLA/DCO using true facts.
  Submission completion records only “已投稿” and the link and releases capacity; no CI query, record or wait.
  Select checks by actual action: capture/metadata alone does not trigger audits/tests/publication.
  Preserve target-required checks, privacy/permission gates, mutation reconciliation and resource protection.
- Use direct Markdown, no custom runtime/queue/claims/database. Report coverage, outcomes, unfinished work and
  resource release accurately; execution status alone never proves completion.
