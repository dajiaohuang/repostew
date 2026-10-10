"""Validate native Codex role config without model calls or personal configuration."""
import argparse
import importlib.util
import json
import os
import queue
import subprocess
import sys
import tempfile
import threading
import tomllib
from pathlib import Path


def validate(bundle, output):
    root = Path(tempfile.mkdtemp(prefix="codex-native-", dir=output))
    workspace = root / "workspace"
    workspace.mkdir()
    spec = importlib.util.spec_from_file_location("worker_setup", bundle / "scripts/configure-workers.py")
    setup = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(setup)
    setup.configure(workspace, bundle / "skills/repostew")
    setup.configure(workspace, bundle / "skills/repostew")
    role = workspace / ".codex/repostew/worker.toml"
    instructions = tomllib.loads(role.read_text(encoding="utf-8"))["developer_instructions"]
    assert json.dumps(str(workspace)) in instructions
    assert "model" not in tomllib.loads(role.read_text(encoding="utf-8"))
    preserved = role.read_bytes()
    pi_agent = workspace / ".pi/agents/repostew-worker.md"
    pi_agent.write_text("existing project agent", encoding="utf-8")
    try:
        setup.configure(workspace, bundle / "skills/repostew")
    except FileExistsError:
        pass
    else:
        raise AssertionError("Different existing agent must be preserved")
    assert role.read_bytes() == preserved
    assert pi_agent.read_text(encoding="utf-8") == "existing project agent"
    environment = {**os.environ, "CODEX_HOME": str(root / "home")}
    Path(environment["CODEX_HOME"]).mkdir()
    command = ["rtk", "proxy", "codex", "app-server", "--strict-config", "-c",
               'agents.repostew_worker.description="Bounded RepoStew Worker"', "-c",
               "agents.repostew_worker.config_file=" + json.dumps(str(role))]
    process = subprocess.Popen(command, cwd=workspace, env=environment, stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, encoding="utf-8")
    replies = queue.Queue()
    def read():
        for line in process.stdout:
            replies.put(json.loads(line))
    threading.Thread(target=read, daemon=True).start()
    def request(identifier, method, params):
        process.stdin.write(json.dumps({"id": identifier, "method": method, "params": params}) + "\n")
        process.stdin.flush()
        while True:
            reply = replies.get(timeout=15)
            if reply.get("id") == identifier:
                assert "error" not in reply, reply.get("error")
                return reply["result"]
    try:
        request(1, "initialize", {"clientInfo": {"name": "repostew-validation", "version": "0.1.0"}})
        process.stdin.write('{"method":"initialized"}\n')
        process.stdin.flush()
        result = request(2, "config/read", {"cwd": str(workspace), "includeLayers": False})
        native_role = result["config"]["agents"]["repostew_worker"]
        assert Path(native_role["config_file"]) == role
        assert native_role["description"] == "Bounded RepoStew Worker"
    finally:
        process.stdin.close()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.terminate()
            process.wait(timeout=5)
    print("Codex native strict config/read, Worker TOML, idempotency and collision preservation passed (no live spawn/model).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path)
    parser.add_argument("--output", type=Path, default=Path("dist"))
    args = parser.parse_args()
    validate(args.bundle.resolve(), args.output.resolve())
