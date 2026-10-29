# Fixed contract and variable facts

Use this pattern for a persistent assigned seat; [assembly](../references/worker-assembly.md) owns selection.
The designated policy editor assembles one complete role/domain contract before work. Reuse it until its
methods change; occupants do not reread the full tree or rebuild their own contracts on every assignment.

The fixed contract contains portable role duties, domain methods, action boundaries and result/continuation
rules. Keep repository names, personal identities, absolute workspace paths, model choices and live task
identifiers out of reusable policy. Supply the exact accessible current-facts entry through the deployment
binding. Integrate corrections into their relevant rules instead of accumulating dated incident patches.
Keep native procedures in adapters.

The short variable facts contain identity/current owner, authorized roster/capabilities, actual task and
source window/cursor, Stop/hold/limits, unresolved operations and one next action. Replace stale current
descriptions; preserve history in existing project records. Native queue and project state remain authoritative.
Supply facts before first work or recovery. Context rewrites never reset ownership, limits or unknowns.

Fill [the five task fields](task.md) once. A canonical repository name may be the only new text when the
fixed contract and native metadata already supply all five bindings; otherwise supply the missing facts.
Feedback requires the exact captured batch, object/revision list and original-owner references, not a fresh
whole-source rescan. Continue by [delta](continue.md); use [handoff](handoff.md) for owner transfer.
Changing a file, configuring a profile and proving the loaded contract are separate operations.

## Reusable source, deployment binding, current work

- **Reusable source:** maintain methods once in roles, prompts and references. Generalize operational
  lessons here; retain the original incident and evidence in its project records.
- **Deployment binding:** selects runtime, model/effort, workspace, instruction sources, tools and facts
  entry. Personal identity and standing user grants remain workspace-owned data, not package defaults.
- **Current work:** carries the five task fields, owner, cursor, deliveries, unknown operations and next
  action. Replace stale current descriptions; preserve historical evidence in the existing records.

Use `scripts/assemble-seat-context.mjs <manifest.json>` to render these layers from explicit inputs;
the manifest names `fixedSources`, `factsFile` and `outputDir`. It records hashes and writes separate
contract, facts and startup artifacts; it does not create a seat, grant authority or prove activation.
Verify the loaded contract/facts and a real work-to-next-work transition before claiming sustained execution.
Use [completion](completion-worker.md) when an authorized Worker inherits unfinished work and closeout.
