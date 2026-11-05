# RepoStew Codex integration

Codex CLI and local Codex app sessions share project configuration. This adapter
implements the applicable Pi extension behavior with native hooks and read-only MCP
tools; it does not create a runner, scheduler, token store or task queue.

| Pi behavior | Codex equivalent |
| --- | --- |
| Role/seat guidance on each turn | SessionStart/UserPromptSubmit read fixed contract and separate current facts |
| Runtime and tool status | `repostew_runtime_status`; native MCP/tool discovery owns actual activation |
| Existing gh login | `repostew_gh_status`, non-secret GH_CONFIG_DIR inheritance |
| OpenRig bridge and slots | `openrig_runtime_status`, `openrig_slots`; same shared native fact projection |
| Whole-state grep guard / oversized grep context | PreToolUse/PostToolUse hooks; original native result remains unchanged |
| Reload / restore tools | Native Codex reconnect/restart and explicitly selected MCP/tools; no invented Pi commands |
| codemode / tool_search | Use native code mode/tool discovery when exposed by the selected host |
| Seat-specific model activation | Existing OpenRig model/effort selection, never a package default |
| Turso-specific recovery | Existing applicable MCP/tool configuration; no embedded account or database binding |

Pi and Codex both compose `skill/integrations/seat-guidance.js` for coordinator
continuation and Worker result-return obligations. This shared text creates no
scheduler: OpenRig's atomic handoff creates the receiving task and native wake;
a completed state with only a recipient label is not that handoff.

Create a local profile with `version: 1`, absolute `workspace`, `role`
(`general`, `coordinator`, `worker`), optional absolute `seatGuidance`, `currentFacts`,
`skillRoot`, optional `gh.configDir`, and optional explicit local OpenRig `binding`
(`url`, `rig`, `observer`, `seats`). Profiles and facts are local deployment inputs.

`rtk proxy node harnesses/codex/configure.mjs PROJECT_DIRECTORY PROFILE_JSON`

The configurator preserves other MCP/hook entries and refuses differing existing
RepoStew entries. It changes only project `.codex` configuration, never global
permissions/model/login. Review and trust the hooks using native Codex controls;
installation is not proof they ran. Restart/reconnect the selected session. Read
`repostew_context` after recovery to refresh facts, without replaying old tasks.

For Codex Cloud/web, these files must exist in the actual execution environment.
Local paths, localhost daemons, host credentials and hook trust do not travel to the
cloud. Use the existing `codex-cloud` task transport with an assembled contract and
current facts; use environment-provided tools/auth. Mark unavailable capabilities
explicitly rather than treating local installation as hosted activation. T3-hosted
Codex uses T3's exposed tools/lifecycle, not native Codex subprocess APIs.

Validate: `rtk proxy node --test harnesses/codex/*.test.mjs`.
Official APIs: [hooks](https://learn.chatgpt.com/docs/hooks),
[plugin packaging](https://developers.openai.com/plugins/build/plugins).
