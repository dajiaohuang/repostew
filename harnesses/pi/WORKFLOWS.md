# Skill workflows in the Pi harness

The harness executes the full [Skill flow index](../../skill/SKILL.md#all-flows).
Each assignment receives the complete Skill entry, role contract, five-field task
and selected form. Action methods are read from the canonical files through
`harness_policy`. There is one policy source, not a second copied rulebook.

This is workflow support through Pi agents and native tools. It is not a claim
that every forge, private reporting channel, mailbox or target platform is installed,
authenticated or tested on this machine. Tool availability does not grant authority.

## Coverage

| Workflow ID | Execution path | Required boundary |
| --- | --- | --- |
| `assigned` | Explicit bounded C/W task; existing default | No inferred source expansion |
| `prepare` | Full role/form assembly and action methods | Scope, authority and resources established first |
| `discovery` | Registered sources, native inspection/admission, C dispatch | Exclusions, suitability and exact project identity |
| `new-repository` | Native W investigation through suitable delivery | Actual-use proof and target-required checks |
| `contribution-reassessment` | C source reconciliation and scoped W continuation | Current authored objects and remaining scope |
| `incremental-feedback` | Captured batch, same-project W, C judgment | Capture is separate from handling |
| `recurring-patrol` | Completed pass waits until the configured revisit | No new pass over unfinished selected input |
| `followed-issues` | Exact registered issue windows and W batches | Followed membership and complete source coverage |
| `notifications` | All-read-status GitHub capture, selected mail input, W handling | Native IDs, pagination, independent source positions |
| `open-objects` | Authored/commented searches and unfinished-object reads | Lightweight deltas before deeper work |
| `actual-use` | W traces supported call chains and documents | Concrete behavior and evidence |
| `discussion` | W makes the authorized native issue/comment submission | Target discussion permission and no invented finding |
| `security` | W uses the authorized private route | Missing route retains protected evidence and a blocker |
| `delivery` | W repair, validation, fork/branch/commit/push/PR/MR and follow-up | Actual submission evidence; no signature impersonation |
| `maintenance` | W triage, review, amend, merge or maintain within assignment | Maintainer authority comes from current records |
| `records` | C global records; W project state/history; authorized migration | Direct Markdown remains project authority |
| `history` | C reconciles retained evidence and reclassification | No history-based permission or automatic replay |
| `backup` | C reviews an exact whitelist and uses native Git | Requested backup only; protected data excluded |
| `disposition` | C uses native tools after stopped-writer handoff | Finite explicit release path, ownership and exceptions |

Legacy selectors `direct`, `audit`, `reassessment`, `captured-feedback`, `patrol`,
`maintain`, `migration` and `recovery` resolve to their corresponding entries.
C/W do not create new timers. A continuous campaign uses the existing service
lifecycle and `revisitMs`; a finite campaign stays complete.

## Select a workflow

List all entries without starting a service:

```sh
rtk node src/cli.mjs workflows
rtk node src/cli.mjs policy list
rtk node src/cli.mjs policy references/workflows/notifications.md
```

The MCP equivalent is `repostew_workflows` with `action: "list"` or
`action: "read", paths: [...]`. Canonical paths are constrained to the configured
Skill root; returned documents include their full text and SHA-256.

Add a paused C through the existing `add-c` command. This example is a template;
replace the scope and time window with actually authorized values:

```json
{
  "id": "notifications",
  "campaign": {
    "id": "selected-notifications",
    "workflow": "notifications",
    "mandate": "Capture this exact window and handle only assigned repositories. Retain out-of-scope objects without engineering.",
    "allowedProjects": [
      {"host": "github.com", "namespace": "example", "repo": "project"}
    ],
    "allowedHosts": [],
    "workerMode": "engineering",
    "continuous": false,
    "revisitMs": 3600000,
    "sources": [{
      "id": "github-window",
      "kind": "github-notifications",
      "host": "github.com",
      "since": "2026-01-01T00:00:00Z",
      "until": "2026-01-02T00:00:00Z"
    }]
  }
}
```

Standalone W accepts `workflow` alongside its explicit `workerMode`.
Child W inherits its C campaign. Read-only W has no write/edit/shell tools;
`harness_repository` supplies bounded GitHub/GitLab GET operations.
C record tools and, for applicable workflows, shell tools support its assigned
duties. They are not an OS filesystem sandbox. C never gains repository
engineering or cleanup authority merely by selecting a workflow.

## Sources and capture

`harness_source` lists only registered sources and captures one exact page.
Follow `nextPage` until the window is complete; then read `indexPath` and the
referenced local raw pages with native read. Raw values remain local; the
runtime exposes capture metadata, IDs and references rather than message bodies.

| Source kind | Selection |
| --- | --- |
| `github-notifications` | `host: github.com`, fixed `since`/`until` or rolling `windowMs`; includes read notifications |
| `github-issues`, `github-repositories` | Exact authorized `query`; newest updated first; incomplete/capped search stays incomplete |
| `gitlab-issues`, `gitlab-merge-requests` | Exact `host` and `project`, fixed or rolling updated window |
| `url` | Exact HTTPS `url`; GET without redirect following; no implicit linked-page crawl |
| `capture-file` | Exact workspace `path` containing `{provenance, items, complete}` |

Rolling windows are fixed once per C pass. Pages are retained with hashes and
receipts; repeated reads reuse verified retained captures. The terminal
processing index deduplicates native IDs and sorts globally by `updated_at`
descending, then numeric-aware ID descending. Search caps, malformed input,
missing pages and changed retained bytes never become complete coverage.
Capture completion is required for registered sources before a C completes its
pass. The C still owns handling coverage and independent Markdown source positions.

A selected Outlook export can use `capture-file` with
`expectedProvenance: {"folder": "github", "account": "selected-account"}`.
That validates the supplied snapshot fields; it is **not** a live Outlook
connector or independent proof of the original capture. Use the authorized
host's connector to obtain the exact folder/window. No other mailbox is read.
Never publish captures or include credentials in provenance.

Built-in source reads use existing `gh`/`glab` authentication. Set
`forges: {"gitlab.example.com": "gitlab"}` for an explicitly selected self-hosted
forge. Native interfaces can handle additional authorized sources or mutations;
the generic adapter does not grant them credentials or install dependencies.

## Failure and completion behavior

403 access gates hold the affected project; 401 authentication and rate limits
hold the affected host. Other hosts/projects continue when independently eligible.
Use a stable governance operation with `action: "clear-forge"` and exactly one
`project`, `host` or `source: {coordinatorId, id}`, plus concrete repair evidence.
Clearing an incident alone does not clear a gate or resume a task.

Failed inspections are not permanently cached. Refresh successful metadata only
with a changed-input reason. Upstream `push: false` never means that a fork-based
PR, comment or issue claim is forbidden; actual operation results decide.

Source progress and changed evidence count as C progress. Repeated unchanged
continuation is still bounded. Source completion arriving after Stop retains its
local receipt but cannot advance C coverage. Post-submission personal CLA/DCO work
is reported by feedback/notification workflows without retaining a completed W.

See [operational blockers](OPERATIONS.md) for recovery decisions and validation limits.
