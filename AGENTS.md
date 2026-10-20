# RepoStew skill maintenance

- Keep generic pages concise and harness-neutral; SKILL.md explicitly links every flow. Native API names,
  event/flag/version semantics and backend restrictions belong only in harness adapters/integrations.
  Portability needs capability mapping, not a fixed agent hierarchy or emulated execution service.
- Roles own responsibility, prompts own task variables, assembly owns context selection, orchestration
  owns scheduling/lifecycle. Forms define coverage; methods define engineering; forge references map access.
  One C contract, one W contract and prompts/task.md's five fields; five forms add input/coverage only.
  Maintainer extends Worker authority, not another mandatory stage or agent.
- Assign complete units: Worker owns setup, engineering, validation and direct repository publication;
  Coordinator checks actual submission, coverage/refill/disposition; Supervisor owns bounded fault recovery.
  No inspection-only finish for ordinary engineering; local patches/forwarding require a delivery decision.
  Serialize same-project/shared-index writes, not independent repository publication; shared-state Git has its publisher.
  C refills in the same result turn; a single bounded S heartbeat may send deduplicated gap instructions to C,
  never direct W/engineering/cleanup/file writes. Preserve real gates and cumulative consumption; resource estimates are not mandatory hard quotas.
- Reuse supplied rules/evidence; batch missing startup reads, load conditional methods before action.
  Leaves receive applicable boundaries, not global briefs. Links are navigation, not recursive reading.
  Templates add no authority. Keep runtime implementation out of generic Skill files; optional execution code belongs in harnesses/.
- Storage owns delivery/preservation, scoped abandonment and retention. Workers establish facts and stop
  unused owned processes; Coordinators dispose after handoff; Supervisor governs shared capacity.
  Preserve confidentiality, protected recovery and unrelated/shared material; only explicit scope permits
  private-material abandonment or narrow dependency/build/Git-object exceptions. ENOSPC stops affected writes.
- Preserve privacy/exclusions, actual-use/document proof, target-required checks, mutation reconciliation,
  single writers and paused jobs. New security findings use authorized private reporting only.
  Assigned review is engineering, not a universal extra acceptance stage; internal contracts remain trusted.
- Keep translations/site aligned, old entry links navigable and unrelated work intact. Validate flow coverage,
  links/anchors, generic/adapter separation, authority preservation and whitespace. Expand only applicable rules.
  Run scripts/validate-policy.py for entry budgets, flow links and implementation-detail separation.
