# Safety without an orchestration protocol

- Read target AGENTS.md, CONTRIBUTING, templates and SECURITY.md. Contributor scope
  does not grant merge/close/delete/release/upstream-push or maintainer authority.
- Resolve evidenced useful defects with implementation, tests and eligible delivery.
  Difficulty alone is not a blocker. No fabricated issue, PR or quota.
- Check existing issue/PR/discussion/fix and policy before submission. Respect
  invitation/assignment/security gates; no dummy permission probes. A legitimate
  fork PR does not require upstream push permission. Lack of upstream write permission
  or read-only access is not a contribution blocker: evaluate the authorized fork/PR
  route before withholding delivery. If that route is unavailable, name its actual
  policy or service error separately from missing native validation; never infer a fork
  prohibition from upstream write access or broaden contributor authority.
- Preserve dirty/unpushed/unknown work. No reset or cleanup of independent projects,
  Go caches/toolchains/build output. Use isolated work when needed.
- Security findings/mail/credentials stay private. Without an authorized disclosure
  channel, retain the concrete blocker.
- Update only contributor-controlled branches. Reconcile uncertain remote effects
  before retrying, rather than submitting duplicates.
- Validate changes and distinguish local/CI/deployed evidence and scanned/tested/
  submitted/merged facts. Blocked is not done.
- No unnecessary public tool/model/agent/generated attribution. Comply truthfully
  with explicit disclosure requirements, never fabricate identity or endorsement.
- Completion needs ordinary evidence, not binding or a structured receipt.

Apply these gates using [lean leaf validation](leaf.md): initial full inspection,
then relevant live deltas, affected-scope tests plus mandatory requirements and one
combined final review. Reuse unchanged facts, not stale volatile decisions. One
reliable publication result is enough; ambiguous external writes still need reconciliation.

## Feedback-derived review rules

Apply these when the candidate touches the corresponding contract; they do not
require unrelated tests or broaden a repository's submission restrictions.

- Establish the intended contract before changing behavior: supported constraints,
  numerical invariants, backend units, defaults and public API semantics. A safer-looking
  implementation is not proof of a defect. See [libdivide](repositories/ridiculousfish/libdivide.md),
  [doocs](repositories/doocs/leetcode.md), [FinancePy](repositories/domokane/FinancePy.md)
  and [Magrit](repositories/riatelab/magrit.md).
  Scope backend-specific limits to that backend; a hosted service's restriction does
  not establish the same constraint for custom/local servers. Numerical restrictions
  need an authoritative source; see [system-one-connector](repositories/itsmostafa/system-one-connector.md).
- When maintainers question compatibility cost or practical value, establish a
  reproducible supported use case and concrete benefit before pursuing equivalent
  behavior changes. Use the maintainer-requested real fixture or dataset when one is
  needed to establish that use case; do not invent personal usage or add unrelated
  sample contributions solely to validate hypothetical behavior. If no concrete case
  supports the change, withdraw it and its linked defect report when appropriate.
  See [MAST](repositories/RGLab/MAST.md) and
  [TidyTuesday](repositories/rfordatascience/tidytuesday.md).
- Trace the complete affected path: initial and live updates, all shared-state readers,
  identity consumers, restart/replacement generations and delivered artifacts. Fix at
  the canonical layer, including generated documentation or a shared dependency when
  appropriate. For generated code, change the authoritative schema/API or generator
  input and regenerate; a hand-edited output will be overwritten. See
  [Latitude](repositories/latitude-dev/latitude-llm.md),
  [OpenRig](repositories/mvschwarz/openrig.md),
  [Proxcenter](repositories/adminsyspro/proxcenter-ui.md) and
  [Godot Rapier](repositories/appsinacup/godot-rapier-physics.md).
- Make defect regressions exercise the real reachable path with supported fixtures
  (including invalid inputs covered by an explicit handling contract) and deterministic,
  bounded waits. Check that the regression exposes the base defect;
  use sanitizer or platform evidence when ordinary output cannot distinguish it.
  Adapt mocks to production interfaces, not production semantics to broken mocks.
  When a failed observation should remain retryable, exercise the real rollback and
  retry with the same authoritative input; assert both restored state and that the
  second attempt reaches the operation again.
  For machine-readable CLI output, assert stdout parseability and stderr diagnostics
  across optional formatter branches. Apply path escaping consistently to primary
  records and their notifications, including reserved-character fixtures.
  Diff cleanliness does not prove compilation or behavior; validate the changed path
  before asking maintainers to review. See [MelonLoader](repositories/LavaGang/MelonLoader.md),
  [WebSocket-for-Python](repositories/Lawouach/WebSocket-for-Python.md),
  [Firebase](repositories/firebase/firebase-ios-sdk.md),
  [Deep Lake](repositories/activeloopai/deeplake.md) and
  [Places](repositories/custom-components/places.md).
