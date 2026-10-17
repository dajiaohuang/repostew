# Pi

Bind `/repostew-workspace <directory>`, then `/repostew <task>`; binding follows native session branches.
The default `extensions/pi.js` adds one prompt section, not an execution service or subagent backend.
Do not rebind or start a second assignment while busy; use native same-task steering/follow-up instead.

[Optional extras](pi-extras.md) adapt eight official example patterns: bounded completion checks,
structured factual results, streaming-aware deltas, explicit path/shell safety aids and a bounded native
read wrapper. They are shipped as `extensions/pi-extras.js` but not auto-loaded. Load that exact entry
explicitly alongside the base; package installation alone changes no execution or safety policy.
The helper's two-request continuation cap does not replace task budgets, engineering acceptance,
project state.md, real blocker handling or the owner's whole-scope continuation decision.

Use only the host's authorized delegation/lifecycle tools; in T3 follow the [T3 adapter](t3.md).
Verify the actual Pi version, extra-entry loading, command/RPC support and final settlement handling
before enabling extras in a hosted runtime; offline Pi 1.3.0 tests are not live T3 acceptance.
Do not load Pi subagent plugins or generate their agent definitions. Pi's provider name imposes no
RepoStew-specific child count, batch size, subprocess-release or thread-reuse rule.
Without an available authorized delegation backend, work serially where permitted; do not install a
plugin to emulate it or claim an explicitly required delegation capability is available.
