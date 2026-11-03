import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  Check,
  CalendarPlus,
  ClipboardCheck,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Modal,
  Progress,
} from '@/components/ui';
import { StatusBadge, TierBadge } from '@/components/badges';
import {
  AlertList,
  PageHeader,
  Toast,
  useToast,
} from '@/components/app/shared';
import {
  ASSESSMENT_VALID_DAYS,
  INSPECTION_VALID_DAYS,
  daysBetween,
  daysUntil,
  deriveAlerts,
  formatDate,
  getCompliance,
  latestAssessment,
} from '@/domain/compliance';
import { ASSESSMENT_QUESTIONS } from '@/domain/seed';
import { useApp } from '@/domain/store';
import { TIER_META, type Tier } from '@/domain/types';
import { cn } from '@/lib/cn';

const tierOrder: Tier[] = ['learner', 'verified', 'monitored'];

const tierRequirements: Record<Tier, string[]> = {
  learner: [
    'Complete all six training modules',
    'Score at least 80% on every module quiz',
    'Training record attached to the vendor profile',
  ],
  verified: [
    'At least 80% of recent purchases from verified suppliers',
    'Self-assessment score of 80% or higher',
    'Assessment completed within the last 90 days',
  ],
  monitored: [
    'Programme inspection passed',
    'Inspection within the last 180 days',
    'Self-assessment renewed within the current cycle',
  ],
};

