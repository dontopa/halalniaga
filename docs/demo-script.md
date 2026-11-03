# HALALNiaga — 8-minute presentation script

## Before you start (2 minutes before class)

1. Open the deployed landing page in one tab and the workspace in a second tab.
   If possible, install the PWA on your phone before class and open it once
   while online so the offline cache is ready.
2. Set browser zoom to 100% and hide bookmarks if possible.
3. Check that the demo is reset: workspace → sidebar → **Reset demo**.
4. Have a phone ready with a QR scanner app for the customer-record moment.
5. If the venue Wi-Fi is unreliable, run `npm run dev` locally and use
   `http://localhost:5173`. The app works offline after the first load.

## Opening (60 seconds)

**Say:**
> "My innovation is HALALNiaga. We are a UMS student team, and the brief is
> simple: help small vendors find nearby halal suppliers — especially for wet
> ingredients — and prove what they already do. The client asked for a PWA
> prototype on a limited budget, so this is a working, installable prototype
> rather than a full backend product."

**Show:** the landing page hero. Point to the disclaimer under the CTA:

> "Before I show the product, one boundary matters: this is programme
> recognition, not JAKIM certification. The proposal does not try to replace
> SPHM — it tries to make the evidence before certification visible."

## 1. The problem (45 seconds)

Scroll to **The problem**. Read the five headings quickly. Land on:

> "The gap is not intention. It is evidence. A receipt is not a compliance
> system, but without receipts there is no way to prove the source of the
> chicken."

## 2. The live workspace (60 seconds)

Click **Open the demo**. You land on Dapur Kak Nur's overview.

**Point out:**
- Compliance score: 70/100 — it is *not* 100 because monitoring has expired.
- Alerts: a supplier certificate expiring in 24 days, a lapsed supplier, an
  overdue inspection.
- The wet-market banner: five nearby sources for the fresh categories.
- The QR record is live on the right.

**Say:**
> "The score is deliberately honest. Training and sourcing are in place. The
> inspection is more than six months old, so monitoring contributes zero. The
> system does not hide that."

## 3. Supplier finder (45 seconds)

Go to **Supplier finder**.

- Show the four status counts: certified, verified, pending, lapsed.
- Point to the **Wet ingredients** toggle (5 of 8 suppliers) and the
  **Nearest first** sort. The closest source is 2.1 km away.
- Open **Tawau Sea Harvest** → its certificate expired nine days ago.
- Open **Sri Tanjung Poultry** → certified, but expiring in 24 days.

**Say:**
> "Status is product-level, not just company-level. A supplier’s certificate does
> not automatically cover every product it sells."

Click **Record purchase** on a verified supplier, choose a product, save.

## 4. Academy (45 seconds)

Go to **Halal academy**.

- Point out six modules and the 80% pass mark.
- Open module 6 (Records and traceability) → **Start the quiz**.
- Answer the three questions; show the score and explanations.

**Say:**
> "Completion is based on a passing score, not watching a video. The result is
> written into the same record the customer sees."

## 5. Assessment (60 seconds)

Go to **Self-assessment**.

- Point to the live score preview.
- Change the critical equipment-separation question to **No**.
- Show the score drop and the cap warning.
- Change it back to **Yes** and submit.

**Say:**
> "The assessment is not a form. A failed critical control caps the score at
> 55%. It tells the vendor what to fix, not just what they scored."

## 6. Monitoring and tier (60 seconds)

Go to **Monitoring**.

- Show the three-tier ladder and why Monitored is locked.
- Show inspection history and findings.
- Click **Book inspection** → **Record visit**.

**Say:**
> "Watch what happens. A current, passing inspection moves the vendor from
> Verified to Monitored and adds monitoring to the score. Recognition is
> earned and maintained — it expires if the evidence expires."

Go back to **Overview** and show the updated tier and score.

**Optional (30 seconds):** Open **Starter kit** in the sidebar. Point to the
printable storage labels, the equipment colour guide and the checklist. Say:

> "This is the physical layer. The labels go on the chiller containers, the
> colour guide goes on the wall, and the QR sticker goes on the counter. The
> kit prints without the app navigation."

## 7. Customer verification (60 seconds)

Go to **Verification & QR**. Click **Open record**.

- Show the public page on screen.
- If possible, scan the QR with a phone.

**Say:**
> "This is what the customer sees. No app. Training, suppliers, assessment and
> inspection dates. And at the bottom: this is not a JAKIM certificate.
> Transparency without overclaiming."

## 8. The PWA moment (45 seconds)

Scroll to **Install it once** on the landing page.

**Say:**
> "Because this is a prototype on a student budget, it is a PWA — not an app
> store submission. I can install it from the browser, and the shell is cached.
> Let me show you: I will go offline and reopen the workspace."

Install it if the browser allows, or open **How to install**. If you tested
offline before class, say:

> "The dashboard still opens with the browser offline. Records are stored on the
> device; when the demo is connected again, the record is still there."

## 9. Close (60 seconds)

Return to the landing page and scroll to **Sabah pilot**.

**Say:**
> "The pilot starts in Kota Kinabalu with 24 stalls, then Sandakan and Tawau.
> The three parties are the vendor, the verified supplier and the programme
> officer. The output is not another directory — it is a maintained record for
> wet ingredients and the people who sell them. Thank you."

## Likely questions

**"Is this a halal certificate?"**
> No. It is programme recognition. SPHM remains with JAKIM and the state
> authorities. The distinction is enforced in the interface and documented in
> ADR 0002.

**"How do you prevent vendors from faking records?"**
> In the prototype, records are local and illustrative. In production, supplier
> certificates would be ingested and reviewed, inspections would be officer
> signed, and records would be time-stamped and auditable. The QR would show
> the evidence trail, not just a tick.

**"Why Sabah?"**
> Short supply chains, strong wet-market culture and a manageable pilot geography.
> The pilot design starts in Kota Kinabalu and expands to four more districts.

**"What is the business model?"**
> Supplier subscription for verified visibility, a modest vendor programme fee,
> or government/agency funding for the training and monitoring layer. The
> prototype does not process payments.

**"How is this different from a halal directory?"**
> A directory tells you a business exists. HALALNiaga maintains the evidence:
> training scores, purchase records, assessment findings and inspection dates,
> and it expires recognition when the evidence expires.

**"Why a PWA and not a native app?"**
> The brief has a limited budget. A PWA installs from the browser, needs no app
> store review, runs on a static host, and can cache the shell for weak-signal
> use at a wet market. The trade-off is that this prototype has no backend, so
> records are local rather than shared across devices.

**"Why focus on wet ingredients?"**
> Chicken, fish, vegetables, eggs and milk are bought several times a week and
> change supplier often. They are the hardest categories to trace and the ones
> where a stale certificate matters most. The supplier finder filters for them
> and sorts by distance.

**"What about non-Muslim vendors?"**
> Participation is based on compliance, not religion. The proposal explicitly
> includes non-Muslim operators who meet the requirements.

## Reset after the presentation

Sidebar → **Reset demo**. This restores the seeded vendor, records, alerts and
tier.
