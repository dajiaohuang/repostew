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
    "roles/supervisor.md": 23, "roles/coordinator.md": 32, "roles/worker.md": 38,
    "roles/maintainer.md": 15,
    "prompts/README.md": 18, "prompts/supervisor-start.md": 24,
    "prompts/coordinator-start.md": 20, "prompts/worker-start.md": 20,
    "prompts/continue.md": 18, "prompts/handoff.md": 22,
}
FLOW_LINKS = {
    "references/worker-assembly.md", "references/orchestration.md",
    "references/work-forms/discovery.md", "references/work-forms/new-repository.md",
    "references/work-forms/contribution-reassessment.md", "references/work-forms/incremental-feedback.md",
    "references/work-forms/recurring-patrol.md", "references/workflows/followed-issues.md",
    "references/workflows/notifications.md", "references/workflows/open-objects.md", "references/patrols.md",
    "references/audit.md", "references/contribution-value.md", "references/security.md",
    "references/workflows/delivery.md", "references/safety.md", "references/reassessment.md",
    "references/workflows/maintain.md", "references/records.md", "references/workflows/history.md",
    "references/workflows/records-and-backup.md", "references/storage.md",
}


def validate():
    generic = [ROOT / name for name in ("SKILL.md", "AGENTS.md", "README.md", "README.en.md", "README.zh.md")]
    for directory in ("roles", "prompts", "references", "references/work-forms", "references/workflows"):
        generic.extend((ROOT / directory).glob("*.md"))
    generic = [path for path in generic if path != ROOT / "references/harness.md"]
    for path in generic:
        match = NATIVE.search(path.read_text(encoding="utf-8"))
        assert not match, f"Move native implementation detail to an adapter: {path}: {match.group() if match else ''}"
    for name, limit in LIMITS.items():
        count = len((ROOT / name).read_text(encoding="utf-8").splitlines())
        assert count <= limit, f"Review compact entry budget without dropping authority gates: {name}: {count}>{limit}"
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    links = set(re.findall(r"\[[^\]]*\]\(([^\s)#]+)(?:#[^)]*)?\)", skill))
    assert FLOW_LINKS <= links, f"Missing flow links: {sorted(FLOW_LINKS - links)}"
    assert (ROOT / "README.md").read_bytes() == (ROOT / "README.en.md").read_bytes(), "English README copies diverged"
    # These checks cannot establish semantic preservation or host compatibility; review those separately.
    print(f"Policy boundary passed: {len(generic)} generic pages, {len(LIMITS)} compact entries, {len(FLOW_LINKS)} flow links; English mirrors match.")


if __name__ == "__main__":
    validate()
