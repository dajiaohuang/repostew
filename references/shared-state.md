# Shared state, local work

## Boundary

For an explicitly authorized multi-device workspace, state/ is the shared coordination layer in
its designated private Git repository. work/ remains device-local: source checkouts, uncommitted
changes, investigation notes, tests, environments and recovery material are not synchronized.
Never upload credentials, mail positions/content or private security evidence, even to private Git.
Keep protected material local; share only an appropriately reviewed non-sensitive blocker.

Global membership, maintainer authority, exclusions and public read positions retain their meanings.
Add state/repositories/<host>/<owner>/<repo>.md for facts another device needs before acting:
identity, confirmed responsible Coordinator, current scope/next action/blocker, published object URLs,
meaningful coverage and exact event positions where applicable. Preserve unknowns and permissions;
a URL or migrated record does not prove delivery, resolution, current status or authority.
Use exact forge namespaces (including GitLab subgroups); never merge identities based on similar names.

## Additive migration

1. Read the applicable local container-root state.md/work.md and existing shared record. Review the
   content for privacy and exclusions; exclude source/temp/archives. Do not copy raw records wholesale.
2. Add only reviewed coordination facts, with source paths and snapshot UTC. Preserve all local work
   records and intervening edits. Existing shared records need a fresh comparison, not regeneration.
3. During backfill mark the summary as a snapshot requiring reconciliation. Legacy local records
   may still receive updates; read their delta and current native objects before consequential action.
   Missing shared records never mean a project is free, complete or safe to start again.
4. Transition a project's coordination authority only through an explicit handoff by its current
   responsible Coordinator. Record the new writer and next action; resolve divergent updates first.
   Thereafter keep shared action-changing facts current, local work details local. Retained legacy
   text is evidence, not a competing authority. No deletion is part of additive migration.
5. Report migrated and deferred scope accurately. Do not infer completeness from file counts or
   mark unreviewed projects migrated. No permanent migration database, queue or receipt system.

## Multiple Coordinators and Git

One writer per project, explicitly agreed disjoint scopes across Coordinators. Device availability,
a Git commit, or a locally written ownership line does not acquire/release a project. Unknown ownership
requires clarification. Designate an editor for global authority/exclusion/membership files; until
explicit repartition, existing writers retain them. Designate one capturer per account-wide notification
or mail source; processing can be split by repository. Do not resume or duplicate paused schedules.

Fetch and integrate reviewed remote changes before taking assigned work. Publish small, explicitly
staged commits after meaningful coordination updates; review staged content and verify the remote head.
On rejected push, retain local work, integrate and resolve semantic conflicts; never force-push or
blindly choose the newest text. Git is synchronization, not a distributed lock. Offline investigation
can continue within assignment; uncertain ownership or stale action state blocks external publication.

Skill and state commits remain separate. A synchronization checkout is not automatically the runtime
state root: explicitly bind a device's state/ checkout before treating it as the shared live copy.
During backfill an external clone is only a publication copy; never overwrite live state/ from it.
See [workspace](workspace.md), [records](records.md) and [publication](workflows/records-and-backup.md).
