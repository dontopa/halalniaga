# HALALNiaga — Context and ubiquitous language

## Purpose

HALALNiaga helps small food vendors in Sabah source from suppliers whose halal
status can be evidenced, learn the handling practices that protect that status,
and publish a record that customers can inspect at the stall. The pilot focuses
on **wet ingredients** — the fresh, fast-moving categories that are hardest to
trace.

The system is an **ecosystem record**, not a certification authority. The
deliverable is a **PWA prototype**: installable, offline-capable, statically
hosted, with local demo data and no backend.

## Bounded context

One context: **Programme participation**.

Actors:

- **Vendor** — a small food business (stall, night market, food truck,
  caterer, kopitiam).
- **Supplier** — a business that sells ingredients. A supplier may hold a halal
  certificate, be verified by the programme, be pending checks, or have a lapsed
  certificate.
- **Programme officer / mentor** — trains, advises, inspects and records
  findings.
- **Customer** — scans the stall QR and reads the public record.

## Terms

### Halal certificate

A certificate issued by JAKIM or a recognised state Islamic authority
(MAIN/JAIN). Represented in the system as a supplier- or product-level record
with a number, issue date and expiry date. **HALALNiaga never issues one.**

### Wet ingredient

A fresh, perishable category prioritised by the pilot: poultry & meat, seafood,
produce, and dairy & eggs. Dry goods and sauces are supported in the network but
are not the pilot focus. Wet ingredients are a first-class supplier filter and
the default supplier list is sorted nearest-first.

### Starter kit

A printable bundle for the stall: quick handling guide, storage labels,
equipment colour guide, hygiene and halal checklist, and the customer QR
sticker. It is a programme training tool, not a certificate.

### Verified source

A supplier or product whose evidence the programme accepts:

- `certified` — a valid certificate is on file.
- `verified` — the programme has reviewed an alternative evidence trail.
- `pending` — evidence requested but not yet accepted.
- `expired` — the certificate has lapsed or been withdrawn.

A purchase is **traceable** when it is linked to a supplier and product and the
supplier was verified at the time of purchase (`Purchase.verifiedSource`).

### Purchase record

Supplier + product + quantity + amount + date + receipt number. These five
fields are the minimum evidence for traceability. A record can exist without a
receipt, but it will be flagged in the integrity check.

### Training module

A short lesson with a scored quiz. Completion requires a score of **80% or
higher**. Six modules make up the core curriculum.

### Self-assessment

A recurring, weighted check of eight halal controls, valid for **90 days**.
Answers are `yes`, `partial`, `no` or `na`. Critical controls (equipment
separation, supplier evidence, slaughter source) cap the score at 55% if failed.
A score of **80% or higher** is required for the Verified tier.

### Programme inspection

A visit by a programme officer, valid for **180 days**. Records an officer,
score, pass/fail and findings. Only a current, passing inspection earns the
monitoring component of the score.

### Recognition tier

A programme credential. Ordered, non-skippable:

1. **Learner** — all six modules passed.
2. **Verified participant** — Learner + ≥80% traceable recent purchases + ≥80%
   self-assessment within 90 days.
3. **Monitored participant** — Verified + a passing inspection within 180 days.

Tiers expire when their underlying evidence expires. A tier is never described
as "halal certified".

### Compliance score

A presentation metric, not a legal determination:

```
score = 0.25 × training% + 0.25 × sourcing%
      + 0.25 × assessment% + 0.25 × monitoring%
```

Monitoring contributes zero unless the inspection is current. This is why a
vendor can be Verified while still scoring below 80.

### Public record

The customer-facing page at `/vendor/:slug`. It publishes tier, training,
source records, assessment band and inspection history, plus an explicit
disclaimer that the record is not a Malaysian halal certificate.

## Invariants

1. The programme never describes itself as a halal certifier.
2. A purchase from an unverified or lapsed supplier never increases the sourcing
   score.
3. A tier cannot be held if its evidence has expired.
4. Every public record states the certification boundary in plain language.
5. Training completion is based on a passing score, not video watch time.
6. The supplier finder defaults to nearest-first and treats wet ingredients as a
   first-class filter, not an afterthought.
7. The application must remain usable offline after the first visit; the service
   worker caches the shell, while records stay on the device.

## Naming conventions

- Use **vendor**, not "merchant" or "seller".
- Use **supplier**, not "vendor" (they are different parties).
- Use **recognition**, **tier** or **programme record** for HALALNiaga status.
- Reserve **certificate**, **certified** and **halal certification** for JAKIM /
  MAIN / JAIN.
