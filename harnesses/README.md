# Optional execution harnesses

[Pi](pi/README.md) supplies a separate execution service and governance entry.
It is not loaded by the Skill/plugin installer and starts no assignments on installation.
Runtime data and credentials remain outside Git.

[Codex](codex/README.md) maps the applicable Pi context/status/gh/OpenRig and bounded-search
features onto native Codex hooks and read-only MCP, without an execution service.
CLI and local app sessions share the adapter; cloud/web must install it in their own environment.
