# Discovery and admission — Worker

Use the [W header](../worker-start.md) and [discovery form](../../references/work-forms/discovery.md).

> Input: {finite source/links, filters, known identities/aliases and exclusions}.
> Location: {explicit intake working directory}; no project checkout or empty project state is required.
> List writing: {exact bounded append permission, or return candidates to the named list writer}.
> TODO 1: Extract native identities, resolve ambiguous aliases and lightly screen suitability.
> TODO 2: Deduplicate against supplied/current membership; expand only the specified linked-list boundary with cycle checks.
> TODO 3: Return additions/skips/unknowns and visited/partial boundaries; write only the expressly assigned list slice.
> Completion: the finite intake selection is accounted for, including zero additions and inaccessible portions.

No ordinary-project dependency recursion, clone/build/audit, issue/PR creation or resource-proof ceremony.
