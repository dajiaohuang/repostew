# Single-repository delivery and release

Apply this to every assigned repository. Load the policy for a new repository;
same-repository continuation can reuse available, unchanged instructions and evidence.
Refresh only changed or missing facts; a new context must load what it does not have.
Keep the skill, state and work root workspace-local; target source lives in the user's
relative layout. No execution client, vendor, operating system or tool API is required.
The leaf writes its own repository state.md/work.md; only the coordinator writes
shared membership, navigation and cross-repository positions. Never write another
leaf's repository or a shared file; defer known conflicting same-repository writes.

## Coordinator updates

Stay quiet during routine progress. Do not send interim findings, counts, PR status,
or unchanged updates to the coordinator. Report an error or concrete blocker promptly
when it affects safe continuation, requires coordinator action, or leaves work unusable.
Otherwise, send one concise final result when the assigned work is complete; if a
concrete blocker prevents completion, report the blocker and exact remaining scope.
The coordinator may change this cadence for a specific assignment.

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
3. Apply [direct claim and regular PR rules](safety.md#prefer-a-regular-open-pr). For new
   work, claim available issues through the permitted target process; continue existing
   submissions directly within their current scope. Prefer a normal open PR when all
   conditions pass. Verify/create the actual contributor fork once, and reuse confirmed
   fork, owned branch and permitted remote/base facts unless they change or an operation
   fails. Refresh volatile base/availability facts through the pre-submission delta.
   Push the owned branch and create the PR against the permitted base. Establish its
   native URL, state and exact published head once from reliable operation responses
   or one live lookup; match the expected pushed commit. Do not routinely duplicate
   this with separate PR queries and remote-ref queries. Follow-up pushes need evidence
   for the new head, not another verification of unchanged publication facts. Reconcile ambiguous
   writes before retrying. Do not stop at a local commit, infer a fork prohibition from
   upstream read-only access, or use lack of native tooling as an automatic Draft gate.
   Missing checks are disclosed; mandatory target requirements are not waived.
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
   Return a concise factual result: actual coverage/base/window; findings and public
   issue/PR URLs with published heads (or explicitly none, why, and whether further
   eligible work remains); checks run and unrun; ordinary/Draft/rejected
   publication outcome; each resource released/retained/failed with its relative path
   and any retention reason or actual error; no recovery copy/location is required;
   unresolved native links, reasons and retry conditions; which record writes succeeded
   or failed; distinguish audit coverage, contribution outcomes and resource disposition.
   State whether assigned scope and feasible initial work are complete; report security
   scope separately without exposing private evidence. Signal operation,
   state-write and execution faults promptly, not only at the end; distinguish an
   expected blocker from an error. Report deletion outcomes,
   not measured reclaimed bytes. No terminal JSON protocol or hidden task registry.

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
