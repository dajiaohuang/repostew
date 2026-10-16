# Harness packages

Build from the source repository: `rtk python scripts/build-package.py`.
Output: `dist/repostew/`; rebuild into a new directory with `--output <path>`.
One bundle, one canonical skill; generated copies are never edited.

| Harness | Load/install from the source repository | Invoke |
| --- | --- | --- |
| Codex | `rtk codex plugin marketplace add ./dist`, then `rtk codex plugin add repostew@repostew-local` | `$repostew` |
| Claude Code | `rtk claude --plugin-dir ./dist/repostew` | `/repostew:repostew` |
| Pi | `rtk pi install ./dist/repostew` | `/repostew-workspace <directory>`, then `/repostew <task>` |
| OMP (oh-my-pi) | `rtk omp --no-extensions -e ./dist/repostew` | `/repostew <task and workspace>` |

Pi preserves explicit workspace binding in native session branches and adds one prompt section.
OMP retains its existing command. Neither creates an execution service.
Roles/forms/methods remain assembled by the Coordinator. Native delegation and permissions
come from the harness; installation grants no public, maintainer or schedule authority.
Workspace instructions/state stay outside the package: each native project uses
`state/repositories/<host>/<namespace>/<repo>/state.md` with ignored local `work/`.
Assignments supply that current project home; workers write shared project facts, not global lists
or a separate root work tree. Installation never publishes local records or binds a backup as runtime.
Other skill-capable harnesses can load `skills/repostew/SKILL.md` directly.

Configure native Workers: `rtk python <bundle>/scripts/configure-workers.py <workspace>`.
This creates project Pi agent and Codex role-config files, preserves different existing definitions,
and prints Codex CLI overrides; it changes no global config, model, permissions or concurrency.
Pi delegation uses its shipped `examples/extensions/subagent` directory loaded with `-e`;
select project agents through native trust. See [Pi](skills/repostew/references/harnesses/pi.md)
and [Codex](skills/repostew/references/harnesses/codex.md) for lifecycle limits.

Formats: [Codex](https://developers.openai.com/plugins/build/plugins),
[Claude](https://code.claude.com/docs/en/plugins), [Pi](https://pi.dev/docs/latest/packages),
[OMP](https://github.com/can1357/oh-my-pi/blob/main/docs/extension-loading.md).
