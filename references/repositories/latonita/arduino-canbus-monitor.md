# latonita/arduino-canbus-monitor

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- Can232 contains MCP_CAN rather than inheriting it: expose needed access through the wrapper. Preserve RTR DLC while omitting payload bytes and compile the real can-232/mcp_can paths. [Feedback #18](https://github.com/latonita/arduino-canbus-monitor/pull/18).
- Separate source/compile evidence from requested hardware r/R output. A pre-existing fake-mode failure does not justify claiming that mode passed. [Feedback #18](https://github.com/latonita/arduino-canbus-monitor/pull/18).
