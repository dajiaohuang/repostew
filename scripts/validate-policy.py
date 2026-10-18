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
    "prompts/coordinator-start.md": 20, "prompts/worker-start.md": 20,
    "prompts/continue.md": 18, "prompts/handoff.md": 22,
}
FORMS = ("new-repository", "contribution-reassessment", "incremental-feedback", "discovery", "recurring-patrol")
for form in FORMS:
    for role in ("coordinator", "worker"):
        LIMITS[f"prompts/{form}/{role}.md"] = 18
FLOW_LINKS = {
    "references/worker-assembly.md", "references/orchestration.md", "references/execution-recovery.md",
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
    "roles/worker.md": ("direct", "fork/branch/commit/push/Open PR", "CLA/DCO prechecks"),
    "roles/supervisor.md": ("bounded recovery", "notify the user if unable", "read-only heartbeat"),
    "prompts/supervisor-start.md": ("Read-only inspection", "No dispatch/send/steer/restart/cancel", "Do not queue a follow-up"),
    "references/orchestration.md": ("read-only heartbeat", "workspace policy/shared-state Git", "three failed repairs"),
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
    index = (ROOT / "prompts/README.md").read_text(encoding="utf-8")
    for form in FORMS:
        for role in ("coordinator", "worker"):
            name = f"{form}/{role}.md"
            text = (ROOT / "prompts" / name).read_text(encoding="utf-8")
            assert f"]({name})" in index, f"Unindexed task template: {name}"
            assert f"](../{role}-start.md)" in text, f"Missing shared header: {name}"
            if form == "discovery" and role == "worker":
                assert "](../new-repository/worker.md)" in text, "Discovery W must alias the complete new-repository template"
            else:
                assert "> TODO 1:" in text and "> Completion:" in text, f"Missing task contract: {name}"
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    links = set(re.findall(r"\[[^\]]*\]\(([^\s)#]+)(?:#[^)]*)?\)", skill))
    assert FLOW_LINKS <= links, f"Missing flow links: {sorted(FLOW_LINKS - links)}"
    assert (ROOT / "README.md").read_bytes() == (ROOT / "README.en.md").read_bytes(), "English README copies diverged"
    validate_boundaries()
    # These checks cannot establish semantic preservation or host compatibility; review those separately.
    print(f"Policy boundary passed: {len(generic)} generic pages, {len(LIMITS)} compact entries, {len(FLOW_LINKS)} flow links; English mirrors match.")


if __name__ == "__main__":
    validate()