- Preserve uncertainty and lifecycle guarantees: failed observations are not confirmed
  offline/healthy state; cancellation and shutdown must preserve notification and
  in-flight-work contracts. Report incomplete work accurately. Deferred work is a
  warning unless the actual contract or target policy requires refusal.
  See [OpenRig](repositories/mvschwarz/openrig.md) and
  [Proxcenter](repositories/adminsyspro/proxcenter-ui.md).
- Classify feedback before acting: a question, optional suggestion, revision request,
  rejected direction, takeover and submission-method refusal differ. Apply a confirmed
  rejection to equivalent candidates and existing work, within its exact scope;
  recheck temporary restrictions. Do not replace required native checks with unrelated
  green CI, or persist with competing fixes after a confirmed handoff.
  For curated resource lists, verify displayed titles against the primary resource and
  use only the target's supported license annotations. See
  [Free Programming Books](repositories/EbookFoundation/free-programming-books.md).
  For partial revision requests, change only the requested scope and verify the live
  PR head and file list after pushing; a corrected diff is not final acceptance.
  See [repository reference scope](repositories/README.md),
  [TileLang](repositories/tile-ai/tilelang.md) and
  [wBlock](repositories/0xCUB3/wBlock.md).
- For dynamic query ordering, use the framework's structured order API instead of
  interpolating values into SQL; verify accepted/default directions and rejection of
  invalid directions against the pinned framework version. See
  [Huginn](repositories/huginn/huginn.md).
- When maintainers supersede earlier advice after checking compiler or linter
  diagnostics, follow the latest evidence-backed direction. Map each requested change
  to the concrete toolchain warning and supported type behavior; do not reuse a broad
  idiom that the target's flags reject. See [nlohmann/json](repositories/nlohmann/json.md).
- Distinguish optional support being absent from an explicit operator setting being
  invalid. Fallback for an unavailable optional import only; preserve malformed
  configured trust errors, and test valid and invalid settings through each affected
  caller. See [Headroom](repositories/headroomlabs-ai/headroom.md).
- When a helper intentionally propagates configuration failures, translate them at
  user-facing boundaries to the caller's established error contract while preserving
  the cause. Test the real command path and verify the failure occurs before network or
  other side effects. See [Headroom](repositories/headroomlabs-ai/headroom.md).

## Prefer a regular open PR

Within authorized work, claim available issues directly through the target's permitted
process, complete the repair and submit a regular Open PR when the conditions below hold.
No additional general approval or mandatory Draft stage is required; honor explicit target gates.

1. Target rules permit unsolicited contributions without an outstanding invitation,
   assignment, design or disclosure gate.
2. The issue/direction remains available: no competing claim/PR, equivalent current-base
   fix or explicit rejection. Check all relevant object states before submission.
3. Expected behavior and compatibility are clear from discussions, source, tests and
   project conventions; do not submit a known ineffective candidate.
4. The smallest complete, reviewable and reversible patch preserves interfaces/defaults
   and crosses no separate dependency, service, security or authority gate.
5. The mandatory [error gate](contribution-value.md#general-submission-standards) passes:
   actual supported use/calls reach the defect, or documentation contains a verifiable
   existing error. Reproduction or strong source proof establishes that error;
   relevant feasible checks pass and target-
   mandated prerequisites are satisfied. Separate unrun environment-dependent checks
   from explicit submission requirements; no local native toolchain alone is not a ban.
   Apply the [actual-use evidence standard](contribution-value.md#defect-evidence-for-submission-and-reassessment).
   Check numerical bounds and language semantics;
   performance claims need evidence of an actual bottleneck.
6. Follow the permitted base branch, style, templates, public identity and truthful
   validation caveats. A target's actual contribution route matters independently of
   whether another hosting service happens to accept a PR request.

Re-evaluate an existing Draft under these conditions and mark it ready when eligible;
do not create a duplicate or ask again merely because a previous attempt was cautious.
Missing local native tests do not automatically require Draft when strong source proof
and appropriate focused validation support the change and target rules permit delivery.
No claimed native, CI or runtime pass may replace an unrun check.

If a hosting service limits open regular PRs, submit an otherwise ready contribution as Draft with the limit stated, then mark it ready when a slot becomes available.

Use Draft otherwise only for a concrete remaining implementation/validation/decision uncertainty
when early submissions are permitted, describing that uncertainty without closing
keywords or implying approval. Required prior invitation/assignment/agreement prohibits
an upstream Draft too; use a permitted fork-only proposal or retain a tested branch.
Explicitly prohibited public prototypes/security disclosures stay private. An archived
contribution endpoint does not authorize changing products or presenting a mirror PR
as accepted delivery to the designated endpoint; preserve the actual route and outcome.
Do not invent findings or a PR quota to make every repository produce a submission.
