# Repository containers and storage disposition

Use state/repositories/<host>/<namespace>/<repo>/: shared state.md stays at project root;
local history is work/work.md; notes/evidence and disposable source/material live under work/.
Use actual checkout[-<purpose>]/ and tmp/ paths; existing names such as temp/ may remain.
Project work/ itself is not disposable. Persistent records and existing recovery archives retain their
separate protection; private/imported notes are not implicitly included in a source cleanup.

## Provision and reuse

Inspect remotely when sufficient; provision source only for investigation/editing/validation.
Establish native identity/existing paths, preserve unrelated data, never clone into container root.
Use Git-aware operations for linked/shared worktrees. Record actual relative/legacy paths;
unknown ownership or unavailable resources retain exact blockers, not an invented release result.
Necessary dependency supply uses named task-local caches/build outputs under [bounded setup](execution-recovery.md),
not shared/global toolchain mutation. Use estimates and stage capacity checks, not mandatory hard quotas.

## Ownership: authorized execution owner disposes, Coordinator coordinates, Supervisor governs capacity

Workers establish delivery/preservation or explicit abandonment facts, stop unused task-owned services,
and complete feasible authorized task-owned cleanup before capacity return, including no-finding/blocked units.
Retention of one protected or still-useful target does not block independent work or require a new cleanup queue.
Preserve material pending an applicable release path; do not require permanent copies of delivered work.
An existing authorized execution owner performs eligible disposition after writer/process stop; C only
coordinates ownership and records ordinary outcomes, and never approves or executes deletion. The user's
Worker-owned [private-disposition rule](security.md#worker-owned-private-disposition-under-explicit-authority)
applies directly within its explicit user scope, without a C handoff/report. Ordinary checkout/tmp
deletion still needs its existing exact authority and execution owner; changing C's role grants no new
deletion scope. Use normal project records, not an extra approval/disposal queue or parallel inventory.
Reuse reliable existing facts without waking finished leaves or repeating engineering checks for cleanup.
Execute eligible release; retain concrete failed/protected targets and next conditions.
The Supervisor governs capacity/shared blockers, not routine per-project deletion. On ENOSPC stop
writes to the affected volume, including small records; retain native outcomes without truncation.
Already complete release facts remain usable. Missing necessary facts block that target, not every
independent authorized release. Capacity pressure never grants deletion or publication authority.

## Choose the release path

All paths require existing cleanup authority, a named boundary, stopped writers/owned processes and
no active/shared dependency. File labels such as dirty, private or evidence are not perpetual-retention rules.

- **Delivered or preserved:** release corresponding unused local source/material after reliable delivery
  to the authorized destination. Ordinary changes use an eligible delivery or confirmed permitted-fork head;
  private/security material uses only an authorized private channel under [security](security.md).
  A successful server result identifying the submitted report/material suffices; no extra human receipt,
  review, CI, merge, triage, remediation or disclosure wait. An attempted/failed/ambiguous send is not delivery.
  A submitted summary does not prove omitted attachments/raw material were delivered: retain those parts
  or use explicit abandonment. Do not create another local copy/archive solely to allow release.
- **Explicitly abandoned:** use the bounded user authority below instead of preservation/reconstruction.
  Accept irreversible loss honestly; do not push, sign, test, rebuild or report merely to permit deletion.
- **Retained:** keep active/shared, ownership-unclear, out-of-scope or otherwise restricted material and
  undelivered material not covered by abandonment. Give the actual blocker and next condition. A waiting
  public object, private label or old blanket rule alone does not establish a local retention need.

Release is not engineering completion, acceptance, withdrawal of a report, remediation or public disclosure.
Never upload protected material to a public fork/shared Git or an unauthorized destination to enable cleanup.
Mailbox contents, credentials/keys, shared environments, persistent records and existing recovery archives
are not made disposable by these paths; any separate disposition requires its own applicable authority.

## Explicit narrow release permissions

With explicit workspace/user authority, the designated execution owner may release task-exclusive reproducible installed
dependencies/build outputs inside a named boundary. Reuse known source/pins/lock/configuration evidence;
no reinstall/rebuild or fresh audit to prove disposability. Retain reconstruction inputs and unique logs/
fixtures unless their own delivery or explicit abandonment path applies. Directory names prove nothing.
Shared/global caches, protected module stores/toolchains and unrelated outputs remain excluded;
workspace facts name additional protected resources. Eligible subtrees
do not authorize deleting a parent containing excluded material; whole-checkout release needs every
included category to satisfy its own path and boundary.

For an authorized disposable checkout covered by delivery/preservation or explicit abandonment, the
authorized execution owner may clear only ordinary Git-created object files' read-only flag when that handling is authorized.
Confirm the resolved Git object boundary and ordinary, non-symlink/reparse, non-hardlinked files, not
alternate/shared stores or canonical repositories. No ACL/ownership changes, elevation, other attribute
changes, forced unlocks or process kills. Correct a known read-only failure and retry the affected deletion
once; persistent/other errors retain an exact blocker. Reconcile prior partial results, never reconstruct
source or infer whole-tree success merely to force cleanup.

## Explicitly authorized abandonment

A user may accept irreversible loss within named finite resources; do not infer this from cleanup authority,
capacity pressure or future assignments. Specified local commits, dirty/truncated source, untracked files
and unique logs/fixtures may be covered. Private/security/incident material requires authority explicitly
covering that category and scope, not an ordinary-work waiver. Confidentiality and external-reporting rules
still apply; disposal is not permission to publish or withdraw reports. User acceptance of loss does not
prove ownership of shared resources or external link targets.

Before acting, the execution owner records the user authority, actual abandoned scope, known commit/base
or explicit unknowns and irreversible-loss risk in the same project records. No further approval ceremony
inside that scope; no new backup, remote preservation or validation prerequisite. Never call abandoned
material preserved/recoverable. Persistent records, existing recovery patches/archives and material outside
the explicit waiver remain protected. Apply the common procedure and narrow filesystem limits below.

## Minimal-retention campaign

Only explicit user acceptance of ordinary-work loss enables this mode; a cleanup request alone does not.
Use the existing authorized disposition execution owner and the [single task](../prompts/disposition.md);
C only coordinates scope and records outcomes, without approving or deleting. Do not infer a new seat or
timer. Freeze a finite set of native projects/resource paths from existing records;
transfer disposition ownership after writers, queued writes and owned processes stop and mutations reconcile.
For eligible ordinary task materials retain only root state.md and work/work.md: discard named checkouts,
.git, unpublished commits/patches, untracked source, dependencies, builds, downloads and ordinary logs/fixtures.
Record abandonment and known base/commit or unknowns before deleting; no publish/test/backup prerequisite.
Exclude live/shared/user-owned canonical material, mailbox/credentials/keys, private security/incident evidence,
existing recovery patches/archives, unknown ownership and external link targets. Protected children prevent
whole-parent deletion; release eligible siblings instead. No privilege escalation, forced unlocking or shared kills.
Execute eligible deletion in the same unit, not an inventory-only return; local failures do not freeze the rest.
Write only concise disposition deltas to the two existing records; no new ledger, reports or recovery copies.
This does not authorize future/all resources, engineering completion or removal of separately protected data.

## Release without a verification ceremony

Apply disposition to resources created, used or explicitly assigned, including blocked/no-change passes.
Omit empty resource checks when none are involved; do not inventory unrelated resources. Self-owned/
canonical repositories are not disposable clones. Known unused assigned resources need actual disposition.

1. Under standing workspace release authority, eligible end-of-pass cleanup needs no per-directory
   reapproval. Resolve the named target; exclude container roots, shared stores, unrelated paths and
   external link targets. Linked/shared worktrees need supported Git removal; loss acceptance grants
   no link/ACL/ownership override. Retain exact authority/ownership blockers where needed.
2. For ordinary not-yet-PR work needing preservation, review and commit intended changes to a distinct
   owned branch on a permitted fork, confirm the actual remote head once and record recovery facts.
   Include valuable untracked/combined changes after review, never blind add, force-push or forbidden
   publication. No empty preservation commit for an unchanged clean clone. Use existing reliable results;
   eligible delivery or explicit abandonment substitutes for this preservation path, not for ownership.
3. Before release record the native target, selected path and minimal supporting facts: delivery reference/
   confirmed fork branch/head/base and remaining limits, or abandonment authority/scope/loss facts.
   Keep sensitive references only in existing protected local records; shared state contains no private
   evidence/body. Do not copy raw payloads or create a recovery archive as a cleanup prerequisite.
4. Delete only the eligible named source/temp/material or subtrees. Keep excluded resources, persistent
   records, existing recovery archives and remote refs untouched. Report released, retained/reason or
   failed/error; partial/ambiguous effects are not whole-target success. No blind retries, broad-root
   deletion, forced unlocks, shared-service kills or disk compaction.
5. The execution owner updates only disposition facts in the same state.md/work/work.md, preserving engineering
   facts and single-writer ownership. If recording fails, retain the native result and exact failure, never
   truncate originals. No unchanged paragraphs, repeated remote checks or post-delete path/Git/archive/
   size checks. Do not claim reclaimed bytes. A necessary Supervisor volume-capacity check for resuming
   writes is not per-target deletion verification. Archives remain recovery-only, not new current state.

## Temporary services and shared runtimes

- Workers normally stop their unused task-owned temporary processes/services/containers within authority;
  data follows its own disposition path, not an automatic container-delete rule.
- The authorized environment owner stops WSL only after confirming no active Worker, user task or shared service depends on it,
  within existing authority. High memory use alone proves neither idleness nor disposal authority.
- Do not force-kill shared Docker/WSL or vmmem; wsl --shutdown terminates all distributions and the VM.
