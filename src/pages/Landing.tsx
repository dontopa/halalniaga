import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Droplets,
  Drumstick,
  Egg,
  FileCheck2,
  Fish,
  GraduationCap,
  Handshake,
  Leaf,
  MapPin,
  Menu,
  MessageSquareQuote,
  PackageCheck,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { Reveal } from '@/components/Reveal';
import { TierBadge } from '@/components/badges';
import { Badge, Card, Progress, buttonClass } from '@/components/ui';
import { HeroMockup } from '@/pages/landing/HeroMockup';
import { LanguageToggle } from '@/i18n/LanguageToggle';
import { images } from '@/lib/images';
import siteContent from '@/content/site.json';
import vendorProfile from '@/content/vendor.json';
import suppliersContent from '@/content/suppliers.json';
import productsContent from '@/content/products.json';
import type { LucideIcon } from 'lucide-react';
import { openInstallHelp } from '@/components/pwa/PwaExperience';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

const SectionHead = ({
  index,
  eyebrow,
  title,
  lead,
  align = 'left',
  dark = false,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}) => {
  const t = useT();

  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
    <div
      className={cn(
        'flex items-center gap-3',
        align === 'center' && 'justify-center',
      )}
    >
      {index && (
        <span
          className={cn(
            'font-mono text-[10px] tracking-[0.2em]',
            dark ? 'text-gold-300' : 'text-gold-700',
          )}
        >
          {index}
        </span>
      )}
      <span className={cn('h-px w-8', dark ? 'bg-gold-300/50' : 'bg-gold-500/50')} />
      <span
        className={cn(
          'font-mono text-[10.5px] uppercase tracking-[0.2em]',
          dark ? 'text-gold-300' : 'text-forest-700',
        )}
      >
        {t(eyebrow)}
      </span>
    </div>
    <h2
      className={cn(
        'mt-5 font-display text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.035em]',
        dark ? 'text-ivory' : 'text-ink',
      )}
    >
      {title}
    </h2>
    {lead && (
      <p
        className={cn(
          'mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base',
          align === 'center' && 'mx-auto',
          dark ? 'text-ivory/70' : 'text-ink-2',
        )}
      >
        {t(lead)}
      </p>
    )}
    </div>
  );
};

const Stat = ({
  value,
  label,
  dark = false,
}: {
  value: string;
  label: string;
  dark?: boolean;
}) => {
  const t = useT();

  return (
    <div>
    <p
      className={cn(
        'font-display text-3xl tracking-[-0.03em] sm:text-4xl',
        dark ? 'text-ivory' : 'text-ink',
      )}
    >
      {value}
    </p>
    <p
      className={cn(
        'mt-1 text-[11.5px] leading-snug',
        dark ? 'text-ivory/55' : 'text-ink-3',
      )}
    >
      {t(label)}
    </p>
  </div>
  );
};

const moduleMeta: Record<
  string,
  {
    number: string;
    icon: LucideIcon;
    span: string;
    featured?: boolean;
    wide?: boolean;
  }
> = {
  suppliers: {
    number: '01',
    icon: Store,
    span: 'lg:col-span-3',
    featured: true,
  },
  education: {
    number: '02',
    icon: GraduationCap,
    span: 'lg:col-span-3',
  },
  purchases: {
    number: '03',
    icon: PackageCheck,
    span: 'lg:col-span-2',
  },
  assessment: {
    number: '04',
    icon: ClipboardCheck,
    span: 'lg:col-span-2',
  },
  qr: {
    number: '05',
    icon: QrCode,
    span: 'lg:col-span-2',
  },
  monitoring: {
    number: '06',
    icon: Activity,
    span: 'lg:col-span-6',
    wide: true,
  },
};

const modules = siteContent.modules.map((module) => ({
  ...module,
  ...moduleMeta[module.id]!,
}));

const tierKeys = ['learner', 'verified', 'monitored'] as const;

const tiers = siteContent.tiers.map((tier, index) => ({
  ...tier,
  tier: tierKeys[index] ?? 'learner',
  level: `Tier ${index + 1}`,
}));

const stepIcons = [Store, GraduationCap, Truck, ClipboardCheck, QrCode];

const steps = siteContent.steps.map((step, index) => ({
  ...step,
  icon: stepIcons[index] ?? Store,
}));

const problems = siteContent.problems;

const wetMeta: Record<
  string,
  { icon: LucideIcon; image: string; alt: string; position: string }
