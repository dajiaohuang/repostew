# OpenRig and Pi seat context

Use [fixed contract / variable facts](../../prompts/fixed-context.md) for persistent C/W seats.
For a directly assigned persistent execution owner, use the [native worker binding](openrig-worker-context.md).
RepoStew supplies business policy; official openrig-core skills supply generic native operations;
OpenRig owns custody, queue, generation, Stop and wake. Pi owns sessions, tools and compaction.
The Pi runner is the single activity producer. A locally authored bridge is not upstream Pi support.

## Seat construction

1. Assemble the C or W role with its exact domain methods and applicable forge/action rules. Include a
   current-facts path, not old conversations. C captures/screens/routes/registers/refills; W owns complete work.
   Publication-only, feedback-only and scientific-writing seats retain their distinct scope.
2. Keep user-specific identity, model/effort, roster, source grants, holds, deadlines, receipts and recovery
   deltas in workspace-owned facts/profile/native task inputs. Do not put live fleets or credentials in a package.
   Preserve an isolated replacement seat's fresh context; do not inject its retired coordinator history.
3. Configure `repostew.json` with absolute `workspace` and `seatGuidance`, `role`, optional `gh.configDir`. Configure the independent bridge in
   `openrig-pi.json` with `binding: {url, rig, observer, seats}`. Bind only authorized canonical session names.
   Example shape (replace values from the selected instance; these are not live destinations):

   ```json
   {"version":1,"binding":{"url":"<daemon-url>","rig":"assigned-team","observer":"c@assigned-team","seats":["w1@assigned-team"]}}
   ```

4. Use `configure-pi.mjs --mode combined --seat-guidance <absolute-contract> --openrig-home <selected-instance>` with the
   ordinary agent-dir/workspace/role options. Preserve unrelated settings, models and roster fields;
   configuration neither creates seats nor supplies missing authorization. Inspect skill-name collisions.
5. Load `pi-repostew.js` for application rules and `pi-openrig.js` for neutral native facts. Do not also
   load the legacy combined `pi-native.js`, old `pi.js`, `pi-extras.js` or `pi-native-seats.js`. Preserve separately authorized model activation until a verified native replacement exists.

## Loading and recovery

The before-agent-start hook rereads the configured contract; C refill guidance remains composed with it.
Code changes need an authorized idle reload; verify `repostew_runtime_status` version, entrypoint, role,
tools and guidance path. `/repostew-restore-tools read` adds only explicitly named current intended tools, preserves active extras
and rejects unregistered/hidden requests before mutation; it is not an automatic reset or permission change.
Discovery, configured files, loaded code and actual task progress are separate claims.

Keep portable contract sources in the Skill and render the selected contract separately from workspace
facts using the fixed-context assembler. A native member/profile binds those artifacts, runtime and
model settings; its startup supplies current facts before the first work action. Persist the member,
source hashes and queue mission in the workspace, without copying live identities or paths into the Skill.
When a clean seat workspace is needed, project only its assembled contract and current facts there;
the selected policy/state workspace remains authoritative. Check actual tools, model/effort and task
pickup, then consecutive substantive work and continuation before claiming a stable deployment.

Managed queue mutations must preserve the seat's native identity. An external orchestration helper
that removes seat environment fields is unsuitable for the occupant's claim/update calls. External
instructions use a declared sender and a stable queue ID; an unlabelled terminal send must not become
an unverifiable ownership transfer. Runtime completion, cancellation request and actual stopped-writer
evidence remain separate; transfer work only after reconciling possible writes and descendants.

Keep daemon/CLI identity separate from already-loaded runners. During an authorized upgrade record selected
base, public head, runtime head and local overlays separately. Preserve recovery sources; daemon health or
build success does not prove all runners reloaded or full Windows/cross-platform tests passed.
Do not restart agents, restore databases or wake stopped seats as a side effect of package updates.

Reconcile timeouts with exact native queue rows/results before another send/create. Accepted notification
or closed reminder does not prove the linked engineering task resolved. Never guess `S` as a session address:
use the verified external Supervisor channel, or return the exact non-sensitive fault and required action.
Do not revive a retired automatic Supervisor. A crashed runner, route fault or exhausted finite capture
is a local condition, not proof of a global serial-worker rule or permission to expand scope.

Pi shell timeouts use seconds; `pi.exec` uses milliseconds. Use current CLI help and `rtk proxy` for exact
JSON/help; use structured arguments/body files for multiline content. Check native exit codes.

## Capacity evidence

`openrig_slots` is a read-only snapshot, not a reservation, scheduler or process-stop certificate.
Apply current facts' user holds and eligibility even when a node looks available. Distinguish execution
occupancy, retained project ownership, blocked obligations and pending result registration.
Reconcile the affected owner without freezing independent compatible slots; no polling loop or second ledger.
Invocation/refill/pickup counts do not prove causal savings or delivery quality. Claim performance improvement
only from a suitable comparison; require persisted queue-row evidence before counting dispatch success.

## Domain-specific content contracts

Preserve a content seat's exact assigned nodes, source boundaries, locale requirements and CAS baseline.
Under an explicit full-rewrite assignment, empty sections/null drafts and existing prose all remain in
scope: research and organize complete content rather than treating either state as a skip. Authorized
ordered section keys/pages are document content, not an automatic database-schema engineering task.
Keep scientific identity, verified facts, source qualifications, numbers, negation and attribution across
languages. W checks out, writes, registers actually used references, submits, reconciles the matching
receipt and reads back the complete result. A first submission does not require a pre-existing success
receipt; a previously attempted unknown result does require reconciliation. Partial/no-write/unchanged
outcomes remain incomplete under a full rewrite and return to their original owner, without C re-research
or acceptance. Publication settings, Stop/hold and isolated fresh-seat context remain workspace facts;
neither this template nor a successful local submission enables public publication.
