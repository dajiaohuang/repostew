"""Bundle canonical skill files with native manifests; never copy workspace state."""

import argparse
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def build(output):
    output.mkdir(parents=True, exist_ok=False)
    bundle = output / "repostew"
    core = bundle / "skills" / "repostew"
    sources = [ROOT / "SKILL.md"]
    for directory in ("roles", "prompts", "references"):
        sources.extend(sorted((ROOT / directory).rglob("*.md")))
    for source in sources:
        target = core / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    extension = bundle / "extensions" / "repostew.js"
    extension.parent.mkdir()
    shutil.copyfile(ROOT / "integrations" / "repostew.js", extension)
    for name in ("pi.js", "pi-extras.js", "pi-native.js"):
        shutil.copyfile(ROOT / "integrations" / name, extension.parent / name)
    (bundle / "scripts").mkdir()
    shutil.copyfile(ROOT / "scripts" / "configure-workers.py", bundle / "scripts/configure-workers.py")
    shutil.copyfile(ROOT / "scripts" / "configure-pi.mjs", bundle / "scripts/configure-pi.mjs")
    shutil.copyfile(ROOT.parent / "LICENSE", bundle / "LICENSE")
    shutil.copyfile(ROOT / "integrations" / "README.md", bundle / "README.md")
    package = json.loads((ROOT / "integrations" / "package.json").read_text(encoding="utf-8"))
    package["files"] = ["plugin.json", ".codex-plugin", ".claude-plugin", "extensions", "skills", "scripts"]
    write_json(bundle / "package.json", package)
    identity = {key: package[key] for key in ("name", "version", "description", "license", "repository", "author")}
    write_json(bundle / "plugin.json", {
        "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", **identity,
    })
    write_json(bundle / ".codex-plugin" / "plugin.json", {**identity, "skills": "./skills/"})
    write_json(bundle / ".claude-plugin" / "plugin.json", identity)
    write_json(output / ".agents" / "plugins" / "marketplace.json", {
        "name": "repostew-local",
        "interface": {"displayName": "RepoStew"},
        "plugins": [{"name": "repostew", "source": {"source": "local", "path": "./repostew"},
                     "policy": {"installation": "AVAILABLE", "authentication": "ON_USE"},
                     "category": "Productivity"}],
    })
    write_json(output / ".claude-plugin" / "marketplace.json", {
        "name": "repostew-local", "owner": {"name": "dajiaohuang"},
        "plugins": [{"name": "repostew", "source": "./repostew"}],
    })
    print(bundle)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist", help="New output directory")
    build(parser.parse_args().output.resolve())
