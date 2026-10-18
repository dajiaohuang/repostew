"""Offline editorial checks: generic/adapter boundary, compact entry pages and full flow index."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# These are implementation identifiers, not universal workflow concepts. Forge-specific references
# and harness integration pages have separate scope and are deliberately excluded.
NATIVE = re.compile(
    r"\b(?:T3|Pi|Codex|Claude|OMP|delegate_task|task_status|t3_thread_send|taskId|childThreadId|"
    r"clientRequestId|runtimeMode|agent_end|agent_before_settle|agent_settled|"
    r"max_concurrent_threads_per_session)\b|ctx\.executeTool|/repostew-goal"
)
LIMITS = {
    "SKILL.md": 85, "AGENTS.md": 28,
    "references/orchestration.md": 115, "references/worker-assembly.md": 65,
    "references/harness.md": 40,
    "roles/supervisor.md": 26, "roles/coordinator.md": 33, "roles/worker.md": 38,
    "roles/maintainer.md": 15,
    "prompts/README.md": 24, "prompts/supervisor-start.md": 24,
    "prompts/coordinator-start.md": 10, "prompts/worker-start.md": 10, "prompts/task.md": 18,
    "prompts/continue.md": 18, "prompts/handoff.md": 22,
}
FORMS = ("new-repository", "contribution-reassessment", "incremental-feedback", "discovery", "recurring-patrol")
for form in FORMS:
    for role in ("coordinator", "worker"):
        LIMITS[f"prompts/{form}/{role}.md"] = 10
FLOW_LINKS = {
    "references/worker-assembly.md", "references/orchestration.md", "references/execution-recovery.md", "references/refill.md",
    "references/work-forms/discovery.md", "references/work-forms/new-repository.md",
    "references/work-forms/contribution-reassessment.md", "references/work-forms/incremental-feedback.md",
    "references/work-forms/recurring-patrol.md", "references/workflows/followed-issues.md",
    "references/workflows/notifications.md", "references/workflows/open-objects.md", "references/patrols.md",
    "references/audit.md", "references/contribution-value.md", "references/security.md",
    "references/workflows/delivery.md", "references/safety.md", "references/reassessment.md",
    "references/workflows/maintain.md", "references/records.md", "references/workflows/history.md",
    "references/workflows/records-and-backup.md", "references/storage.md",
}


# Editorial regression assertions, not proof of runtime compliance or complete semantic review.
BOUNDARIES = {
    "roles/worker.md": ("direct", "fork/branch/commit/push/Open PR", "CLA/DCO prechecks",
                        "Preparation is internal", "No delivery needed", "Externally blocked", "Execution failed",
                        "Continue feasible work", "whole-unit resource envelope"),
    "roles/coordinator.md": ("Check delivery", "No routine remote readback", "Not delivered, feasible",
                             "owning Worker continues", "No delivery needed", "Blocked/failed", "Continue in the same turn",
                             "local failure is not a domain stop"),
    "prompts/task.md": ("1. Object and outcome", "2. Location and prior work", "3. Complete TODO",
                        "4. Authority and resources", "5. Finish and return"),
    "roles/supervisor.md": ("bounded recovery", "notify the user if unable", "bounded refill heartbeat"),
    "prompts/supervisor-start.md": ("Bounded refill fallback", "at most one", "Deduplicate queued/in-flight",
                                    "No direct W delegation", "no self-queued bypass"),
    "references/orchestration.md": ("bounded C-routing", "workspace policy/shared-state Git", "three failed repairs"),
    "references/refill.md": ("in the same turn", "No gap", "Refill gap", "Disposition gap", "Already routed",
                             "Ineffective prior correction", "At most one combined continuation",
                             "No direct W delegation", "only mutation is the bounded C message",
                             "hard-quota waiver", "expiry never renews itself"),
    "references/safety.md": ("do not precheck CLA/DCO", "actually requests signing", "PR-only refusal", "Never sign for the user"),
    "references/execution-recovery.md": ("three failed repairs", "notify", "prospective deadline", "cumulative accounting"),
    "references/workflows/delivery.md": ("assigned Worker completes its own", "no global", "Missing fork/remote head is a step"),
    "references/forges/github/README.md": ("submit before CLA/DCO prechecks", "Report `gh` faults promptly", "If unable to repair"),
    "references/forges/gitlab/README.md": ("Decide per project and action", "submit before CLA/DCO prechecks", "Report `glab` faults promptly"),
    "prompts/recurring-patrol/coordinator.md": ("Frozen source windows do not freeze",),
    "prompts/discovery/coordinator.md": ("Source-screen limits do not consume",),
    "prompts/reinforcement.md": ("overlooked idle units", "not via a backlog gateway"),
}
FORBIDDEN = (
    "C7 is the only serial", "single serial publisher", "with one serial publisher",
    "Every wake follows", "Every completion, continuation or authorized heartbeat resumes",
    "Finish assigned issue classification and [usage/documentation audit](audit.md) before repair publication",
    "Complete classification/coverage before grouped delivery",
    "Compose one shared header plus the selected form's TODO",
    "Compose one brief from the shared C/W header",
    "Wait for C7 before publication", "End engineering after read-only inspection",
    "read-only heartbeats only inspect/report", "The authorized Supervisor heartbeat is **read-only**",
    "A read-only heartbeat inspects and reports only", "No dispatch/send/steer/restart/cancel",
    "Heartbeat may directly dispatch Workers", "Heartbeat may change quotas", "Heartbeat may delete checkouts",
)


def validate_boundaries(root=ROOT):
    for name, phrases in BOUNDARIES.items():
        text = " ".join((root / name).read_text(encoding="utf-8").split())
        for phrase in phrases:
            assert phrase in text, f"Missing current boundary: {name}: {phrase}"
    paths = [root / name for name in ("SKILL.md", "AGENTS.md", "README.md", "README.en.md", "README.zh.md")]
    for directory in ("roles", "prompts", "references", "docs"):
        paths.extend((root / directory).rglob("*.md"))
        paths.extend((root / directory).glob("*.html"))
    for path in paths:
        text = " ".join(path.read_text(encoding="utf-8").split())
        for phrase in FORBIDDEN:
            assert phrase not in text, f"Retired boundary: {path}: {phrase}"


def validate_task_shape(root=ROOT):
    index = (root / "prompts/README.md").read_text(encoding="utf-8")
    task = (root / "prompts/task.md").read_text(encoding="utf-8")
    assert len(re.findall(r"^> \*\*[1-5]\.", task, re.M)) == 5, "Task must have exactly five fields"
    assert len(re.findall(r"^>", task, re.M)) == 5, "Task must not grow extra fields"
    for role in ("coordinator", "worker"):
        header = (root / f"prompts/{role}-start.md").read_text(encoding="utf-8")
        assert "](task.md)" in header and f"](../roles/{role}.md)" in header, "Role entry must use canonical contract/task"
        assert not re.search(r"^>", header, re.M), "Role entry must not duplicate task fields"
        for form in FORMS:
            name = f"{form}/{role}.md"
            text = (root / "prompts" / name).read_text(encoding="utf-8")
            assert f"]({name})" in index, f"Unindexed task form: {name}"
            assert f"](../{role}-start.md)" in text and "](../task.md)" in text, f"Missing canonical task: {name}"
            assert not re.search(r"^>|TODO [0-9]:", text, re.M), f"Form duplicates task contract: {name}"
            if form == "discovery" and role == "worker":
                assert "](../new-repository/worker.md)" in text, "Discovery W must alias new-repository"


def validate():
    generic = [ROOT / name for name in ("SKILL.md", "AGENTS.md", "README.md", "README.en.md", "README.zh.md")]
    for directory in ("roles", "prompts", "references", "references/work-forms", "references/workflows"):
        generic.extend((ROOT / directory).glob("*.md"))
    generic.extend(path for path in (ROOT / "prompts").rglob("*.md") if path.parent != ROOT / "prompts")
    generic = [path for path in generic if path != ROOT / "references/harness.md"]
    for path in generic:
        match = NATIVE.search(path.read_text(encoding="utf-8"))
        assert not match, f"Move native implementation detail to an adapter: {path}: {match.group() if match else ''}"
    for name, limit in LIMITS.items():
        count = len((ROOT / name).read_text(encoding="utf-8").splitlines())
        assert count <= limit, f"Review compact entry budget without dropping authority gates: {name}: {count}>{limit}"
    validate_task_shape()
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    links = set(re.findall(r"\[[^\]]*\]\(([^\s)#]+)(?:#[^)]*)?\)", skill))
    assert FLOW_LINKS <= links, f"Missing flow links: {sorted(FLOW_LINKS - links)}"
    assert (ROOT / "README.md").read_bytes() == (ROOT / "README.en.md").read_bytes(), "English README copies diverged"
    validate_boundaries()
    # These checks cannot establish semantic preservation or host compatibility; review those separately.
    print(f"Policy boundary passed: {len(generic)} generic pages, {len(LIMITS)} compact entries, {len(FLOW_LINKS)} flow links; English mirrors match.")


if __name__ == "__main__":
    validate()
