import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Code2, ExternalLink, PencilLine, ShieldCheck } from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { Badge, Card, CardHeader, buttonClass } from '@/components/ui';

const clientSteps = [
  'Sign in to Pages CMS with the GitHub account that has access to the repository.',
  'Choose the repository dontopa/halalniaga and the main branch.',
  'Edit the vendor, suppliers, products or landing-page copy.',
  'Click Publish. Pages CMS commits the change to GitHub.',
  'GitHub Actions builds the site and deploys it to Cloudflare Pages.',
];

const setupSteps = [
  'Add the client as a collaborator on the GitHub repository.',
  'Create a Cloudflare API token with Cloudflare Pages: Edit permission.',
  'Add the token as the GitHub Actions secret CLOUDFLARE_API_TOKEN.',
  'Open Pages CMS, sign in with GitHub, and authorise the HALALNiaga repository.',
  'Make one test edit and confirm the GitHub Action completes.',
];

const editable = [
  'Vendor profile, stall name, owner, area, tagline and QR slug',
  'Suppliers, certificate status, distance and areas',
  'Products, prices, units and product-level halal status',
  'Landing hero, problem cards, module cards, steps, tiers, pilot areas and personas',
  'Supplier thumbnails, vendor cover and wet-category images',
];

const developerOnly = [
  'Training quiz content and assessment questions',
  'Community posts, mentor replies and generated purchase records',
  'Section headings and eyebrows that are not in site.json',
  'Logo, app icon, PDF documents and the OG image',
  'New features, layout changes and integrations',
];

export const Admin = () => (
  <div className="min-h-screen bg-ivory">
    <header className="border-b border-line bg-ivory/90">
      <div className="mx-auto flex h-[68px] max-w-[980px] items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="HALALNiaga home">
          <Wordmark />
        </Link>
        <Link
          to="/"
          className="text-[11.5px] text-ink-3 transition-colors hover:text-forest-700"
        >
          Back to website
        </Link>
      </div>
    </header>

    <main className="mx-auto max-w-[980px] px-5 py-12 sm:px-8">
      <Badge tone="gold" dot>
        Content editor · handover page
      </Badge>
      <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.04em] text-ink">
        Edit the site without touching code.
      </h1>
      <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-2">
        HALALNiaga uses <strong>Pages CMS</strong> to edit the content stored in
        this GitHub repository. Changes are committed to the repository and
        deployed automatically to Cloudflare Pages by the GitHub Actions
        workflow.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="https://app.pagescms.org/"
          target="_blank"
          rel="noreferrer"
          className={buttonClass('primary', 'lg')}
        >
          <PencilLine className="h-4 w-4" />
          Open Pages CMS
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/dontopa/halalniaga/blob/main/docs/CONTENT-GUIDE.md"
          target="_blank"
          rel="noreferrer"
          className={buttonClass('secondary', 'lg')}
        >
          Read the content guide
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="For the client"
            description="The normal editing flow, once setup is complete."
          />
          <ol className="space-y-3 p-5">
            {clientSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-50 font-mono text-[9px] text-forest-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[12px] leading-relaxed text-ink-2">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHeader
            title="One-time setup"
            description="The repository owner does this once."
          />
          <ol className="space-y-3 p-5">
            {setupSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 font-mono text-[9px] text-gold-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[12px] leading-relaxed text-ink-2">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="What you can edit" />
          <ul className="space-y-2.5 p-5">
            {editable.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="What still needs a developer" />
          <ul className="space-y-2.5 p-5">
            {developerOnly.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-2">
                <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold-500/25 bg-gold-100/40 p-5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
        <div>
          <p className="text-[12.5px] font-semibold text-ink">
            If the site does not update after publishing
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
            Open the repository&apos;s <strong>Actions</strong> tab and check the
            “Deploy to Cloudflare Pages” run. If it says the token is missing,
            add the <span className="font-mono">CLOUDFLARE_API_TOKEN</span>{' '}
            secret — the full setup is in the content guide.
          </p>
        </div>
      </div>

      <p className="mt-6 text-[10px] leading-relaxed text-ink-3">
        This page is a handover aid. It contains no credentials and does not
        grant access to the CMS by itself; Pages CMS requires a GitHub login
        with write access to the repository.
      </p>
    </main>
  </div>
);
