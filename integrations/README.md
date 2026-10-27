# Harness packages

From the source repository, validate with `rtk python scripts/validate-policy.py`,
then build with `rtk python scripts/build-package.py`.
Output: `dist/repostew/`; rebuild into a new directory with `--output <path>`.
One bundle, one canonical skill; generated copies are never edited.

| Harness | Load/install from the source repository | Invoke |
| --- | --- | --- |
| Codex | `rtk codex plugin marketplace add ./dist`, then `rtk codex plugin add repostew@repostew-local` | `$repostew` |
| Claude Code | `rtk claude --plugin-dir ./dist/repostew` | `/repostew:repostew` |
| Pi | `rtk pi install ./dist/repostew` | Configure an explicit agent profile, then use native prompts and `/repostew-status` |
| OMP (oh-my-pi) | `rtk omp --no-extensions -e ./dist/repostew` | `/repostew <task and workspace>` |

The Pi integration uses the single `pi-native.js` extension, following official prompt, tool
and reload patterns. Configure each agent with
`rtk node <bundle>/scripts/configure-pi.mjs --agent-dir <dir> --workspace <workspace> --role coordinator|worker`.
Add `--seat-guidance <absolute-contract>` for an assembled C/W contract and
`--openrig-home <selected-instance>` for installed official skills. See the bundled
[seat context guide](skills/repostew/references/harnesses/openrig-context.md).
Add `--trust-projects` when that native trust policy is explicitly wanted.
This enables native editing/search/shell tools and existing host gh authentication
through non-secret configuration paths. No separate runtime, token store, approval
gate or automatic completion loop is installed. See [Pi](skills/repostew/references/harnesses/pi.md).
The former `pi.js`/`pi-extras.js` implementation is deprecated; remove its exact
settings entries before enabling the new extension. Old files remain for rollback.
OMP retains its existing command. These integrations create no execution service.
Roles/forms/methods remain assembled by the Coordinator. Native delegation and permissions
come from the harness; installation grants no public, maintainer or schedule authority.
Workspace instructions/state stay outside the package: each native project uses
`state/repositories/<host>/<namespace>/<repo>/state.md` with ignored local `work/`.
Assignments supply that current project home; workers write shared project facts, not global lists
or a separate root work tree. Installation never publishes local records or binds a backup as runtime.
Other skill-capable harnesses can load `skills/repostew/SKILL.md` directly.

Configure Codex native Workers: `rtk python <bundle>/scripts/configure-workers.py <workspace>`.
This creates only a Codex role-config file, preserves different existing definitions and prints CLI overrides;
it changes no global config, model, permissions or concurrency. Existing Pi plugin files are left untouched,
not generated or loaded. Pi uses the host's authorized delegation, not a subagent plugin.
See [Pi](skills/repostew/references/harnesses/pi.md), [Codex](skills/repostew/references/harnesses/codex.md)
and [T3-owned orchestration](skills/repostew/references/harnesses/t3.md) for the actual backend.
Completed assignments do not bind future work to their Worker/model; reuse valid evidence and select
suitable execution at task boundaries, preserving one writer and safe handoff.

Formats: [Codex](https://developers.openai.com/plugins/build/plugins),
[Claude](https://code.claude.com/docs/en/plugins), [Pi](https://pi.dev/docs/latest/packages),
[OMP](https://github.com/can1357/oh-my-pi/blob/main/docs/extension-loading.md).
