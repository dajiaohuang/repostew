# RepoStew

Portable repository stewardship for capable multi-agent harnesses: discovery, audits, contribution follow-up and authorized maintenance. Coordinators assemble scoped Workers;
state is direct Markdown, execution serial unless authorized otherwise.

[中文](README.md) · [Entry](SKILL.md) · [Website](https://dajiaohuang.github.io/RepoStew_skills/)

## All flows

1. Prepare outcome/scope/prior work/authority/resources. [Coordinator](roles/coordinator.md)
   uses [assembly](references/worker-assembly.md) and [templates](prompts/README.md) to assign
   [Workers](roles/worker.md), adding [Maintainer](roles/maintainer.md) for authorized management. [Harness](references/harness.md) supplies execution;
   [orchestration](references/orchestration.md) dispatches, waits, integrates, continues, hands off and recovers.
2. Select [discovery](references/work-forms/discovery.md), [new audit](references/work-forms/new-repository.md),
   [reassessment](references/work-forms/contribution-reassessment.md), [incremental feedback](references/work-forms/incremental-feedback.md)
   or [recurring patrol](references/work-forms/recurring-patrol.md). Capture/deduplicate
   [followed issues](references/workflows/followed-issues.md), [notifications/selected mail](references/workflows/notifications.md)
   and [open/unfinished objects](references/workflows/open-objects.md) under separate source positions.
3. [Trace actual use/documents](references/audit.md), prove [necessity](references/contribution-value.md),
   discuss ordinary unsettled contracts; every new security finding uses [private reports only](references/security.md), never public issues.
   Complete assigned audit coverage before grouped repair delivery.
4. [Repair, validate, publish](references/workflows/delivery.md) under [target/safety gates](references/safety.md);
   handle feedback, consolidate roots and withdraw within authority; [maintain](references/workflows/maintain.md)
   managed/self-owned repositories' issues, PRs, code, documents and CI/tests.
5. Write [minimal records/migrate when authorized](references/records.md),
   [reconcile/recover/reclassify history](references/workflows/history.md),
   [publish reviewed backup when requested](references/workflows/records-and-backup.md),
   [provision/dispose resources](references/storage.md). Separate coverage, delivery, resolution and release.

## Boundaries

- Apply [user-selected exclusions](references/forges/github/exclusions/agentscan.md) before selecting or continuing GitHub work; preserve existing objects/history without inferring withdrawal or deletion authority.
- Establish scope/authority; roles, membership, history and installation grant no permission or task.
  Serial by default; delegation, parallelism, schedules and external actions require authorization.
- Follow actual use/contracts and [quality standards](references/contribution-value.md), without invented defects/necessity.
  Prohibit defensive programming, trust internal contracts, retain necessary boundary checks.
- One writer per resource; Coordinator owns shared state, Workers repository records. Preserve unrelated/dirty/unpushed/unknown/private/recovery material.
- Dispatch sufficiently once, continue by delta, trust usable finals; no routine receipts/progress/readback loops.
- Direct Markdown, no custom runtime/queue/claims/database; report coverage, outcomes, unfinished work and resource release accurately.

## Use

Use the skill at workspace RepoStew_skills/ or the [Codex/Claude/Pi/OMP package](integrations/README.md).
Priority adapters: [Pi workspace binding](references/harnesses/pi.md) and [Codex native Workers](references/harnesses/codex.md); reuse official execution.
Keep state/, work/<owner>/<repo>/ and state/maintained-repositories.md in the selected workspace.
[Workspace rules](references/workspace.md) define membership, positions, repository records and disposable source.
Read SKILL.md and assign scope/authority. Verify actual harness capabilities; files never start jobs or schedules.

[MIT](LICENSE)
