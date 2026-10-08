# Contribution value

## General submission standards

Apply to new issues/PRs and existing authored contributions, independently of intake filters.
Use one mandatory gate for filing an issue, opening a PR and reassessing existing work:
establish an actual-use error or a verifiable documentation error before proceeding.
Passing target policy or CI does not waive this gate; Drafts have the same necessity gate.
Only submit or retain defect repairs for concrete errors reachable through actual
supported use and calls. Establish that trigger before choosing the smallest complete
compatible repair; hypothetical risk or cleaner implementation is insufficient.

Documentation repairs must correct a verifiable existing error in facts, commands,
paths, links, API usage or examples. Identify the erroneous statement or instruction
and prove the correction against authoritative sources or actual behavior. Wording,
formatting, optional additions and consistent standalone example names do not qualify.
Group minor genuine errors into one repository errata issue/PR.

Triage each candidate while auditing: establish the supported trigger and contract,
retain a qualifying error, discard an unsupported suspicion after bounded review,
or name the unavailable evidence and retry condition. Consolidate equivalent candidates
as they arise; do not defer all necessity decisions until final delivery. Private
unpublished evidence remains protected, and public withdrawals require authority.

## Defect evidence for submission and reassessment

1. Require a reachable actual-use chain: supported input/configuration → production call or documented
   public API → concrete error → violated existing contract. Check upstream/downstream
   consumers, state transitions and final results. Reproduction or strong source proof
   must establish the complete trigger and error, not merely suspicious code.
   A documented public API needs no in-repository caller, but requires a concrete supported
   invocation that reaches the error. Invalid input is relevant
   when validation, rejection or recovery is an explicit contract.
2. Restore intended behavior across the affected path, following project design,
   compatibility and applicable maintainer direction. For full-audit assignments, finish
   the assigned scope before grouped delivery; combine the same root cause and reuse matching objects.
3. Verify the behavioral correction and target-required checks; reuse unchanged evidence
   and expand testing for concrete uncertainty. Separate local, CI and actual-use acceptance.
4. Revise useful work according to valid feedback and correct mistaken explanations.
   After one bounded review of available source, contracts and relevant evidence, withdraw
   authored PRs whose necessity remains unestablished, within the user's authority. State
   "necessity not established", not "no defect" or "fixed". Temporarily inaccessible
   required evidence retains its concrete blocker and retry condition; it is not a defect verdict.
5. Before filing an issue, establish the trigger, actual/expected behavior, impact and
   evidence, or the exact documentation error and its authoritative correction.
   Before opening a PR, verify that it fixes that same established error completely;
   describe the minimal change, validation and remaining limits. Reassessment applies
   the same gate to the current base and diff, including inherited issues and patches;
   correct or withdraw unsupported defect reports within authority rather than keeping
   them to justify a PR. Follow
   [direct claim and Open PR rules](safety.md#prefer-a-regular-open-pr).

Artificial bad data, isolated helper calls, representation changes, green CI and prior
effort alone do not establish necessity. Cosmetic changes and optional completion are
not repairs. Do not manufacture scenarios, repeat unchanged tests or set closure/submission quotas
to justify contributions; a linked issue and PR are one contribution.

## HKUDS batch contribution thresholds

These user-selected filters apply to proactive full audits in the HKUDS organization batch. Other selections keep their existing rules.

The user selected only the priority group: nanobot, LightRAG, DeepTutor, DeepCode, RAG-Anything, Vibe-Trading, CLI-Anything, ViMax, AgentSpace, OpenOPC, OpenHarness, CatchMe, OpenSpace, AI-Trader, VideoAgent, ClawTeam and OpenPhone. Continue this batch serially; observation, deferred and documentation groups are outside its new-audit scope. Existing contributions retain necessary follow-up.

- Default to software with at least 500 stars, substantive source/runtime changes within 180 days, and a useful outside contribution merged or substantive maintainer response to an engineering problem within 180 days. Stars are an allocation filter, not proof of quality. Explicit user selection, actual use or maintainer invitation may justify a scoped exception.
- README, badges, contact details, licenses, automated dependency updates, non-default-branch pushes, our own submissions and maintainer self-merges do not alone establish maintenance or outside reception. Inspect actual changed files and native contributor/maintainer evidence. Unknown remains observation, not a claim of abandonment.
- Newly released software and one-off research implementations without continued maintenance/reception evidence remain observational; a concrete user need or accepted reproducibility problem can receive focused work.
- Resource collections and organization showcases remain eligible for useful targeted documentation repairs, but do not receive proactive full-audit batches merely because PRs are welcome. Prefer corrections affecting actual navigation, referenced sources or usage; related small documentation repairs belong in one coherent PR. Cosmetic wording, badges and alternative-text improvements alone do not justify a new proactive submission.
- Apply the same mandatory error gate to behavior, installation, data correctness, reliability, performance and documentation repairs; benefit alone does not qualify. Keep the full-assigned-audit and root-cause grouping rules for admitted full audits; do not impose a PR quota. Security work retains its real-threat-boundary and disclosure requirements.
- Selection changes retain historical membership, records and existing unresolved contributions. Continue necessary PR follow-up; never infer authorization to close public objects or erase followed membership from a reduced audit selection.
