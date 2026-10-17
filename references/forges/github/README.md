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
Continue only when primary identity/access and all applicable required policy are established.
Unknown/mixed errors, transport/authentication/rate failures or missing mandatory policy remain gates.
Keep this handling explicit in new scoped assignments; it does not override existing strict stops,
restore expired deadlines or refund consumed budgets. Previously stopped units need their own disposition.
