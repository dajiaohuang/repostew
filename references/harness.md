# Harness integration

Native adapters: [Pi](harnesses/pi.md), [Codex](harnesses/codex.md). Reuse official coverage.

Map native capabilities to the selected task; no fixed vendor, model, OS, tool or thread API.
Harness supplies execution/tools/scheduling; RepoStew supplies policy and assignments.

## Capabilities depend on the selected work

- Access live target policy/objects and authoritative Markdown/source through supported interfaces.
  Executions share one authoritative state, not divergent copies. Missing write access is a blocker.
- Delegate only when authorized, with sufficient context/action limits; child work does not
  authorize top-level conversations or persistent jobs.
- Retain native handles; receive final results, attention/errors through events or supported waits.
  No transcript/record polling, duplicate relays or custom watcher/receipt service.
- Continue the same task when supported; otherwise end its writer, preserve work and hand off.
- Schedule only when requested; preserve existing activation. Manual passes do not resume jobs.

## Context and workspace mapping

Use [assembly](worker-assembly.md): readable canonical files or complete applicable inline text.
Establish needed context inheritance, shared access, result relay and continuation once when unknown.
Bind the actual workspace and assigned native project home, not cwd/target checkout. Share only project
state.md and necessary task facts; work/ is device-local, not automatically inherited or published context.
Keep APIs, credentials/accounts/private IDs, models, concurrency, cadence and schedule IDs
in workspace/harness configuration. Native permissions remain binding; no silent setting substitution.

## Limits and compatibility claims

Without delegation, serial execution may combine roles; unavailable explicitly requested behavior
remains a blocker. Source failure is unknown coverage; publication failure does not change destination.
Portability is not certification: verify actual instructions, permissions, results, continuation/handoff,
state and source operations before claiming integration. Add adapters only for real validated needs.
