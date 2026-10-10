# Pi

Bind `/repostew-workspace <directory>`, then `/repostew <task>`; binding follows native session branches.
The extension adds one prompt section; it owns no execution, queue, counter or watcher.

Use Pi's shipped `examples/extensions/subagent` when delegation is authorized; configure
`repostew-worker` with the package script, load that example explicitly, select project agents
through its native trust flow. Omitted model inherits the parent; omitted tools use native defaults.
One finite parallel call: at most eight tasks/four simultaneous children; respect any lower authorized
limit. Do not stack calls to inflate capacity. Native process close releases capacity; streamed
unfinished counts include queued work. Children are ephemeral: continue through records after exit.
Pi `agent_settled`, not `agent_end`, marks a settled parent turn. No extra completion report.

Native backend: [shipped subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent).
