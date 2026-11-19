# Maintaining contracts in a long-running OpenRig team

This is a RepoStew field example, not an OpenRig built-in feature or an installation recipe.
Use the portable [contract-update procedure](../../skill/references/context-updates.md) for the method.

## The operating problem

Our repository teams keep reusable methods in role modules, render fixed contracts and supply current
work through native queue/workflow state and short facts. We needed to change a team's priorities:
handle outstanding human maintainer requirements first, then primarily resolve upstream Issues and
advance PRs, while local runtime/code/document/use-path review continues to supply evidenced candidates.

The first edit replaced an old paragraph, but expanded the specialty module with shared publication,
validation and priority rules that already existed elsewhere. It was an in-place edit syntactically,
yet still accumulated duplicate policy semantically. The operator's correction was to consolidate the
rules, not add another “latest instruction” section.

## What we changed and checked

- Rewrote the team's specialty source to retain its work sources, routing and exact domain boundaries.
  Shared engineering/publication/validation methods stayed in their existing common homes.
- Regenerated the team's role contracts and checked the rendered files against their sources.
  The wider contract consistency check passed too; this was a file-level result, not behavior acceptance.
- Disabled the superseded one-shot generator that could reconstruct the expanded text, preserving its
  preimage as history. Historical task notifications stayed in the original queue; a short note pointed
  the owner to the current contract instead of creating another task or policy layer.
- Preserved original task/branch/writer ownership, exact private-source boundaries, runtime choices and
  paused unrelated work. No new seat, timer or session handover was needed for this content correction.

The priority wording is illustrative of this application's authorized policy. Other targets may require
different contribution, validation or submission stages. Persistent custodian and bounded executor are
application responsibilities, not additional OpenRig platform primitives.

## A separate saved-startup limitation

An earlier maintenance pass found old application text embedded in saved startup actions and launch
recipes. Rendering files did not itself change those saved inputs. A local compare-before-write
migration changed selected application-owned `send_text` actions while retaining other recorded inputs.
That internal-database workaround is **not a supported API or a procedure recommended by this example**.

We proposed a supported preview/update/readback operation in
[OpenRig #3534](https://github.com/mvschwarz/openrig/issues/3534). Its scope is saved application inputs
on an existing seat, without automatic relaunch, task replay or claims of live adoption. The proposal
does not mean the feature exists or that its scope has been accepted.

## Evidence limits

The observations were made on 2026-11-19 in a Windows-native custom fork based on OpenRig 0.7.18. They
do not establish stock Windows support, behavior on every runtime, or a defect on the latest upstream.
Source/preimage records, renderer results and persisted queue notes support the operations described.
Native task changes and actual tool activity are separate from semantic acceptance or later adoption.

The source and render correction is observed. A later engineering decision proving that the revised
priority rule was followed has not been established by this example. No productivity or token-saving
claim follows from the shorter text. The public account omits instance dumps, private source, prompts,
credentials and local deployment paths.