export const Monitoring = () => {
  const { state, dismissAlert, recordInspection } = useApp();
  const { toast, show, clear } = useToast();
  const [bookOpen, setBookOpen] = useState(false);
  const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS);
  const alerts = useMemo(() => deriveAlerts(state), [state]);
  const currentIndex = tierOrder.indexOf(snapshot.tier);

  const inspections = [...state.vendor.inspections].sort(
    (a, b) =>
      new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime(),
  );
  const latestInspection = inspections[0];
  const latest = latestAssessment(state.assessments);
  const assessmentAge = latest
    ? daysBetween(new Date(latest.completedAt), new Date())
    : null;

  const certificateRows = state.suppliers
    .filter((supplier) => supplier.validUntil)
    .map((supplier) => ({
      supplier,
      days: daysUntil(supplier.validUntil, new Date()) ?? 0,
    }))
    .sort((a, b) => a.days - b.days);

  const handleInspection = () => {
    recordInspection();
    setBookOpen(false);
    show(
      'Programme inspection recorded. Your monitoring score and recognition tier have been recalculated.',
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 06 · Monitoring & recognition"
        title="Recognition that has to be maintained."
        description="Tiers are not permanent labels. Monitoring, assessment and certificate validity all expire — and the record shows exactly when."
        actions={
          <Button size="sm" onClick={() => setBookOpen(true)}>
            <CalendarPlus className="h-3.5 w-3.5" /> Book inspection
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
            Current tier
          </p>
          <div className="mt-2">
            <TierBadge tier={snapshot.tier} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            {TIER_META[snapshot.tier].blurb}
          </p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
            Inspection validity
          </p>
          <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-ink">
            {latestInspection
              ? `${Math.max(
                  INSPECTION_VALID_DAYS -
                    daysBetween(new Date(latestInspection.inspectedAt), new Date()),
                  0,
                )} days`
              : 'None'}
          </p>
          <p className="mt-1 text-[10.5px] text-ink-3">
            {latestInspection
              ? `Last inspected ${formatDate(latestInspection.inspectedAt)}`
              : 'No programme inspection recorded'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
            Assessment renewal
          </p>
          <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-ink">
            {assessmentAge === null
              ? 'Not started'
              : `${Math.max(ASSESSMENT_VALID_DAYS - assessmentAge, 0)} days`}
          </p>
          <p className="mt-1 text-[10.5px] text-ink-3">
            {latest
              ? `Completed ${formatDate(latest.completedAt)}`
              : 'Complete the first assessment'}
          </p>
          <Link
            to="/app/assessment"
            className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-forest-700 hover:underline"
          >
            <ClipboardCheck className="h-3 w-3" /> Open assessment
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Card>
            <CardHeader
              title="Recognition ladder"
              description="Each tier builds on the last. The programme does not skip a step."
              action={<Badge tone="gold">{snapshot.tierProgress}% to next tier</Badge>}
            />
            <div className="space-y-3 p-5">
              {tierOrder.map((tier, index) => {
                const achieved = index <= currentIndex;
                const isCurrent = tier === snapshot.tier;
                const isNext = index === currentIndex + 1;
                return (
                  <div
                    key={tier}
                    className={cn(
                      'rounded-2xl border p-4 transition-colors',
                      isCurrent
                        ? 'border-forest-200 bg-forest-50/60'
                        : achieved
                          ? 'border-line bg-paper'
                          : 'border-dashed border-line bg-sand/20',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border',
                            achieved
                              ? 'border-forest-200 bg-forest-100 text-forest-800'
                              : 'border-line bg-ivory text-ink-3',
                          )}
                        >
                          {achieved ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="font-mono text-[10px]">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          )}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-ink">
                            {TIER_META[tier].label}
                          </p>
                          <p className="text-[10.5px] text-ink-3">
                            {TIER_META[tier].blurb}
                          </p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Badge tone="forest" dot>
                          Current
                        </Badge>
                      ) : achieved ? (
                        <Badge tone="success">Achieved</Badge>
                      ) : isNext ? (
                        <Badge tone="gold">Next</Badge>
                      ) : (
                        <Badge tone="neutral">Locked</Badge>
                      )}
                    </div>
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
                      {tierRequirements[tier].map((requirement) => (
                        <li
                          key={requirement}
                          className="flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-3"
                        >
                          {achieved ? (
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest-600" />
                          ) : (
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3/40" />
                          )}
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Inspection history"
              description="Visits by programme officers, including findings and corrective actions."
              action={
                <Button variant="secondary" size="sm" onClick={() => setBookOpen(true)}>
                  <CalendarPlus className="h-3.5 w-3.5" /> Record a visit
                </Button>
              }
            />
            <div className="p-5">
              <ol className="relative space-y-5 border-l border-line pl-5">
                {inspections.map((inspection) => (
                  <li key={inspection.id} className="relative">
                    <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-ivory bg-forest-600" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[12.5px] font-semibold text-ink">
                          {inspection.officer}
                        </p>
                        <p className="text-[10px] text-ink-3">
                          {formatDate(inspection.inspectedAt)} · Programme visit
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={inspection.passed ? 'success' : 'danger'}>
                          {inspection.passed ? 'Passed' : 'Follow-up required'}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-0.5 font-mono text-[9.5px] text-ink">
                          <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                          {inspection.score}
                        </span>
                      </div>
                    </div>
                    {inspection.findings.length > 0 ? (
                      <ul className="mt-2 space-y-1 rounded-xl border border-line bg-sand/30 p-3">
                        {inspection.findings.map((finding) => (
                          <li
                            key={finding}
                            className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-2"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[10.5px] text-forest-700">
                        No findings recorded.
                      </p>
                    )}
                  </li>
                ))}
                {inspections.length === 0 && (
                  <li className="text-[12px] text-ink-3">
                    No inspections recorded yet.
                  </li>
                )}
              </ol>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Certificate watchlist"
              description="Certificate status is checked continuously, not only at purchase."
              action={<Badge tone="warning">{certificateRows.filter((row) => row.days <= 30).length} due</Badge>}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-line-soft text-[9px] uppercase tracking-[0.12em] text-ink-3">
                    <th className="px-5 py-2.5 font-medium">Supplier</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Valid until</th>
                    <th className="px-5 py-2.5 text-right font-medium">Window</th>
                  </tr>
                </thead>
                <tbody>
                  {certificateRows.map(({ supplier, days }) => (
                    <tr key={supplier.id} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-3">
                        <p className="text-[11.5px] font-medium text-ink">
                          {supplier.shortName}
                        </p>
                        <p className="font-mono text-[9px] text-ink-3">
                          {supplier.certificateNo ?? 'No certificate'}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={supplier.status} />
                      </td>
                      <td className="px-3 py-3 text-[10.5px] text-ink-2">
                        {formatDate(supplier.validUntil)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge tone={days < 0 ? 'danger' : days <= 30 ? 'warning' : 'success'}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Open alerts" action={<Badge tone={alerts.length ? 'warning' : 'success'}>{alerts.length}</Badge>} />
            <div className="p-4">
              <AlertList alerts={alerts} onDismiss={dismissAlert} compact />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-forest-700" />
              <p className="text-[12px] font-semibold text-ink">
                Monitoring cycle
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Self-assessment', value: `${ASSESSMENT_VALID_DAYS} days`, icon: ClipboardCheck },
                { label: 'Programme inspection', value: `${INSPECTION_VALID_DAYS} days`, icon: Activity },
                { label: 'Certificate check', value: 'Continuous', icon: BadgeCheck },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[11px] text-ink-2">
                    <item.icon className="h-3.5 w-3.5 text-ink-3" />
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-line-soft pt-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                Overall monitoring score
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-display text-2xl text-ink">
                  {snapshot.monitoringPct}%
                </span>
                <span className="text-[9.5px] text-ink-3">
                  {snapshot.monitoringPct === 0 ? 'Inspection expired' : 'Current'}
                </span>
              </div>
              <Progress value={snapshot.monitoringPct} tone="gold" className="mt-2 h-1.5" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gold-600" />
              <p className="text-[12px] font-semibold text-ink">
                What moves you to Monitored
              </p>
            </div>
            <ul className="mt-3 space-y-2">
              {snapshot.gaps.slice(0, 3).map((gap) => (
                <li key={gap} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                  {gap}
                </li>
              ))}
              {snapshot.gaps.length === 0 && (
                <li className="flex items-center gap-2 text-[11px] text-forest-700">
                  <Check className="h-3.5 w-3.5" /> All tier requirements met.
                </li>
              )}
            </ul>
            <Button className="mt-4 w-full" size="sm" onClick={() => setBookOpen(true)}>
              <CalendarPlus className="h-3.5 w-3.5" /> Record a programme visit
            </Button>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-sand/40 p-3.5 text-[10px] leading-relaxed text-ink-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
            Inspections in this prototype are simulated. In a real programme they
            would be carried out by a trained officer and recorded with evidence.
          </div>
        </div>
      </div>

      <Modal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        title="Record a programme inspection"
        description="For the prototype, this simulates a completed officer visit and recalculates your tier."
        footer={
          <>
            <Button variant="secondary" onClick={() => setBookOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInspection}>
              <CalendarPlus className="h-4 w-4" /> Record visit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                Officer
              </p>
              <p className="mt-1 text-[11.5px] text-ink">
                Hafiz Roslan, Programme Officer
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                Visit type
              </p>
              <p className="mt-1 text-[11.5px] text-ink">Scheduled compliance visit</p>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-sand/40 p-3.5">
            <p className="text-[11.5px] font-medium text-ink">Checklist</p>
            <ul className="mt-2 space-y-1.5">
              {[
                'Purchase records and receipts for the last 30 days',
                'Separation of raw and cooked equipment',
                'Cold storage temperature and labelling',
                'Training records for everyone handling food',
                'Supplier certificates matched to products',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10.5px] text-ink-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[10px] leading-relaxed text-ink-3">
            Recorded visits are stored in the demo workspace only. A real
            inspection would require an officer sign-off and supporting evidence.
          </p>
        </div>
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};