> = {
  'Poultry & meat': {
    icon: Drumstick,
    image: images.poultry,
    alt: 'Live chickens at a market',
    position: 'object-[50%_45%]',
  },
  Seafood: {
    icon: Fish,
    image: images.seafood,
    alt: 'Fish crates at the Sandakan fish market',
    position: 'object-[50%_82%]',
  },
  Produce: {
    icon: Leaf,
    image: images.produce,
    alt: 'Leafy greens and eggs at a Sabah market',
    position: 'object-[50%_55%]',
  },
  'Dairy & eggs': {
    icon: Egg,
    image: images.wetMarket,
    alt: 'Egg trays and fresh produce at a Kota Kinabalu market',
    position: 'object-[78%_55%]',
  },
};

const wetCategories = siteContent.wetCategories.map((item) => ({
  ...item,
  ...wetMeta[item.category]!,
  image: item.image ?? wetMeta[item.category]!.image,
}));

const beneficiaryIcons = [
  Store,
  Handshake,
  ScanLine,
  Truck,
  ShieldCheck,
];

const beneficiaries = siteContent.beneficiaries.map((item, index) => ({
  ...item,
  icon: beneficiaryIcons[index] ?? Store,
}));

const pilotAreas = siteContent.pilotAreas;

const personas = siteContent.personas;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

const wetCategoryNames = [
  'Poultry & meat',
  'Seafood',
  'Produce',
  'Dairy & eggs',
];

const wetSupplierCount = (
  suppliersContent as unknown as Array<{ categories: string[] }>
).filter((supplier) =>
  supplier.categories.some((category) => wetCategoryNames.includes(category)),
).length;

const heroStats = siteContent.hero.stats.map((stat) =>
  stat.label === 'Wet-ingredient sources'
    ? { ...stat, value: String(wetSupplierCount).padStart(2, '0') }
    : stat,
);

const heroChipIcons = [Droplets, Smartphone, WifiOff];

const vendorInitials = vendorProfile.name
  .split(' ')
  .map((word) => word[0])
  .slice(0, 2)
  .join('');

const navLinks = [
  { href: '#problem', label: 'The problem' },
  { href: '#modules', label: 'Modules' },
  { href: '#trust', label: 'Trust model' },
  { href: '#pilot', label: 'Sabah pilot' },
];

