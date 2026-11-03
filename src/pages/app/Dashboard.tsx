import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Check,
  Copy,
  GraduationCap,
  PackageOpen,
  PackagePlus,
  QrCode,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Progress,
} from '@/components/ui';
import { StatusBadge, TierBadge } from '@/components/badges';
import { PurchaseModal } from '@/components/app/PurchaseModal';
import {
  AlertList,
  PageHeader,
  ScoreRing,
  Toast,
  useToast,
} from '@/components/app/shared';
import {
  deriveAlerts,
  formatDate,
  getCompliance,
  relativeDate,
} from '@/domain/compliance';
import { ASSESSMENT_QUESTIONS, TRAINING_MODULES } from '@/domain/seed';
import { useApp } from '@/domain/store';
import { images } from '@/lib/images';

const StatCard = ({
  label,
  value,
  hint,
  progress,
  icon: Icon,
  tone = 'forest',
}: {
  label: string;
  value: string;
  hint: string;
  progress?: number;
  icon: typeof ShieldCheck;
  tone?: 'forest' | 'gold' | 'clay' | 'info';
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-3">
          {label}
        </p>
        <p className="mt-2 font-display text-[1.9rem] leading-none tracking-[-0.04em] text-ink">
          {value}
        </p>
      </div>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-ivory text-forest-700">
        <Icon className="h-4 w-4" />
      </span>
    </div>
    {typeof progress === 'number' && (
      <Progress value={progress} tone={tone} className="mt-3 h-1" />
    )}
    <p className="mt-2.5 text-[10.5px] leading-snug text-ink-3">{hint}</p>
  </Card>
);

export const Dashboard = () => {
  const { state, dismissAlert } = useApp();
  const { toast, show, clear } = useToast();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const snapshot = useMemo(
    () => getCompliance(state, ASSESSMENT_QUESTIONS),
    [state],
  );
  const alerts = useMemo(() => deriveAlerts(state), [state]);
  const recentPurchases = useMemo(
    () =>
      [...state.purchases]
        .sort(
          (a, b) =>
            new Date(b.purchasedAt).getTime() -
            new Date(a.purchasedAt).getTime(),
        )
        .slice(0, 5),
    [state.purchases],
  );

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const spend = state.purchases
        .filter((purchase) => {
          const date = new Date(purchase.purchasedAt);
          return date >= start && date < end;
        })
        .reduce((sum, purchase) => sum + purchase.amount, 0);
      const verified = state.purchases
        .filter((purchase) => {
          const date = new Date(purchase.purchasedAt);
          return date >= start && date < end && purchase.verifiedSource;
        })
        .reduce((sum, purchase) => sum + purchase.amount, 0);
      return {
        month: start.toLocaleString('en-GB', { month: 'short' }),
        spend: Math.round(spend),
        verified: Math.round(verified),
      };
    });
  }, [state.purchases]);

  const profileUrl = `${window.location.origin}/vendor/${state.vendor.qrSlug}`;
  const totalSpend = state.purchases.reduce(
    (sum, purchase) => sum + purchase.amount,
    0,
  );
  const supplierName = (id: string) =>
    state.suppliers.find((supplier) => supplier.id === id)?.shortName ?? '—';
  const productName = (id: string) =>
    state.products.find((product) => product.id === id)?.name ?? '—';

  const nextAction = snapshot.gaps[0];

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      show('Vendor verification link copied.');
    } catch {
      show('Could not access the clipboard. Copy the link from the address bar.', 'warning');
    }
  };

  const exportRecord = () => {
    const record = {
      programme: 'HALALNiaga — academic innovation prototype',
      disclaimer:
        'This is a programme participation record, not a Malaysian halal certificate (SPHM).',
      exportedAt: new Date().toISOString(),
      vendor: state.vendor,
      compliance: snapshot,
      training: state.training,
      latestAssessment: snapshot.latestAssessment,
      purchases: state.purchases,
      alerts,
    };
    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `halalniaga-record-${state.vendor.qrSlug}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    show('Record exported as JSON.');
  };

  const trainingAverage = Math.round(
    state.training.reduce((sum, item) => sum + (item.bestScore ?? 0), 0) /
      Math.max(state.training.length, 1),
  );

  return (
    <>
      <PageHeader
        eyebrow="Tanjung Aru · Kota Kinabalu"
        title={`Good morning, ${state.vendor.owner.split(' ')[0]}.`}
        description="Here is the current state of your halal programme record — what is verified, what is due, and what moves you to the next tier."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportRecord}>
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Export record
            </Button>
            <Button size="sm" onClick={() => setPurchaseOpen(true)}>
              <PackagePlus className="h-3.5 w-3.5" />
              Record purchase
            </Button>
          </>
        }
      />

      {alerts.some((alert) => alert.severity === 'critical') && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-danger/20 bg-danger-soft/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <p className="text-[13px] font-semibold text-ink">
                A supplier certificate needs attention
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-2">
                Purchases from a lapsed supplier do not count as verified
                sourcing until the certificate is renewed.
              </p>
            </div>
          </div>
          <Link
            to="/app/suppliers"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-danger hover:underline"
          >
            Review suppliers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Compliance score"
          value={`${snapshot.score}`}
          hint="Weighted across training, sourcing, assessment and monitoring."
          progress={snapshot.score}
          icon={ShieldCheck}
        />
        <StatCard
          label="Recognition tier"
          value={snapshot.tier === 'monitored' ? 'Monitored' : snapshot.tier === 'verified' ? 'Verified' : 'Learner'}
          hint={
            snapshot.nextTier
              ? `${snapshot.tierProgress}% toward ${snapshot.nextTier === 'monitored' ? 'Monitored' : 'Verified'}`
              : 'Highest programme tier achieved.'
          }
          progress={snapshot.tierProgress}
          icon={BadgeCheck}
          tone="gold"
        />
        <StatCard
          label="Verified sourcing"
          value={`${snapshot.sourcingPct}%`}
          hint={`${state.purchases.filter((purchase) => purchase.verifiedSource).length} of ${state.purchases.length} recorded purchases are traceable.`}
          progress={snapshot.sourcingPct}
          icon={TrendingUp}
        />
        <StatCard
          label="Open alerts"
          value={`${alerts.length}`}
          hint={
            alerts.length
              ? 'Certificates, assessments and inspections that need action.'
              : 'Nothing needs action right now.'
          }
          icon={BellRing}
          tone={alerts.length > 0 ? 'clay' : 'forest'}
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-forest-200 bg-forest-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={images.produce}
            alt=""
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
          <div>
            <p className="text-[12px] font-semibold text-ink">Wet-market focus</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-3">
              5 nearby suppliers for poultry, meat, seafood, produce, dairy and
              eggs.
            </p>
          </div>
        </div>
        <Link
          to="/app/suppliers?wet=1"
          className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-forest-800 hover:underline"
        >
          Browse wet ingredients <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader
              title="Compliance breakdown"
              description="Four weighted controls feed the score. Monitoring only counts while an inspection is current."
              action={
                <Link
                  to="/app/monitoring"
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700 hover:underline"
                >
                  View monitoring <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            />
            <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-5">
                <ScoreRing
                  score={snapshot.score}
                  size={124}
                  tone={snapshot.score >= 80 ? 'forest' : snapshot.score >= 50 ? 'gold' : 'clay'}
                />
                <div>
                  <TierBadge tier={snapshot.tier} />
                  <p className="mt-2 max-w-[170px] text-[11.5px] leading-relaxed text-ink-3">
                    {snapshot.tier === 'monitored'
                      ? 'Your record is independently inspected and current.'
                      : snapshot.tier === 'verified'
                        ? 'Sourcing and training are in place. Monitoring is the next step.'
                        : 'Keep building the training and record base.'}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-3.5">
                {[
                  { label: 'Halal training', value: snapshot.trainingPct, detail: `${snapshot.modulesCompleted} of ${snapshot.modulesTotal} modules`, tone: 'forest' as const },
                  { label: 'Verified sourcing', value: snapshot.sourcingPct, detail: `${snapshot.verifiedPurchaseShare}% recent purchases`, tone: 'forest' as const },
                  { label: 'Self-assessment', value: snapshot.assessmentPct, detail: snapshot.latestAssessment ? `Last ${relativeDate(snapshot.latestAssessment.completedAt)}` : 'Not completed', tone: 'gold' as const },
                  { label: 'Monitoring', value: snapshot.monitoringPct, detail: snapshot.latestInspection ? `Inspected ${relativeDate(snapshot.latestInspection.inspectedAt)}` : 'No inspection yet', tone: 'clay' as const },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-[12px] text-ink-2">{row.label}</span>
                      <span className="font-mono text-[10.5px] text-ink-3">
                        {row.value}%
                      </span>
                    </div>
                    <Progress value={row.value} tone={row.tone} className="h-1.5" />
                    <p className="mt-1 text-[10px] text-ink-3">{row.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Sourcing activity"
              description="Recorded spend and the share backed by a verified source, last six months."
              action={<Badge tone="forest">RM {totalSpend.toFixed(0)} total</Badge>}
            />
            <div className="h-[230px] px-2 py-4 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F6049" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#0F6049" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EEE8DC" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64766d', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64766d', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                    tickFormatter={(value: number) => `RM${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E3DDD0',
                      background: '#FFFFFF',
                      fontSize: 11,
                      boxShadow: '0 10px 30px -18px rgba(16,35,29,0.3)',
                    }}
                    formatter={(value, name) => [
                      `RM ${Number(value).toFixed(0)}`,
                      name === 'verified' ? 'Verified source' : 'All spend',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#147457"
                    strokeWidth={1.6}
                    fill="url(#spendFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    stroke="#C99A4B"
                    strokeWidth={1.4}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 border-t border-line-soft px-5 py-3 text-[10.5px] text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-forest-600" /> All spend
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-gold-500" /> Verified source
              </span>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Recent purchases"
              description="The newest records from your stall."
              action={
                <Link
                  to="/app/purchases"
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700 hover:underline"
                >
                  Open purchase log <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left">
                <thead>
                  <tr className="border-b border-line-soft text-[9.5px] uppercase tracking-[0.13em] text-ink-3">
                    <th className="px-5 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">Supplier</th>
                    <th className="px-3 py-2.5 font-medium">Source</th>
                    <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                    <th className="px-5 py-2.5 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-3">
                        <p className="text-[12px] font-medium text-ink">
                          {productName(purchase.productId)}
                        </p>
                        <p className="font-mono text-[9px] text-ink-3">
                          {purchase.quantity} {purchase.unit}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[11.5px] text-ink-2">
                        {supplierName(purchase.supplierId)}
                      </td>
                      <td className="px-3 py-3">
                        {purchase.verifiedSource ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] text-forest-700">
                            <Check className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-warn">Unverified</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[11px] text-ink">
                        RM {purchase.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-[10.5px] text-ink-3">
                        {formatDate(purchase.purchasedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-forest-800 p-5 text-ivory">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-gold-300" />
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold-300">
                    Stall verification
                  </p>
                </div>
                <Badge tone="gold">Live</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="rounded-xl bg-ivory p-2">
                  <QRCodeSVG
                    value={profileUrl}
                    size={82}
                    bgColor="#FAF7F0"
                    fgColor="#0B4F3C"
                    level="M"
                    aria-label="Vendor verification QR code"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{state.vendor.name}</p>
                  <p className="mt-0.5 text-[10.5px] text-ivory/60">
                    {state.vendor.stall}
                  </p>
                  <p className="mt-2 text-[10px] leading-relaxed text-ivory/60">
                    Customers can scan this to see your current programme record.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={copyProfileLink}
              >
                <Copy className="h-3.5 w-3.5" /> Copy verification link
              </Button>
              <Link
                to="/app/verification"
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[11.5px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50"
              >
                Open QR kit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Next best action" />
            <div className="p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-snug text-ink">
                {nextAction ?? 'Your record is fully current.'}
              </p>
              <div className="mt-3">
                <Link
                  to={
                    snapshot.monitoringPct === 0
                      ? '/app/monitoring'
                      : snapshot.trainingPct < 100
                        ? '/app/academy'
                        : '/app/assessment'
                  }
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700 hover:underline"
                >
                  Take the next step <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4 border-t border-line-soft pt-3">
                <div className="flex items-center justify-between text-[10.5px] text-ink-3">
                  <span>Training average</span>
                  <span className="font-mono">{trainingAverage}%</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-3">
                  <span>Assessment</span>
                  <span className="font-mono">
                    {snapshot.latestAssessment
                      ? `${snapshot.latestAssessment.score}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card id="alerts" className="scroll-mt-24">
            <CardHeader
              title="Open alerts"
              description="Derived from certificate dates, records and inspections."
              action={<Badge tone={alerts.length ? 'warning' : 'success'}>{alerts.length}</Badge>}
            />
            <div className="p-4">
              <AlertList alerts={alerts} onDismiss={dismissAlert} compact />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Training progress"
              action={
                <Link
                  to="/app/academy"
                  className="text-[11.5px] font-medium text-forest-700 hover:underline"
                >
                  Open
                </Link>
              }
            />
            <div className="space-y-3 p-4">
              {state.training.slice(0, 3).map((progress, index) => {
                const trainingModule = TRAINING_MODULES.find(
                  (item) => item.id === progress.moduleId,
                );
                return (
                  <div key={progress.moduleId} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-50 font-mono text-[9px] text-forest-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-medium text-ink">
                        {trainingModule?.title ?? progress.moduleId}
                      </p>
                      <Progress
                        value={progress.bestScore ?? 0}
                        className="mt-1 h-1"
                      />
                    </div>
                    <span className="font-mono text-[9.5px] text-ink-3">
                      {progress.bestScore}%
                    </span>
                  </div>
                );
              })}
              <p className="text-[9.5px] text-ink-3">
                {state.vendor.name} · {state.vendor.category}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              <div>
                <p className="text-[12px] font-semibold text-ink">
                  Programme recognition
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-ink-3">
                  HALALNiaga recognition records participation and evidence. It
                  is not a JAKIM halal certificate or a substitute for SPHM.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status="verified" />
                  <span className="text-[9.5px] text-ink-3">
                    {formatDate(state.vendor.joinedAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-gold-600" />
              <p className="text-[12px] font-semibold text-ink">Starter kit</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-3">
              Print storage labels, the equipment colour guide, the hygiene
              checklist and a QR sticker for the stall.
            </p>
            <Link
              to="/app/starter-kit"
              className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-forest-700 hover:underline"
            >
              Open the starter kit <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Card>

          <div className="flex items-center gap-2 px-1 text-[10px] text-ink-3">
            <ReceiptText className="h-3.5 w-3.5" />
            <span>{state.purchases.length} source records · local demo data</span>
          </div>
        </div>
      </div>

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
      />
      <Toast toast={toast} onClose={clear} />
    </>
  );
};
