# Separate security audit

Use this for assigned security work or a concrete security finding encountered during
ordinary work. It does not make every ordinary audit a full security audit or authorize
another task, conversation or schedule.

## Threat and evidence

Define the actual deployment/configuration, assets, attacker capabilities and trust
boundaries. Trace attacker-controlled input through reachable calls to a concrete
security impact and violated security guarantee. Establish the deployment conditions
and any mitigations; a dangerous-looking helper or hypothetical capability is not proof.

Attacker inputs need not be supported normal-user inputs. Do not discard a reachable
attack because ordinary error triage would exclude malformed or malicious input.
Reproduction or strong source proof can establish the path; a historical incident is
not required. Test only within authorized resources and operations, using isolated
fixtures when appropriate; an audit assignment does not authorize attacks on live
services or other users' data.

## Handling and completion

Read the target security/disclosure policy and use its authorized private channel.
Keep findings, exploit details and private links in protected, unsynced material.
Missing disclosure authority is a retained blocker, not permission for a public issue,
PR or discussion. Public repair submission requires the applicable disclosure gate;
use the threat evidence above rather than ordinary supported-input proof.

Validate the affected security path, mitigations and target-required checks. Reuse
unchanged evidence and distinguish source proof, local reproduction and deployed
acceptance. Report security scope, remaining boundaries and outcome separately from
ordinary audit coverage; completion of either does not certify the other.

Apply shared [safety](safety.md), [minimal records](records.md) and
[resource disposition](storage.md) rules without exposing private evidence in public
records or grouped ordinary deliveries. Remediation and disclosure blockers remain
unfinished after an investigation finishes.
