# Persistent execution owner on OpenRig

Assemble the [Worker](../../roles/worker.md) and applicable task methods from portable sources. The
workspace binding supplies the selected CLI, home, daemon, seat, model/effort, facts entry and mission ID.
Do not turn those instance values or a former conversation into package policy.

At first startup, current facts must already accompany the role contract. Resolve `whoami` and the exact
native mission, then claim and execute it. If seat creation launches before an external assignment can
be admitted, the complete authorized startup task may direct the occupant to create its one initial
mission using a predetermined ID. Reconcile that ID before creation; never create a second assignment
or turn this bootstrap into self-queued wake tasks.

Use the selected CLI with inherited managed-seat identity for `queue claim`/`update` and result actions.
`scripts/run-bound-cli.mjs <binding.json> ...args` runs a workspace-selected CLI without stripping that
identity. The binding has `command`, `args`, `cwd` and optional `env`; it is trusted deployment data,
not permission to change other seats or the daemon. Keep credentials out of messages and package files.

Name one canonical current-facts file in the deployment binding. Embedded startup facts and rendered
copies are snapshots, not additional editable state. Before mutation and after restore, read that
canonical file and reconcile the exact mission; never replace newer facts with a replayed startup block.
Local convenience files should point to the canonical entry instead of duplicating mutable facts.

Record substantive progress and actual blockers on the existing mission and project records. Continue
the next feasible assigned unit in the same work turn. A tool response or model turn ending is not an
instruction to abandon the remainder. Use native result/dependency events for later continuation;
do not install an agent-end loop, duplicate queue or unauthorised timer. An actual user Stop remains a Stop.

After a real unit or phase result, update the original mission's concise summary/note through the
managed CLI, as well as current facts. A long-lived in-progress row with no recorded result can look
stalled even while tools run. Do not close unfinished work to silence a sweep, manually close its
system finding, or create periodic empty progress notes; record only actual changes at work boundaries.

An external `queue create --source ...` records a declared sender; a terminal send without a native
identity may appear unknown. Preserve the exact authorised transfer and reconcile the prior writer
before project mutation. Store the loaded contract/facts hashes, native task pickup, observed model/effort
and actual work results separately: configured, running, claimed and completed are distinct claims.

If a platform's pane-to-runner association cannot verify the model or effort, retain that diagnostic
as unknown. A native session's explicit model/effort events can provide separate evidence when its
session file is tied to the same seat's runner state. Do not read credential files or hidden reasoning
to establish those fields, and do not interpret an observability gap alone as a stopped worker.
