# domoticz/domoticz

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- Do not reuse a per-entity creation flag for a global new-device used/default setting without tracing its consumers. Reset Add-dialog defaults after editing another device; test the edit-to-add transition. [Feedback #7055](https://github.com/domoticz/domoticz/pull/7055).


- Project-specific submission rule: use rounds of about five PRs; one fix per PR except closely related fixes in the same driver. A separate issue is unnecessary for a self-submitted fix PR. Address applicable bot findings before requesting merge and state the actual build/test platform or static-only boundary. This exception overrides the default paired-issue convention for this target. [Maintainer feedback](https://github.com/domoticz/domoticz/pull/7137#issuecomment-5966822998).
