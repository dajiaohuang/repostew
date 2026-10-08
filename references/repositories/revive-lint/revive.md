# revive-lint/revive

- The project rejected making constant-logical-expr a typed rule; do not submit equivalent type-checking refactors for that rule. The rejection does not by itself invalidate the independently supported false-positive report or other rules already using types. [Rejection](https://github.com/revive-lint/revive/pull/1825#issuecomment-6037184457).
- AST panic proof must use nodes emitted by the supported Go parser. Empty case clauses have nil Body and are caught by the existing nil guard; a hand-built non-nil empty slice is not evidence of a reachable linter crash. [Review](https://github.com/revive-lint/revive/issues/1875#issuecomment-6015382876).
