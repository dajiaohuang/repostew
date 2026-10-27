# Skill integration packages

From the repository's `skill/` directory, validate with `rtk python scripts/validate-policy.py`,
then build with `rtk python scripts/build-package.py`.
Output: `dist/repostew/`; rebuild into a new directory with `--output <path>`.
One bundle, one canonical skill; generated copies are never edited.

| Harness | Load/install from the source repository | Invoke |
| --- | --- | --- |
| Codex | `rtk codex plugin marketplace add ./dist`, then `rtk codex plugin add repostew@repostew-local` | `$repostew` |
| Claude Code | `rtk claude --plugin-dir ./dist/repostew` | `/repostew:repostew` |
| Pi | `rtk pi install ./dist/repostew` | Configure an explicit agent profile, then use native prompts and `/repostew-status` |
| OMP (oh-my-pi) | `rtk omp --no-extensions -e ./dist/repostew` | `/repostew <task and workspace>` |

Pi has independent `pi-repostew.js` (application) and `pi-openrig.js` (neutral bridge) modules,
with shared `pi-runtime.js` mechanisms. The package default loads only the application.
The old `pi-native.js` combined wrapper remains for existing profiles; never load it with the new modules. Configure each agent with
`rtk node <bundle>/scripts/configure-pi.mjs --agent-dir <dir> --workspace <workspace> --role coordinator|worker --mode repostew`.
Add `--seat-guidance <absolute-contract>` for an assembled C/W contract and
`--mode combined --openrig-binding <binding.json> --openrig-home <selected-instance>` for the optional bridge.
For bridge-only use, select `--mode openrig --openrig-binding <binding.json>`; it needs no RepoStew workspace/profile or gh setup. See the bundled
[seat context guide](skills/repostew/references/harnesses/openrig-context.md).
Bridge-only use loads the bridge files directly; do not also install/load the default application entry.
The configurator does not rewrite installed package manifests. Choose package discovery or direct
extension entries without loading the same module twice.
Add `--trust-projects` when that native trust policy is explicitly wanted.
The application enables native editing/search/shell tools and existing host gh authentication
through non-secret configuration paths. No separate runtime, token store, approval
gate or automatic completion loop is installed. See [Pi](skills/repostew/references/harnesses/pi.md).
The former `pi.js`/`pi-extras.js` implementation is deprecated; remove its exact
settings entries before enabling the new extension. Old files remain for rollback.
OMP retains its existing command. These integrations create no execution service.
Roles/forms/methods remain assembled by the designated policy editor. Native delegation and permissions
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
