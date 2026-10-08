# rhash/RHash

Apply the review lesson narrowly to related filename-scanning changes.

- Prefer keeping the existing pointer-scan structure when a small bounds guard fixes the defect. If changing the loop is necessary, include a regression that checks behavior against the base implementation; the maintainer questioned an unverified loop rewrite in [PR #321](https://github.com/rhash/RHash/pull/321).
- For canonical hash-name handling, include executable CLI regressions for canonical names and aliases and preserve existing template directives; the owner required tests in [PR #319](https://github.com/rhash/RHash/pull/319#issuecomment-5983278679).
