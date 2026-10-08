# NVIDIA/SkillSpector

Apply these directions to the related feedback scope and recheck current target instructions.

- `CONTRIBUTING.md` requires a `Signed-off-by` trailer on every commit (`git commit -s`).
- The batch scanner's `_print` must honor its `file` argument with Rich and with the plain fallback. JSON and Markdown stdout must remain parseable while progress and error diagnostics go to stderr; test both formatter availability branches. [PR #789](https://github.com/NVIDIA/SkillSpector/pull/789).
- Use the same slash normalization and percent-encoding for SARIF finding and notification artifact URIs. Include filenames with reserved characters such as `#` and spaces in notification tests. [PR #789](https://github.com/NVIDIA/SkillSpector/pull/789).
