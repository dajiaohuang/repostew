# Ordinary audit through actual use

## Scope and entry point

Establish the assignment kind, maintained usage/documentation scope and source base
before investigation. A new-repository audit covers the project's maintained,
advertised use paths and documentation within that scope. Select paths from project
purpose, usage instructions, public interfaces and captured issues; do not select
only a convenient candidate. Follow-up covers its assigned objects and affected paths.
Whole-source or file-by-file review is mandatory only when explicitly required by the
user or target. Apply this method to ongoing ordinary audits too; a superseded default
is not a separate requirement. Ordinary audits do not count file opens as coverage.

Keep the assigned scope and audit base fixed. Consult history for a concrete contract,
regression or duplicate. Before publication, reconcile findings with the permitted
current base and review relevant deltas through the affected paths; reuse unchanged
coverage. Report uncovered work, not coverage of a newer base inferred from an old one.

## Find and establish errors

Fully capture the assigned issue window, deduplicate and classify newest first.
Read enough of each report to classify it; investigate actual-use problems, relevant
contract questions and applicable maintainer direction in depth. Classifying reports
does not adopt the upstream backlog or require implementing feature wishes.

Trace supported inputs/configuration through the real entry point, calls, state
changes and dependencies to the final result. Read implementation and tests as needed
to establish the complete trigger, concrete error and violated existing contract.
Include initialization, updates, cancellation or recovery where they affect that path.
Reproduction or strong source proof is sufficient. A documented public API needs a
concrete supported invocation, not an in-repository caller. An isolated helper test
without a reachable use chain is insufficient.

For documentation, identify an existing false statement, broken instruction/reference
or incorrect example. Check facts, commands, parameters, paths, API usage and version
conditions against authoritative sources or actual behavior. Temporary unavailability
alone does not prove a link is wrong. Wording, formatting and optional additions alone
do not qualify. Do not invent a software surface for a documentation collection.

Apply [candidate and reassessment standards](contribution-value.md): retain proven
errors, route evidenced contract questions to discussion, discard unsupported
suspicions after bounded investigation, or retain unavailable evidence with a concrete
blocker and retry condition. Consolidate common root causes as they arise.

## Completion and continuation

Complete the assigned issue classification and usage/documentation scope, then deliver
under [grouped delivery](../SKILL.md#assigned-audit-before-grouped-delivery).
No qualifying error is a valid result. Record only the base, meaningful covered and
remaining scope, candidate disposition and necessary blockers; file/line counts do
not prove coverage. Reuse existing proven chains and fill specific gaps when adopting
this method; old read logs cannot be relabelled as completed usage-path coverage.

Keep audit coverage, contribution outcomes and resource disposition distinct; use
[workflows](workflows.md#new-repository) for new-list completion effects. Follow-up
does not reopen unchanged audit scope. Security work uses the separate
[security audit](security.md), including findings encountered during ordinary work.
