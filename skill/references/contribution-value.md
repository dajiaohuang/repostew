# Contribution value

## General submission standards

New issues/PRs and authored-object reassessment share one necessity gate:
ordinary repair needs actual-use error; documentation repair needs a verifiable existing error.
[Security](security.md) findings use private reports only and independent threat/disclosure gates. CI, linked issues, cosmetics,
optional improvements, artificial data, isolated helpers and prior effort do not establish necessity.
Triage immediately: proven error, evidenced discussion, discard unsupported suspicion, or retain
unavailable evidence with blocker/retry. Group common roots; do not accumulate suspicions.
Authorized [maintenance](workflows/maintain.md) may revise code/CI/tests to these standards within
assigned scope; it does not require inventing a defect or waive evidence for public defect claims.

## Defect evidence for submission and reassessment

1. Prove supported input/configuration -> production/public API calls -> final concrete error
   -> violated contract, including consumers/state/results. Reproduction or strong source proof suffices.
   Public APIs need concrete supported invocation, not internal callers; invalid inputs count only
   where validation/rejection/recovery is contractual. Documentation needs an exact false fact,
   instruction/link/example and authoritative/behavioral correction; wording/formatting alone fails.
2. Follow project design, compatibility and maintainer direction; fix the complete affected path minimally.
   Establish intended correction before a repair PR. Evidenced unsettled behavior goes to a discussion
   stating trigger, observation, evidence and exact question, without an unconfirmed defect verdict.
3. Validate affected behavior and target-required checks; reuse unchanged evidence, test concrete uncertainty.
   Separate source proof, local, CI and actual-use acceptance; no invented checks or contribution quotas.
4. Revise useful work/incorrect claims. After bounded review, withdraw authored unnecessary/incorrect
   objects only within authority; say "necessity not established", not "no defect"/"fixed" without proof.
   Retain real discussions, unavailable-evidence blockers, merged/others' work and private evidence.
5. Before publication, confirm the claim and complete repair match. State trigger/actual/expected/impact/
   evidence, minimal change, validation/limits. Reuse matching objects; PRs need no companion issue unless
   required. Existing work uses [reassessment](reassessment.md); Drafts retain the same necessity gate.

## Code implementation: prohibit defensive programming

Code written/modified by RepoStew must eliminate defensive programming:

1. Internal callers satisfy preconditions; callees guarantee results. Trust input/output/state contracts;
   do not recheck guaranteed types, fields, non-nullness or state.
2. No just-in-case defaults, empty substitutes, swallowed exceptions, unjustified retries/alternate paths
   or out-of-contract accommodation. Handle legitimate optional/business/failure branches by contract.
3. Fix violations at the responsible producer/caller; no downstream masking, normal-result conversion
   or continued invalid-state propagation.
4. Necessary external-input/security checks and contracted failure handling belong at their boundaries;
   internal code trusts validated results, without layer-by-layer defense.
5. Remove redundant defenses within changed scope; this rule alone never justifies wider cleanup or
   contributions without error proof. Contribution/security gates still apply.
6. Every CI/test change retains only actual supported call/use coverage and essential checks;
   authorized maintenance also removes excess. Never drop necessary checks to mask failures.

## Assigned audit and grouped delivery

Complete the assigned issue classification and [usage/documentation audit](audit.md); publishing a repair
never narrows that remaining scope. A complete, independently proven and appropriately validated repair may
ship before unrelated audit work finishes. Group same-root fixes/errata; separate independent errors, reuse
matching objects and discard duplicates. Do not split an incomplete repair or claim whole coverage from a PR.
Evidenced unresolved problems may be issues/discussions; unsupported suspicions are not deliverables.
New security findings use private reports only. Incremental work retains its original scope.
