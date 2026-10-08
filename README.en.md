# RepoStew

Finish the contribution. Keep the maintenance loop going.

RepoStew is a portable repository-stewardship Skill for discovery, issue handling, code audits, fixes, validation, PR delivery and ongoing review/CI follow-up. Executors work directly with Markdown—no extra runtime scripts, database, task protocol or orchestration service, and no required client, model vendor or operating system.

[中文](README.md) · [Skill](SKILL.md) · [Project site](https://dajiaohuang.github.io/RepoStew_skills/)

## Start here

1. Place this repository at `RepoStew_skills/` in a workspace with the layout below.
2. Define selection filters, the recent-issue window, maintenance authority and disposable resource boundaries. Set an explicit start time when the first scan has no saved position.
3. Ask the executor to read [SKILL.md](SKILL.md) and choose the entry point and authorized actions. Explicitly authorize parallelism or scheduling, including count and cadence, when needed.

For example:

> Read RepoStew_skills/SKILL.md and handle repositories in the new list. Fully capture and classify the assigned issue window, trace agreed actual-use/call paths and verify genuine documentation errors. Respect target rules and submit regular open PRs when eligible. Finish authorized source release and repository records; retain incomplete work with concrete reasons.

[Ordinary audits](references/audit.md) cover agreed usage paths and documentation facts without default file-by-file reading; explicit whole-source assignments retain their scope. [Security audits](references/security.md) separately establish deployment, attacker capabilities, trust boundaries and impact, with private disclosure.
Complete assigned issue classification and usage/documentation coverage before grouped repair delivery: combine common root causes, keep independent problems reviewable, and do not publish slice findings during the audit.
PRs need no separate issue; reuse and link a matching issue when available, otherwise explain the error and evidence directly in the PR. Honor explicit target requirements.
For evidenced actual-use questions needing maintainer agreement, open or reuse a discussion issue. A concrete question necessary to continue investigation may be raised earlier with observed behavior and the unresolved point; establish the error and intended correction before a repair PR.
Group each repository's minor documentation errors in one errata PR; extend an open errata PR instead of splitting corrections by file or error.
Before submission, apply the [general contribution standards](references/contribution-value.md#general-submission-standards): prove an actual-use error or a verifiable existing documentation error, then assess correction impact and maintenance cost. Benefit or cleaner implementation cannot replace error evidence.

The Skill defines the method; the execution environment supplies repository, mail, file and scheduling tools. Saving instructions does not start jobs, create chats or resume paused schedules.

## State is Markdown in directories

Operational paths resolve from the workspace root, even after entering a target checkout. Document links resolve from their containing file. No machine-specific absolute paths.

```text
workspace/
├── RepoStew_skills/          Skill and references
├── state/
│   ├── new-repositories.md
│   ├── old-repositories.md
│   ├── followed-repositories.md
│   ├── unfinished.md        Navigation only
│   ├── read-positions.md
│   └── private/
│       └── mail-position.md Private; excluded from sync
├── work/<owner>/<repo>/
│   ├── state.md             Repository facts and unfinished work
│   ├── work.md              Short contribution history
│   ├── checkout/            Disposable source
│   └── temp/                Optional temporary material
└── MAINTAINED_REPOSITORIES.md Maintenance authority input
```

Three membership lists select repositories and entry points:

| List | Purpose |
| --- | --- |
| `new-repositories.md` | Initial new-repository work; remove evidenced unsuitable targets or completed assigned audits and feasible initial work; retain external follow-up in repository records |
| `old-repositories.md` | Full historical old membership; repository names, not duplicated status |
| `followed-repositories.md` | Named, overlapping groups; scan their deduplicated union |

Resource lists, awesome collections and documentation repositories are eligible for document repairs. Skip this category only for explicit refusal of external PRs or a forbidden submission method, not lack of software maintenance, activity or previous outside merges. Review documents, links, examples, structure and relevant automation; reuse prior coverage and retain concrete submission blockers.

Each repository's `state.md` alone holds evidenced patrol scope, time and boundary, unfinished native links with short reasons, and local resource outcomes. `work.md` briefly records issues handled, PRs submitted or followed up, and known dates/results.
General lessons become shared skill rules; repository lessons live in `references/repositories/<owner>/<repo>.md` with scope and sources, read on demand. Current facts stay in state; raw interactions remain at native sources or in authorized private archives.

Feedback is distilled into [repository references](references/repositories/README.md) and [shared review rules](references/safety.md#feedback-derived-review-rules), applied to relevant contracts without expanding the assignment.

Use [minimal records](references/records.md): write only material changes, one line per unfinished action or actual delivery, and scoped maintainer constraints with source links. Retrieve details from GitHub when needed. Omit empty sections, source-read logs, unchanged patrol entries and parallel progress diaries. Explicitly requested, private or irreplaceable evidence has one canonical raw copy.

The central `unfinished.md` only links to repository records. A complete unfinished-work patrol enumerates every container-root state, including nonmembers, excluding source, temporary trees and recovery archives. Read discussions, reviews, CI and mail bodies live; do not mirror an interaction database or invent missing facts.

## Discovery through delivery

Authorized Trending entries, awesome-list repositories and their linked projects enter the new list after identity, approved filters, the [contribution suitability rule](SKILL.md#skip-unsuitable-contribution-targets) and deduplication. Use lightweight policy, purpose and maintenance evidence without cloning or auditing. Existing repositories continue their scope without resetting progress or automatic following. Unsuitable list repositories can still serve as discovery sources. Expand list-to-list links in bounded, cycle-free batches, not ordinary project dependencies.

New audits, existing-contribution reassessment and incremental feedback reuse one [coordinator](references/workflows.md#explicitly-requested-coordinator-and-leaves) and [leaf delivery flow](references/leaf.md), routed by user scope and actual authored history:

| Entry point | Leaf assignment | Completion effect |
| --- | --- | --- |
| New repository | Suitability first; classify all recent issues and audit assigned usage paths/documentation facts | Apply initial-audit completion rules; retain external blockers with next actions and retry conditions |
| Already-worked repository selected for contribution review | [Enumerate authored issues/PRs; handle feedback, correct, consolidate and close within authority](references/reassessment.md) | Evidence-backed dispositions and completed feasible actions; retain legitimate discussion/external blockers |
| Followed new issues | This batch of issues and related code | Preserve membership; advance scan time after full capture and handling or retention |

Fix the assignment scope and base, then review relevant deltas before submission. Separate audit coverage, contribution outcomes and resource disposition. Incomplete coverage or feasible initial work stays in the new list. Review, CI, maintainer decisions or external delivery gates after completed coverage remain unresolved follow-up, without repeated whole-repository audits.

Serial by default. Explicit parallel authorization allows distinct repository leaves; the coordinator captures, deduplicates, routes, dispatches and refills without duplicating engineering investigation. Empty followed-issue batches need no leaf; contribution reassessment needs no new issue. Keep one writer per repository and serialize shared-file edits across shards through an agreed writer or bounded windows. Relay changed rules/modes to the existing leaf. Finish the whole selected shard, not only its current leaves; no lock service.

Leaves investigate, edit, validate, publish, release authorized source and write their own `state.md`/`work.md`. The coordinator writes shared lists, navigation and cross-repository positions. Trust factual returns and reported writes: no duplicate tests, remote queries or record-readback acceptance.

Fresh dispatches inline current common policy in the [fixed source order](references/leaf.md#dispatch-with-a-stable-common-prefix), preserving identical prefix text before repository, kind, scope, authority, resources and existing facts. Cadence and return rules stay in that prefix; full inline policy needs no duplicate reads, and same-repository continuation sends only deltas. Refresh changed policy and verify live target facts. No prompt compiler or task protocol is needed.

New-audit and reassessment leaves share that prefix; coordinators also put common rules before all shard variables. Keep actual-use repairs and genuine document corrections, repair useful but incorrect work, and consolidate equivalent submissions before authorized withdrawal. Close unnecessary, incorrect, superseded or scoped-rejected authored objects within explicit authority. Preserve legitimate discussions, unavailable-evidence blockers, others' objects and merged work. Explicit user reclassification can replace an old initial-audit assignment without claiming that audit completed.

Missing issue/PR outcomes require asking the original leaf: supply omitted links, explain genuinely none, or continue feasible work. Intervene only on concrete failures, contradictions or collisions, preferably through the same leaf. Stop after three failed repairs of the same fault. A long task or one timeout is not failure; silent incorrect successes are not guaranteed detectable.

## Serious delivery, lean checks

Read target policies before source and discussion bodies. Respect contribution, assignment, invitation and security-disclosure gates. Prove a real defect and make the smallest compatible change.

Reuse unchanged same-repository facts; refresh relevant deltas before submission. Test affected behavior plus mandatory target checks, combine final diff/style/public-text review, and establish the real PR URL, state and published head once from reliable responses or one live lookup.

Prefer regular open PRs when eligible, not a local patch, commit or fork as the endpoint. Draft also requires an established error and intended correction, with concrete remaining implementation or validation uncertainty. Missing local native tools do not automatically require Draft, and mandatory target prerequisites still apply. No fabricated findings or submission quotas; no default CI/merge wait.

Every repository pass—including unchanged or blocked work—decides resource disposition. Update the current resource line only when its outcome changes; do not append unchanged entries. For external contribution source, satisfy existing authorization, delivery and non-use gates, delete only named `checkout/`/`temp/` and record the operation result. No new recovery copies, unique/unknown-data inventory, post-delete verification or disk-space measurement. Preserve known undelivered/active/unrelated material, permanent records and existing archives. Self-owned repositories are excluded; do not clean Go caches/toolchains. Submission, coverage, resolution and release are separate facts.

## Three complementary patrols

The [1/6/24-hour baseline](references/patrols.md) is configurable, not an automatically installed schedule or completion deadline.

| Cadence | Coverage and action |
| --- | --- |
| 1 hour | Repository notifications and selected-folder mail as peer incremental sources; independent positions, deduplicated issue/PR handling |
| 6 hours | Full capture of new issues in the followed union; dispatch nonempty repository batches through the shared coordinator/leaf flow |
| 24 hours | All authored/commented open issues, authored open PRs and every authoritative unfinished link; deepen changes, unknown handling or actionable unfinished work |

Prefer one existing patrol conversation; continue unfinished passes rather than stack runs. Reuse unchanged handling instead of rereading whole threads, rerunning tests or recloning. `updated_at` alone cannot establish unchanged CI; fill missing live facts narrowly.

Keep native IDs, revisions, times and boundaries exact for each source. Read only the selected mail folder, never other folders; no email sends, mark-read or subscription changes. Reply substantively on engineering objects. Advance positions only after complete capture plus handling or reliable retention. Failure is not empty; reading is not resolution.

Stay quiet for unchanged or identically blocked runs; notify meaningful progress, failures or required user action. Downtime, source limits or long work can delay coverage. Report actual gaps; configuration is not execution evidence.

## Authority and privacy

Following and historical contributions do not grant maintainer authority. No inferred merge, close, upstream push, broader cleanup or public security disclosure. Honor truthful disclosure rules and preserve unknown/unrelated changes.

Mail positions, private links, security bodies, credentials, source trees and recovery archives stay out of public publication. When state backup is explicitly requested, review eligible membership, public positions and individual repository records; commit Skill and state separately, never force-push.

## Reference map

- [SKILL.md](SKILL.md): workspace, state and execution boundaries.
- [Ordinary audit](references/audit.md) / [Security audit](references/security.md): usage-path/document errors and separate threat evidence/private disclosure.
- [Workflows](references/workflows.md): discovery, new/followed work and shared coordination.
- [Leaf delivery](references/leaf.md): fixes, validation, publication, records and release.
- [Patrol cadence](references/patrols.md): complementary entry points, deduplication and activation.
- [Safety](references/safety.md) / [Storage](references/storage.md): submission gates and resource disposition.

Archived scripts, JSON and tests are recovery material, never runtime alternatives.

[MIT License](LICENSE)
