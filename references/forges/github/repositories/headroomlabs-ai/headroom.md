# headroomlabs-ai/headroom

Scope: contributor fixes to the CLI, trust configuration and associated test paths.
Recheck the live contribution guide and current supported trust policy before reuse.

- Bug-fix PRs require a reproduction and a test. Keep the required description
  sections complete, use the repository's conventional commit/title format, and do
  not edit `CHANGELOG.md`; release-please generates it. See [contribution
  guidelines](https://github.com/headroomlabs-ai/headroom/blob/main/CONTRIBUTING.md)
  and the [PR template](https://github.com/headroomlabs-ai/headroom/blob/main/.github/PULL_REQUEST_TEMPLATE.md).
- For urllib callers, catch only `ImportError` around lazy loading of the optional
  trust helper. A configured replacement bundle such as `REQUESTS_CA_BUNDLE` has
  replacement semantics: certificate parsing/context-construction failures must
  remain visible instead of silently switching to stdlib roots. Preserve any outer
  call-specific error policy, such as the update checker returning no update.
  See [PR #4011](https://github.com/headroomlabs-ai/headroom/pull/4011) and its
  [review](https://github.com/headroomlabs-ai/headroom/pull/4011#pullrequestreview-5446412709).
- Exercise valid and invalid configured bundles through both the binary-download
  and update-check helpers. Test doubles for `urllib.request.urlopen` must accept
  the production `context` keyword so tests remain valid when system trust is
  configured. Keep this validation narrow to the affected callers and trust path.
- The download helper must preserve context-construction failures as its
  `BinaryFetchError` contract with the original cause; test both the passthrough CLI
  and `tools install` to confirm a useful error is reported before any network call.
