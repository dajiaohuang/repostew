# Prompt assembly and templates

Use [assembly](../references/worker-assembly.md); templates are ordinary-text skeletons,
not copied policy, executable protocol or authority.

- [Coordinator start](coordinator-start.md): selected scope and Worker construction.
- [Worker start](worker-start.md): one complete bounded assignment.
- [Continue](continue.md): changed rules/facts and remaining work only.
- [Handoff](handoff.md): replacement after prior writer ends and mutations reconcile.

## Canonical context and ordering

Common constraints/role -> applicable form/methods -> scoped target rules -> assignment variables.
Keep unchanged shared text stable; do not load unrelated methods.
Every new security finding requires [private reporting only](../references/security.md), never a public issue.
Separate supplied current text, missing startup reads and action-triggered rules under [assembly](../references/worker-assembly.md).
Use accessible canonical paths or complete current applicable text, never inaccessible paths/summaries alone.
Batch independent missing reads; complete usable text needs no duplicate reading. Leaves receive their
boundaries, not entire Coordinator briefs. Links do not require unrelated or recursive loading.
Fill/remove `{fields}`; clarify indispensable missing facts, let Workers establish ordinary unknowns.
No credentials/private bodies/unrelated transcripts. Use native [harness](../references/harness.md)
transport; templates do not launch tasks or schedules.
