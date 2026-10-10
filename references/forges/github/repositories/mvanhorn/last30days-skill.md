# mvanhorn/last30days-skill

- Query repairs must preserve multi-word search recall; quoting the whole topic as an exact phrase is not a neutral sanitizer. Verify intended search syntax before changing query construction.
- Review against the actual branch base: importing modules or constants introduced only on newer main makes an otherwise plausible fix unusable. Reuse the existing repair with tests instead of competing with it.
- Scope: rejection of PR #1233 in favor of #1179, not a refusal of external contributions. Source: [maintainer reply](https://github.com/mvanhorn/last30days-skill/pull/1233#issuecomment-6038035997). Consult GitHub for current object states.
