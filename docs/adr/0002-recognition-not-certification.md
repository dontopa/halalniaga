# ADR 0002 — Recognition is not certification

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Project author

## Context

An early version of the proposal awarded a "temporary halal certificate" after
training, a quiz and a purchase through the app. That would conflict with the
Malaysian Halal Certification system (SPHM), which is issued by JAKIM and the
state Islamic authorities. It would also mislead customers and expose the
programme to legal and reputational risk.

## Decision

The programme issues **recognition**, never certification:

- Training completion → certificate of completion (programme document).
- Sourcing and assessment → Verification badge and QR record.
- Inspection and re-assessment → Monitoring badge.

Every tier, badge and public record states, in plain language, that it is not a
Malaysian halal certificate and does not replace SPHM. The Malaysian halal logo
is never used. The interface links customers to JAKIM for official status.

The tier names deliberately avoid the words "certified" and "halal certified".

## Consequences

- The product remains complementary to the official system rather than
  competing with it.
- The compliance engine can be more permissive and incremental, because it is
  not making a legal determination.
- The public record must repeat the disclaimer wherever status is presented.
- Marketing and presentation material must use the same framing.
