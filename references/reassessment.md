# Single-repository contribution reassessment

Use this leaf for an assigned repository's existing authored issues/PRs: review,
feedback, correction, consolidation and authorized withdrawal. Apply the shared
[leaf flow](leaf.md) and [evidence gate](contribution-value.md#defect-evidence-for-submission-and-reassessment).
This is an engineering task, not coordinator acceptance of a previous leaf.

## Capture the assigned objects

Establish the author, native repository identity, scope and action authority. For a
whole-repository reassessment, fully paginate authored issues and PRs across all states,
including Drafts, and reconcile every authoritative unfinished link. Include objects
absent from membership/navigation; prioritize open/unresolved work and use closed/merged
history for duplicates, fixes, maintainer decisions and regressions. Reuse evidenced
handling of unchanged historical objects; do not reread every closed thread. Commenting
is not authorship. A targeted
feedback batch keeps its explicitly assigned objects instead of expanding to all history.

Start with compact live state, PR base/head/diff and current-head checks. Read relevant
feedback and evidence where a decision is needed; unchanged, already sound work reuses
its evidence. Unknown or inaccessible is not empty. Preserve exact omitted scope and
retry conditions when enumeration fails. Do not clone, retest or repeat a whole code
audit merely because the repository has many submissions.
Partition capped source searches as necessary; a truncated result is not full capture.
Pending/cancelled/action-required checks are not passes or a reason alone to withdraw
an otherwise necessary correction. Preserve original applicable acceptance requirements.

## Decide and complete the engineering action

Assess the current claim and patch against supported use/calls, the existing contract,
project design and scoped maintainer direction. Documentation needs a verifiable
existing error. Trace the affected path far enough to distinguish a necessary repair
from a defensive preference, isolated helper scenario or cosmetic change. Use bounded
source review or reproduction, not repeated testing to justify an inherited submission.
Security uses its separate threat/disclosure rules and protected records.

- **Keep or repair:** the error is established and the correction remains needed.
  Handle actionable feedback, remove unsupported parts and correct misleading text.
  Complete the smallest compatible repair and necessary checks; update the existing
  PR directly and mark an eligible Draft ready. A wrong patch does not invalidate a
  real unresolved error; repair it when feasible within authority.
- **Consolidate:** submissions duplicate the same root cause or split minor document
  errors. Choose the appropriate existing issue/PR, preserve all necessary corrections
  and discussion context there, then withdraw redundant authored objects when authorized.
  Do not close their only delivery before the retained contribution covers that work.
  Independent errors remain distinct unless one coherent fix requires them together.
- **Withdraw:** available evidence establishes no applicable error, the repair is
  unnecessary/incorrect, already fixed, superseded or rejected within the maintainer's
  stated scope. After one bounded review, an ordinary repair whose necessity is still
  unestablished is also withdrawn within authority. Say "necessity not established"
  where appropriate; do not assert "no defect" or "fixed" without evidence.
- **Discuss or retain:** concrete actual behavior requires a maintainer decision, or
  indispensable evidence/submission access is temporarily unavailable. Keep or correct
  a legitimate discussion issue with its exact question. Retain the concrete blocker
  and retry condition. Unsupported suspicions do not become discussion issues merely
  to keep an old contribution alive. Continue feasible independent work.
  Keep an evidenced contract question as discussion; withdraw an unproven repair PR
  within authority. An unsettled question alone does not establish a PR's necessity.

A PR needs no companion issue unless the target explicitly requires one. Assess the
issue and PR separately: an unresolved real error or valid discussion can remain after
a PR is withdrawn; a redundant companion issue need not remain to justify a valid PR.
Apply confirmed takeover/rejection to equivalent work without reopening the same
direction as a new issue or PR. Optional advice is not a design veto; follow the latest
applicable evidence-backed maintainer direction.

## Withdrawal authority and completion

An explicit user request to close their incorrect or unnecessary submissions authorizes
those in-scope authored open issues and unmerged PRs; carry that authority into the
assignment and use it without asking again per object. The template itself grants no
closure, merge, reopen, branch-deletion or cleanup authority. Leave others' objects and
merged work intact. A problem in merged work needs a separately authorized correction;
it cannot be undone by closing history. Preserve dirty/unpushed and unpublished work.

Before closing, reconcile the live object state, authorship and relevant new feedback.
Use a short factual reason, with the retained native link for duplicates/supersession;
use a reliable operation result and reconcile ambiguity before retrying. Close/update
comments are authorized only as part of the requested engineering action, not courtesy
messages; never copy protected security evidence into a public withdrawal reason.
Record only changed current actions and actual deliveries/resolutions under
[minimal records](records.md); finish the resource check under existing release authority.

Finish when every captured object has an evidenced disposition and all feasible
authorized corrections/withdrawals are done. Pending review, CI, maintainer decisions
and unavailable evidence remain linked follow-up, not resolved work. Missing capture
or feasible local work leaves the assignment incomplete. Return concise native outcomes,
remaining scope/actions and resource results; no per-object read log, quota or blanket
wait for merge. A reassessment neither proves a new-repository audit nor changes
membership/read positions by itself.
