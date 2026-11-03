# ADR 0001 — A static, client-side prototype with local persistence

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Project author

## Context

HALALNiaga is an academic innovation proposal that must be demonstrated live to
a lecturer and, ideally, shared as a public link. The prototype needs to feel
like a real product while remaining:

- zero-cost to host,
- reliable in a presentation room with unreliable Wi-Fi,
- free of personal data handling or supplier integrations,
- fast to iterate before the presentation.

A production system would need a server, authentication, supplier onboarding,
certificate verification against JAKIM, audit trails and role-based access. None
of that is required to demonstrate the service model or the compliance logic.

## Decision

Build a **single-page React application** with:

- Vite + React 19 + TypeScript,
- Tailwind CSS v4 for the design system,
- React Router for the route surface,
- a **pure domain layer** for compliance scoring and tier calculation,
- **localStorage** as the demo repository, seeded with a realistic Sabah vendor,
  eight suppliers, eighteen purchases, six training modules, an assessment and
  two inspections,
- static hosting on **Cloudflare Pages**, which provides a free
  `*.pages.dev` domain.

The domain layer is framework-free and unit-tested with Vitest, so the rules can
be lifted into a server-backed version without rewriting the business logic.

## Consequences

**Positive**

- One command builds; hosting is free and globally distributed.
- The demo works offline after the first load, including the seeded data.
- Domain rules are testable and independent of UI decisions.
- No secrets, no database, no billing, no personal data.

**Negative**

- Data is per-browser. A lecturer opening the link sees the seeded demo, not the
  presenter's local changes.
- No real authentication, multi-user collaboration or server-side audit trail.
- Certificate status is illustrative, not a live JAKIM lookup.
- A reset button is required to restore the demo between presentations.

## Follow-up (production path)

1. Add a backend (Cloudflare D1 + Workers or Supabase) with vendor and supplier
   accounts.
2. Replace the seeded certificate fields with a certificate ingestion workflow and
   an evidence file store.
3. Add role-based access for programme officers and an immutable audit log.
4. Integrate with the JAKIM public halal directory where an authorised interface
   exists.
5. Add real QR verification with signed, time-stamped records.
