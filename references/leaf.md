# Single-repository delivery and release

Apply this to every assigned repository. Complete current policy supplied inline
satisfies its reading gate; do not reread the same files. Load missing or changed
policy only. Same-repository continuation reuses unchanged instructions and evidence.
Keep the skill, state and work root workspace-local; target source lives in the user's
relative layout. No execution client, vendor, operating system or tool API is required.
The leaf writes its own repository state.md/work.md; only the coordinator writes
shared membership, navigation and cross-repository positions. Never write another
leaf's repository or a shared file; defer known conflicting same-repository writes.

## Coordinator updates

Work independently after dispatch. Send no receipt, start notice, routine progress,
slice findings, file counts, PR/CI status, unchanged updates or questions about optional
details to the coordinator. Establish missing ordinary base/path/history facts yourself
and resolve local engineering questions within the supplied rules and authority.

Continue the whole assignment while feasible work remains; do not end a turn with a
partial result merely because a slice finished, a wait elapsed or context compacted.
Retain candidate-specific external blockers and continue independent assigned work.
Handle recoverable local failures yourself. Alert the coordinator promptly only when
safe continuation requires its intervention, indispensable scope/authority is missing,
or a failure leaves the assignment unusable. Include the actionable problem and exact
remaining scope once; do not repeat the same unchanged blocker or send check-in requests.

Return one concise final result after feasible assigned work and the resource check are
done, distinguishing retained external follow-up from unresolved local work. If the
executor delivers that result automatically, send no separate completion message.
Otherwise use one authorized final relay. Read an incoming rule/scope delta, apply it
and continue without acknowledging it unless a necessary question remains. Only an
explicit user requirement overrides this communication cadence; the coordinator must
not add routine progress reporting on its own.

## Complete the assigned work

