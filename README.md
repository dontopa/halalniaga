# HALALNiaga

**Source with confidence. Serve with certainty.**

A digital halal ecosystem for small food vendors — an academic innovation
prototype built for a Sabah pilot. HALALNiaga connects verified suppliers,
practical halal training, traceable purchase records and a customer-scannable
programme record.

> **Important:** HALALNiaga is a programme-recognition prototype. It does **not**
> issue halal certification. Malaysian Halal Certification (SPHM) is issued only
> by JAKIM or a recognised state Islamic authority. See
> [`docs/adr/0002-recognition-not-certification.md`](docs/adr/0002-recognition-not-certification.md).

## Live demo

- **Landing page:** https://halalniaga.pages.dev
- **Vendor workspace:** https://halalniaga.pages.dev/app
- **Public QR record:** https://halalniaga.pages.dev/vendor/dapur-kak-nur

The demo opens with a seeded vendor, **Dapur Kak Nur** (Tanjung Aru, Kota
Kinabalu), and is fully interactive. No sign-up is required.

## Screens

### Landing page

![HALALNiaga landing page](docs/screenshots/landing-hero.png)

### Vendor overview

![Vendor compliance overview](docs/screenshots/app-dashboard.png)

### Public verification record

![Customer-facing vendor record](docs/screenshots/public-vendor.png)

### Supplier finder

![Supplier finder with certificate status](docs/screenshots/app-suppliers.png)

More screens are in [`docs/screenshots/`](docs/screenshots/).

## What it demonstrates

| Module | What a visitor can do |
| --- | --- |
| **01 · Supplier finder** | Filter eight Sabah suppliers by area, category and certificate status, inspect product-level halal status, save a shortlist, record a purchase |
| **02 · Halal education** | Read six practical modules and take a scored quiz; passing updates the training record |
| **03 · Purchase tracking** | Review, search, filter and export a traceable purchase log; record a new purchase (verified or unverified) |
| **04 · Self-assessment** | Complete an eight-question weighted assessment with live scoring, corrective actions and a 90-day validity cycle |
| **05 · QR verification** | Preview, copy and download the customer QR record and a printable stall sticker |
| **06 · Monitoring & recognition** | See the three-tier ladder, inspection history, certificate watchlist and record a simulated programme inspection |
| **Support** | Community feed, simulated ingredient barcode scanner, and a scripted halal mentor conversation |

The public record at `/vendor/dapur-kak-nur` is the customer-facing view: tier,
training, source records, assessment band, inspection history and a clear
certification disclaimer.

## The compliance model

The score is a presentation metric, not a legal determination:

```
score = 0.25 × training% + 0.25 × sourcing%
      + 0.25 × assessment% + 0.25 × monitoring%
```

Recognition tiers are ordered and evidence-based:

1. **Learner** — all six modules passed at 80% or higher.
2. **Verified participant** — Learner + ≥80% traceable recent purchases + ≥80%
   self-assessment within 90 days.
3. **Monitored participant** — Verified + a passing programme inspection within
   180 days.

Tiers expire with their evidence. A vendor can be Verified and still score below
80 overall because the monitoring component is zero until an inspection is
current. That distinction is intentional and visible in the UI.

## Demo data

Everything is seeded in [`src/domain/seed.ts`](src/domain/seed.ts):

- 1 vendor, 2 programme inspections
- 8 suppliers across five Sabah districts (certified, verified, pending and
  lapsed certificate states)
- 16 products with barcodes and product-level status
- 18 purchases over the last four months, including two untraceable records
- 6 training modules with 18 quiz questions
- 8 weighted self-assessment questions
- Community posts, mentor messages and live-derived alerts

Data is persisted to `localStorage` under `halalniaga.state.v1`. Use **Reset
demo** in the sidebar to restore the seed.

## Tech stack

- **React 19 + TypeScript + Vite 7**
- **Tailwind CSS v4** with a custom token layer
- **React Router 7** with route-level code splitting
- **Recharts** for the sourcing chart
- **qrcode.react** for verification and sticker generation
- **Lucide** icons
- **Vitest** for domain unit tests
- **Cloudflare Workers static assets** for hosting

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # domain rules
npm run build      # typecheck + production build
npm run preview    # preview the built app
```

Node 20+ is recommended (built on Node 24).

## Project structure

```
src/
  domain/          # framework-free business logic + seed + store
    types.ts       # ubiquitous language (see CONTEXT.md)
    compliance.ts  # scoring, tiers, alerts, date rules
    seed.ts        # realistic Sabah pilot data
    store.tsx      # localStorage-backed React context
    compliance.test.ts
  components/
    ui/            # buttons, cards, badges, fields, modal, progress
    app/           # app shell, purchase modal, shared page pieces
    Logo.tsx       # the Verified Seal and wordmark
  pages/
    Landing.tsx
    SignIn.tsx
    PublicVendor.tsx
    app/           # ten workspace modules
public/            # logo variants, favicon, pattern, OG card, manifest
docs/
  adr/             # architecture and policy decisions
  brand.md         # logo construction, colour, type, misuse
  demo-script.md   # 8-minute presentation walkthrough
CONTEXT.md         # domain glossary and invariants
```

## Testing

```bash
npm run test
```

The domain suite covers:

- weighted self-assessment scoring, N/A handling and the critical-control cap
- tier calculation from seeded evidence
- expiry rules for inspections and assessments
- alert derivation (certificate expiry, untraceable purchases, overdue records)
- promotion to Monitored after a current inspection
- seed integrity (every purchase resolves to a real supplier and product)

## Deployment

### Cloudflare Pages (short `pages.dev` URL)

This is the primary target and yields `https://halalniaga.pages.dev`.

```bash
npx wrangler login
npm run deploy
```

The Pages project `halalniaga` is already created; the command above deploys
the current build to production. To create it from scratch, run
`npx wrangler pages project create halalniaga --production-branch main` first.

`npm run deploy` builds the app, writes the Pages SPA fallback to
`dist/_redirects`, and uploads `dist/` to the `halalniaga` Pages project. Deep
links such as `/app/suppliers` and `/vendor/dapur-kak-nur` resolve correctly.

### Cloudflare Workers (fallback)

```bash
npx wrangler login
npm run deploy:workers
```

[`wrangler.jsonc`](wrangler.jsonc) uses
`not_found_handling: "single-page-application"` for SPA routing. Workers static
assets reject a `_redirects` file with an SPA catch-all (it is treated as an
infinite redirect), which is why the Pages redirect is generated only in the
Pages deploy path.

## Limitations

- This is a **prototype**, not a production compliance system.
- Data is stored per browser. Changes do not sync between devices.
- Certificate status, supplier details and inspection records are illustrative.
- The scanner and mentor are simulated; there is no camera, payment, email or
  supplier integration.
- No real authentication. The sign-in page is a presentation flow.
- Nothing here constitutes a halal certification decision.

## Academic context

Built as a working prototype for the **HALALNiaga** innovation proposal:
*"Aplikasi Ekosistem Digital bagi Memperkasa Pematuhan Halal dalam Kalangan
Peniaga Makanan Kecil-kecilan"*. The written proposal focuses on a Sabah pilot
with small vendors, verified suppliers and programme monitoring.

The identity and interface were designed in this repository; the logo concept and
construction notes are in [`docs/brand.md`](docs/brand.md).
