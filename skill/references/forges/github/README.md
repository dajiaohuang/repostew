# GitHub

Use `gh` against the exact host/repository; map issues, PRs, checks/reviews, merge and notifications.
Keep current-head evidence, actual branch-edit/merge rights and applicable protection requirements distinct.
Read only applicable [organization/repository rules](repositories/README.md); enterprise instances add host scope.
Apply the classified [AgentScan exclusions](exclusions/agentscan.md): participants by owner,
public adopters by exact repository; retain existing objects/history and action authority.
For public GitHub, `gh --hostname` is `github.com`, not `api.github.com`; retain the exact enterprise host when applicable.

## Optional policy lookups

Preserve bounded raw responses/errors before text conversion. A GraphQL nonzero exit may contain valid
primary-repository data plus an error for an optional owner `.github` repository. Inspect structured
error type/path: only a missing optional object (404 or its corresponding `NOT_FOUND`/null) is a
path-local unavailable-policy result, not proof of authentication denial, contribution refusal or
whole-repository failure. Record the request/bytes/error; do not retry, follow redirects or guess aliases.
Establish primary identity/access before further scoped reads. Completing required policy reads is
allowed within the original authority and budget; engineering/publication still require all applicable
policy gates to be satisfied. Missing policy is not permission to start an audit, nor a ban on obtaining it.
Unknown/mixed errors, transport/authentication/rate failures or missing mandatory policy remain gates.
Keep this handling explicit in assignments. Distinguish a missing optional policy from a tool fault;
ordinary stopped helpers follow [bounded recovery](../../execution-recovery.md), not permanent blanket bans.
Preserve actual user/target prohibitions, cumulative attempts and expired-phase facts.

## Publication and client faults

Each repository W completes its own fork/branch/push/PR; absent fork/head is a step, not a refusal.
Apply [contribution terms](../../safety.md#contribution-terms): submit before CLA/DCO prechecks, then report
actual signing requests without signing. Ordinary automatic checks are not a manual-CI or deployment grant.
A PR-only refusal permits one evidenced issue or relevant comment where discussion is allowed; explicit
no-contact/no-external-contribution/AI-interaction refusals must not be bypassed through another channel.
Report `gh` faults promptly to S for immediate safe diagnosis and bounded repair on the failure-event turn.
Correct arguments, GraphQL/request format, encoding and native timeouts; preserve failed attempts and reconcile
uncertain mutations before retry. No credential dumps, account/endpoint shopping, blind retries or silent
login/token/proxy changes. If unable to repair, S immediately tells the user the exact blocker and needed action.
