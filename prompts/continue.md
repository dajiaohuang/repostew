# Same-task continuation template

Use only for a same-task delta or bounded omission/correction with suitable original context under
[task boundaries](../references/orchestration.md#task-boundaries-and-context-reuse). Send one combined delta,
not repeated context. Completed tasks do not bind later batches to this Worker/model; otherwise use handoff.

> Continue the existing assignment. Changes: {rules, scope, authority, facts}.
> Remaining work/stage effects: {exact actions, priority, dependency/gate boundaries, completion}.
> Coordinator continuation retains the full selection and authorized backend capacity; refill independent
> eligible work before waiting. Apply orchestration's next-action contract, not a summary-only return;
> no-child unfinished feasible scope needs action now, not another completion event. Respect any stop mode.
> Changed instructions/paths: {readable current files or complete changed text; relocated project paths if any}.
> Preserve work and unchanged authority/evidence; use current project state.md/local work/ and native result route.
> Read only affected rule changes/missing context; a new turn or completion event is not a reread trigger.
> Reuse still-applicable validation; refresh changed heads/contracts/requirements before dependent actions.
> Apply and continue without receipt; do not recreate retired paths or infer a handoff from relocation.

For material omissions, request existing native outcomes or none/reason and remaining feasible work;
do not re-query publication, demand optional fields or impose quotas.
