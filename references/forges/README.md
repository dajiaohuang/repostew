# Forge capabilities

Use the target's native CLI: [GitHub](github/README.md), [GitLab](gitlab/README.md),
[Forgejo](forgejo/README.md); other forges follow the same mapping.
Map repository/issue/change-request reads and mutations, checks/reviews, merge and incremental sources.
Keep native host/identity/URLs/revisions/permissions/completion evidence; report missing capabilities.
Use native API access for CLI gaps, within existing authority; never infer equivalent semantics.
Load only applicable `<forge>/repositories/` organization/repository rules, outside shared prompts;
multi-instance targets add `<host>/`. Installation and references grant no authority.
Apply user-selected exclusions linked from the applicable forge page before selecting or continuing work.
