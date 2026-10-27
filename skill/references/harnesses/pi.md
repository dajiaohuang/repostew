# Pi

RepoStew's supported Pi integration is `extensions/pi-native.js`, using Pi's official
[prompt-customizer](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/prompt-customizer.ts),
[tools](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/tools.ts)
and [reload-runtime](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/reload-runtime.ts)
patterns. It adds a role prompt, runtime status and native gh authentication check.
Pi owns tools, settings, sessions, compaction and cancellation; the selected host
owns queue, delegation and lifecycle. No parallel scheduler, completion loop or approval gate.

Use [seat context construction](openrig-context.md) for integrated C/W contracts.
Configure each real Pi agent directory explicitly:

```sh
rtk node <bundle>/scripts/configure-pi.mjs --agent-dir <agent-dir> --workspace <workspace> --role worker --seat-guidance <absolute-contract> --trust-projects
```

For a managed OpenRig seat, also pass `--openrig-home <the-selected-instance>`
(or use that instance's existing `OPENRIG_HOME`). The configurator adds the installed
`plugins/openrig-core/skills` directory through Pi's native skill settings. It preserves
existing `seatGuidance`, OpenRig roster bindings and other profile fields. The package's
single `pi-native.js` entrypoint includes the read-only `repostew_openrig_slots` tool;
do not additionally load the historical `pi-native-seats.js` entrypoint.
Coordinator refill rules are composed with configured seat contracts; a custom contract
must not suppress them. Source selection order and completed coverage are distinct.
The slot projection separates executing assignments, returned results and blocked
obligations. `waiting-reconciliation` is not automatically available: reconcile that
Worker's execution and ownership without holding unrelated available Workers.
`processClearance: "unknown"` means unmeasured, not a fleet-wide approval requirement.
After changing extension code, reload only at an idle boundary and verify the loaded
version; changing a contract is read by the existing before-agent-start hook next turn.
Official Claude/Codex hook manifests are not Pi extensions: activity and lifecycle still
belong to OpenRig's Pi runner, while RepoStew retains its business rules. Model activation
extensions with explicit user authority remain separate until their setting is preserved
and verified by a native replacement.

Use `coordinator` for C and `general` for unassigned interactive use. Configuration
sets native tools (read/bash/powershell/edit/write/grep/find/ls/codemode/tool_search),
the extension path and a non-secret `repostew.json` role/workspace/gh-path profile.
`--trust-projects` explicitly enables Pi's native `defaultProjectTrust: always`;
it is not OS elevation or authority for unassigned work. The profile adds no
routine confirmation before assigned setup, repair, tests or authorized publication.
Actual user/target restrictions, destructive-action authority and privacy remain.

For Windows setup that derives paths before writing, use task-specific variable
names such as `$taskRoot`; never assign `$HOME`/`$home` (PowerShell is case-insensitive).
Set `$ErrorActionPreference = 'Stop'` inside the actual PowerShell script, including
a PowerShell child launched from Bash. A parent shell setting does not protect the
child. Check each native program's `$LASTEXITCODE` separately: `Stop` does not make
native exit codes terminating in Windows PowerShell. Do not continue dependent
writes after failed path setup, and resolve task caches under the assigned work root.

GitHub CLI keeps its own login/keyring. The configurator resolves its documented
[configuration path precedence](https://cli.github.com/manual/gh_help_environment)
and supplies `GH_CONFIG_DIR` and `GH_PROMPT_DISABLED` through Pi's official
[`shellCommandPrefix`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/shell-aliases.md)
setting. The extension supplies the same missing path to its process environment,
covering native PowerShell and `pi.exec` as well. No token is read, copied or stored.
Existing token/config environment overrides retain precedence. Use native `gh`
commands and `--body-file` for multiline text; `repostew_gh_status` verifies the
existing login with a read-only authenticated API request and returns no credentials.

`repostew_runtime_status` shows the actual role/tools/version and non-secret paths.
`/repostew-reload` uses native `ctx.reload()`; activate initial installs at a safe
host-supported lifecycle boundary. Config files alone do not prove a live load.
Verify native role/tools, local file and shell execution, gh identity and return
to the original queue obligation. Never replace an active writer blindly.

The former `pi.js` + `pi-extras.js` integration is deprecated and no longer auto-loaded.
Remove its exact configured entries before enabling this extension. Retained old
code/history supports rollback only; do not load both generations. The
[legacy extras reference](pi-extras.md) documents historical behavior, not current defaults.
