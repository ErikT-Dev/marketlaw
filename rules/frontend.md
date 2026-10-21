# Frontend

### The client renders, the server decides
The UI displays the latest `PlayerView` and sends intents. It never computes legality or
outcomes; any "can I play this" hint comes from data in the view.
**Why:** client-side rules drift from server rules and mislead the player.
**Enforced by:** dependency-cruiser (client cannot import `rules/apply*`).

### One store for server state
The current `PlayerView`, connection status and pending actions live in a single store. Components
read from it; they do not keep their own copies of game state.
**Why:** duplicated state shows stale cards after a resync.
**Enforced by:** review.

### Optimistic UI is explicit
If a move is shown before the server confirms it, it is marked pending and rolled back on
rejection, with the rejection reason shown to the player.
**Why:** silent rollbacks look like the game ignoring the player.
**Enforced by:** e2e test for a rejected move.

### Touch first, large hands
Design for a phone in portrait first. The hand must stay usable with the spec's maximum hand
size: overlap, scroll or zoom, with tap targets at least 44x44 CSS px.
**Why:** most casual players are on phones, and large hands are the core of this game.
**Enforced by:** Playwright screenshots at phone and desktop sizes.

### Accessible controls
Interactive elements are real `button`s or have proper roles and labels. Cards have accessible
names (`Seven of hearts`). Everything works by keyboard. Respect `prefers-reduced-motion`.
**Why:** accessible names are also what tests select by.
**Enforced by:** `eslint-plugin-jsx-a11y` · Playwright `getByRole` selectors · axe check.

### Components
Function components only. One component per file. Components over ~150 lines get split. Props are
typed with a named `Props` type in the same file. No business logic in components; put it in
hooks or pure functions.
**Why:** small components stay testable and replaceable.
**Enforced by:** ESLint `max-lines` · `react/no-multi-comp`.

### Styling
CSS Modules or a single agreed approach; no inline style objects except for dynamic values like
card positions. Colours, spacing and fonts come from design tokens in one file.
**Why:** one visual system keeps a no-designer project consistent.
**Enforced by:** review.

### Bundle size
Keep the initial download within `harness/budgets.yaml`. Lazy-load anything not needed for the
first screen. Ask before adding any UI library.
**Why:** slow first loads lose players before the game starts.
**Enforced by:** `size-limit` in `npm run check`.

### Testable UI
Select elements in tests by role and accessible name, never by CSS class or DOM structure. Add
`data-testid` only when no accessible name exists.
**Why:** tests should survive restyling.
**Enforced by:** ESLint `testing-library/prefer-screen-queries` · review.
