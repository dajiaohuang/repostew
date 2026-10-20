# doocs/leetcode

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- The cited feedback rejects replacing recursive DFS with explicit stacks or memoized search with iterative DP. Preserve the intended solution style; recursion alone is not a defect. [Feedback #5961](https://github.com/doocs/leetcode/pull/5961).
- Compare the actual current-main implementation before opening or retaining a repair; an already-landed change does not justify another PR. [Feedback #5829](https://github.com/doocs/leetcode/pull/5829).
- Judge correctness under the published problem constraints; zero-length handling adds no accepted-input benefit when n >= 1. [Feedback #5859](https://github.com/doocs/leetcode/pull/5859).
- Reproduce the reported skyline failure under valid constraints; an extra guard is not a repair when the existing sweep already returns the correct result. [Feedback #5915](https://github.com/doocs/leetcode/pull/5915).
