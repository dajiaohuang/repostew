# RepoStew

Repository maintenance for capable multi-agent harnesses. Coordinators assemble scoped Workers;
state is direct Markdown, execution serial unless authorized otherwise.

[中文](README.md) · [Entry](SKILL.md) · [Website](https://dajiaohuang.github.io/RepoStew_skills/)

## All flows

1. Prepare outcome/scope/prior work/authority/resources. [Coordinator](roles/coordinator.md)
   uses [assembly](references/worker-assembly.md) and [templates](prompts/README.md) to assign
   [Workers](roles/worker.md). [Harness](references/harness.md) supplies execution;
   [orchestration](references/orchestration.md) dispatches, waits, integrates, continues, hands off and recovers.
2. Select [discovery](references/work-forms/discovery.md), [new audit](references/work-forms/new-repository.md),
   [reassessment](references/work-forms/contribution-reassessment.md), [incremental feedback](references/work-forms/incremental-feedback.md)
   or [recurring patrol](references/work-forms/recurring-patrol.md). Capture/deduplicate
   [followed issues](references/workflows/followed-issues.md), [notifications/selected mail](references/workflows/notifications.md)
   and [open/unfinished objects](references/workflows/open-objects.md) under separate source positions.
3. [Trace actual use/documents](references/audit.md), prove [necessity](references/contribution-value.md),
   discuss evidenced unsettled contracts, or [investigate/disclose security privately](references/security.md).
   Complete assigned audit coverage before grouped repair delivery.
4. [Repair, validate, publish](references/workflows/delivery.md) under [target/safety gates](references/safety.md);
   handle feedback, consolidate roots and withdraw only within authority. Prefer regular Open PRs;
   no qualifying finding is valid completion.
5. Write [minimal records/migrate when authorized](references/records.md),
   [reconcile/recover/reclassify history](references/workflows/history.md),
   [publish reviewed backup when requested](references/workflows/records-and-backup.md),
   [provision/dispose resources](references/storage.md). Separate coverage, delivery, resolution and release.

## Boundaries

- Real errors only; prohibit defensive programming, trust internal contracts, fix at source, retain necessary boundary checks.
- Read applicable canonical files or provide complete inline text; roles/ owns responsibilities, prompts/ wording,
  [forges/](references/forges/README.md) native CLI mappings and scoped repository rules. No copied policy/all-methods prefix.
- Worker writes repository records, Coordinator shared state; one writer. Required reassessment precedes new-audit refill.
- Explicit authority for parallelism/schedules/public actions/withdrawal/cleanup; preserve dirty/unpushed/unknown/private/recovery material.
- [Cadence](references/patrols.md) is not coverage. Keep paused jobs paused, mail selected/private, read/subscriptions unchanged.
- Reuse evidence/run necessary checks; no routine progress/readback loops or added PR-review stage. Resource checks grant no deletion rights.

## Use

Use the skill at workspace RepoStew_skills/ or the [Codex/Claude/Pi/OMP package](integrations/README.md).
Priority adapters: [Pi workspace binding](references/harnesses/pi.md) and [Codex native Workers](references/harnesses/codex.md); reuse official execution.
Keep state/, work/<owner>/<repo>/ and MAINTAINED_REPOSITORIES.md in the selected workspace.
[Workspace rules](references/workspace.md) define membership, positions, repository records and disposable source.
Read SKILL.md and assign scope/authority. Verify actual harness capabilities; files never start jobs or schedules.

[MIT](LICENSE)
