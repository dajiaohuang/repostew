# bencheeorg/benchee

- Display only the percentile rank whose value is present; do not silently substitute another rank. Represent absence explicitly, and test the complete `Benchee.run` console path across runtime, memory and reductions. Statistex computes quartiles even when the configured percentile list is empty.
- Tag increments match the exact original tag or its numeric suffix, with the desired tag regex-escaped and the whole string anchored. Fix the filtering layer rather than tolerating unrelated tags in the integer parser; retain existing loaded tags.
- README expansion mentioned as work for another time is optional follow-up, not a requirement to enlarge the current repair.
- Sources: [percentile review](https://github.com/bencheeorg/benchee/pull/490#pullrequestreview-5281575728), [tag filtering review](https://github.com/bencheeorg/benchee/pull/492#discussion_r4074770659).
