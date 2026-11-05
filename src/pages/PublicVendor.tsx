import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  FileText,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Wordmark } from '@/components/Logo';
import { Badge } from '@/components/ui';
import { StatusBadge, TierBadge } from '@/components/badges';
import {
  daysBetween,
  formatDate,
  getCompliance,
  latestAssessment,
} from '@/domain/compliance';
import { ASSESSMENT_QUESTIONS, TRAINING_MODULES } from '@/domain/seed';
import { TIER_META } from '@/domain/types';
import { useApp } from '@/domain/store';
import { useT } from '@/i18n';
import { LanguageToggle } from '@/i18n/LanguageToggle';

const bandFor = (score: number) => {
  if (score >= 90) return { label: 'Strong', tone: 'success' as const };
  if (score >= 80) return { label: 'Passing', tone: 'forest' as const };
  if (score >= 60) return { label: 'Needs work', tone: 'warning' as const };
  return { label: 'Action required', tone: 'danger' as const };
};

export const PublicVendor = () => {
  const t = useT();
  const { slug } = useParams();
  const { state } = useApp();
  const profileUrl = `${window.location.origin}/vendor/${state.vendor.qrSlug}`;

  if (slug !== state.vendor.qrSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
        <Wordmark />
        <h1 className="mt-8 font-display text-3xl tracking-[-0.03em] text-ink">
          {t('Record not found')}
        </h1>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-3">
          {t(
            'This demo contains one seeded vendor record. Open the live profile to see how a customer experiences programme verification.',
          )}
        </p>
        <Link
          to="/vendor/dapur-kak-nur"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-[13px] text-ivory hover:bg-forest-700"
        >
          {t('Open the demo vendor record')} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <Link to="/" className="mt-4 text-[11.5px] text-ink-3 hover:text-forest-700">
          {t('Back to HALALNiaga')}
        </Link>
      </div>
    );
  }

  const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS);
  const assessment = latestAssessment(state.assessments);
  const band = bandFor(assessment?.score ?? 0);
  const suppliersUsed = [...new Set(state.purchases.map((purchase) => purchase.supplierId))]
    .map((id) => {
      const supplier = state.suppliers.find((item) => item.id === id);
      const purchases = state.purchases.filter((purchase) => purchase.supplierId === id);
      const last = [...purchases].sort(
        (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
      )[0];
      return {
        supplier,
        lastPurchase: last?.purchasedAt ?? null,
        count: purchases.length,
        evidence: purchases
          .map((purchase) => purchase.evidencePhoto)
          .filter((photo): photo is string => Boolean(photo))
          .slice(0, 3),
        manual: Boolean(supplier?.manual),
      };
    })
    .filter((entry) => Boolean(entry.supplier));
  const inspections = [...state.vendor.inspections].sort(
    (a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime(),
  );
  const weakControls = assessment
    ? ASSESSMENT_QUESTIONS.filter(
        (question) =>
          assessment.answers[question.id] === 'no' ||
          assessment.answers[question.id] === 'partial',
      )
    : [];

  return (
    <div className="min-h-screen overflow-x-clip bg-ivory">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-ivory/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-[68px] max-w-[1040px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" aria-label={t('HALALNiaga home')}>
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle showIcon={false} />
            <Badge tone="forest" dot className="hidden sm:inline-flex">
              {t('Programme verification')}
            </Badge>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] text-ink-2 transition-colors hover:border-forest-200"
            >
              <Printer className="h-3.5 w-3.5" /> {t('Print')}
            </button>
            <Link
              to="/app"
              className="hidden items-center gap-1 rounded-full bg-forest-800 px-3.5 py-1.5 text-[11px] text-ivory sm:inline-flex"
            >
              {t('Vendor workspace')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-3 hover:text-forest-700 print:hidden"
        >
          <ArrowLeft className="h-3 w-3" /> {t('HALALNiaga programme record')}
        </Link>

        <div className="relative mt-5 h-[190px] overflow-hidden rounded-2xl border border-line sm:h-[230px]">
          <img
            src={state.vendor.coverImage}
            alt={t('Fresh vegetables and eggs at a Sabah market')}
            className="h-full w-full object-cover object-[30%_55%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/15 to-forest-950/10" />
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <Badge tone="forest">{t('Wet-market vendor')}</Badge>
            <Badge tone="neutral">{t('Fresh produce · Tanjung Aru')}</Badge>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={snapshot.tier} />
              <Badge tone="neutral">
                {t('Joined {date}', { date: formatDate(state.vendor.joinedAt) })}
              </Badge>
              <Badge tone="gold">
                {t('Updated {date}', {
                  date: formatDate(new Date().toISOString()),
                })}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.04em] text-ink">
              {state.vendor.name}
            </h1>
            <p className="mt-2 text-[13px] text-ink-2">{state.vendor.owner}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-3">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {state.vendor.stall}, {state.vendor.area}
              </span>
              <span>·</span>
              <span>{t(state.vendor.category)}</span>
            </p>
            <p className="mt-4 max-w-xl font-display text-[17px] italic leading-snug text-forest-800">
              “{t(state.vendor.tagline)}”
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-paper p-5 print:break-inside-avoid">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-700">
                  {t('HALALNiaga programme record')}
                </p>
                <p className="mt-2 text-[12px] font-semibold text-ink">
                  {state.vendor.name}
                </p>
                <p className="text-[10px] text-ink-3">{state.vendor.stall}</p>
              </div>
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-gold-500/30 bg-gold-100/40">
                <QRCodeSVG
                  value={profileUrl}
                  size={54}
                  bgColor="transparent"
                  fgColor="#0B4F3C"
                  level="M"
                  aria-label={t('Vendor verification QR code')}
                />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-line-soft pt-3">
              <div>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  {t('Record ID')}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-ink">
                  HN-{state.vendor.qrSlug.toUpperCase().replace(/-/g, '')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  {t('Status')}
                </p>
                <p className="mt-0.5 text-[10.5px] font-medium text-forest-700">
                  {t('Active')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0 space-y-4">
            <section className="min-w-0 rounded-2xl border border-line bg-paper p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">
                    {t('Programme compliance')}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-3">
                    {t(
                      'Weighted across training, sourcing, assessment and monitoring.',
                    )}
                  </p>
                </div>
                <span className="font-display text-3xl tracking-[-0.04em] text-ink">
                  {snapshot.score}
                  <span className="ml-0.5 text-sm text-ink-3">/100</span>
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ['Halal training', snapshot.trainingPct, 'forest'],
                  ['Verified sourcing', snapshot.sourcingPct, 'forest'],
                  ['Self-assessment', snapshot.assessmentPct, 'gold'],
                  ['Monitoring', snapshot.monitoringPct, 'clay'],
                ].map(([label, value, tone]) => (
                  <div key={String(label)}>
                    <div className="mb-1 flex items-center justify-between text-[10.5px]">
                      <span className="text-ink-2">{t(String(label))}</span>
                      <span className="font-mono text-ink-3">{value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                      <div
                        className={
                          tone === 'clay'
                            ? 'h-full rounded-full bg-clay'
                            : tone === 'gold'
                              ? 'h-full rounded-full bg-gold-500'
                              : 'h-full rounded-full bg-forest-600'
                        }
                        style={{ width: `${Number(value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {snapshot.gaps.length > 0 && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-warn/20 bg-warn-soft/40 p-3 text-[10.5px] leading-relaxed text-ink-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                  {t('Open improvement: {gap}', { gap: snapshot.gaps[0] })}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">
                    {t('Halal training')}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-3">
                    {t('{completed} of {total} modules passed · pass mark 80%', {
                      completed: snapshot.modulesCompleted,
                      total: snapshot.modulesTotal,
                    })}
                  </p>
                </div>
                <Badge tone={snapshot.modulesCompleted === snapshot.modulesTotal ? 'success' : 'warning'}>
                  {snapshot.modulesCompleted}/{snapshot.modulesTotal}
                </Badge>
              </div>
              <ul className="divide-y divide-line-soft">
                {TRAINING_MODULES.map((module) => {
                  const progress = state.training.find(
                    (item) => item.moduleId === module.id,
                  );
                  const passed = (progress?.bestScore ?? 0) >= 80;
                  return (
                    <li key={module.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={
                            passed
                              ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-800'
                              : 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sand text-ink-3'
                          }
                        >
                          {passed ? <Check className="h-3 w-3" /> : <span className="h-1 w-1 rounded-full bg-ink-3" />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-medium text-ink">
                            {t(module.title)}
                          </p>
                          <p className="text-[9.5px] text-ink-3">
                            {t('{duration} min · {count} questions', {
                              duration: module.durationMin,
                              count: module.quiz.length,
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-ink-3">
                        {progress?.bestScore != null ? `${progress.bestScore}%` : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-2xl border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">
                    {t('Verified source records')}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-3">
                    {t('Suppliers recorded against recent purchases.')}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-forest-700" />
              </div>
              <ul className="divide-y divide-line-soft">
                {suppliersUsed.map(({ supplier, lastPurchase, count, evidence, manual }) => (
                  <li key={supplier!.id} className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 text-ink-3" />
                        <p className="text-[11.5px] font-medium text-ink">
                          {supplier!.name}
                        </p>
                      </div>
                      <StatusBadge status={supplier!.status} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-5 text-[9.5px] text-ink-3">
                      <span>{t('{count} recorded purchases', { count })}</span>
                      <span>{t('Last {date}', { date: formatDate(lastPurchase) })}</span>
                      <span className="font-mono">
                        {supplier!.certificateNo ?? t('No certificate on file')}
                      </span>
                    </div>
                    {manual && (
                      <div className="mt-1.5 pl-5">
                        <Badge tone="warning">
                          {t('Added by vendor · pending review')}
                        </Badge>
                      </div>
                    )}
                    {evidence.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-5">
                        {evidence.map((photo, index) => (
                          <img
                            key={`${supplier!.id}-evidence-${index}`}
                            src={photo}
                            alt={t('Purchase evidence')}
                            className="h-12 w-16 rounded-lg border border-line object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">
                    {t('Self-assessment')}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-3">
                    {t('Completed {date}', {
                      date: assessment ? formatDate(assessment.completedAt) : '—',
                    })}
                    {assessment
                      ? ` · ${t('{count} days ago', {
                          count: daysBetween(
                            new Date(assessment.completedAt),
                            new Date(),
                          ),
                        })}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={band.tone}>
                    {assessment ? t(band.label) : t('Not completed')}
                  </Badge>
                  <span className="font-display text-2xl text-ink">
                    {assessment?.score ?? '—'}
                    <span className="text-xs text-ink-3">%</span>
                  </span>
                </div>
              </div>
              {assessment && (
                <>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {ASSESSMENT_QUESTIONS.map((question) => {
                      const answer = assessment.answers[question.id];
                      const ok = answer === 'yes';
                      const partial = answer === 'partial';
                      return (
                        <div
                          key={question.id}
                          className="flex items-start gap-2 rounded-lg border border-line bg-ivory px-2.5 py-2"
                        >
                          <span
                            className={
                              ok
                                ? 'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-800'
                                : partial
                                  ? 'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-gold-100'
                                  : 'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-danger-soft'
                            }
                          >
                            {ok && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span className="text-[9.5px] leading-snug text-ink-2">
                            {t(question.prompt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {weakControls.length > 0 && (
                    <p className="mt-3 text-[9.5px] leading-relaxed text-ink-3">
                      {t(
                        '{count} controls flagged for improvement. The vendor has a corrective action list in the workspace.',
                        { count: weakControls.length },
                      )}
                    </p>
                  )}
                </>
              )}
            </section>
          </div>

          <div className="min-w-0 space-y-4">
            <section className="min-w-0 rounded-2xl border border-forest-200 bg-forest-50 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest-700" />
                <p className="text-[12px] font-semibold text-ink">
                  {t('What this record means')}
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-2">
                {t(
                  'The vendor has completed programme training, recorded purchases from verified suppliers and completed a self-assessment. The record is maintained through periodic programme checks.',
                )}
              </p>
              <p className="mt-3 text-[10.5px] font-medium leading-relaxed text-forest-900">
                {t(
                  'It is not a Malaysian halal certificate. SPHM certification is issued only by JAKIM or a recognised state Islamic authority.',
                )}
              </p>
            </section>

            <section className="rounded-2xl border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
                <h2 className="text-[13px] font-semibold text-ink">
                  {t('Inspection history')}
                </h2>
                <Badge tone="neutral">{inspections.length}</Badge>
              </div>
              <ol className="space-y-4 p-5">
                {inspections.map((inspection) => (
                  <li key={inspection.id} className="relative border-l border-line pl-4">
                    <span className="absolute -left-[4.5px] top-1 h-2 w-2 rounded-full bg-forest-600" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-medium text-ink">
                        {formatDate(inspection.inspectedAt)}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-ivory px-2 py-0.5 font-mono text-[9px] text-ink">
                        <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                        {inspection.score}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[9.5px] text-ink-3">
                      {t(inspection.officer)}
                    </p>
                    {inspection.findings.length > 0 && (
                      <p className="mt-1.5 text-[9.5px] leading-relaxed text-ink-3">
                        {inspection.findings.map((finding) => t(finding)).join(' · ')}
                      </p>
                    )}
                  </li>
                ))}
                {inspections.length === 0 && (
                  <li className="text-[11px] text-ink-3">
                    {t('No inspection recorded yet.')}
                  </li>
                )}
              </ol>
            </section>

            <section className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-forest-700" />
                <p className="text-[12px] font-semibold text-ink">{t('At a glance')}</p>
              </div>
              <dl className="mt-3 space-y-2.5">
                {[
                  ['Recognition tier', t(TIER_META[snapshot.tier].short)],
                  ['Training', t('{completed}/{total} modules', { completed: snapshot.modulesCompleted, total: snapshot.modulesTotal })],
                  ['Verified sourcing', `${snapshot.sourcingPct}%`],
                  ['Self-assessment', assessment ? `${assessment.score}%` : t('Not completed')],
                  ['Last inspection', inspections[0] ? formatDate(inspections[0].inspectedAt) : t('None')],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 text-[10.5px]">
                    <dt className="text-ink-3">{t(label)}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-2xl border border-line bg-sand/40 p-4">
              <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-ink-3">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {t(
                  'This page is generated from the HALALNiaga demo workspace. Data is illustrative and stored locally in the visitor’s browser. It is not an official halal verification service.',
                )}
              </p>
            </section>

            <section className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 print:hidden">
              <QrCode className="h-5 w-5 shrink-0 text-forest-700" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium text-ink">
                  {t('Share this record')}
                </p>
                <p className="truncate font-mono text-[9px] text-ink-3">
                  {profileUrl}
                </p>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-10 border-t border-line pt-6 text-center print:hidden">
          <div className="flex flex-col items-center gap-3">
            <Wordmark />
            <p className="max-w-xl text-[10px] leading-relaxed text-ink-3">
              {t(
                'HALALNiaga is an academic innovation prototype. Programme recognition is not halal certification. For official certification status, consult JAKIM or the relevant state Islamic authority.',
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10.5px] text-ink-3">
              <Link to="/" className="hover:text-forest-700">
                {t('About HALALNiaga')}
              </Link>
              <Link to="/app" className="hover:text-forest-700">
                {t('Vendor workspace')}
              </Link>
              <Link to="/credits" className="hover:text-forest-700">
                {t('Image credits')}
              </Link>
              <a
                href="https://www.halal.gov.my/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-forest-700"
              >
                JAKIM Halal Malaysia <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            </div>
            <BadgeCheck className="h-4 w-4 text-forest-600" />
          </div>
        </footer>
      </main>
    </div>
  );
};
