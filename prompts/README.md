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
File access: actual canonical paths + required reads. Otherwise complete applicable inline text;
paths/summaries alone are insufficient. Full current inline text needs no duplicate reading.
Fill/remove `{fields}`; clarify indispensable missing facts, let Workers establish ordinary unknowns.
No credentials/private bodies/unrelated transcripts. Use native [harness](../references/harness.md)
transport; templates do not launch tasks or schedules.
