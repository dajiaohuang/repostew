"""Check bundle fidelity, local links and the actual npm archive."""

import argparse
import json
import re
import subprocess
import tarfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def validate(bundle):
    core = bundle / "skills" / "repostew"
    for source, target in ((ROOT / "integrations/pi.js", bundle / "extensions/pi.js"),
                           (ROOT / "integrations/pi-native.js", bundle / "extensions/pi-native.js"),
                           (ROOT / "integrations/pi-repostew.js", bundle / "extensions/pi-repostew.js"),
                           (ROOT / "integrations/pi-openrig.js", bundle / "extensions/pi-openrig.js"),
                           (ROOT / "integrations/pi-runtime.js", bundle / "extensions/pi-runtime.js"),
                           (ROOT / "scripts/configure-pi.mjs", bundle / "scripts/configure-pi.mjs"),
                           (ROOT / "integrations/pi-extras.js", bundle / "extensions/pi-extras.js"),
                           (ROOT / "integrations/repostew.js", bundle / "extensions/repostew.js"),
                           (ROOT / "scripts/configure-workers.py", bundle / "scripts/configure-workers.py"),
                           (ROOT / "integrations/README.md", bundle / "README.md")):
        assert source.read_bytes() == target.read_bytes(), f"Stale adapter: {target}"
    sources = [ROOT / "SKILL.md"]
    for directory in ("roles", "prompts", "references"):
        sources.extend((ROOT / directory).rglob("*.md"))
    for source in sources:
        copy = core / source.relative_to(ROOT)
        assert source.read_bytes() == copy.read_bytes(), f"Stale bundled file: {copy}"
        for link in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", copy.read_text(encoding="utf-8")):
            url = urlsplit(link.strip("<>"))
            if url.scheme:
                continue
            target = (copy.parent / unquote(url.path)).resolve()
            assert target.is_relative_to(core), f"Link escapes skill: {copy}: {link}"
            assert target.exists(), f"Missing link: {copy}: {link}"
            if url.fragment:
                headings = re.findall(r"^#{1,6} (.+)$", target.read_text(encoding="utf-8"), re.MULTILINE)
                anchors = {re.sub(r"[^\w -]", "", heading.lower()).replace(" ", "-") for heading in headings}
                assert unquote(url.fragment) in anchors, f"Missing anchor: {copy}: {link}"
    package = json.loads((bundle / "package.json").read_text(encoding="utf-8"))
    for manifest in ("plugin.json", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json"):
        data = json.loads((bundle / manifest).read_text(encoding="utf-8"))
        for key in ("name", "version", "description"):
            assert data[key] == package[key], f"Manifest identity mismatch: {manifest}"
    assert package["pi"]["extensions"] == ["./extensions/pi-repostew.js"], "Default package loads only RepoStew; OpenRig is explicit"
    for host in ("pi", "omp"):
        for kind in ("extensions", "skills"):
            for path in package[host][kind]:
                assert (bundle / path).exists(), f"Missing {host} resource: {path}"
    result = subprocess.run(["rtk", "proxy", "npm", "pack", "--json"], cwd=bundle,
                            capture_output=True, text=True, encoding="utf-8", check=True)
    archive = bundle / json.loads(result.stdout)[0]["filename"]
    expected = {"package/skills/repostew/" + source.relative_to(ROOT).as_posix() for source in sources}
    expected.update("package/" + path for path in (
        "package.json", "plugin.json", ".codex-plugin/plugin.json", ".claude-plugin/plugin.json",
        "LICENSE", "README.md", "extensions/pi.js", "extensions/pi-extras.js", "extensions/pi-native.js", "extensions/pi-repostew.js", "extensions/pi-openrig.js", "extensions/pi-runtime.js", "extensions/repostew.js", "scripts/configure-workers.py", "scripts/configure-pi.mjs"))
    with tarfile.open(archive) as tar:
        assert {entry.name for entry in tar if entry.isfile()} == expected, "Unexpected archive membership"
        for name in expected:
            assert tar.extractfile(name).read() == (bundle / name.removeprefix("package/")).read_bytes()
    print(f"Validated {len(sources)} canonical files, links, manifests and {len(expected)} archive entries: {archive}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", nargs="?", type=Path, default=ROOT / "dist" / "repostew")
    validate(parser.parse_args().bundle.resolve())
