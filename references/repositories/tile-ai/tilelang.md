# tile-ai/tilelang

Lessons distilled from October 2026 feedback. Apply only to the stated direction;
recheck current contribution policy and volatile facts. These are not current PR
status or maintainer authority. See the [reference scope](../README.md).

- Infer an implicit GPU stream from the tensor's device, not the ambient current device; test differing devices and explicit-stream controls. Intercepted wrapper calls do not prove kernel/build acceptance. [Feedback #3359](https://github.com/tile-ai/tilelang/pull/3359).
- The cited member took shared bfloat16 ABI work into the TVM fork, submodule and backend conversions. Fix ABI mapping at the shared APIType helper and inspect its other consumers, including tvm_ffi and NVRTC integer/bool conversions; local wrapper success does not establish backend parity. Recheck canonical issue #2986 and that handoff before pursuing competing local wrapper fixes. If that work is bundled with an independent repair, remove the handed-off portion while preserving the independent fix when it remains valid; #3370 now keeps its #2572 atomic diagnostic after removing the #2986 ABI/Cython changes. [Feedback #3416](https://github.com/tile-ai/tilelang/pull/3416).
- Place dtype restrictions at the compilation backend when the shared Python API cannot know the target. A global `atomic_addx4` whitelist rejected CPU int32/int64 destinations that lower correctly; #3369 moved the restriction into CUDA float overloads and added CUDA-rejection plus CPU-runtime coverage. #3370's int16/uint16 diagnostic is a distinct CUDA-template rule; preserve it as a separate issue-linked change, without bundling the #2986 bfloat16 ABI patch. [Maintainer feedback #3369](https://github.com/tile-ai/tilelang/pull/3369#issuecomment-5969819687).
