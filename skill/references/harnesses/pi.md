# Pi

The integration has two independent, explicitly loadable modules and shared native mechanisms.
Pi owns tools, settings, sessions, compaction and cancellation; the selected host owns queue and lifecycle.
Neither module schedules, reserves seats, certifies process stop or grants task/action authority.

## Select the layer

- `extensions/pi-repostew.js`: RepoStew application. Reads `repostew.json`; injects the `repostew` prompt
  section, assembled C/W contracts and continuation policy; provides `repostew_runtime_status`,
  `repostew_gh_status` and `/repostew-status`, `/repostew-reload`, `/repostew-restore-tools`.
  It does not import the OpenRig bridge, read its profile, register its tools or call its API.
- `extensions/pi-openrig.js`: neutral OpenRig bridge. Reads `openrig-pi.json`; supplies `openrig_slots`,
  `openrig_runtime_status` and the corresponding `/openrig-*` commands. Optional `seatGuidance` injects
  caller-supplied text into the separate `openrig` section. No RepoStew role, publication, gh or cleanup policy.
- `extensions/pi-runtime.js`: shared mechanisms for profile reads, namespaced prompt injection and
  native reload/tool restoration; a library, not another extension entrypoint.

The package manifest loads only the RepoStew application. The bridge can be loaded alone, or alongside it.
Bridge-only users load its files directly instead of installing the default RepoStew application package.
The configurator selects explicit extension settings; it does not rewrite installed package manifests.
If that package is already installed, disable its application entry through Pi's native package settings
before expecting bridge-only operation. Do not load the same application through multiple entries.
For bridge-only distribution, `pi-openrig.js` and `pi-runtime.js` are sufficient in a Pi environment with
`typebox`; no RepoStew profile, Skill tree or gh configuration is needed. This bridge is locally authored,
not a claim of upstream OpenRig plugin support for Pi.

## Explicit configuration

```sh
rtk node <bundle>/scripts/configure-pi.mjs --mode repostew --agent-dir <dir> --workspace <workspace> --role worker --seat-guidance <absolute-contract>
rtk node <bundle>/scripts/configure-pi.mjs --mode openrig --agent-dir <dir> --openrig-binding <binding.json>
rtk node <bundle>/scripts/configure-pi.mjs --mode combined --agent-dir <dir> --workspace <workspace> --role coordinator --seat-guidance <absolute-contract> --openrig-binding <binding.json> --openrig-home <instance>
```

Mode defaults to `repostew`. The binding file contains `url`, `rig`, `observer` and `seats` (canonical native
session names), with an explicit loopback daemon URL. Bridge mode needs no workspace/role/gh setup and
does not create or read `repostew.json`. Optional `--openrig-guidance` selects generic host context.
`--openrig-home` (or the selected `OPENRIG_HOME`) adds installed official openrig-core skills only in a
bridge-enabled mode. Official hook JSON is not a Pi extension; the Pi runner remains the activity producer.

The configurator preserves unrelated settings, model/effort, auth references and profile fields. It
replaces only these modules in the selected installation and exact `--remove-extension` paths. For old
entries from a different installation, pass their exact paths; do not remove extensions by basename.
`--trust-projects` explicitly selects native `defaultProjectTrust: always`; it grants no task or OS authority.
No process starts or reloads, and no queue, credential or session is changed by configuration.

## Facts, application policy and migration

Bridge snapshots return native availability, execution occupancy, pending observer results and blocked
obligations. They include no `nextAction` or instruction to refill. RepoStew's application contract decides
continuation using these facts and current source/Stop/hold/ownership boundaries. Raw availability is not
eligibility; process clearance remains unmeasured. Do not add polling, duplicate queues or reservations.

`pi-native.js` remains a legacy combined entrypoint. It reads the old `repostew.json.openrig` binding and
retains `repostew_openrig_slots` plus the old snapshot field/state names; it also exposes native bridge
tools. No business `nextAction` is returned. New installations use the independent modules. Do not load
the legacy wrapper alongside either replacement module. `--mode combined` converts an existing legacy
binding into `openrig-pi.json` when no new binding was supplied, while retaining the original profile fields.
Keep `pi.js`, `pi-extras.js` and `pi-native-seats.js` disabled; retained files support recovery only.

Use [fixed seat context](openrig-context.md). Contracts are reread at the before-agent-start hook; code
changes need an authorized idle reload and target-session status verification. Configuration, loaded
version/entrypoint, contract injection and task progress remain separate claims. Preserve active writers
and user-specific model activation; a source/package update does not migrate the live fleet.

The application supplies only non-secret gh configuration paths; existing environment overrides win.
The native gh CLI reads its own keyring. No token is read/copied; `repostew_gh_status` performs one read-only
account check. Use body files for multiline text. On Windows use task-specific PowerShell variables,
set `ErrorActionPreference = Stop` in the actual child script and inspect native exit codes separately.
Pi shell timeouts use seconds; `pi.exec` uses milliseconds.

## Observe and restore the current tool intention

Status now separates `toolSelection.configured` (Pi's effective merged `defaultTools` declaration),
`registered`, `active`, and `intended: null`. Patterns/modifiers are reported as declarations, not expanded
into a claimed effective active set. Saved configuration does not establish the current operator intention.
Use a loaded helper command only at an appropriate idle boundary:

```text
/openrig-status
/openrig-restore-tools read
```

The RepoStew application has the equivalent `/repostew-*` commands. An explicit list is required;
an empty command changes nothing. Only the named tools are added to the existing active set. Thus a
configured but deliberately disabled `bash` stays disabled unless explicitly requested now. Unregistered
or hidden requested tools are rejected before mutation. The receipt names configured declaration,
current intended list, registered names, before/after and missing names; incomplete readback is an error.
The command changes no settings, permission policy or session identity, and does not persist a new
branch selection. Verify one harmless actual call too: listed-active is not proof of usable access.

Pi 1.4.0's opt-in `examples/extensions/tools.ts` selector persists selection per branch and requires
Pi's own TUI. Do not send `/tools` to an OpenRig-managed RPC seat. Reloading unchanged settings may
intentionally retain session-disabled tools; failure to restore them is not by itself an accidental-loss bug.
This helper uses Pi's `getSettings`, `getAllTools`, `getActiveTools` and `setActiveTools` APIs, tested with
the installed Pi 1.4.0 loader. It does not claim a stock OpenRig/Pi tool-loss reproduction or support parity
for other harnesses. See the maintainer's [scope decision](https://github.com/mvschwarz/openrig/issues/2045#issuecomment-6429892459).
