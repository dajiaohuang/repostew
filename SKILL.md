---
name: repostew
description: Handle repository issues, audits, notifications and contribution follow-up using membership lists and per-repository Markdown state and work records.
---

# RepoStew

Complete current canonical policy supplied inline satisfies its reading gate; read
only missing or changed policy, while target instructions and live facts still need checking.
Read [workflows](references/workflows.md) for execution
and [safety](references/safety.md) before target changes or external actions.
Read [workspace lifecycle](references/storage.md) when provisioning, finishing or
releasing a repository checkout.
Use [ordinary audit](references/audit.md) to discover errors through actual usage
paths and verifiable documentation facts; use [security audit](references/security.md)
for security work, with its separate threat, evidence and disclosure rules.
Apply [minimal records](references/records.md) to every state/history write and
continuation: write only material changes, prefer live GitHub details, and keep no
parallel progress diaries.

## Portable workspace layout

Resolve operational paths from the workspace root, not the process working directory
or a target repository checkout. The workspace contains `RepoStew_skills/` (this skill),
`state/` (membership lists and cross-repository positions), `work/` (repository
containers) and `MAINTAINED_REPOSITORIES.md` (authority input).
Links within this skill are relative to the file containing the link.
If the workspace root cannot be established, ask for it; do not guess a machine path.
Use the user's existing relative layout. Moving the workspace must not require edits
to this skill. No particular operating system, execution client, model, reasoning
level, command wrapper or tool API is required.

## State you edit directly

Use ordinary file tools to read and edit Markdown under `state/` and `work/`.
No custom runtime scripts or intermediate task protocol.

- new-repositories.md: owner/repo bullets; incomplete assigned audit or feasible initial
  work stays listed, unless the user explicitly reclassifies the assignment. External
  follow-up after completion remains in repository state.
- old-repositories.md: the full historical old-repository membership list, not the followed subset.
- followed-repositories.md: sublists under user-selected headings.
  A repository may belong to several groups. Scan the union once; removing one membership
  does not remove others. Membership changes only when the user requests or authorizes selection.
- unfinished.md: a non-authoritative navigation view linking repository state files.
  Never add, resolve or delete engineering items by editing this view.
- read-positions.md: repository notification position and one global followed-issue scan time.
- private/mail-position.md: private mailbox position, outside public exports and sync.

Each repository has `work/<owner>/<repo>/state.md` and `work.md`, with disposable
source in `checkout/` and optional temporary material in `temp/`. Resolve names by
actual source identity; preserve known aliases/native IDs and do not merge different
repositories merely because names match. Use a source namespace when needed to avoid
cross-service collisions. Do not put RepoStew records inside target source checkouts.

