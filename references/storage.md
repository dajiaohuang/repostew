# Repository containers and storage disposition

Use state/repositories/<host>/<namespace>/<repo>/: shared state.md stays at project root;
local history is work/work.md; notes/evidence and disposable source/material live under work/,
with multiple checkout[-<purpose>]/ and tmp/ directories (existing names such as temp/ may remain).
Project work/ itself is not disposable: preserve persistent records and private/imported notes.
Use the actual workspace root.

## Provision and reuse

Inspect remotely when sufficient; provision source only for investigation/editing/validation.
Establish native identity/existing paths, preserve unknown data, never clone into container root.
Use Git-aware operations for linked/shared worktrees. Record actual relative/legacy paths;
unknown/unavailable resources remain retained with reasons. No client-specific storage API is required.

## Ownership: Worker preserves, Coordinator disposes, Supervisor governs capacity

Workers preserve reviewed changes remotely where authorized, retain unique fixtures/logs outside disposable
source, stop their unused task-owned services and identify exact resource boundaries/blockers. They do not
delete checkout/tmp. Use the normal final and project records, not a separate disposal queue or receipt.
The domain Coordinator accepts a resource-only handoff after the project writer and relevant processes
stop; it becomes the sole writer for that bounded disposition, not for engineering. Reuse reliable existing
preservation facts; do not wake finished leaves or repeat engineering checks just to obtain a cleanup receipt.
Actually release eligible material under the gates below. Retain failed/protected cases with exact reason
and next condition; a recorded blocker is not permanent closure. Diagnose changed conditions only, never
blind retries, ACL takeover, shared-service kills or reconstruction solely to delete. The narrowly authorized
Git-object read-only handling below is not permission to change other attributes or access controls.
The Supervisor owns capacity/shared-resource decisions and cross-domain blockers, not routine per-project
deletion. Existing cache/toolchain/build/privacy restrictions are not relaxed by changing the executor.
On ENOSPC stop writes to the affected volume, including small state updates, and new work needing them; retain facts
through native results. Existing complete recovery records remain usable; zero free space is not itself a
ban on an otherwise authorized, fully preserved release. Missing necessary recovery facts still block deletion.

## Explicit narrow release permissions

These exceptions require explicit workspace/user authorization; task assignment or a full disk alone is not
permission. With it, the Coordinator may release task-exclusive, reproducible installed dependencies and
build outputs inside a named disposable boundary. Establish known source/pins/lock/configuration sufficient
for reconstruction from existing evidence; no reinstall/rebuild or fresh audit just to prove disposability.
Preserve source, manifests/locks, fixtures, complete logs and unique evidence outside the deletion target;
unknown, modified or non-reproducible contents stay protected. A dependency/build directory name alone
proves nothing. Shared caches/stores, toolchains, global Go/module caches and unrelated outputs remain excluded.
Remove only eligible subtrees; their presence does not authorize deleting a parent containing protected data.
A whole disposable checkout is eligible only when every included category and preservation gate permits it.

For an already-authorized, preserved disposable checkout, the Coordinator may clear only the read-only
flag on ordinary Git-created object files as part of deletion, when that precise handling is authorized.
Confirm the object is inside the resolved disposable Git object directory, not a symlink/reparse point,
hardlinked file, alternate/shared store or canonical repository. Do not change ownership/ACLs, elevate,
clear other attributes, unlock handles or kill processes. On a known read-only failure, apply this bounded
correction and retry the affected authorized deletion once; other/persistent errors retain an exact blocker.
Reconcile prior partial deletion from existing results; do not reconstruct source or infer whole-tree success.

## Release without a verification ceremony

Apply disposition to resources created, used or explicitly assigned, including no-change/blocked passes.
If none are involved, omit resource checks/report fields; do not inventory unrelated resources to prove none.
Known assigned unused resources still need disposition. Disposable-source release excludes self-owned/canonical
repositories. CI/review/merge waits alone do not require retaining source.

1. Under an explicit workspace standing release authorization, end-of-pass removal of unused disposable
   project checkout/temp is included; do not demand a new per-directory approval. Check the resolved
   target remains inside its named boundary, excluding container/shared store/unrelated paths or links.
   Without standing or exact authority, retain the concrete authority blocker; do not infer permission.
2. For ordinary work temporarily not opening a PR, first review and commit the intended source/test/doc
   changes to a distinct owned branch on the user's permitted fork; confirm the actual remote branch
   head and record recovery facts before release. This is preservation, not a PR, acceptance or delivery
   claim. An upstream PR/invitation/CI wait alone does not block permitted fork preservation or release.
   Include unpublished combined commits and valuable ordinary untracked changes only after review;
   do not blindly add everything, force-push, overwrite unrelated refs or publish rejected/prohibited work.
   Dirty/unpushed/undelivered is a preservation action, not an indefinite retention reason. If no valuable
   change exists, an unused disposable clean checkout needs no empty preservation commit or branch.
   Retain active/shared resources, private/security material and concrete failed/forbidden/unknown
   preservation cases with exact blocker and next action. Never push secrets, private evidence or
   undisclosed security work to a public fork (or assume private Git authorizes protected uploads).
   For security work, confirmed delivery to the authorized private reporting channel can also close
   the local-source retention boundary: record the report's protected reference/acceptance and remaining
   follow-up locally, then release unused disposable source under standing authority. Report submission
   is not remediation or disclosure completion. Do not keep a reproducible clone solely to await triage.
   Preserve unique evidence/reproduction material not retained in that private channel in protected local
   storage outside the disposable checkout before release; never publish it to a fork or shared Git.
   Failed/ambiguous reporting, active investigation or evidence available only inside the checkout is a
   concrete retention blocker until reporting/evidence preservation is resolved. No broad unique/unknown-data
   inventory, recovery archive, restore/hash gate or process survey.
3. Delete only authorized disposable checkout/temp; linked/shared worktrees need supported Git removal.
   Include task-local dependency/build subtrees or Git-object read-only handling only under the explicit
   narrow permissions above. Preserve records, remote refs, private material and existing recovery archives.
   No shared/global cache, Go/module-store, toolchain or unrelated-build cleanup, broad roots, forced unlocks
   or disk compaction.
4. Before deletion, record native target, owned fork URL, branch, exact confirmed remote commit,
   upstream base and remaining work/validation limits in shared state/repositories/<host>/<namespace>/<repo>/state.md
   regardless of whether this device publishes Git. Never claim recoverability for excluded local-only
   material; record any protected/non-reproducible blocker without its sensitive evidence.
   Record operation result: released, retained/reason, or failed/error. Ambiguity is not success;
   recover the concrete fault, never blindly retry. No post-delete path/Git/archive checks or size/free-space
   measurements; never claim measured reclaimed bytes. This does not prohibit a Supervisor's bounded
   volume-capacity check needed to decide whether writes may resume; it is not per-target deletion verification.
5. After the resource handoff, the Coordinator writes only changed disposition facts to the same project
   records under [records](records.md), preserving engineering facts and single-writer ownership; no mirror.
   If the result cannot be recorded, retain the native outcome and exact write failure without truncating
   existing files. No unchanged paragraphs/history or repeated publication checks. Archives stay recovery-only.

## Temporary services and shared runtimes

- Within existing authority, Workers normally stop their unused temporary processes/services/containers
  after a task, preserving data.
- Coordinators stop a WSL distribution only after confirming no active Worker, user task or shared
  service still depends on it, within existing authority.
- High memory use alone does not prove idleness. Do not force-kill `vmmem` or shared Docker/WSL;
  `wsl --shutdown` terminates all running distributions and the WSL VM.
