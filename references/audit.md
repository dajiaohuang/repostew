# Ordinary audit through actual use

## Scope and entry point

Establish assignment kind, maintained usage/documentation scope and base. New audits cover advertised,
maintained paths selected from purpose, instructions, public interfaces and captured issues; follow-up
covers assigned objects/affected paths. Whole-source/file-by-file review only when explicitly required.
Keep scope/base fixed; use history for concrete contract/regression/duplicate questions. Before publication,
reconcile permitted-base changes through affected paths; reuse coverage, never relabel it as newer coverage.

## Find and establish errors

Capture/deduplicate the full issue window; classify newest first, investigating actual-use problems,
contract questions and maintainer direction without adopting the upstream backlog.
Trace input/configuration -> entry/calls/dependencies/state -> final result, including relevant initialization,
live updates/cancellation/recovery. Read source/tests as needed; prove concrete error and violated contract
by reproduction or strong source proof. Public APIs need supported invocation; isolated helpers are insufficient.
Verify exact existing document errors against authoritative sources/behavior; temporary unavailability,
wording, formatting and optional additions do not qualify. Do not invent code scope for document collections.
Apply [candidate standards](contribution-value.md): error, evidenced discussion, unsupported discard,
or unavailable-evidence blocker/retry; consolidate common roots during investigation.

## Completion and continuation

Finish assigned classification/coverage before [grouped delivery](contribution-value.md#assigned-audit-before-grouped-delivery).
Report base, meaningful covered/remaining paths, dispositions and blockers; file/read counts are not coverage.
Zero qualifying errors is valid. Fill actual gaps without restarting unchanged work. Apply
[new-list completion](workflows/new-repository.md); follow-up does not reopen completed coverage.
[Security](security.md) remains independently scoped and private.
