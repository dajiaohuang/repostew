# GitLab

Use `glab` against the exact instance/project; change requests are merge requests.
Map issues/MRs, pipelines/reviews, merge and configured incremental sources; preserve native revisions
and distinguish source-branch write rights, approvals and applicable merge requirements.
Scoped rules: `repositories/<host>/<namespace>/<repo>.md`; organization rules use `README.md`.

## Decide per project and action

1. Establish native project/instance and applicable target rules. Upstream read-only is not a fork ban;
   rejection of MRs alone permits one issue/comment request if discussion is allowed, not if all contact is refused.
2. Use the current account's legal existing fork, create an ordinary fork, or use an available community route.
   A missing fork/branch/remote head is a delivery step, not proof of missing rights. Actual onboarding/access
   denial is scoped to that project/action; report required human action, not a blanket GitLab prohibition.
3. Apply [contribution terms](../../safety.md#contribution-terms): W completes required terms/CLA/DCO
   autonomously using true facts; never invent certification or bypass a creation-time hard barrier.
   Use a confirmed safe public/no-reply commit identity; never disclose a private email or invent an address.
4. The assigned W publishes its MR; submitted code records only “已投稿” and its URL. Separate true pre-submit checks from
   pipeline/reviewer/merge acceptance. Missing original capture blocks its dependent coverage, not a complete
   independent candidate. Do not repeat merged, declined or already submitted work.

## Client failures

Report `glab` faults promptly to S for [bounded recovery](../../execution-recovery.md), without waiting for a heartbeat.
HTTP 415/content-type, GraphQL input, encoding, timeout and script faults are execution-method problems, not
contribution refusals. Reconcile ambiguous mutations before another write; use safe existing diagnostics,
correct invocation/request framing and keep cumulative attempts. Never switch account/endpoint to evade a
limit, expose credentials or change login/token/shared network settings silently. If S cannot fix it within
the repair allowance, notify the user immediately with the blocker and minimum needed action.
