# edmundhung/conform

## Zod v4 constraint extraction

For `getZodConstraint`, inspect the pinned Zod v4 check definitions as well as any convenience bag. In Zod 4.4.3 and 4.6.4, exact string length is represented by `length_equals` with a `length` field. When the bag is empty, fold that value into both HTML `minLength` and `maxLength`. Keep regression coverage with an explicitly empty bag. [Review thread](https://github.com/edmundhung/conform/pull/1341#discussion_r4154678515), [Zod 4.6.4 check definition](https://github.com/colinhacks/zod/blob/v4.6.4/packages/zod/src/v4/core/checks.ts#L587-L599).