const SiteNav = () => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-line/80 bg-ivory/90 backdrop-blur-xl'
          : 'border-transparent bg-ivory/60 backdrop-blur-sm',
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label={t('HALALNiaga home')} className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('Main')}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-ink-2 transition-colors hover:text-forest-800"
            >
              {t(link.label)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <LanguageToggle showIcon={false} />
          <Link
            to="/signin"
            className={buttonClass('ghost', 'sm', 'hidden md:inline-flex')}
          >
            {t('Vendor sign in')}
          </Link>
          <Link to="/app" className={buttonClass('primary', 'sm')}>
            {t('Open the demo')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <LanguageToggle showIcon={false} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="cursor-pointer rounded-full p-2 text-ink-2 hover:bg-sand"
            aria-label={open ? t('Close menu') : t('Open menu')}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-ivory px-5 py-4 sm:hidden">
          <nav className="space-y-1" aria-label={t('Mobile')}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-ink-2 hover:bg-sand"
              >
                {t(link.label)}
              </a>
            ))}
            <Link
              to="/signin"
              className="block rounded-lg px-3 py-2.5 text-sm text-ink-2 hover:bg-sand"
            >
              {t('Vendor sign in')}
            </Link>
            <Link
              to="/app"
              className={buttonClass('primary', 'md', 'mt-2 w-full')}
            >
              {t('Open the demo')} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export const Landing = () => {
  const t = useT();

  return (
  <div className="overflow-x-clip">
    <SiteNav />

    {/* Hero ---------------------------------------------------------------- */}
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top_right,rgba(201,154,75,0.16),transparent_55%),radial-gradient(ellipse_at_top_left,rgba(11,79,60,0.08),transparent_50%)]"
      />
      <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-forest-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
              {t(siteContent.hero.eyebrow)}
            </span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.7rem,6.2vw,4.9rem)] leading-[0.98] tracking-[-0.045em] text-ink">
            {siteContent.hero.titleLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {t(line)}
                <br />
              </span>
            ))}
            <span className="italic text-forest-700">
              {t(siteContent.hero.titleEmphasis)}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink-2 sm:text-[17px]">
            {t(siteContent.hero.lead)}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/app" className={buttonClass('primary', 'lg')}>
              {t(siteContent.hero.ctaPrimary)}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a href="#how" className={buttonClass('secondary', 'lg')}>
              {t(siteContent.hero.ctaSecondary)}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-4 flex max-w-xl items-start gap-2 text-[12px] leading-relaxed text-ink-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
            {t(siteContent.hero.disclaimer)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {siteContent.hero.chips.map((label, index) => {
              const Icon = heroChipIcons[index] ?? Droplets;
              return (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[10.5px] font-medium text-forest-800"
                >
                  <Icon className="h-3 w-3" />
                  {t(label)}
                </span>
              );
            })}
          </div>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-7 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <HeroMockup />
        </div>
      </div>

      <div className="border-y border-line bg-paper/60">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {t('Built for the vendors the system usually misses')}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-2">
            {[
              'Roadside stalls',
              'Night markets',
              'Food trucks',
              'Home caterers',
              'Kopitiams',
              'Market vendors',
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gold-500" />
                {t(item)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Problem ------------------------------------------------------------- */}
    <section id="problem" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHead
              index="01"
              eyebrow="The problem"
              title={
                <>
                  {t('The gap isn’t')}
                  <br />
                  {t('intention. It’s')}{' '}
                  <span className="italic text-forest-700">{t('evidence.')}</span>
                </>
              }
              lead="Most small vendors want to do the right thing. What they lack is a practical way to prove what they already do — and a clear next step when something is missing."
            />
            <div className="mt-8 rounded-2xl border border-gold-500/25 bg-gold-100/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-700">
                {t('The design stance')}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                {t('Do not ask a vendor to become an administrator. Build the record from the work they already do — buying, cooking, cleaning, serving.')}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="space-y-0">
          {problems.map((problem, index) => (
            <Reveal key={problem.number} delay={index * 60}>
              <div className="group flex gap-5 border-t border-line py-7 last:border-b">
                <span className="mt-1 font-mono text-[10px] tracking-[0.16em] text-gold-700">
                  {problem.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink transition-colors group-hover:text-forest-800">
                    {t(problem.title)}
                  </h3>
                  <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-ink-3">
                    {t(problem.body)}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-line transition-colors group-hover:text-gold-600" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Ecosystem ----------------------------------------------------------- */}
    <section className="bg-forest-950 py-16 text-ivory lg:py-20">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-300">
              {t('Not another directory')}
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.03em]">
              {t('An ecosystem that connects the three parties the supply chain depends on.')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Store,
                  title: 'Small vendors',
                  body: 'Buy, cook and serve — while the system records the evidence.',
                },
                {
                  icon: Truck,
                  title: 'Verified suppliers',
                  body: 'Publish product-level halal status and reach small stalls.',
                },
                {
                  icon: Users,
                  title: 'Guidance & monitoring',
                  body: 'Train, advise, inspect and recognise along a clear ladder.',
                },
              ].map((party) => (
                <div
                  key={party.title}
                  className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-5 transition-colors hover:border-gold-300/30 hover:bg-ivory/[0.06]"
                >
                  <party.icon className="h-5 w-5 text-gold-300" />
                  <h3 className="mt-4 text-[14px] font-semibold">{t(party.title)}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ivory/60">
                    {t(party.body)}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Wet market first ---------------------------------------------------- */}
    <section id="wet" className="scroll-mt-24 border-y border-line bg-paper/60 py-20 lg:py-24">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHead
              eyebrow="Wet market first"
              title={
                <>
                  {t('The morning run,')}
                  <br />
                  {t('made')}{' '}
                  <span className="italic text-forest-700">{t('traceable.')}</span>
                </>
              }
              lead="Fresh chicken, fish, vegetables, eggs and milk are bought often, stored carefully and hard to trace. HALALNiaga starts with the wet ingredients where trust is won or lost every day."
            />
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-forest-700">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-2xl leading-none text-ink">
                {String(wetSupplierCount).padStart(2, '0')}
              </p>
                <p className="mt-0.5 text-[10px] text-ink-3">
                  {t('wet-ingredient suppliers')}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {wetCategories.map((item, index) => (
            <Reveal key={item.category} delay={index * 70}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-sand">
                <img
                  src={item.image}
                  alt={t(item.alt)}
                  loading="lazy"
                  className={cn(
                    'h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]',
                    item.position,
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/30 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-forest-950/45 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-ivory backdrop-blur-sm">
                    <item.icon className="h-3 w-3 text-gold-300" />
                    {t(item.category)}
                  </span>
                  <span className="rounded-full bg-ivory/90 px-2 py-0.5 text-[8.5px] font-medium text-forest-900">
                    {t(item.count)}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
                  <p className="text-[13px] font-semibold">{t(item.examples)}</p>
                  <p className="mt-1 text-[10px] text-ivory/60">{t(item.note)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-ivory p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={images.dryGoods}
                  alt={t('Dried goods at a Kota Kinabalu market')}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-ink">
                  {t('Dry goods and sauces are in the network too.')}
                </p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-3">
                  {t('But the pilot starts with the categories that spoil fastest and carry the most daily risk.')}
                </p>
              </div>
            </div>
            <Link
              to="/app/suppliers?wet=1"
              className={buttonClass('secondary', 'sm', 'shrink-0')}
            >
              {t('Browse wet ingredients')} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Modules ------------------------------------------------------------- */}
    <section id="modules" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHead
            index="02"
            eyebrow="The system"
            title={
              <>
                {t('Six modules.')}
                <br />
                {t('One continuous')}{' '}
                <span className="italic text-forest-700">{t('record.')}</span>
              </>
            }
            lead="Training, sourcing, assessment and inspection stop living in separate notebooks. Each module feeds the same compliance record."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {modules.map((module, index) => (
            <Reveal
              key={module.id}
              delay={index * 60}
              className={cn(module.span, 'h-full')}
            >
              <Card
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft',
                  module.featured && 'bg-forest-800 text-ivory',
                  module.wide && 'bg-sand/50',
                )}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl border',
                      module.featured
                        ? 'border-ivory/15 bg-ivory/10 text-gold-300'
                        : 'border-line bg-ivory text-forest-700',
                    )}
                  >
                    <module.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'font-mono text-[10px] tracking-[0.16em]',
                      module.featured ? 'text-ivory/40' : 'text-ink-3/60',
                    )}
                  >
                    {module.number}
                  </span>
                </div>
                <h3
                  className={cn(
                    'mt-5 text-[17px] font-semibold tracking-[-0.02em]',
                    module.featured ? 'text-ivory' : 'text-ink',
                  )}
                >
                  {t(module.title)}
                </h3>
                <p
                  className={cn(
                    'mt-2 flex-1 text-[13px] leading-relaxed',
                    module.featured ? 'text-ivory/65' : 'text-ink-3',
                  )}
                >
                  {t(module.description)}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {module.detail.map((detail) => (
                    <li
                      key={detail}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10.5px]',
                        module.featured
                          ? 'border-ivory/15 text-ivory/70'
                          : 'border-line bg-paper text-ink-2',
                        module.wide && 'bg-paper',
                      )}
                    >
                      {t(detail)}
                    </li>
                  ))}
                </ul>

                {module.id === 'education' && (
                  <div className="mt-5 space-y-2 rounded-xl border border-line bg-ivory/70 p-3">
                    {[
                      ['Foundations', 100],
                      ['Meat & slaughter', 100],
                      ['Ingredients', 85],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <div className="mb-1 flex justify-between text-[10px] text-ink-3">
                          <span>{t(String(label))}</span>
                          <span className="font-mono">{value}%</span>
                        </div>
                        <Progress value={Number(value)} className="h-1" />
                      </div>
                    ))}
                  </div>
                )}

                {module.id === 'suppliers' && (
                  <div className="mt-5 rounded-xl border border-ivory/15 bg-ivory/[0.06] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-gold-300">
                        {t('Nearby verified sources')}
                      </span>
                      <span className="font-mono text-[9px] text-ivory/40">
                        {t('3 matches')}
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-2">
                      {suppliersContent.slice(0, 3).map((supplier) => {
                        const status =
                          supplier.status === 'certified'
                            ? 'Certified'
                            : supplier.status === 'verified'
                              ? 'Verified'
                              : supplier.status === 'pending'
                                ? 'Pending'
                                : 'Lapsed';
                        return (
                          <div
                            key={supplier.id}
                            className="flex items-center justify-between gap-3 border-t border-ivory/10 pt-2 first:border-0 first:pt-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-ivory/90">
                                {supplier.name}
                              </p>
                              <p className="text-[9px] text-ivory/45">
                                {supplier.distanceKm} km · {supplier.area}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-ivory/15 px-2 py-0.5 text-[8.5px] text-gold-300">
                              {t(status)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {module.id === 'qr' && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-ivory/70 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-forest-800 text-gold-300">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                        {t('Live vendor record')}
                      </p>
                      <p className="text-[11px] font-medium text-ink">
                        {t('4 controls · 1 scan')}
                      </p>
                    </div>
                  </div>
                )}

                {module.wide && (
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {tiers.map((tier) => (
                      <div
                        key={tier.tier}
                        className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2"
                      >
                        <TierBadge tier={tier.tier} showLabel={false} />
                        <span className="text-[11px] text-ink-2">{t(tier.title)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* How it works -------------------------------------------------------- */}
    <section id="how" className="scroll-mt-24 border-y border-line bg-paper/70 py-20 lg:py-24">
      <div className="container-page">
        <Reveal>
          <SectionHead
            index="03"
            eyebrow="How it works"
            title={t('Five steps, built into the working day.')}
            lead="No new paperwork ritual. Each step adds a small amount of evidence to a record that compounds over time."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <div className="relative flex h-full flex-col rounded-2xl border border-line bg-ivory p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 bg-forest-50 text-forest-700">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-gold-700">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[13.5px] font-semibold text-ink">
                  {t(step.title)}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
                  {t(step.body)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* PWA ----------------------------------------------------------------- */}
    <section id="pwa" className="scroll-mt-24 bg-ivory py-20 lg:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <SectionHead
            eyebrow="Prototype · installable PWA"
            title={
              <>
                {t('Install it once.')}
                <br />
                {t('Use it at the')}{' '}
                <span className="italic text-forest-700">{t('stall.')}</span>
              </>
            }
            lead="The brief asked for a PWA prototype on a small budget. HALALNiaga installs straight from the browser, caches its shell, and keeps the workspace usable when the signal drops."
          />
          <div className="mt-8 space-y-3">
            {[
              {
                icon: Smartphone,
                title: 'Install from the browser',
                body: 'No app store, no submission and no review queue. Add it to the home screen in seconds.',
              },
              {
                icon: WifiOff,
                title: 'Offline-ready',
                body: 'The app shell and demo data stay available after the first visit — useful at a wet market with a weak signal.',
              },
              {
                icon: Check,
                title: 'No server bill',
                body: 'A static Cloudflare Pages deployment and local demo data keep the prototype within a student budget.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-line bg-paper p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">
                    {t(item.title)}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                    {t(item.body)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openInstallHelp}
              className={buttonClass('primary', 'md')}
            >
              <Smartphone className="h-4 w-4" /> {t('How to install')}
            </button>
            <Link to="/app" className={buttonClass('secondary', 'md')}>
              {t('Open the workspace')} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto w-full max-w-[330px]">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rotate-2 rounded-[3rem] border border-gold-300/40 bg-forest-50/70 pattern-geo"
            />
            <div className="relative rounded-[2.5rem] border-[9px] border-ink bg-ivory p-3 shadow-lift">
              <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-ink/20" />
              <div className="rounded-[2rem] bg-paper p-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/icon-192.png"
                    alt=""
                    className="h-12 w-12 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">
                      HALALNiaga
                    </p>
                    <p className="truncate text-[9.5px] text-ink-3">
                      halalniaga.pages.dev
                    </p>
                  </div>
                  <Badge tone="success" className="ml-auto">
                    {t('Installed')}
                  </Badge>
                </div>

                <div className="mt-4 rounded-xl border border-line p-3">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-forest-700" />
                    <p className="text-[10.5px] font-medium text-ink">
                      {t('Wet ingredients near you')}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {[
                      ['Sabah Fresh Produce', '2.1 km'],
                      ['Sri Tanjung Poultry', '6.4 km'],
                      ['Kinabalu Dairy & Eggs', '7.8 km'],
                    ].map(([name, distance]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between gap-2 rounded-md bg-ivory px-2 py-1.5 text-[9.5px]"
                      >
                        <span className="truncate text-ink-2">{name}</span>
                        <span className="font-mono text-ink-3">{distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-forest-50 p-2 text-center">
                    <p className="font-display text-lg leading-none text-ink">68</p>
                    <p className="mt-0.5 text-[8px] text-ink-3">{t('compliance')}</p>
                  </div>
                  <div className="rounded-lg bg-gold-100/60 p-2 text-center">
                    <p className="text-[11px] font-semibold leading-none text-ink">
                      {t('Verified')}
                    </p>
                    <p className="mt-1 text-[8px] text-ink-3">{t('tier')}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-forest-800 px-3 py-2 text-ivory">
                  <span className="text-[9px]">{t('Opens offline')}</span>
                  <WifiOff className="h-3 w-3 text-gold-300" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Trust model --------------------------------------------------------- */}
    <section id="trust" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHead
            index="04"
            eyebrow="Trust model"
            title={
              <>
                {t('Three tiers of recognition.')}
                <br />
                {t('One clear')}{' '}
                <span className="italic text-forest-700">{t('boundary.')}</span>
              </>
            }
            lead="HALALNiaga recognition is a programme credential. It describes participation and evidence — it is not, and never claims to be, a Malaysian halal certificate."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal key={tier.tier} delay={index * 80}>
              <Card
                className={cn(
                  'relative flex h-full flex-col p-6',
                  index === 2 && 'border-gold-500/35 bg-gold-100/30',
                )}
              >
                <div className="flex items-center justify-between">
                  <TierBadge tier={tier.tier} />
                  <span className="font-mono text-[10px] tracking-[0.16em] text-ink-3">
                    {t('Tier {number}', { number: index + 1 })}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl tracking-[-0.03em] text-ink">
                  {t(tier.title)}
                </h3>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.criteria.map((criterion) => (
                    <li
                      key={criterion}
                      className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-2"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                      {t(criterion)}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-line bg-paper px-3.5 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                    {t('Recognition')}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-ink">
                    {t(tier.recognition)}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-forest-200 bg-forest-50 p-5 sm:flex-row sm:items-start">
            <ShieldCheck className="h-5 w-5 shrink-0 text-forest-700" />
            <div>
              <p className="text-[13px] font-semibold text-forest-900">
                {t('What this is not')}
              </p>
              <p className="mt-1 max-w-4xl text-[12.5px] leading-relaxed text-forest-900/75">
                {t('HALALNiaga does not certify halal status, does not use the Malaysian halal logo, and does not replace inspections by JAKIM or a state Islamic authority. Malaysian Halal Certification (SPHM) remains with JAKIM and MAIN/JAIN. Food-handler training requirements remain subject to KKM. Every QR record carries this disclaimer.')}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* QR ------------------------------------------------------------------ */}
    <section className="overflow-hidden bg-forest-900 py-20 text-ivory lg:py-28">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-300">
            {t('05 · Customer verification')}
          </p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.3rem)] leading-[1.05] tracking-[-0.035em]">
            {t('Trust, at the point of')}{' '}
            <span className="italic text-gold-300">{t('sale.')}</span>
          </h2>
          <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-ivory/70">
            {t('A customer scans the sticker on the stall. No app, no account, no marketing claim — just the programme record behind the food, with the date it was last checked.')}
          </p>
          <ul className="mt-7 space-y-3">
            {[
              'Training completed and quiz scores',
              'Verified suppliers and recent purchases',
              'Latest self-assessment and weakest control',
              'Last inspection date and findings',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[13px] text-ivory/75">
                <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-300/15">
                  <Check className="h-2.5 w-2.5 text-gold-300" />
                </span>
                {t(item)}
              </li>
            ))}
          </ul>
          <Link
            to={`/vendor/${vendorProfile.qrSlug}`}
            className={buttonClass('gold', 'md', 'mt-8')}
          >
            {t('Open a live vendor profile')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rotate-2 rounded-[2.5rem] border border-gold-300/20 bg-ivory/[0.03] pattern-geo"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-ivory/15 bg-ivory p-5 text-ink shadow-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 font-display text-sm text-gold-300">
                    {vendorInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">{vendorProfile.name}</p>
                    <p className="text-[10.5px] text-ink-3">
                      {t(vendorProfile.category)}
                    </p>
                  </div>
                </div>
                <TierBadge tier="verified" />
              </div>

              <div className="mt-4 rounded-xl border border-line bg-sand/40 px-3.5 py-3">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-mono uppercase tracking-[0.12em] text-ink-3">
                    {t('Last verified')}
                  </span>
                  <span className="font-medium text-forest-700">{t('31 days ago')}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { label: 'Halal training', value: '6 of 6 modules · avg 90%', pct: 100 },
                  { label: 'Verified sourcing', value: '89% of recent purchases', pct: 89 },
                  { label: 'Self-assessment', value: '83% · two amber controls', pct: 83 },
                  { label: 'Programme inspection', value: 'Due for renewal', pct: 20 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-ink-2">{t(row.label)}</span>
                      <span className="text-[10px] text-ink-3">{t(row.value)}</span>
                    </div>
                    <Progress
                      value={row.pct}
                      tone={row.pct < 50 ? 'clay' : 'forest'}
                      className="h-1"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-line bg-paper p-3">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  {t('Most recent source records')}
                </p>
                <div className="mt-2 space-y-1.5">
                  {suppliersContent.slice(0, 3).map((supplier) => {
                    const product = productsContent.find(
                      (item) => item.supplierId === supplier.id,
                    );
                    return (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between gap-2 text-[10.5px]"
                      >
                        <span className="truncate font-medium text-ink">
                          {supplier.name}
                        </span>
                        <span className="shrink-0 text-ink-3">
                          {product ? t(product.name) : t('Source record')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-[8.5px] leading-relaxed text-ink-3">
                {t('HALALNiaga programme recognition. Not a JAKIM halal certificate. Official certification is issued by JAKIM or a recognised state Islamic authority.')}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Pilot --------------------------------------------------------------- */}
    <section id="pilot" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <SectionHead
              index="06"
              eyebrow="Sabah pilot"
              title={
                <>
                  {t('Start where the')}
                  <br />
                  {t('supply chain is')}{' '}
                  <span className="italic text-forest-700">{t('local.')}</span>
                </>
              }
              lead="Sabah’s food economy runs through wet markets, small suppliers and neighbourhood stalls. A pilot here tests the model where it matters most — with short routes, visible relationships and real accountability."
            />

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <Stat value="12" label="Weeks to a monitored cohort" />
              <Stat value="24" label="Stalls in the first wave" />
              <Stat value="5" label="Pilot districts" />
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                {t('Proposed pilot network')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Mydin',
                  '99 Speedmart',
                  'CKS',
                  'Bataras',
                  'Local poultry & meat',
                  'Wet market vendors',
                ].map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-line bg-ivory px-3 py-1.5 text-[11.5px] text-ink-2"
                  >
                    {t(partner)}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[10.5px] leading-relaxed text-ink-3">
                {t('Illustrative pilot network for this academic prototype. No partnership or endorsement is claimed.')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Card className="overflow-hidden">
              <div className="border-b border-line-soft px-6 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                  {t('Pilot footprint')}
                </p>
                <h3 className="mt-1.5 text-[15px] font-semibold text-ink">
                  {t('Five districts, one shared standard')}
                </h3>
              </div>
              <ul>
                {pilotAreas.map((area) => (
                  <li
                    key={area.area}
                    className="flex items-center justify-between gap-4 border-b border-line-soft px-6 py-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border',
                          area.active
                            ? 'border-forest-200 bg-forest-50 text-forest-700'
                            : 'border-line bg-sand/50 text-ink-3',
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-ink">
                          {area.area}
                        </p>
                        <p className="text-[10.5px] text-ink-3">{t(area.note)}</p>
                      </div>
                    </div>
                    {area.active ? (
                      <Badge tone="success" dot>
                        {t('Active')}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">{t('Planned')}</Badge>
                    )}
                  </li>
                ))}
              </ul>
              <div className="bg-sand/40 px-6 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                  {t('12-week rollout')}
                </p>
                <div className="mt-3 space-y-3">
                  {[
                    ['Weeks 1–2', 'Supplier onboarding and certificate audit'],
                    ['Weeks 3–4', 'Vendor training and baseline assessment'],
                    ['Weeks 5–8', 'Purchase records and corrective actions'],
                    ['Weeks 9–12', 'Inspections and recognition rollout'],
                  ].map(([window, task]) => (
                    <div key={window} className="flex gap-3 text-[11.5px]">
                      <span className="w-20 shrink-0 font-mono text-[10px] text-gold-700">
                        {t(window)}
                      </span>
                      <span className="text-ink-2">{t(task)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Beneficiaries ------------------------------------------------------- */}
    <section className="border-y border-line bg-paper/70 py-20 lg:py-24">
      <div className="container-page">
        <Reveal>
          <SectionHead
            index="07"
            eyebrow="Who benefits"
            title={t('A compliance model that is inclusive by design.')}
            lead="Halal certification in Malaysia is open to Muslim and non-Muslim operators who meet the requirements. HALALNiaga is built on compliance, not identity."
          />
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {beneficiaries.map((item, index) => (
            <Reveal key={item.who} delay={index * 60}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-ivory p-5">
                <item.icon className="h-5 w-5 text-forest-700" />
                <h3 className="mt-4 text-[13px] font-semibold text-ink">
                  {t(item.who)}
                </h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
                  {t(item.benefit)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Personas ------------------------------------------------------------ */}
    <section className="bg-ivory py-20 lg:py-24">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHead
              eyebrow="Voices from the pilot design"
              title={t('What the model has to earn.')}
            />
            <p className="max-w-xs text-[11px] leading-relaxed text-ink-3">
              {t('These are design personas used to test the service, not customer testimonials.')}
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {personas.map((persona, index) => (
            <Reveal key={persona.name} delay={index * 70}>
              <Card className="flex h-full flex-col p-6">
                <MessageSquareQuote className="h-5 w-5 text-gold-500" />
                <blockquote className="mt-4 flex-1 font-display text-[19px] leading-snug tracking-[-0.02em] text-ink">
                  “{t(persona.quote)}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-line-soft pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 font-display text-[11px] text-gold-300">
                    {persona.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {persona.name}
                    </p>
                    <p className="text-[10.5px] text-ink-3">{t(persona.role)}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA ----------------------------------------------------------------- */}
    <section className="px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-forest-950 px-6 py-14 text-ivory sm:px-12 lg:px-16 lg:py-20">
            <img
              src={images.greens}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-[50%_55%] opacity-20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/90 to-forest-950/55"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07] pattern-geo"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 256 256"
              className="absolute -right-16 -top-16 h-72 w-72 text-gold-300/20"
            >
              <path
                d="M 128 24 L 154.02 65.18 L 201.54 54.46 L 190.82 101.98 L 232 128 L 190.82 154.02 L 201.54 201.54 L 154.02 190.82 L 128 232 L 101.98 190.82 L 54.46 201.54 L 65.18 154.02 L 24 128 L 65.18 101.98 L 54.46 54.46 L 101.98 65.18 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <div className="relative max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-300">
                {t('The invitation')}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.03] tracking-[-0.04em]">
                {t('Make halal compliance visible — one stall at a time.')}
              </h2>
              <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-ivory/65">
                {t('Explore the working prototype with a seeded Sabah vendor. Every module is interactive: complete training, record a purchase, run an assessment, publish a QR record.')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/app" className={buttonClass('gold', 'lg')}>
                  {t('Open the demo workspace')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/vendor/dapur-kak-nur"
                  className={buttonClass('secondary', 'lg', 'border-ivory/20 bg-transparent text-ivory hover:border-gold-300/50 hover:bg-ivory/5')}
                >
                  {t('View a customer QR record')}
                  <QrCode className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Footer -------------------------------------------------------------- */}
    <footer className="border-t border-line bg-paper/60">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-ink-3">
              {t('A digital halal ecosystem for small food vendors. Source with confidence, serve with certainty.')}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-ivory px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-600" />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2">
                {t('UMS student innovation · Sabah pilot')}
              </span>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              {t('Product')}
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-2">
              <li><a href="#modules" className="hover:text-forest-800">{t('Modules')}</a></li>
              <li><a href="#how" className="hover:text-forest-800">{t('How it works')}</a></li>
              <li><a href="#trust" className="hover:text-forest-800">{t('Trust model')}</a></li>
              <li><a href="#wet" className="hover:text-forest-800">{t('Wet-ingredient sourcing')}</a></li>
              <li><a href="#pwa" className="hover:text-forest-800">{t('PWA prototype')}</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              {t('Programme')}
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-2">
              <li><a href="#pilot" className="hover:text-forest-800">{t('Sabah pilot')}</a></li>
              <li><Link to="/app/academy" className="hover:text-forest-800">{t('Halal academy')}</Link></li>
              <li><Link to="/app/monitoring" className="hover:text-forest-800">{t('Monitoring')}</Link></li>
              <li><Link to="/vendor/dapur-kak-nur" className="hover:text-forest-800">{t('Vendor QR profile')}</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              {t('Demo')}
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-2">
              <li><Link to="/signin" className="hover:text-forest-800">{t('Vendor sign in')}</Link></li>
              <li><Link to="/app" className="hover:text-forest-800">{t('Open workspace')}</Link></li>
              <li><Link to="/app/assessment" className="hover:text-forest-800">{t('Run an assessment')}</Link></li>
              <li><Link to="/app/mentor" className="hover:text-forest-800">{t('Ask the mentor')}</Link></li>
              <li><Link to="/app/starter-kit" className="hover:text-forest-800">{t('Starter kit')}</Link></li>
              <li><a href="/HALALNiaga-system-brief-en.pdf" target="_blank" rel="noreferrer" className="hover:text-forest-800">{t('Client brief (EN)')}</a></li>
              <li><a href="/HALALNiaga-system-brief.pdf" target="_blank" rel="noreferrer" className="hover:text-forest-800">{t('Client brief (BM)')}</a></li>
              <li><Link to="/admin" className="hover:text-forest-800">{t('Content editor')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-line bg-ivory p-4">
          <p className="text-[10.5px] leading-relaxed text-ink-3">
            <strong className="font-medium text-ink-2">{t('Important:')}</strong>{' '}
            {t('HALALNiaga is an academic innovation prototype. It does not issue halal certification and is not affiliated with JAKIM, MAIN/JAIN, KKM or any named retailer. Malaysian Halal Certification (SPHM) is issued by JAKIM or a recognised state Islamic authority. Food-handler training requirements are set by the Ministry of Health Malaysia.')}
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-line pt-6 text-[11px] text-ink-3 sm:flex-row sm:items-center">
          <p>
            {t('© 2026 HALALNiaga · A student innovation project, Universiti Malaysia Sabah.')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/credits" className="hover:text-forest-700">
              {t('Image credits')}
            </Link>
            <p className="inline-flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5" />
              {t('Designed and built as a working prototype')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
  );
};
