# HALALNiaga content guide

This guide is for the client and the repository owner. It explains how to edit
the live site without touching code, and the one-time setup that makes it work.

## How editing works

The site is a static React application. Editable content lives in JSON files
under `src/content/`:

| File | What it controls |
| --- | --- |
| `src/content/site.json` | Landing page hero, problem cards, module cards, steps, recognition tiers, pilot areas, beneficiaries and personas |
| `src/content/vendor.json` | Vendor name, owner, stall, area, category, tagline, public cover image and QR slug |
| `src/content/suppliers.json` | Supplier list, areas, categories, certificate status, distance and images |
| `src/content/products.json` | Product names, supplier links, units, prices and product-level halal status |

The CMS form is provided by [Pages CMS](https://pagescms.org). It commits edits
to this GitHub repository. A GitHub Actions workflow then builds and deploys the
site to Cloudflare Pages.

## One-time setup (repository owner)

Do these once. The client does not need Cloudflare or repository admin access.

1. **Add the client as a GitHub collaborator.**
   Repository → Settings → Collaborators and teams → Add people. The client
   needs a GitHub account with write access.

2. **Create a Cloudflare API token.**
   Cloudflare dashboard → My Profile → API Tokens → Create Token → Create
   Custom Token. Give it:
   - Account → Cloudflare Pages → Edit
   - Account → Account Settings → Read (recommended)

   Scope it to the account that owns the `halalniaga` Pages project.

3. **Add the token to GitHub Actions.**
   Repository → Settings → Secrets and variables → Actions → New repository
   secret. Name it exactly `CLOUDFLARE_API_TOKEN` and paste the token.

4. **Authorise Pages CMS.**
   Sign in at <https://app.pagescms.org/> with the GitHub account that owns the
   repository. Select `dontopa/halalniaga`, install/authorise the Pages CMS
   GitHub app if prompted, and open the content collections.

5. **Test the pipeline.**
   Change a small piece of text in Pages CMS, click Publish, then open
   Repository → Actions. The “Deploy to Cloudflare Pages” workflow should pass
   and the live site should update within a minute or two.

If the workflow says the token is missing, go back to step 3. The workflow will
still commit content but will skip deployment until the secret exists.

## Editing the site (client)

1. Open <https://halalniaga.pages.dev/admin> or
   <https://app.pagescms.org/>.
2. Sign in with GitHub. The account must have write access to the repository.
3. Choose `dontopa/halalniaga` and the `main` branch.
4. Edit the content:
   - **Landing page** — hero, problem cards, module cards, steps, tiers, pilot
     areas, beneficiaries and personas.
   - **Vendor profile** — stall name, owner, area, tagline, cover image and QR
     slug.
   - **Suppliers** — names, areas, categories, certificate statuses, distances,
     thumbnails.
   - **Products** — names, suppliers, units, prices and product status.
5. Click **Publish**. Pages CMS commits to GitHub.
6. Wait for the GitHub Action to finish. Hard-refresh the live site (or use an
   incognito window) to see the change.

## What can be edited

- All text in `site.json`, `vendor.json`, `suppliers.json` and `products.json`.
- Supplier thumbnails, the public vendor cover, and the four wet-category
  images through the media/image fields.
- Certificate status, certificate validity (in days from today), distance,
  ratings and tags.
- The wet-ingredient supplier count on the landing page is derived from the
  supplier categories; edit the suppliers, not the stat number.

## What still needs a developer

- Training quiz content and assessment questions (not in the CMS yet).
- Community posts and the scripted mentor replies.
- Generated purchase records, training progress and inspections.
- Section headings and eyebrows that are not stored in `site.json`.
- The logo, app icons, PDFs and Open Graph image.
- New layouts, features, supplier/product relations and backend work.

The PDFs and OG image are generated artifacts. Editing the site content does not
regenerate them. Ask the developer to rebuild them when the client-facing
documents need to match.

## Rules for safe edits

### IDs are permanent

Do not change supplier IDs (`sup-...`), product IDs (`prd-...`) or the vendor
ID (`vnd-kak-nur`). Purchases and records reference these IDs.

Do not delete the seeded suppliers or products that are referenced by demo
purchases. You can edit their names, prices and statuses safely.

### Keep ordered lists in order

These lists map to icons or tiers by position:

- Six module cards (keep the six module IDs unchanged).
- Six “How it works” steps (briefing first).
- Three recognition tiers: Participant → Verification → Monitoring.
- Five beneficiary cards.
- Three packages (Basic, Premium, Pro/Biz) shown as section 08.

You can edit the text, but do not reorder or add items.

### Certificate dates are relative

`issuedDaysAgo` and `validInDays` are measured from today so the demo stays
fresh. A negative `validInDays` means the certificate has lapsed. Changing these
values updates the alerts and the monitoring screen.

### QR slug

Changing `vendor.qrSlug` changes the public record URL and the QR payload. The
printed sticker, PDFs and any shared links will not update automatically.

### Images

Use WebP, JPG or PNG. Upload through the CMS media library and select the image
in the relevant image field. Keep the file size reasonable; very large images
slow down the site.

## Troubleshooting

**The site does not change after Publish**

- Check Repository → Actions → “Deploy to Cloudflare Pages”.
- If the run succeeded, hard-refresh or open an incognito tab.
- If the run skipped deployment, the `CLOUDFLARE_API_TOKEN` secret is missing.
- If the run failed, open the failed step for the error.

**Pages CMS does not show the repository**

- Confirm the GitHub account has write access to `dontopa/halalniaga`.
- Sign out and back in, then re-authorise the Pages CMS GitHub app.

**The build fails after an edit**

- Check that you did not remove a required field, change an ID referenced by a
  purchase, or use a malformed image path.
- Run `npm run build` locally to see the TypeScript error. Revert the content
  commit if needed.

## Developer commands

```bash
npm ci
npm run dev
npm run build
npm run test
npm run deploy   # build + prepare Pages redirects + deploy
```

The CMS configuration is in `.pages.yml`. The deployment workflow is
`.github/workflows/deploy.yml`.

## Alternative: edit on GitHub

If the CMS is unavailable, the same JSON files can be edited directly on GitHub.
Open the file, use the pencil icon, commit to `main`, and the same GitHub Action
will deploy. This is less friendly than Pages CMS but needs no extra setup.
