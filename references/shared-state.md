# Shared coordination, local execution

## Boundary

Use the [workspace layout](workspace.md): state/repositories/<host>/<namespace>/<repo>/state.md is
shared coordination; the same project's work/ is entirely local. work/work.md records actual delivery
history; source checkouts, notes, environments, private evidence and imported detailed records stay local.
Do not maintain a second current state, mirror tree or required legacy state.md under work/.

Shared facts are identity, responsible writer when established, current scope/next action/real blocker,
native outcomes, meaningful coverage, exact event positions and fork/branch/commit/base/check limits.
Keep sensitive reporting references local; share only a non-sensitive constraint. Even private Git never
receives credentials, mail positions/bodies, source, private security evidence, raw logs or recovery material.
Use exact reviewed-path admission; test that native namespace/repository names such as work are not
mistaken for execution directories. Ignore alone neither untracks files nor makes local data disposable.

## Authority and current writes

The assigned project writer updates both root state.md and local work/work.md. Under a stopped-writer
[resource handoff](storage.md), the Coordinator updates only disposal facts there, without parallel engineering
writes or a second record. Otherwise the Coordinator edits globals;
one designated publisher serializes Git index/commits. Repository state is shared, not a Coordinator-only
mirror of Worker notes. Neither a record, Git commit, physical move nor device availability grants ownership.

Existing backfills remain snapshots until reconciled; do not turn old status or absent records into present
claims. Explicit handoff changes project responsibility after prior writes/mutations reconcile. Preserve
membership, maintainer authority, exclusions and public/private source positions; schedules stay paused
unless explicitly activated. Unknown or conflicting ownership blocks dependent action, not unrelated work.

## Synchronization

Fetch and integrate reviewed remote changes before assigned work. Explicitly stage eligible paths and
inspect actual staged blobs, including already tracked files; never recursively add state/ or work/.
Keep skill/state commits separate, push without force, verify actual remote main. On rejection retain local
work and reconcile semantic conflicts, never blindly choose newer text. A publication copy is not a live
runtime binding; do not overwrite runtime state or silently choose between conflicting authority records.

## Authorized housekeeping and relocation

Follow [records](records.md) and [storage](storage.md). Remove only proved redundant navigation, expired
scratch or empty obsolete namespaces after preserving necessary facts/positions and fixing current links.
Retain unfinished/unknown/private work; historical scope or a recovery archive is not a new task queue.

Layout changes require explicit authority: preserve original bytes and dirty refs, never overwrite local
material, repair supported Git worktree links and actual local references, remove old roots only when empty.
Identify real blockers; process termination needs its own applicable authority, never a blanket process kill.
No ACL takeover, elevation, protection bypass or reconstruction of deleted source to force completion.

Ordinary not-yet-PR work follows standing preservation authority: reviewed changes on a distinct permitted
user-fork branch, actual remote-head confirmation and recovery facts in root state.md before unused-source
release. PR/CI waits alone do not justify indefinite retention. Protected/prohibited/failed preservation and
active/shared resources keep concrete boundaries. Local persistent records are never disposable source.
