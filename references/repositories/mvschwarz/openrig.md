# mvschwarz/openrig

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- Preserve focused restore tests when revising the implementation; exercise the actual workspace-doctor and ancestor-resolution boundaries. The cited request allowed a merge without those tests, so it is not a universal submission gate. [Feedback #459](https://github.com/mvschwarz/openrig/pull/459#issuecomment-5951289317).
- Unknown or malformed selections and unusable hooks remain caveats, not healthy results; distinguish disabled, wrong-event and wrong-handler-type hooks without adding startup refusal. [Feedback #328](https://github.com/mvschwarz/openrig/pull/328).
- Launch terminal/locale values come from the live pane, not daemon startup; absent values stay absent. Test differing pane/daemon environments and the actual launch path. [Feedback #326](https://github.com/mvschwarz/openrig/pull/326).
- Shutdown closes event streams separately, preserves ordinary in-flight work within its budget, and reports forced interruption truthfully. Server mocks must satisfy the production interface. [Feedback #324](https://github.com/mvschwarz/openrig/pull/324).
- Verify shipped archive behavior before changing it; preserve exact permission bits through create, unpack and install. Investigate staging writability separately from installed modes. [Feedback #321](https://github.com/mvschwarz/openrig/pull/321).
- Resume and reconciliation use the same strict same-pane foreground identity proof; background tokens, ambiguous lineage and incomplete metadata do not prove recovery. [Feedback #335](https://github.com/mvschwarz/openrig/pull/335).
- The @ restriction concerns pod/member identifiers, not rig names. Documentation must name the actual preflight/create/launch phase rather than claiming schema validation enforces it. [Feedback #473](https://github.com/mvschwarz/openrig/pull/473).
- Compaction regressions use real stores/enforcement with controlled clocks and fake transport, covering stale data, threshold equality and paused restore; external live services are not inherently required. [Feedback #464](https://github.com/mvschwarz/openrig/pull/464).
- Carry channel-scoped identity through deduplication and attachment storage; verify distinct attachment bytes, not just a changed seen-key. [Feedback #452](https://github.com/mvschwarz/openrig/pull/452).
- Distinguish new Compose identity from replacement continuity. Preserve explicit/stored names and proven predecessor generations; report ambiguity and protect live successors during rollback/cleanup without silently skipping unrelated requested operations. [Feedback #481](https://github.com/mvschwarz/openrig/pull/481).
- Deferred role hooks produce ordinary result diagnostics with role/reference context; this warning is not authority to block validation, planning or installation. [Feedback #478](https://github.com/mvschwarz/openrig/pull/478).
