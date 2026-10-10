# Separate security audit

Use for assigned security work or concrete findings; ordinary audits do not certify security
or authorize another task/schedule.

## Threat and evidence

Establish actual deployment/configuration, assets, attacker capabilities, trust boundaries and mitigations.
Trace attacker-controlled input/calls to concrete impact and violated security guarantee. Malicious/malformed
inputs need not be supported normal use. Reproduction or strong source proof suffices; no incident is required.
Dangerous helpers/hypothetical capability alone fail. Test authorized resources only, using isolated fixtures;
no inferred attacks on live services or others' data.

## Handling and completion

Read disclosure policy; use an authorized private channel. Keep findings/exploits/private links protected
and unsynced. Missing disclosure authority is a blocker/retry, never permission for public issue/PR/discussion.
Public remediation must pass disclosure gates. Validate affected security/mitigations and required checks;
reuse evidence, separate source/local/deployed acceptance. Report scope/remaining boundaries/outcomes
separately; investigation completion does not resolve remediation/disclosure blockers.
Apply [safety](safety.md), [records](records.md) and [resources](storage.md) without exposing evidence.
