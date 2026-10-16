"""Create workspace-bound native Worker definitions without changing harness config."""
import argparse
import json
from pathlib import Path


def configure(workspace, core):
    workspace = workspace.resolve(strict=True)
    core = core.resolve(strict=True)
    if not workspace.is_dir() or not (core / "SKILL.md").is_file():
        raise ValueError("Supply a workspace directory and canonical skill directory")
    prompt = (
        f"Read {json.dumps(str(core / 'SKILL.md'))}, "
        f"{json.dumps(str(core / 'roles/worker.md'))} and applicable references. "
        f"Policy/state root: {json.dumps(str(workspace))}. "
        "The Coordinator supplies the finite assignment and supplied/startup/action-triggered rules. "
        "Reuse complete current text; batch independent missing reads. Links are not recursive read orders. "
        "Load methods before their actions, not full Coordinator briefs; keep permission/privacy gates."
    )
    files = {
        workspace / ".pi/agents/repostew-worker.md":
            "---\nname: repostew-worker\ndescription: One bounded RepoStew repository assignment\n---\n\n" + prompt + "\n",
        workspace / ".codex/repostew/worker.toml":
            "developer_instructions = " + json.dumps(prompt) + "\n",
    }
    for path, content in files.items():
        if path.exists() and path.read_text(encoding="utf-8") != content:
            raise FileExistsError(f"Preserving different existing definition: {path}")
    for path, content in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(path)
    print("Codex: pass -c 'agents.repostew_worker.description=\"Bounded RepoStew Worker\"' "
          "-c 'agents.repostew_worker.config_file=" + json.dumps(str(workspace / '.codex/repostew/worker.toml')) + "'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workspace", type=Path)
    parser.add_argument("--core", type=Path, default=Path(__file__).resolve().parents[1] / "skills/repostew")
    args = parser.parse_args()
    configure(args.workspace, args.core)
