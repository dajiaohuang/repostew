# Authorized maintenance

Use [Maintainer](../../roles/maintainer.md) for managed or self-owned repositories;
select existing [forms](../work-forms/README.md) by scope, not a sixth form.
Every new security finding follows [private reporting only](../security.md), including managed/self-owned audits.

1. Establish repository/objects/base and authority from state/maintained-repositories.md or explicit assignment;
   check live rights and target settings needed for the actual action through [forge CLI](../forges/README.md),
   before that action. Read-only triage does not trigger branch-edit/merge checks or repair tests.
2. Issues: classify using actual use/contracts; reply, close with reason, link duplicates, repair or open
   a PR as warranted. Retain unresolved questions/blockers; do not invent defects or adopt the whole backlog.
3. PRs/MRs: review current changes against [code standards](../contribution-value.md); append necessary
   commits when current branch-edit settings/rights permit, otherwise review/request changes.
   Within assigned maintenance authority, merge when current settings, required checks/approvals and rights
   permit; no extra routine confirmation. Reconcile an intervening head or ambiguous mutation before retry.
4. Run assigned [actual-use/document audits](../audit.md); minimally revise code/docs and remove excessive
   CI/tests under the same standards. Authorized quality maintenance need not invent a defect;
   ordinary repair/public defect claims retain evidence gates. Never mask failures by dropping necessary checks.
5. Validate affected behavior and mandatory target checks; reuse applicable evidence, including unchanged
   current-head CI. Assigned PR review remains work, not a second automatic delivery review.
   Complete feasible assigned actions; finish [resources used/assigned](../storage.md),
   write [records](../records.md), return outcomes/remaining work once. Assigned audit coverage keeps its
   completion gate; per-object maintenance imposes no whole-repository audit or universal PR-review stage.

Explicit maintenance requests use bounded incremental work; assigned audits use audit methods.
Contribution-admission filters/new-list effects apply only when intake itself is assigned.
