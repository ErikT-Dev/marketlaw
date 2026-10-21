# TypeScript

### Strict compiler
`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`,
`noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`,
`verbatimModuleSyntax`.
**Why:** the compiler is the cheapest reviewer the project has.
**Enforced by:** `tsconfig.json`.

### No escape hatches
No `any`, no non-null assertion `!`, no `as` casts except `as const` and at schema-validated
boundaries. Use `unknown` and narrow.
**Why:** each cast is a place where the type system stops checking.
**Enforced by:** `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`,
`consistent-type-assertions`.

### No comments
Do not write code comments, including JSDoc, TODOs and commented-out code. If code needs a
comment, rename or restructure it until it does not. Rationale belongs in the spec, the rules
files or the commit message.
**Why:** comments drift from the code and nobody reads the code here to notice.
**Enforced by:** ESLint `no-warning-comments` + `no-inline-comments` + custom rule banning comments.

### Model states with discriminated unions
Represent phases, actions, messages and rejections as discriminated unions on a `type` or `kind`
field. Every `switch` over a union is exhaustive with a `never` check.
**Why:** adding a new action or phase becomes a compile error everywhere it must be handled.
**Enforced by:** `@typescript-eslint/switch-exhaustiveness-check`.

### Expected failures are values
Illegal moves, validation failures and not-found cases return `Result<T, E>` with a typed reason
code. `throw` only for programmer errors and broken invariants.
**Why:** an illegal move is normal gameplay, not an exception; typed reasons are testable.
**Enforced by:** review · scenario tests assert reason codes.

### Immutable data
State and views are `readonly` (`Readonly<>`, `ReadonlyArray<>`). Transitions return new objects.
No mutation of function arguments.
**Why:** shared mutable state causes bugs that only appear in multiplayer timing.
**Enforced by:** `@typescript-eslint/prefer-readonly-parameter-types` in `rules/` ·
`functional/immutable-data`.

### Nullability is honest
Make a property optional or nullable only when the value can genuinely be absent in a valid
state, never because it is new or convenient. Prefer a union (`{ kind: 'waiting' } | { kind:
'playing'; turn: PlayerId }`) over a cluster of optional fields.
**Why:** a field that is "always set in practice" but typed optional spreads null checks everywhere.
**Enforced by:** review.

### Branded ids
Ids are branded types (`PlayerId`, `RoomId`, `CardId`), never bare `string`/`number`.
**Why:** passing a room id where a player id belongs should not compile.
**Enforced by:** types · review.

### Naming
Names are descriptive and specific: `discardDownToHandLimit`, not `handle` or `process`; no
abbreviations except well-known ones (`id`, `url`). Types and components `PascalCase`, functions
and variables `camelCase`, constants `SCREAMING_SNAKE_CASE`, files named after their main export.
Booleans read as questions (`isMyTurn`, `hasDrawn`).
**Why:** without comments, names are the documentation.
**Enforced by:** `@typescript-eslint/naming-convention`.

### Size limits
Max 60 lines per function, 300 lines per file, 6 parameters (use an options object beyond that),
cyclomatic complexity ≤ 14, cognitive complexity ≤ 15, nesting depth ≤ 3.
**Why:** small units are easier to test, replace and reason about.
**Enforced by:** ESLint `max-lines-per-function`, `max-lines`, `max-params`, `complexity`,
`max-depth`, `sonarjs/cognitive-complexity`.

### Style
Named exports only, no default exports. `function` declarations for top-level functions, arrow
functions for callbacks. `async`/`await` over `.then`; no floating promises. `===` only. Prefer
`const`.
**Why:** one style makes the codebase look like one author wrote it.
**Enforced by:** ESLint `import/no-default-export`, `@typescript-eslint/no-floating-promises`,
`eqeqeq`, `prefer-const` · Prettier.

### Time
Timestamps are UTC epoch milliseconds (`number`, branded `EpochMs`). Convert to local time only
for display in the client.
**Why:** mixed time zones in multiplayer produce timer bugs that are hard to reproduce.
**Enforced by:** types · review.
