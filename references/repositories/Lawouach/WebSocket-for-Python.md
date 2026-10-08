# Lawouach/WebSocket-for-Python

Apply these lessons only within the cited scope; recheck current policy before future work.
See the [reference scope](../README.md).

- When sender validation changes, malformed-peer parser fixtures must construct invalid wire bytes directly; invoking the newly guarded sender prevents the test from reaching the parser. Preserve both sender-boundary and parser regression coverage. [Review](https://github.com/Lawouach/WebSocket-for-Python/pull/305#pullrequestreview-5398847785).
- Test the actual example's participant map and connection-close callback, including other participants and repeated or unknown removal. Include dependencies needed to import the example in the test environment. [Review](https://github.com/Lawouach/WebSocket-for-Python/pull/307#pullrequestreview-5398825517).
