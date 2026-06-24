# CLAUDE.md — Kickstart Academy (React Admin)

## Project overview

React admin area for the Kickstart football school project. It talks to
`kickstart-api` for all data and controls internal workflows: coaches, offers,
bookings, customers, documents, invoices, and dunning. Users are **Superusers** and
**Providers**.

**Stack:** React · TypeScript (where applicable) · SCSS · REST integration with
`kickstart-api`.

**Main goal:** a professional, maintainable, consistent admin UI. Preserve existing
logic, routes, API contracts, component behavior, class names, and styling
architecture unless a change is explicitly required.

## Context files

Domain model and established patterns are imported here:

@PROJECT_CONTEXT.md

At the start of a work session, also read `TODO_CONTEXT.md` for current open tasks.
It is intentionally **not** auto-imported.

## Working method

- Make the **smallest change** that solves the task — no broad refactors for a small
  bug fix; don't change component structure unless it improves maintainability or the
  task requires it.
- Edit files **directly** — do not paste "remove this / insert this" snippets into
  the chat.
- After each discrete change, give a Conventional-Commit **summary + description in
  English**.

## API integration

- Use existing API helpers / patterns; do not duplicate API logic inside components.
- Preserve existing request and response shapes. Do not rename backend fields in UI
  logic unless there's a clear mapping layer.
- **The backend owns business logic — don't invent frontend-only business rules.**
- Handle loading, empty, and error states clearly; never hide API errors without user
  feedback.

## UI direction

Admin screens are for daily operations: clean, efficient, easy to scan. Avoid
decorative complexity — use visual hierarchy for clarity, not to make the admin look
like a landing page.

## SCSS architecture

- SCSS over CSS. Centralize design tokens (colors, spacing, radii, shadows,
  typography, transitions). No inline styles; no hardcoded values where a token
  exists.
- Organize SCSS by feature / component / shared pattern. Use shared styles only for
  truly shared behavior; no one-off styles when a shared pattern already exists.
- Keep hover, focus, active, and disabled states consistent. Use SCSS nesting
  carefully; keep selectors readable.
- Do **not** introduce Angular Material or other unrelated UI libraries.

## Components

- Keep components focused; split large ones before they get hard to maintain.
- Move state logic into hooks when it improves readability; move reusable helpers into
  dedicated files.
- Don't duplicate formatting logic in TSX. Centralize date / time / day formatting in
  utilities. Centralize toasts through shared toast + i18n handling where available.

## React & TypeScript

- Prefer typed props and clear interfaces.
- Avoid unnecessary component state and duplicated derived state.
- Keep rendering readable; extract complex conditions into small helper functions.

## i18n

- No hardcoded visible UI text — use i18n keys for visible labels, messages, titles,
  and helper text.
- Do **not** translate internal technical values, API fields, enum values, or route
  names.

## Icons

- **SVG icons only.** No raster icons, no emoji as UI icons. Icons align cleanly with
  text and controls.

## Accessibility

- Respect color contrast, focus states, keyboard navigation, button/link semantics,
  dialog behavior, form labels, error messaging, and touch-target size.
- Never remove focus states. Never use `div`s as buttons. Use ARIA only when needed.

## Clean code

- No commented-out code. Short "why" comments only where logic is non-obvious.
- English names; meaningful variable/function names; no unused or dead code; no inline
  styles.
- Functions do one thing, **≤14 lines** where possible; files **≤400 lines** where
  possible.

## Verification

For admin changes, verify: Superuser and Provider behavior, loading / empty / error
states, responsive behavior where relevant, API compatibility, i18n keys, and — where
relevant — document-download and invoice / dunning behavior.

## Git

- **Conventional Commits**, English summaries, one commit per discrete change.
- Always confirm before destructive commands.

<!-- # CLAUDE.md — Kickstart Academy (React Admin)

## Project overview

**React** admin area for the Kickstart project. Talks to `kickstart-api`
(Node.js / MongoDB) for all data.

**Stack**

- React (TypeScript where applicable)
- SCSS

## Domain model (mirrors kickstart-api)

- **Roles:** Superuser and Provider.
- **Coach / offer status flow:** pending → approved / rejected → published.
- **Draft / live system.**
- **Invoices / dunning** area.

## UI conventions

- **SCSS over CSS**; centralize design tokens (colors, spacing, radii, shadows).
- Admin **list + bulkbar** styles live in a single global `bulk-list.scss`.
- **Franchise Locations** UI follows the Online-Booking page styles / templates.
- For the **Invoices** area, reuse the PDF / ZIP / CSV download patterns from the
  Customer Documents Dialog.
- No inline styles.
- Prefer **SVG** icons.
- No hardcoded UI text — use i18n keys.

## Coding conventions

- Functions: **max 14 lines**; files: **max 400 lines** (split components when needed).
- No commented-out code.

## Git

- **Conventional commits**, summaries in **English**, one commit per discrete change.
- Always confirm before destructive commands. -->
