# Repository containers and storage disposition

Keep persistent state.md/work.md outside disposable checkout/temp; use the actual workspace root.

## Provision and reuse

Inspect remotely when sufficient; provision source only for investigation/editing/validation.
Establish native identity/existing paths, preserve unknown data, never clone into container root.
Use Git-aware operations for linked/shared worktrees. Record actual relative/legacy paths;
unknown/unavailable resources remain retained with reasons. No client-specific storage API is required.

## Release without a verification ceremony

Apply disposition after every pass, including serial/parallel/no-change/blocked. Disposable-source release
excludes self-owned/canonical repositories. CI/review/merge waits alone do not require retaining source.

1. Use existing exact release authority; check resolved target remains inside its named boundary,
   excluding container/shared store/unrelated paths or links. The check grants no new authority.
2. Use established delivery/non-use facts. Retain known undelivered/active/shared/dirty/unpushed/private
   material. No unique/unknown-data inventory, recovery copy/archive, restore/hash gate or process survey.
3. Delete only authorized disposable checkout/temp; linked/shared worktrees need supported Git removal.
   Preserve records, remote refs, private material and existing recovery archives. No Go/cache/toolchain/
   unrelated-build cleanup, broad roots, forced unlocks or disk compaction.
4. Record operation result: released, retained/reason, or failed/error. Ambiguity is not success;
   recover the concrete fault, never blindly retry. No post-delete path/Git/archive checks or size/free-space
   measurements; never claim measured reclaimed bytes.
5. Worker writes changed resource outcome under [records](records.md); Coordinator changes shared
   navigation only. No unchanged paragraphs/history or repeated publication checks. Archives stay recovery-only.

## Temporary services and shared runtimes

- Within existing authority, Workers normally stop their unused temporary processes/services/containers
  after a task, preserving data.
- Coordinators stop a WSL distribution only after confirming no active Worker, user task or shared
  service still depends on it, within existing authority.
- High memory use alone does not prove idleness. Do not force-kill `vmmem` or shared Docker/WSL;
  `wsl --shutdown` terminates all running distributions and the WSL VM.
