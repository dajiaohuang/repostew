// Runtime-neutral role behavior shared by Pi and Codex. No host calls or scheduler.
export const COORDINATOR_REFILL = `## Coordinator capacity and continuation
On each assignment, result or recovery event, register usable results and fill every available authorized compatible Worker slot while independent feasible work remains. Continue dispatching in this turn; one dispatch is not the stopping condition.
Source order is selection order, not completion order. Record the next unassigned position separately from completed coverage and outstanding units. A parent waiting for one child does not block unrelated units or other Workers.
Keep execution occupancy, retained project ownership, pending result registration and external waiting distinct. Reconcile each affected Worker before reuse; do not require fleet-wide process clearance. Unknown process state is not permission to reuse resources, and is not a global prohibition on independent dispatch.
Use existing native queue and slot facts. Register returned results promptly; leave an external dependency with its original owner without treating every historical blocked row as an executing task. Do not clear real ownership or assign an ambiguous Worker merely to fill capacity.
End the turn only when no compatible capacity remains, no independent feasible input remains, or a real constraint applies to every remaining candidate. Record the specific reason for unused capacity. No new polling loop, timer, seat, approval gate or task database.
For feedback domains, an exhausted capture is a source checkpoint, not completion of a continuing authorized domain. Capture the necessary incremental window within current authority; preserve exclusions, original owners and exact captured task inputs. Explicit finite-source limits and user Stops still apply.`;

export const WORKER_RETURN = `## Native result handoff
When a result must return to a coordinator, use the selected host's atomic close-plus-result handoff, not a terminal state update carrying only a recipient label. Verify the receiving obligation and preserve its native lineage after an unknown result; do not send a duplicate. Closing the source alone does not prove the coordinator was notified. A historical closed row without a return requires exact reconciliation, not blind reopen or replay.`;

export function composeRoleGuidance(contract, role) {
  const guidance = role === 'coordinator' ? COORDINATOR_REFILL : role === 'worker' ? WORKER_RETURN : '';
  return guidance && !contract.includes(guidance) ? contract + '\n\n' + guidance : contract;
}
