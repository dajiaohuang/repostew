# nlohmann/json

Scope: contributor revisions against `develop`; recheck current PR feedback and build
configuration before applying these lessons.

- Contributions target `develop` and require DCO sign-off. Edit the canonical
  `include/nlohmann` source and regenerate `single_include/nlohmann/json.hpp` with the
  repository's amalgamation and pinned AStyle formatter; do not hand-edit generated
  output. See [contribution guidelines](https://github.com/nlohmann/json/blob/develop/.github/CONTRIBUTING.md)
  and the [Ubuntu CI workflow](https://github.com/nlohmann/json/blob/develop/.github/workflows/ubuntu.yml).
- Keep deep-nesting regressions in `tests/src/unit-large_json.cpp`; the maintainers
  reserve `unit-regression2.cpp` from further growth because of MinGW linker limits.
  See [PR #5517 test placement](https://github.com/nlohmann/json/pull/5517#discussion_r4086629387).
- In `flatten_task`, retain the `noexcept` converting constructor and explicitly
  default the copy/move constructors, copy/move assignments, and destructor without
  explicit exception specifications. The reviewed type and warning matrix requires
  this combination for `-Weffc++`, GCC 4.8, clang-tidy, and `-Wnoexcept`; the earlier
  rule-of-zero suggestion was superseded by the maintainer's later compiler evidence.
  Re-evaluate if the type or supported toolchain changes. See [PR #5517 final special-member guidance](https://github.com/nlohmann/json/pull/5517#discussion_r4087102664).
- On Windows, the amalgamation script's include-path deduplication can treat slash
  variants of the root source as different paths and duplicate `json.hpp`. Run the
  generator in a POSIX environment or normalize the configured source path, then run
  the pinned formatter and verify the generated diff is limited to the source change.
