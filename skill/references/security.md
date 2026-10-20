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
If no usable private channel or disclosure authority exists, retain protected evidence and blocker/retry
unless the user explicitly authorizes abandonment of that material under [storage](storage.md).
Never fall back to public reporting. Keep findings/exploits/private links confidential and out of shared Git.
Public remediation requires prior private reporting and satisfied disclosure gates; it is not an initial report.
Successful delivery to the authorized private channel permits release of corresponding unused local
source and private/security evidence under [storage](storage.md), not just the clone. A reliable server
success/report identifier establishing submission suffices; do not require an extra human acknowledgement,
triage, remediation or disclosure completion. Reuse existing delivery evidence, without repeated receipt checks.
Retain only minimal protected reporting/follow-up references, not another raw copy or recovery archive.
A failed/ambiguous send is not delivery; a summary does not cover omitted attachments. Undelivered material
needs preservation or explicit category/scope-specific abandonment; active/shared or ownership-unclear
resources retain their concrete boundary. Local deletion does not withdraw a report or resolve the finding.
No security patch or evidence is pushed to a public fork for preservation.
Validate affected security/mitigations and required checks;
reuse evidence, separate source/local/deployed acceptance. Report scope/remaining boundaries/outcomes
separately; investigation completion does not resolve remediation/disclosure blockers.
Apply [safety](safety.md), [records](records.md) and [resources](storage.md) without exposing evidence.
