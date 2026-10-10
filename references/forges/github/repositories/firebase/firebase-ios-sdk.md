# firebase/firebase-ios-sdk

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- Apply existing configs locking consistently to interrupt/resume/dispose accesses; avoid unnecessary copies of already copied collections. [Feedback #16774](https://github.com/firebase/firebase-ios-sdk/pull/16774#pullrequestreview-5386464431).
- Follow-up display-gate delivery still required failing tests to be addressed and the matching issue linked; a supported direction did not establish validation completion. [Feedback #16819](https://github.com/firebase/firebase-ios-sdk/pull/16819#issuecomment-5962063788).
- Changelog entries, when warranted, belong under Unreleased and include the PR number; internal-only changes need not claim user-visible impact. Follow current scripts/style.sh and setup_check.sh requirements. [Feedback #16759](https://github.com/firebase/firebase-ios-sdk/pull/16759).
- Persisted index offsets outlive queues and span users: validate restart behavior through LocalStore. Avoid crash-on-launch assertions on persisted data and unrelated overflow changes. [Feedback #16751](https://github.com/firebase/firebase-ios-sdk/pull/16751).
- Inspect workflow coverage: Gemini unit tests were excluded from the cited fork CI route, so that green workflow did not establish unit-test acceptance; run the required tests or retain the concrete blocker. [Feedback #16778](https://github.com/firebase/firebase-ios-sdk/pull/16778).
- Deletion queries must retain identifying scope; missing key tags must not broaden deletion. Exercise the actual delete path, not only its query helper. [Feedback #16777](https://github.com/firebase/firebase-ios-sdk/pull/16777).
- INT64_MIN serialization requires sanitizer evidence for undefined behavior; a normal-output test can pass on base. Build valid writer fixtures and describe the actual effect. [Feedback #16773](https://github.com/firebase/firebase-ios-sdk/pull/16773).
- Crash-handler serialization stays async-signal-safe; cover array strings and escaped segments crossing buffer flushes. [Feedback #16772](https://github.com/firebase/firebase-ios-sdk/pull/16772).
- Storage regressions cover immediate resume after creation and progress-time resume. Use valid object paths, bounded waits and synchronized test hooks at every discard point. [Feedback #16771](https://github.com/firebase/firebase-ios-sdk/pull/16771).
- Cross-SDK hash parity needs independent expected values, not values derived entirely from the implementation under test. [Feedback #16769](https://github.com/firebase/firebase-ios-sdk/pull/16769).
- Release locks on exceptions; omit unrelated reindentation. Concurrency fixes must cover all accesses to the shared state. [Feedback #16768](https://github.com/firebase/firebase-ios-sdk/pull/16768).
- Prefer single-queue ownership for keepalive/connection state over per-frame main-thread dispatch that leaves check-then-act races; reconcile the cited overlapping work before delivery. [Feedback #16767](https://github.com/firebase/firebase-ios-sdk/pull/16767).
- Describe custom-provider/default-queue reachability accurately; shipping callbacks already using main do not support a claim that every app hits the race. [Feedback #16766](https://github.com/firebase/firebase-ios-sdk/pull/16766).
- Actor regressions use deterministic gates or observable state, not scheduling guesses. Do not replace negligible UUID bookkeeping with speculative optimization. [Feedback #16765](https://github.com/firebase/firebase-ios-sdk/pull/16765).
- Confirm the backend limit and Android parity before changing UTF-16 limits to grapheme limits; the cited proposal was held for that decision. [Feedback #16764](https://github.com/firebase/firebase-ios-sdk/pull/16764).
- Separate the deterministic display-gate defect from the broader locking redesign. Correlate late callbacks by message identity and avoid holding internal locks while calling external display/delegate code; verify mock matching and base-failing regressions. [Feedback #16763](https://github.com/firebase/firebase-ios-sdk/pull/16763).
- Use valid attribute names in tests and cover the corresponding HTTPMetric accessors; inspect actual base differences rather than assuming a proposed change changes behavior. [Feedback #16761](https://github.com/firebase/firebase-ios-sdk/pull/16761).
