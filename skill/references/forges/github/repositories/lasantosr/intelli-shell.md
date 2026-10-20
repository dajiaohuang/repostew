# IntelliShell

Apply these directions to the related contribution scope and recheck current target instructions.

- `docs/src/` is the public user-facing mdBook. Update it for user-visible behavior changes such as CLI options, configuration, defaults, keybindings, and workflows. Do not add book changes for internal refactors; when feedback asks to revert such a change, remove only the documentation hunks and preserve the requested code and regression tests. [Repository instructions](https://github.com/lasantosr/intelli-shell/blob/main/AGENTS.md), [PR #72](https://github.com/lasantosr/intelli-shell/pull/72), [PRs #67–#69](https://github.com/lasantosr/intelli-shell/pull/69).
- For JSON HTTP imports, apply tags as items enter the stream, then use the same lazy command filter as other import paths. Matching commands are filtered and completions pass through; avoid collecting a second intermediate `Vec`. [Maintainer feedback on PR #70](https://github.com/lasantosr/intelli-shell/pull/70).
