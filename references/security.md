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

Every new security finding, including suspected findings from ordinary audits, stays private.
Read disclosure policy and send evidenced reports only through an authorized private advisory/report channel
or designated security contact; never open a public issue/PR/discussion or expose details in public comments.
If no usable private channel or disclosure authority exists, retain protected evidence and blocker/retry;
never fall back to public reporting. Keep findings/exploits/private links protected and unsynced.
Public remediation requires prior private reporting and satisfied disclosure gates; it is not an initial report.
Confirmed receipt by the authorized private channel can end retention of an unused disposable clone:
record protected reporting/follow-up facts locally, preserve unique evidence outside the checkout if the
channel does not retain it, then release under [storage](storage.md) authority. Waiting for triage alone
is not a source-retention reason. Sending is not confirmed receipt, remediation or disclosure completion;
failed/ambiguous reports, active investigation and unpreserved evidence retain a concrete blocker.
No security patch or evidence is pushed to a public fork for preservation.
Validate affected security/mitigations and required checks;
reuse evidence, separate source/local/deployed acceptance. Report scope/remaining boundaries/outcomes
separately; investigation completion does not resolve remediation/disclosure blockers.
Apply [safety](safety.md), [records](records.md) and [resources](storage.md) without exposing evidence.
