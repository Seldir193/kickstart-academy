# PROJECT_CONTEXT.md — Kickstart Academy (React Admin)

Durable knowledge: the domain the admin operates on and the established UI patterns.
**Rules** live in `CLAUDE.md`. The domain model here mirrors `kickstart-api`, which
is the source of truth — keep them consistent.

## Domain model (mirrors kickstart-api)

- Roles: **`Superuser`** and **`Provider`**.
- Status flow: `pending` → `approved` / `rejected`.
- **Published** is only valid for approved content.
- **Draft / live** system for editable public content: Provider edits work through
  **drafts**; public visibility depends on approved live content; the **Superuser**
  controls approval and publication.
- Invoices and dunning use **backend financial data** as the source of truth.
- The backend owns business logic — the admin must not invent frontend-only rules.

## Admin areas

Coaches, offers, bookings, customers, documents, invoices, dunning — for Superusers
and Providers.

## Established UI patterns

- **List + bulkbar styles** live in one shared global file:
  `src/styles/admin/bulk-list.scss`. Do not duplicate list-selection, bulk-action, or
  bulkbar styling across pages.
- **Franchise Locations** follows the existing **Online Booking** page style and
  template direction, while preserving franchise-location logic and routes.
- **Invoices** reuse the PDF / ZIP / CSV download behavior and implementation pattern
  from the **Customer Documents Dialog**.
