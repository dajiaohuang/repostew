# Resolve blockers at their actual scope

Use with [bounded execution recovery](execution-recovery.md), not as an additional approval stage.
In the existing task/project record, state the blocked action and resource, current evidence,
release condition, and recovery owner. Do not create a separate blocker database or polling service.

## Decide and continue

- Missing dependencies, ordinary client failures, missing fork/branch and planning estimates are work
  to complete within authority. Correct the cause; retain cumulative attempts and real limits.
- An actual refusal, unavailable right, required personal signature, user stop, privacy restriction
  or mandatory unavailable validation is a real gate for its affected action. Do not infer it from
  hypothetical requirements, another project, a stale summary or an unrelated workflow step.
- Unknown external writes require reconciliation of the original operation/process and exact remote
  object before another write. A timeout is not failure; a missing branch alone is not process-stop proof.
  Current stop evidence can release current custody without inventing a historical exit code.
- A blocker applies to its dependency scope, not automatically the whole campaign or every stage.
  Continue independent authorized work. Preserve the current writer; do not reset history by replacement.
- A resolved blocker must be removed from current instructions and task dependencies while its history
  remains available. Command delivery, instruction activation, task claim and completed work are distinct.

## Recurrent distinctions

1. Identity is specific to the forge and repository. Inspect effective author and committer identity
   before publishing. Apply only the requested scope; do not change global identity or rewrite published
   history as an incidental repair. A published identity error needs an explicit recovery decision.
2. Authentication to an API does not prove Git transport authentication. Diagnose the failing transport
   with supported noninteractive helpers; never expose credentials or bypass actual account rights.
   Verify canonical project/ref/encoding before treating a 404 as access denial; do not evade real denial.
3. Ordinary automatic CI is not a pre-publication approval gate. Assess the actual workflow's resource,
   credentials and effects. Privileged setup on a disposable hosted runner does not alone establish
   production access. Preserve genuine deployment, secret, cost and target-required check boundaries.
4. Partial test output is partial evidence even with zero failures. Distinguish baseline failure,
   local validation, native/device validation and upstream schema dependencies. Never claim missing
   required validation passed or silently replace it with a mock/static check.
5. Security investigation and reportability are different. Apply [security](security.md)'s threat and
   evidence test; a rejected hypothesis is not an indefinite missing-channel blocker. Strong source
   proof can suffice without a live incident. Missing private reporting routes never permit public detail.
6. Reading authorized public project/contact metadata is distinct from exercising a live service or
   accessing customer data. Report delivery requires reliable success; an ambiguous send is reconciled
   before retry, and a successful send does not imply remediation or public disclosure authority.

Workers own ordinary engineering recovery; Coordinators narrow dependencies and continue/refill eligible
work; Supervisors resolve shared execution, policy and cross-project custody faults. Escalate inability
promptly and stop after three failed repairs of the same fault. Preserve stopped tasks and paused schedules.
