# Contribution value

## General submission standards

Apply to new issues/PRs and existing authored contributions, independently of intake filters.
Prioritize concrete failures in supported use; choose the smallest complete compatible
repair whose benefit justifies its maintenance and review cost.

Documentation repairs correct misleading facts, commands, paths, links, API usage or
example behavior. Use authoritative sources and group minor errors into one repository
errata issue/PR. Internally consistent standalone examples need not share names.

## Defect evidence for submission and reassessment

1. Trace actual use: supported input/configuration → production call or documented
   public API → concrete error → violated existing contract. Check upstream/downstream
   consumers, state transitions and final results; use reproduction or strong source proof.
   A documented public API needs no in-repository caller. Invalid input is relevant
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
5. Explain trigger, actual/expected behavior, impact and evidence in the issue; explain the
   minimal complete change, validation and remaining limits in the PR. Follow
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
- Deliver concrete improvements to behavior, installation, data correctness, reliability, performance or essential usage documentation, supported by reproduction or strong source evidence. Keep the full-assigned-audit and root-cause grouping rules for admitted full audits; do not impose a PR quota. Security work retains its real-threat-boundary and disclosure requirements.
- Selection changes retain historical membership, records and existing unresolved contributions. Continue necessary PR follow-up; never infer authorization to close public objects or erase followed membership from a reduced audit selection.