`state.md` is the sole authority for that repository's evidenced patrol time, scope,
covered boundary, unresolved public native links/reasons and local resource disposition.
Missing evidence remains unknown. Resolve an item only after actual resolution.
`work.md` is a short factual contribution history: what issue was handled, what PR
was submitted or followed up, and the actual result/date when known. It is not a task
queue, permission cache, source cursor or mirror of interactions. Do not invent a
work history from a migrated status or an object link alone.
Keep current unfinished objects to one actionable line each; omit empty sections.
Record actual deliveries in one short history line. Replace superseded current facts
instead of appending slice/patrol/CI narratives. No material change means no write.
Distill general lessons into shared skill rules. Keep reusable repository-specific
contribution directions, validation requirements and pitfalls in
`references/repositories/<owner>/<repo>.md`, with exact scope and source links.
Use the [repository reference index](references/repositories/README.md) to locate
feedback lessons and apply the [shared review rules](references/safety.md#feedback-derived-review-rules).
Read only the relevant reference and recheck volatile facts; experience is not current
status or authority. State keeps pending work, coverage, positions and resource facts;
work.md keeps actual deliveries. Raw interactions stay on native sources or in an
authorized private archive, without duplicate transcripts.
Membership files alone select/classify repositories; they do not repeat per-repository
status. A summary view can be stale: enumerate repository `state.md` files for a
complete unfinished-work patrol, including containers absent from membership lists.
Inspect container-root state.md files only; exclude checkout/temp contents and recovery
archives rather than treating every file named state.md as RepoStew state.

Preserve native IDs, revisions, timezone-aware times and boundary IDs exactly.
Do not copy interaction bodies, reviews or CI into state; read them live.
Keep private unresolved links/reasons in protected, unsynced notes, not ordinary
repository records or summary views.
No task owner, reservation, identity binding, capacity, access cache or receipt.
Old-repository patrol timestamps are factual history, not an orchestration protocol or
an inferred per-repository source cursor.
Apply [contribution and reassessment standards](references/contribution-value.md)
before filing issues, opening PRs and reassessing existing contributions. Ordinary repairs require
an error reachable through actual supported use/calls or a verifiable documentation error;
evidenced actual-use questions needing maintainer agreement go to discussion issues,
without claiming an unconfirmed defect. Policy compliance, CI and intended improvement
do not replace error proof for a repair. HKUDS selection thresholds
remain scoped to the user's HKUDS full-audit batch.
Apply only the user's configured selection filters. A followed-selection filter does
not erase the old full table or change new work or open-object patrol.
For authorized discovery, use [direct admission](references/workflows.md#discover-and-admit-new-repositories-directly):
real identity, approved filters and deduplication, then append new repositories.
Apply the suitability rule below before admission or new-repository work; do not
clone or audit to decide suitability. Existing repositories continue their own
scope; intake does not auto-follow.

## Skip unsuitable contribution targets

For resource lists, awesome collections, bibliographies, prompt/configuration
collections and documentation targets, skip only on explicit refusal of external PRs
or a target rule forbidding the proposed submission method. No software maintenance,
inactivity or missing outside merges is not a skip reason for this category. Preserve
scoped refusals: rejecting promotional additions does not reject document repairs.
Archived/read-only/unavailable sources without refusal remain with concrete blockers.

For other targets, use current policy, project purpose, substantive development and
maintainer handling of outside contributions. Skip when evidenced:

- Archived, retired, read-only mirror, or the target refuses this contribution method.
- Mainly a course, personal configuration, showcase or one-off paper/experiment,
  without continuing software maintenance and reception of outside contributions.
- No substantive development and no maintainer handling of outside contributions
  for a year; automated updates and our own submissions do not count as activity.

Unknown stays pending. Low stars, expensive validation, a new unmerged PR, a single
rejection or requested revisions alone do not disqualify a repository. Existing
acceptance evidence matters; do not ban every research or educational project.
A mirror flag alone does not prove read-only; verify its contribution route.
Review maintained documents, links, examples, organization and relevant automation;
review code where present without inventing a software surface for a documentation
repository. Correct older list-only/inactivity skips and restore unfinished membership
through its current coordinator. Preserve historical withdrawals; do not reopen public
objects or claim completed audits merely because selection policy changed.
On a confirmed skip, record the reason/source in repository state.md and remove new
membership and the assigned shard entry without a full audit; do not mark it audited
or alter historical/followed membership. Coordinate active writers first. Close only
our unmerged PRs/issues when withdrawal is authorized; preserve others' objects,
accepted work, records and resources, and apply the storage disposition check.

## Assigned audit before grouped delivery

For an ordinary audit assignment, finish the assigned issue classification and
usage/documentation scope before publishing new repair findings. Follow
[ordinary audit](references/audit.md); explicit whole-source assignments retain their
scope. Then present findings as distinct points and deliver
them together: combine the same root cause/fix in one issue/PR, submit independent
problems in separate contributions, and remove duplicates/non-defects. PRs need no
separate issue; reuse and link a matching issue when available, following explicit
target requirements. Do not create issues solely to accompany PRs or duplicate objects.
Do not publish a stream of repair findings from partial slices or narrow the assigned
scope to publish early. A concrete actual-use question requiring maintainer agreement
to continue investigation may be raised earlier as a discussion issue: state observed
behavior, evidence and the exact question, without a defect verdict. This exception
does not unlock repair publication. Security findings follow their private disclosure
workflow. Incremental follow-up keeps its assigned scope, and existing submissions
are not withdrawn merely for this timing rule.
Group each repository's minor documentation errors into one errata PR;
reuse matching issues and an open errata PR for further corrections,
rather than splitting them by file or individual error.

Immediately before a bounded batch of state edits, read affected sections once and
preserve unrelated lines. Reread after an intervening change or another writer;
do not reread per bullet when the same current sections remain available.
Use exact repository names and native object URLs; deduplicate inside each sublist
and by native URL in each repository state. Use focused file edits, not a bulk rewrite
from a stale read. Refresh navigation views from the authoritative files when needed;
never import a view back as state.
If a source is unavailable or its position is ambiguous, preserve the last confirmed
position and ask for the missing fact instead of inventing progress.

## Reviewed backup

Runtime state is the local Markdown, not a Git checkout or service. When asked to
publish a backup, review and copy only the three membership lists, public read positions,
and individually reviewed per-repository `state.md`/`work.md` files
to the configured private state repository. Never include private/, recovery archives,
mail positions, credentials, security bodies, checkout/temp trees or migration staging.
An unfinished navigation view is optional, not a recovery source. Review the staged tree, commit separately
from the skill, and verify the remote head; do not force-push or treat Git as a lock.

## Execution boundaries

Default to serial work; reading does not reserve a repository. For explicitly requested
parallel leaves, use the coordinator guidance in [workflows](references/workflows.md).
Choose the leaf by the user's assignment and actual contribution history: genuinely
new targets use new-repository audit; already-worked targets selected for issue/PR
review use [single-repository reassessment](references/reassessment.md), including
authorized closure. Notifications and followed batches keep their incremental scope.
The coordinator captures and routes; the leaf makes the engineering decisions. A new
rule replaces a superseded skill default, not an explicit user/target requirement.
Every assigned repository leaf follows the complete [leaf delivery](references/leaf.md)
workflow: satisfy target rules, prefer a regular open PR when the submission gate passes,
verify publication, finish authorized release and return facts for state.
Fresh leaf dispatches use the [stable common prefix](references/leaf.md#dispatch-with-a-stable-common-prefix)
with all assignment variables last. It includes the communication cadence and applicable
return requirements; do not repeat them per repository. Same-repository continuation
carries only deltas. Relay changed rules, scope and authority to active leaves when
messaging is authorized and carry scoped overrides in future assignment suffixes.
Use the leaf's lean validation: reuse unchanged same-repository facts, refresh live
submission gates by delta, test affected scope plus mandatory requirements, combine
the final review and establish publication once. Defect proof and full assigned audit
coverage remain required. Trust leaf returns and reported writes by default; leaves
write their own repository records, while the coordinator alone writes shared lists,
navigation and cross-repository positions. No routine reread or acceptance audit;
react to concrete failures/contradictions through [targeted recovery](references/workflows.md#detect-errors-through-existing-signals-not-routine-audits).
If issue/PR outcomes are missing, ask the original leaf for links or explicit none/reason
and whether it can continue eligible work. Trust the clarification; do not infer no
publication, impose a quota or duplicate public objects.
If another execution is writing the same affected file/repository, defer. Do not create chats, subagents
or schedules implicitly.
New repository: apply the suitability rule first. For retained targets, select the issue window by volume (90, 30, then 7 days; narrow when a window contains more than 100 issues), classify issues newest first and audit the assigned usage/documentation scope. An explicitly assigned window takes precedence. Remove only under the completion rule in [workflows](references/workflows.md#new-repository); retained follow-up is not resolved work.
Followed repository: new issues since the saved global time, not another full audit.
Its approved coordinator/leaf mode reuses the same workflow: group captured issues
by repository, dispatch only nonempty groups and let leaves assess engineering action.
Keep membership unchanged; advance the scan time only after complete capture and
handling or reliable retention. Avoid same-repository writers across patrol sources.
Notifications/mail and open-object patrol keep their existing separate schedules.
For authorized recurring work, use [patrol cadence and shared execution](references/patrols.md)
to separate incremental sources, followed new issues and open-object fallback without
adding an orchestration service. Cadence, activation and execution settings remain
workspace configuration, not prerequisites of this portable skill.
Progress in a source position does not mean engineering is complete: retain unresolved
links in authoritative per-repository state before advancing. Completing a new repository
does not automatically follow it. Finish each repository pass with the release procedure,
including no-change, partial and blocked outcomes; engineering and storage disposition
are independent facts.
Disposable-source release excludes self-owned repositories. Use established delivery
and resource facts without unique/unknown-data inventories or new recovery copies.
Keep exact authorized boundaries and known undelivered/active/shared resources safe;
after deletion, record the operation result without post-delete or disk-space checks.

Archived scripts, JSON, tests and historical records are recovery only; never execute
them or reconstruct their runtime. Maintain authority inputs independently of followed lists.