1. Read live target instructions, contribution rules, templates and disclosure policy
   on first entry before reading README, source or issue/discussion bodies; stop or
   adapt at a restriction, not after a batched broad content read. Within the same
   repository, reuse the read version and refresh only
   relevant changed instructions, changed scope/base or newly applicable nested rules.
   Establish the assignment kind, scope, permitted base and actual existing checkout
   before applying defaults. Inspect prior work before reuse; preserve unrelated edits.
   New-repository work captures and classifies the whole recent-issue window under
   [new-repository rules](workflows.md#new-repository); only that entry point uses the
   default 90/30/7-day selection. Followed batches, notifications and existing issue/PR
   continuation use their assigned objects/window and affected paths.
   Existing authored-object review follows [single-repository reassessment](reassessment.md),
   including correction/consolidation and closure only within explicit user authority.
   Ordinary audits follow [actual-use audit](audit.md), completing the assigned usage
   and documentation scope rather than defaulting to file-by-file reads. Security
   assignments or concrete security findings use [security audit](security.md).
   Apply [assigned audit before grouped delivery](../SKILL.md#assigned-audit-before-grouped-delivery),
   including its earlier discussion exception for necessary maintainer agreement.
2. Initially reconcile current issues, discussions, relevant all-state PRs, claims and
   current-base fixes. Before submission, refresh changes since that inspection rather
   than fetching the same complete history again. If no reliable delta is available,
   reread only the affected objects and current submission gates.
   Apply the [actual-use and reassessment standards](contribution-value.md#defect-evidence-for-submission-and-reassessment).
   Apply the same action rules to new and existing ordinary work: establish actual-use
   or document errors before repairs; open/reuse discussion for an evidenced use
   question needing maintainer agreement. Security uses its threat and disclosure gates.
   Once the error and intended correction are established, implement the smallest
   complete compatible change. Correct an
   ineffective inherited patch instead of pushing it to satisfy a submission count.
   Add behavior evidence or appropriate configuration/document checks. Run checks for
   the affected behavior/configuration plus target-mandated prerequisites, not an
   automatic full build/test suite. Broaden only for target requirements or concrete
   cross-cutting risk. Reuse passed checks while their code, inputs and environment
   remain unchanged; rerun affected checks after relevant edits. Keep defect proof.
   Combine full diff/range, style/whitespace and public-text/security/identity review
   into one final pre-publication pass; review later changes, not unchanged material.
3. Deliver according to the established outcome:

   - Proven ordinary error and clear correction: complete the eligible repair under
     [direct claim and regular PR rules](safety.md#prefer-a-regular-open-pr).
     Claim available new work through the permitted process; update existing submissions
     directly. Prefer a regular Open PR when its gates pass; no companion issue is required.
   - Evidenced behavior with an unsettled contract/direction: open or reuse discussion,
     observing the earlier-question exception; no repair PR before error/correction proof.
   - Security finding: use the authorized private disclosure/remediation path.
   - Required evidence or submission gate unavailable: retain the concrete blocker
     and retry condition; continue feasible independent work.
   - Existing contribution fails reassessment: correct, consolidate or withdraw under
     [reassessment rules](reassessment.md); no closure merely from a changed selection.
   - No qualifying finding: report none and whether the assigned scope is complete.

   Only when creating/updating a PR, establish or reuse the contributor fork, owned
   branch and permitted remote/base. Push and establish the native URL, state and exact
   published head once from reliable responses or one lookup. An issue has no PR head.
   Refresh relevant volatile facts before submission; reuse unchanged publication facts.
   Reconcile ambiguous writes before retrying. Do not stop at a local patch when eligible
   delivery remains, infer fork restrictions from upstream read-only access, or waive
   mandatory checks. Disclose unrun checks; missing native tooling alone is not a Draft gate.
4. Finish [resource lifecycle](storage.md) before returning, including blocked/no-change
   work. Honor the assignment's existing release authorization and exact boundaries.
   This release flow excludes self-owned repositories. Use established delivery and
   resource facts; retain known undelivered work or active/shared resources. Do not
   add unique/unknown-data inventories or create recovery copies as release gates.
   Delete the named disposable source/temp, use the operation result and stop. No
   recovery unpacking/hash comparison, post-delete path/registration recheck, directory
   size survey, disk-space detection or virtual-disk measurement. Never delete the
   repository container, state.md/work.md, remote contribution refs, private or existing
   recovery material. Waiting for merge/CI is not a source-retention requirement.
5. Apply [minimal records](records.md): update state only for changed current coverage,
   unfinished actions, constraints or resource outcomes; write one short history line
   only for actual delivery/resolution. No source-slice or unchanged-pass logs and no
   copies of the return in other ledgers. Preserve unrelated content. Read affected
   sections once before focused edits; no stale bulk overwrite.
   Return only applicable facts: actual scope/base/window and completion; actual
   deliveries with native links/state (head only for a created/updated PR), or explicitly
   none and why; remaining actions/blockers and retry conditions; necessary validation
   results/limits; resource outcomes and changed record paths or write failures.
   Distinguish completed coverage, unresolved contributions and released/retained/failed
   resources. Report security scope separately without private bodies or links.
   Signal operation/write/execution faults requiring coordinator intervention promptly.
   Omit empty fields, read logs and
   repeated evidence; use ordinary prose, no receipt/schema or measured reclaimed bytes.

The coordinator trusts the return and reported writes without rereading records,
repeating tests/audits/publication queries or requiring a proof packet. It updates
only affected shared membership/navigation/positions. For explicit failure, unusable
outcome, contradiction or concrete collision, follow [targeted recovery](workflows.md#detect-errors-through-existing-signals-not-routine-audits).
No extra acceptance schema, hidden state protocol or routine success audit.
Missing issue/PR outcomes trigger a short same-leaf clarification, not inferred
no-change or a duplicate search. Supply omitted links or explain why there are none;
continue feasible authorized work when asked rather than stopping at a local artifact.
Submitted is not merged; released is not validated; an open PR does not prove a complete
new-repository audit. Apply the [new-list completion rule](workflows.md#new-repository):
incomplete coverage or feasible initial work stays listed; reliably retained external
follow-up after completed coverage does not reopen the audit. Continue independent repositories without
redispatching an unchanged external blocker repeatedly.

## Dispatch with a stable common prefix

For authorized fresh leaves, supply current canonical text inline in this fixed order:
[SKILL.md](../SKILL.md); this file before this dispatch section;
[contribution standards](contribution-value.md) before the HKUDS batch section;
[ordinary audit](audit.md); [security audit](security.md); [safety](safety.md);
[records](records.md); [storage](storage.md); the
[new-repository section](workflows.md#new-repository) of workflows;
[single-repository reassessment](reassessment.md). Both leaf kinds share this prefix;
only the assignment suffix activates their different scope and completion rules.
Use stable relative source labels. Reuse identical wording, order, whitespace and
separators while policy is unchanged. Append every variable after this common text:
repository, assignment kind, window/URLs, baseline, authority, resources, existing
facts and scoped user/target overrides. Do not prepend dates, names, progress or
unrelated repository history, or rebuild the rules as a per-task summary.

Full current inline content satisfies the corresponding policy reads; paths or
summaries alone do not. Read missing/changed rules and live target instructions as
needed. Refresh the common text when policy changes; an old default does not override
current rules. Same-repository continuation sends only the work delta and changed
rules, without repeating an unchanged prefix. No compiler, hash registry or task protocol
is needed. Prefix reuse is an execution optimization, not evidence of cache savings.

Append a short assignment in ordinary prose, for example:

> Repository: <owner/repo>. Assignment: <new audit / authored-object reassessment / incremental follow-up / security>.
> Scope: <assigned window, native links and explicit boundaries>.
> Authority/resources: <permitted actions, actual checkout/temp and exact release authority>.
> Existing facts/overrides: <relevant known base, unfinished work and source links>.

Omit inapplicable details and avoid copied discussions/CI. The leaf establishes unknown
base/path facts and ordinary usage scope; unspecified release authority permits no deletion.
Communication cadence and return requirements are already in the common prefix; add
only an explicit user override in the suffix. This template grants no new execution authority.

For reassessment, append the author, whole-repository or explicit object scope, and
the user's exact correction/consolidation/closure authority when known. For a new audit,
append an explicit window/scope override only when assigned. Preserve existing work
when changing the kind of an active same-repository leaf; send changed rules and scope
to that leaf rather than starting another writer.
