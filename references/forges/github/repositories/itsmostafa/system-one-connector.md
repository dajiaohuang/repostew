# itsmostafa/system-one-connector

- Cardinality limits must remain guidance scoped to the documented backend. Do not enforce hosted TypeSafe limits locally across OpenRouter or custom/local `TYPESAFE_BASE_URL` servers; the server remains authoritative and its rejection must reach the caller.
- Do not publish an undocumented score-level limit. Establish an authoritative source before adding numerical restrictions to code or documentation.
- Source: [maintainer review of #29](https://github.com/itsmostafa/system-one-connector/pull/29#pullrequestreview-5296804746). The review rejects this implementation direction, not all external contributions. The later unexplained PR closure does not establish a broader ban.
