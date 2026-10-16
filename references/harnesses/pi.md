# Pi

Bind `/repostew-workspace <directory>`, then `/repostew <task>`; binding follows native session branches.
The extension adds one prompt section; it owns no execution, queue, counter or watcher.

The limits below apply only when using Pi's shipped `examples/extensions/subagent`, not to every Pi
provider session. If the host supplies another delegation backend (such as T3-owned tasks), use that
backend's live capacity/lifecycle tools and instructions; do not apply this example's limits or substitute
its subprocesses for host-owned tasks. See [harness mapping](../harness.md).

For the shipped example, when delegation is authorized, configure
`repostew-worker` with the package script, load that example explicitly, select project agents
through its native trust flow. Omitted model inherits the parent; omitted tools use native defaults.
One finite parallel call: at most eight tasks/four simultaneous children; respect any lower authorized
limit. Do not stack calls to inflate capacity. Native process close releases capacity; streamed
unfinished counts include queued work. Children are ephemeral: continue through records after exit.
Pi `agent_settled`, not `agent_end`, marks a settled parent turn; it is not proof of all host-owned
descendants completing. No extra completion report. Within the selected backend's limits, perform
eligible dispatch/refill before yielding; a finite call is not the Coordinator's entire assignment.

Native backend: [shipped subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent).
