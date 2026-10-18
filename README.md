# RepoStew

**Automated repository maintenance for coding agents: discover repositories, investigate real problems, deliver fixes, and keep following the work through review and resolution.**

RepoStew is a portable Skill for multi-agent harnesses. It defines how agents select work, audit code and documentation, handle issues and pull requests, respond to feedback, and maintain authorized repositories over time. It also defines what agents must skip, keep private, preserve, or leave blocked.

[中文](README.zh.md) · [Website](https://dajiaohuang.github.io/repostew/) · [Skill entry](SKILL.md) · [Harness packages](integrations/README.md)

## How automation works

An agent harness supplies execution, tools, permissions, native delegation and scheduling. RepoStew supplies maintenance policy, work methods, role definitions and assignment templates. With an authorized assignment and the required access, an agent can carry a bounded maintenance task from discovery through investigation, repair, publication and follow-up. Authorized recurring jobs can resume this work from saved Markdown records.

Installing the Skill does not start a daemon, create jobs, enable parallel agents, grant maintainer rights or authorize public actions. One-off work and recurring maintenance use the same rules; actual capabilities must be verified in the selected harness.

- **Supervisor, when assigned:** governs cross-domain policy, capacity and concrete execution anomalies through domain owners.
- **Coordinator:** selects, assigns complete units, checks actual submission and refills; owns shared positions and stopped-writer disposition, not a second engineering review.
- **Worker:** starts and completes setup, engineering, checks and direct submission; returns actual delivery or an evidenced no-delivery disposition, not a read-only inventory.
- **Maintainer:** adds explicit repository-management rights to a Worker, not another mandatory agent or stage.

Execution is serial by default and may combine role responsibilities. Authorized parallel Workers handle distinct repositories, with one writer per repository and serialized shared-state edits. See [roles](roles/coordinator.md), [Worker assembly](references/worker-assembly.md), [orchestration](references/orchestration.md), [harness capabilities](references/harness.md) and [Maintainer authority](roles/maintainer.md).

## What RepoStew does

### 1. Prepare and assemble the assignment

Establish workspace/identity, full outcome and scope/base, prior work, permissions and resources. Read access rules before content and action gates before engineering/publication.

Use one [C contract](roles/coordinator.md) or [W contract](roles/worker.md) and one [five-field task](prompts/task.md): object/outcome, location/prior work, complete TODO, authority/resources, finish/return. Five forms supply only input/coverage differences. Give realistic whole-unit limits, not tool-by-tool approvals or cost-only preparation. Roles/templates grant no authority.

C checks actual delivery evidence without routine readback/retests. A feasible unpublished repair returns to its W for submission; execution faults go to recovery, not a central publisher. Valid no-finding/duplicate/already-fixed outcomes need no invented PR. Only explicit inspection/capture work ends at inspection; unresolved engineering retains its owner and next condition.

Reuse current instructions/evidence, batch missing reads and load methods on action triggers. Leaves need their boundaries, not global briefs; links and new turns do not require full reloads. Metadata/capture alone does not trigger engineering. Keep affected/mandatory checks and privacy, mutation, publication and storage gates; no second engineering acceptance.

Active task/event turns follow [orchestration](references/orchestration.md); the single authorized heartbeat only routes concrete missed refill to C. For active work, act on eligible work, wait for actual in-flight work, retain exact blockers, or establish full-scope completion. Refill independent units as results arrive; named stage gates do not freeze unrelated work. A turn, report or batch is not whole-scope completion or descendant-stop proof.

Reuse suitable context for same-task deltas; select later units by capability/capacity, not permanent Worker/model binding. Transfer only after affected writers stop and uncertain effects reconcile; preserve evidence, budgets and paused schedules. Host-specific lifecycle details stay in [adapters](references/harness.md).

### 2. Discover and process new repositories

The Coordinator reads specified sources, extracts identities, checks exclusions/suitability and existing work/writers, and records eligible new candidates through the list writer. It directly assigns each ready repository to one new-audit Worker for complete initial coverage, repair, checks and stated delivery. There is no discovery-only Worker or whole-source admission gate; refill within capacity as candidates become ready.

Trending and awesome-list discovery can use workspace-approved windows, seeds and linked lists/search/topics. List expansion is bounded and detects cycles; it does not recursively traverse ordinary projects' dependencies. C does not clone, build or audit to screen candidates. The combined task includes new-repository work with explicit delivery actions; membership alone grants no following or management rights. Source coverage and repository outcomes are both required; an explicitly intake-only task remains limited.

See [discovery form](references/work-forms/discovery.md) and [discovery procedure](references/workflows/discovery.md).

### 3. Audit a new repository

Inspect target policy, suitability, current base and the assigned issue window. Fully paginate issues, exclude PRs, classify newest-created issues first, and investigate affected supported use, contracts, documentation, duplicates and existing fixes.

An explicit window wins. Otherwise the default window narrows from 90 to 30 to 7 days when each exceeds 100 issues; seven days is the minimum, and its entire window is processed even above 100 issues. An explicit whole-source audit remains whole-source scope.

Complete assigned classification and actual-use/documentation coverage; independently proved and validated repairs may publish before unrelated audit work finishes. Group common-root errors, separate independent errors, reuse matching objects and discard non-defects. Zero qualifying findings is a valid result. Keep incomplete feasible work listed; completed audit coverage with pending review or CI becomes unresolved follow-up.

See [new-audit form](references/work-forms/new-repository.md), [new-repository procedure](references/workflows/new-repository.md) and [audit method](references/audit.md).

### 4. Reassess existing contributions

Review assigned authored issues and PRs against current code, feedback, base/head and current-head CI. A whole-repository reassessment captures authored objects across all states plus authoritative unfinished links; targeted feedback retains its bounded object set. Comments are not authorship, and truncated or inaccessible searches are not empty coverage.

Keep and repair useful work; correct unsupported claims; consolidate duplicates; retain evidenced contract questions or access blockers. Withdraw unnecessary, incorrect, superseded or scoped-rejected authored open objects only within withdrawal authority. Preserve merged work and others' objects. Pending or cancelled CI alone proves neither failure nor grounds for withdrawal.

See [reassessment form](references/work-forms/contribution-reassessment.md) and [reassessment decisions](references/reassessment.md).

### 5. Handle incremental feedback

Capture new feedback and finite repository batches, deduplicate native objects, and investigate changed or unresolved paths. Respond substantively on the native engineering object when needed; update an existing repair instead of publishing a duplicate. Reuse unchanged evidence and checks, retain exact blockers, and avoid repeating a whole audit for each notification.

Sources include [notifications/selected mail](references/workflows/notifications.md), [followed new issues](references/workflows/followed-issues.md), [open/unfinished objects](references/workflows/open-objects.md) and explicitly supplied feedback or maintenance requests. See the [incremental-feedback form](references/work-forms/incremental-feedback.md).

### 6. Maintain authorized repositories

For managed or self-owned repositories, establish authority from the explicit assignment or workspace `state/maintained-repositories.md`, then verify live rights and repository settings.

- **Issues:** classify, answer, link duplicates, close with a factual reason, or implement a warranted repair within assigned scope.
- **PRs/MRs:** review current changes, request revisions, append necessary commits when branch-edit rights permit, and merge when assigned authority, settings, required checks and approvals permit.
- **Code and documentation:** audit actual use and documented behavior; make minimal compatible revisions and correct existing errors.
- **CI and tests:** retain supported-use coverage and essential checks; authorized quality maintenance can remove excess without inventing a defect. Never remove necessary checks to hide failures.

Maintenance uses the existing five forms; it is a role and method, not a sixth form. Per-object maintenance does not impose a whole-repository audit or a universal extra pre-publication review stage. See [maintenance procedure](references/workflows/maintain.md).

### 7. Repair, validate, publish and follow up

For an ordinary repair, establish the supported trigger, observed error, violated contract, intended correction and smallest complete compatible change. Run affected behavioral checks and target-required validation. Confirm current target rules, competing work, base/head and the permitted publication route before writing publicly.

Prefer a regular Open PR when the gates pass. Drafts retain the same necessity gate; they do not bypass invitation or submission restrictions. No compulsory companion issue or additional routine approval stage is added. Keep the existing object's feedback, CI, revisions and final disposition connected through native links.

Each repository Worker completes bounded dependency setup, affected checks and direct PR/MR publication; a delivery-backlog role only recovers overlooked idle work, not every Worker's output. Submit before CLA/DCO prechecks and report actual signing requests without signing for the user. A PR-only refusal permits one evidenced issue/comment request where discussion remains allowed, never around an all-contact or AI prohibition.

See [delivery](references/workflows/delivery.md), [contribution standards](references/contribution-value.md) and [publication gates](references/safety.md).

### 8. Record, reconcile and finish

Write material changes to current repository state and short actual-delivery history. Retain unresolved links, reasons and retry conditions. Reconcile history, recover or reclassify only within assigned scope; migrate or back up records only when requested. Apply resource disposition to resources used or explicitly assigned, including blocked or unchanged work; omit empty checks when no resources are involved.

See [records and migration](references/records.md), [history/reclassification/recovery](references/workflows/history.md), [reviewed backup](references/workflows/records-and-backup.md) and [resource disposition](references/storage.md).

## Recurring maintenance

The [recurring-patrol form](references/work-forms/recurring-patrol.md) uses three complementary entry points. These are configurable baselines, not automatically installed or active schedules.

| Entry point | Baseline | Behavior and boundary |
| --- | --- | --- |
| Notifications + selected mail | Every hour | Independent source positions; deduplicate engineering objects and handle them on their native forge. Read only the explicitly selected mail account/folder. |
| Followed new issues | Every 6 hours | Scan the deduplicated union of followed groups, fully capture the creation-time window, and assign nonempty repository batches. |
| Open/unfinished-object fallback | Every 24 hours | Inspect authored/commented open issues, authored open PRs and every authoritative unfinished link, including nonmembers and closed/merged-but-unfinished objects. Start with lightweight live metadata/head/CI. |

Resume the same source/scope's unfinished pass before stacking a new one. Complete independent repository inputs can proceed while other capture continues; full position-advancement gates remain. Recover missing capture locally first, then fill failed or unrecoverable gaps within original authority; do not repeat complete windows. Deepen changed, unknown or feasible unresolved work; do not stack duplicate scans, clones, tests or audits. Fallback does not rescan mail or expand into all historical new issues.

Advance each source only through completely captured and handled or reliably retained work. Preserve exact native IDs, revisions, UTC windows and boundaries. Source failure or ambiguous ordering preserves its last confirmed position; reading is not resolution. Scheduling changes never resume paused or retired jobs. See [patrol configuration](references/patrols.md).

## Filtering and admission boundaries

### User-selected exclusions

Apply the configured [GitHub exclusions](references/forges/github/exclusions/agentscan.md) before discovery/admission, audits, reassessment, feedback, patrol and publication. The current policy distinguishes exact owner exclusions from exact owner/repository exclusions, case-insensitively. It does not expand to a participant's employer, an adopter's unrelated repositories or another forge. A later explicit assignment may grant a scoped exception.

Exclusion stops new work in scope; it does not erase membership/history or authorize closure, withdrawal, deletion or unsubscription. Public-adoption evidence does not establish private installations or undisclosed users. The exclusion reference records sources and collection boundaries; it is a user cooperation preference, not a claim of malicious behavior or an upstream AI ban.

### Suitability for external contributions

Apply [suitability rules](references/suitability.md) remotely before admission/new audit; unknown remains pending.

- **Resource, awesome, bibliography, prompt, configuration and document collections:** skip only explicit refusal of external PRs or a forbidden submission method. Inactivity, lack of software maintenance or no observed outside merges alone does not disqualify them. Archived/read-only/unavailable without refusal retains a concrete blocker.
- **Other targets:** skip evidenced archive/retirement/read-only mirrors/submission refusal; one-off course/config/showcase/paper projects without continued software maintenance and outside reception; or a year without substantive development and maintainer handling of outside contributions. Automation and our own submissions do not count as that evidence.
- **Insufficient reasons to skip:** low stars, costly validation, one rejection, requested revisions, or a new unmerged PR. Verify mirrors' real contribution routes and preserve legitimate research/education projects and acceptance evidence.

Discovery filters, followed-group filters and maintenance authority have different scope. Followed filters apply to followed-issue scanning, not automatically to intake, notifications or authored-object patrol. Contribution-admission rules apply to maintenance only when intake itself is assigned. Do not invent language, star or activity thresholds. A confirmed skip records reason/source and changes membership through its writer; it never claims an audit was completed.

### Evidence and contribution quality

An ordinary defect claim needs supported input/configuration → production or public API use → concrete wrong result → violated contract. A documentation repair needs an exact existing false fact, instruction, link or example and an authoritative or behavioral correction. Reproduction or strong source proof can establish the error.

Hypothetical risks, isolated helpers, artificial examples, cosmetics, CI failures or prior effort alone do not establish repair necessity. Evidenced unsettled behavior becomes a precise contract question, not a confirmed defect. There are no finding or PR quotas.

Implementation trusts internal contracts: no redundant guaranteed-type/null/state checks, just-in-case defaults, swallowed failures or unjustified retries. Fix the responsible producer/caller; retain necessary external-input/security validation and contractual failure handling at their boundaries. These rules grant no wider cleanup authority. See [code standards](references/contribution-value.md#code-implementation-prohibit-defensive-programming).

## Authority, security and privacy

### Actions stay within explicit authority

Repository membership, following, authored history, account ownership, a role name or installing the Skill does not itself authorize management. Keep existing user authorization and verify live rights. Public posting, upstream pushes, merge/close/reopen, withdrawal, branch deletion, releases, schedules, parallelism and cleanup require applicable authority; one permission does not imply the others.

Respect target-specific contribution, invitation, design, licensing, security and disclosure requirements. Preserve unrelated dirty/unpushed/unknown work and recovery material. Reconcile ambiguous external effects before retrying. Do not fabricate defects, identities or acceptance, or evade truthful disclosure requirements. See [safety](references/safety.md) and [scoped forge rules](references/forges/README.md).

### Every new security finding stays private

This includes suspected findings discovered during ordinary audits and findings in managed/self-owned repositories. Establish the actual deployment/configuration, assets, attacker control, trust boundaries, mitigations, concrete impact and violated security guarantee. Dangerous-looking helpers or hypothetical capability alone are insufficient; security evidence has its own threat model and does not require a normal supported-use trigger or a prior incident.

Use only an authorized private advisory/report channel or designated security contact. Never report a new finding through a public issue, PR, discussion or comment. Without a usable private channel or disclosure authority, keep protected evidence and a blocker/retry unless explicit category/scope-specific abandonment applies; do not fall back to public reporting. Public remediation requires prior private reporting and satisfied disclosure gates.

Test only authorized resources with isolated fixtures; there is no inferred permission to attack live services or others' data. Keep findings, exploits, private links and credentials protected and unsynced. An ordinary audit does not certify security. See [security investigation and disclosure](references/security.md).

### Mail and source positions

Confirm the exact selected account and native folder before reading. Never expand mailbox scope, send/reply by mail, mark notifications read or change subscriptions. Mail only supplies links to native engineering work; substantive handling occurs there. Mail positions and private evidence stay protected, separate from public read positions.

### Resources and backups

Workers hand off delivery/preservation, explicit abandonment or retention facts and stop unused owned services; Coordinators execute bounded cleanup after writer stop; the Supervisor governs capacity/shared blockers. Workers do not delete checkout/tmp.

[Storage](references/storage.md#choose-the-release-path) has three paths: delivered/preserved material may be released; explicitly abandoned material may be discarded with recorded loss risk; active/shared, ownership-unclear or unauthorized targets stay retained. Successful authorized private-channel submission permits release of corresponding private/security material without extra human receipt, triage or remediation waits. Failed sends or omitted attachments need retention or explicit category/scope-specific abandonment, not an extra raw backup merely to enable deletion.

Persistent records, existing recovery archives, mailbox/credentials/keys and shared environments retain separate boundaries. No shared/global cache, Go/module-store, toolchain or unrelated build cleanup follows from a task. Explicit workspace authority may permit task-exclusive reproducible dependencies/build outputs and ordinary Git-object read-only handling under the [narrow gates](references/storage.md#explicit-narrow-release-permissions); no ACL/ownership override or external link-target deletion.

Stop unused task-owned temporary processes/services only within authority. High memory use does not establish idleness or permit force-killing shared Docker/WSL. Record resources as released, retained with a reason, or failed; ambiguous effects are not success.

Backups are requested, reviewed and narrowly staged into the private state repository: eligible global records, exact public positions and selected privacy-reviewed project `state.md`. Never recursively add `state/` or upload project `work/`, raw `work.md`, source/temp, mail positions, security findings, credentials or recovery archives. Preserve remote history, separate skill/state commits, and verify actual remote heads.

## Execution continuity

Active tasks and genuine completion/failure events resume the mandate: act, wait for real work, or retain exact blockers/completion. The [Supervisor](roles/supervisor.md) repairs execution-method faults promptly under [bounded recovery](references/execution-recovery.md); inability to proceed is reported to the user, not deferred to a timer or made a permanent first-failure ban.

[Event-driven refill](references/refill.md) is primary: C integrates a result and continues/refills in the same turn; one project's failure is not a domain stop. The single authorized Supervisor heartbeat is a **bounded fallback**: inspect existing summaries/lifecycle/capacity and send at most one specific continuation per affected C for a missed refill or already-authorized disposition handoff. Suppress equivalent in-flight messages and unchanged sufficient blockers; diagnose ineffective prior corrections rather than repeating prompts. No direct W delegation, restart/cancel, engineering, file writes, forge refresh, tests, Git, cleanup, schedule changes or self-queued bypass. Quotas and storage authority remain unchanged. Frozen source windows do not freeze captured-object engineering; source-screen and repository-engineering budgets remain distinct.

## State and workspace layout

The selected workspace is the canonical policy/state root. The Skill checkout or installed bundle supplies instructions; the harness owns execution and scheduling. There is no custom runtime, queue, claim registry, receipt service or interaction database.

| Path | Purpose |
| --- | --- |
| `state/maintained-repositories.md` | Explicit standing repository/action authority; an assignment may separately grant bounded authority. |
| `state/new-repositories.md` | Incomplete initial assignments. |
| `state/old-repositories.md` | Full historical membership; names, not completion or management rights. |
| `state/followed-repositories.md` | Heading-named followed groups; overlap allowed. |
| `state/read-positions.md` | Public notification/followed-issue read boundaries. |
| `state/private/mail-position.md` | Protected account/folder mail positions. |
| `state/repositories/<host>/<namespace>/<repo>/state.md` | Reviewed shared facts, links, next actions, blockers and recovery outcomes. |
| Project `work/work.md` and other local notes | Local delivery history and evidence, including imported records; never Git or a second current state. |
| Project `work/checkout[-<purpose>]/`, `work/tmp/` | Multiple source checkouts and temporary material; legacy `temp/` names may remain. |
| `state/unfinished.md` | Navigation only; repository state remains authoritative, including nonmembers. |

One project directory unifies shared state and ignored local work. Its assigned writer updates root state.md and local work/work.md; Coordinator owns globals; a designated publisher serializes workspace policy/shared-state Git only. Independent repository Workers publish directly, with one writer per project/checkout/shared index. Never crawl project work/ for shared records or infer ownership from missing files. Unknown identities/resources stay local-only; physical relocation transfers no authority.

Preserve exact native identities, aliases, revisions and boundaries. Cross-forge/renamed identity needs native proof. Source failure is unknown, not absence; archives are recovery-only. See [workspace](references/workspace.md) and [records](references/records.md).

## Start using RepoStew

1. Load [SKILL.md](SKILL.md) from this checkout or build/load the [harness package](integrations/README.md). Keep state and repository records in the selected workspace, outside the package.
2. Assign the workspace, repositories/objects/window, outcome and allowed actions. For recurring work, explicitly authorize sources, cadence and activation. For managed work, specify permitted issue/PR/merge actions.
3. Let the Coordinator select applicable roles, forms and methods; run necessary validation and complete feasible authorized actions. Continue from unresolved records and live sources.

Use the [selected harness adapter](references/harness.md) for setup, optional helpers and verified capability limits; installation never implies activation or authority.

Example assignment:

```text
Use RepoStew in <workspace> for <owner/repository>.
Audit the assigned issue window and documented supported workflows at <revision>.
You may investigate, edit an owned branch, run required checks and publish ordinary
repair PRs when the target gates pass. Do not merge, close others' objects or create
schedules. Keep new security findings private; retain blockers without a usable
authorized private channel. Record coverage, outcomes, unfinished work and resources.
```

An assignment like this authorizes only its listed scope and actions; it is an example, not standing permission. Adapt it to actual rights and target rules using the [assignment templates](prompts/README.md).

## What counts as completion

Finish the whole selected scope and all feasible authorized actions. Retain inaccessible evidence, pending review/CI, decisions and other external blockers with precise next actions; do not silently narrow an audit or treat a partial Worker return as completion.

Report source proof, local validation, hosted CI, deployed behavior, submission, merge/acceptance, audit coverage, engineering resolution and resource release separately. A green local test is not hosted acceptance; a published PR is not a merge; a read position is not issue resolution; a scheduler wakeup is not completed coverage.

[MIT License](LICENSE)
