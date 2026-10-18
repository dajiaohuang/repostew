"""Offline regression tests for current policy assertions; no host/network operations."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("policy", Path(__file__).with_name("validate-policy.py"))
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)


class PolicyBoundaries(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        names = set(policy.BOUNDARIES) | {"SKILL.md", "AGENTS.md", "README.md", "README.en.md", "README.zh.md"}
        for name in names:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes((policy.ROOT / name).read_bytes())

    def test_current_policy(self):
        policy.validate_boundaries(self.root)

    def test_missing_contracts_are_rejected(self):
        for name, phrases in policy.BOUNDARIES.items():
            path = self.root / name
            original = path.read_text(encoding="utf-8")
            normalized = " ".join(original.split())
            for phrase in phrases:
                with self.subTest(file=name, removed=phrase):
                    path.write_text(normalized.replace(phrase, "REMOVED"), encoding="utf-8")
                    with self.assertRaisesRegex(AssertionError, "Missing current boundary"):
                        policy.validate_boundaries(self.root)
                    path.write_text(original, encoding="utf-8")

    def test_retired_gates_are_rejected(self):
        path = self.root / "README.md"
        original = path.read_text(encoding="utf-8")
        for phrase in policy.FORBIDDEN:
            with self.subTest(retired=phrase):
                path.write_text(original + "\n" + phrase, encoding="utf-8")
                with self.assertRaisesRegex(AssertionError, "Retired boundary"):
                    policy.validate_boundaries(self.root)
                path.write_text(original, encoding="utf-8")


if __name__ == "__main__":
    unittest.main()
