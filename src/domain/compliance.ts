import { dateLocale, getActiveLang } from '@/i18n/lang';
import type {
  AppState,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentValue,
  ComplianceSnapshot,
  HalalAlert,
  Tier,
} from './types';

const DAY = 86_400_000;

/** Inline bilingual copy for generated strings that carry live values. */
const l = (en: string, ms: string): string =>
  getActiveLang() === 'ms' ? ms : en;

export const daysBetween = (from: Date, to: Date): number =>
  Math.floor((to.getTime() - from.getTime()) / DAY);

export const isWithinDays = (
  iso: string | null,
  days: number,
  today: Date,
): boolean => {
  if (!iso) return false;
  const then = new Date(iso);
  const diff = daysBetween(then, today);
  return diff <= days;
};

/** Days until an ISO date. Negative means the date has passed. */
export const daysUntil = (iso: string | null, today: Date): number | null => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - today.getTime()) / DAY);
};

export const PASSING_QUIZ_SCORE = 80;
export const VERIFIED_PURCHASE_SHARE = 80;
export const PASSING_ASSESSMENT = 80;
export const INSPECTION_VALID_DAYS = 180;
export const ASSESSMENT_VALID_DAYS = 90;

/** A module is complete when the vendor passed its quiz. */
export const isModuleComplete = (score: number | null): boolean =>
  score !== null && score >= PASSING_QUIZ_SCORE;

export const scoreAssessment = (
  answers: Record<string, AssessmentValue>,
  questions: AssessmentQuestion[],
): number => {
  const applicable = questions.filter((q) => answers[q.id] !== 'na');
  const possible = applicable.reduce((sum, q) => sum + q.weight, 0);
  if (possible === 0) return 0;

  const earned = applicable.reduce((sum, q) => {
    const value = answers[q.id];
    if (value === 'yes') return sum + q.weight;
    if (value === 'partial') return sum + q.weight * 0.5;
    return sum;
  }, 0);

  let score = Math.round((earned / possible) * 100);
  const criticalFailure = questions.some(
    (q) => q.critical && answers[q.id] === 'no',
  );
  if (criticalFailure) score = Math.min(score, 55);
  return score;
};

export const latestAssessment = (
  assessments: AssessmentRecord[],
): AssessmentRecord | null =>
  [...assessments].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )[0] ?? null;

export const getCompliance = (
  state: AppState,
  _questions: AssessmentQuestion[],
  today: Date = new Date(),
): ComplianceSnapshot => {
  const modulesTotal = state.training.length;
  const modulesCompleted = state.training.filter((p) =>
    isModuleComplete(p.bestScore),
  ).length;
  const trainingPct =
    modulesTotal === 0 ? 0 : Math.round((modulesCompleted / modulesTotal) * 100);

  const recent = state.purchases.filter(
    (p) => daysBetween(new Date(p.purchasedAt), today) <= 120,
  );
  const verifiedCount = recent.filter(
    (p) => p.verifiedSource && p.amount > 0,
  ).length;
  const verifiedPurchaseShare =
    recent.length === 0 ? 0 : Math.round((verifiedCount / recent.length) * 100);
  const sourcingPct = verifiedPurchaseShare;

  const assessment = latestAssessment(state.assessments);
  const assessmentFresh =
    assessment !== null &&
    daysBetween(new Date(assessment.completedAt), today) <=
      ASSESSMENT_VALID_DAYS;
  const assessmentPct = assessment ? assessment.score : 0;

  const inspection = state.vendor.inspections.length
    ? [...state.vendor.inspections].sort(
        (a, b) =>
          new Date(b.inspectedAt).getTime() -
          new Date(a.inspectedAt).getTime(),
      )[0]
    : null;
  const inspectionFresh =
    inspection !== null &&
    daysBetween(new Date(inspection.inspectedAt), today) <=
      INSPECTION_VALID_DAYS;
  const monitoringPct = inspectionFresh && inspection ? inspection.score : 0;

  const score = Math.round(
    trainingPct * 0.25 +
      sourcingPct * 0.25 +
      assessmentPct * 0.25 +
      monitoringPct * 0.25,
  );

  const learnerDone = trainingPct >= 100;
  const verifiedDone =
    learnerDone &&
    sourcingPct >= VERIFIED_PURCHASE_SHARE &&
    assessmentPct >= PASSING_ASSESSMENT &&
    assessmentFresh;
  const monitoredDone =
    verifiedDone && inspectionFresh && (inspection?.passed ?? false);

  const tier: Tier = monitoredDone
    ? 'monitored'
    : verifiedDone
      ? 'verified'
      : learnerDone
        ? 'learner'
        : 'learner';

  const nextTier: Tier | null = monitoredDone
    ? null
    : verifiedDone
      ? 'monitored'
      : 'verified';

  const gaps: string[] = [];
  if (!learnerDone)
    gaps.push(
      l(
        `Complete ${modulesTotal - modulesCompleted} remaining training module${modulesTotal - modulesCompleted === 1 ? '' : 's'} with a score of ${PASSING_QUIZ_SCORE}% or higher.`,
        `Selesaikan ${modulesTotal - modulesCompleted} modul latihan lagi. Sasaran skor: ${PASSING_QUIZ_SCORE}% ke atas.`,
      ),
    );
  if (sourcingPct < VERIFIED_PURCHASE_SHARE)
    gaps.push(
      l(
        `Record more purchases from certified or verified suppliers — ${sourcingPct}% of recent purchases are traceable (target ${VERIFIED_PURCHASE_SHARE}%).`,
        `Rekod lebih banyak pembelian daripada pembekal diperakui atau disahkan. Baru ${sourcingPct}% pembelian terkini boleh dijejak; sasaran ${VERIFIED_PURCHASE_SHARE}%.`,
      ),
    );
  if (!assessment)
    gaps.push(
      l(
        'Complete your first halal self-assessment.',
        'Lengkapkan penilaian kendiri halal pertama.',
      ),
    );
  else if (!assessmentFresh)
    gaps.push(
      l(
        `Your self-assessment is more than ${ASSESSMENT_VALID_DAYS} days old. Re-run it to keep the record current.`,
        `Penilaian kendiri anda sudah lebih ${ASSESSMENT_VALID_DAYS} hari. Jalankan semula untuk kekalkan rekod.`,
      ),
    );
  else if (assessmentPct < PASSING_ASSESSMENT)
    gaps.push(
      l(
        `Raise your self-assessment score to ${PASSING_ASSESSMENT}% (currently ${assessmentPct}%).`,
        `Naikkan skor penilaian kendiri kepada ${PASSING_ASSESSMENT}% (kini ${assessmentPct}%).`,
      ),
    );
  if (!inspectionFresh)
    gaps.push(
      l(
        `Schedule a programme inspection — ${inspection ? 'the last inspection has expired' : 'no inspection has been recorded yet'}.`,
        `Jadualkan pemeriksaan program. ${inspection ? 'Pemeriksaan terakhir sudah tamat tempoh.' : 'Belum ada pemeriksaan direkodkan.'}`,
      ),
    );
  else if (inspection && !inspection.passed)
    gaps.push(
      l(
        'Address the findings from your last inspection.',
        'Betulkan penemuan daripada pemeriksaan terakhir.',
      ),
    );

  const tierProgress = monitoredDone
    ? 100
    : verifiedDone
      ? Math.round(
          (Math.min(monitoringPct, 100) +
            (inspectionFresh ? 100 : 0) +
            (inspection?.passed ? 100 : 0)) /
            3,
        )
      : Math.round((trainingPct + sourcingPct + assessmentPct) / 3);

  return {
    score,
    tier,
    nextTier,
    trainingPct,
    sourcingPct,
    assessmentPct,
    monitoringPct,
    modulesCompleted,
    modulesTotal,
    verifiedPurchaseShare,
    latestAssessment: assessment,
    latestInspection: inspection,
    gaps,
    tierProgress,
  };
};

export const deriveAlerts = (
  state: AppState,
  today: Date = new Date(),
): HalalAlert[] => {
  const alerts: HalalAlert[] = [];

  for (const supplier of state.suppliers) {
    if (!supplier.validUntil) continue;
    const remaining = daysUntil(supplier.validUntil, today);
    if (remaining === null) continue;
    if (remaining < 0) {
      alerts.push({
        id: `cert-expired-${supplier.id}`,
        severity: 'critical',
        kind: 'certificate',
        title: l(
          `${supplier.shortName} certificate has lapsed`,
          `Sijil ${supplier.shortName} telah tamat tempoh`,
        ),
        detail: l(
          `The halal certificate for ${supplier.name} expired ${Math.abs(remaining)} days ago. Suspend purchases until a renewed certificate is recorded.`,
          `Sijil halal ${supplier.name} tamat tempoh ${Math.abs(remaining)} hari lalu. Hentikan pembelian sehingga sijil baharu direkodkan.`,
        ),
        dueAt: supplier.validUntil,
        resolvedAt: null,
      });
    } else if (remaining <= 30) {
      alerts.push({
        id: `cert-soon-${supplier.id}`,
        severity: 'warning',
        kind: 'certificate',
        title: l(
          `${supplier.shortName} certificate expires in ${remaining} days`,
          `Sijil ${supplier.shortName} tamat tempoh dalam ${remaining} hari`,
        ),
        detail: l(
          `Ask ${supplier.name} for the renewed certificate before ${new Date(supplier.validUntil).toLocaleDateString(dateLocale(), { day: '2-digit', month: 'short', year: 'numeric' })}.`,
          `Minta sijil baharu daripada ${supplier.name} sebelum ${new Date(supplier.validUntil).toLocaleDateString(dateLocale(), { day: '2-digit', month: 'short', year: 'numeric' })}.`,
        ),
        dueAt: supplier.validUntil,
        resolvedAt: null,
      });
    }
  }

  const assessment = latestAssessment(state.assessments);
  if (!assessment) {
    alerts.push({
      id: 'assessment-missing',
      severity: 'warning',
      kind: 'assessment',
      title: l(
        'Self-assessment not completed',
        'Penilaian kendiri belum diselesaikan',
      ),
      detail: l(
        'Complete the halal self-assessment to give customers a current picture of your practice.',
        'Lengkapkan penilaian kendiri halal. Pelanggan akan nampak gambaran terkini amalan anda.',
      ),
      dueAt: null,
      resolvedAt: null,
    });
  } else {
    const age = daysBetween(new Date(assessment.completedAt), today);
    if (age > ASSESSMENT_VALID_DAYS) {
      alerts.push({
        id: 'assessment-overdue',
        severity: 'warning',
        kind: 'assessment',
        title: l(
          'Self-assessment is due for renewal',
          'Penilaian kendiri perlu diperbaharui',
        ),
        detail: l(
          `Last completed ${age} days ago. A fresh assessment is required every ${ASSESSMENT_VALID_DAYS} days.`,
          `Terakhir diselesaikan ${age} hari lalu. Penilaian perlu dibuat semula setiap ${ASSESSMENT_VALID_DAYS} hari.`,
        ),
        dueAt: new Date(
          new Date(assessment.completedAt).getTime() +
            ASSESSMENT_VALID_DAYS * DAY,
        ).toISOString(),
        resolvedAt: null,
      });
    }
  }

  const inspection = state.vendor.inspections.length
    ? [...state.vendor.inspections].sort(
        (a, b) =>
          new Date(b.inspectedAt).getTime() -
          new Date(a.inspectedAt).getTime(),
      )[0]
    : null;
  if (!inspection) {
    alerts.push({
      id: 'inspection-missing',
      severity: 'info',
      kind: 'supplier',
      title: l(
        'Programme inspection not yet booked',
        'Pemeriksaan program belum dijadualkan',
      ),
      detail: l(
        'Book a visit with a programme officer to qualify for the Monitored tier.',
        'Jadualkan lawatan dengan pegawai program untuk layak ke tahap Dipantau.',
      ),
      dueAt: null,
      resolvedAt: null,
    });
  } else {
    const age = daysBetween(new Date(inspection.inspectedAt), today);
    if (age > INSPECTION_VALID_DAYS) {
      alerts.push({
        id: 'inspection-overdue',
        severity: 'warning',
        kind: 'supplier',
        title: l(
          'Programme inspection has expired',
          'Pemeriksaan program tamat tempoh',
        ),
        detail: l(
          `Your last inspection was ${age} days ago. Inspections are valid for ${INSPECTION_VALID_DAYS} days.`,
          `Pemeriksaan terakhir ${age} hari lalu. Pemeriksaan sah selama ${INSPECTION_VALID_DAYS} hari.`,
        ),
        dueAt: new Date(
          new Date(inspection.inspectedAt).getTime() +
            INSPECTION_VALID_DAYS * DAY,
        ).toISOString(),
        resolvedAt: null,
      });
    }
  }

  const untraceable = state.purchases.filter(
    (p) =>
      !p.verifiedSource &&
      daysBetween(new Date(p.purchasedAt), today) <= 30,
  );
  if (untraceable.length > 0) {
    alerts.push({
      id: 'untraceable-purchases',
      severity: 'warning',
      kind: 'supplier',
      title: l(
        `${untraceable.length} purchase${untraceable.length === 1 ? '' : 's'} need a source record`,
        `${untraceable.length} pembelian memerlukan rekod sumber`,
      ),
      detail: l(
        'Add a receipt or supplier reference so these purchases count toward your sourcing score.',
        'Tambah resit atau rujukan pembekal supaya pembelian ini dikira dalam skor perolehan.',
      ),
      dueAt: null,
      resolvedAt: null,
    });
  }

  return alerts
    .filter((alert) => !state.dismissedAlerts.includes(alert.id))
    .sort((a, b) => weight(b.severity) - weight(a.severity));
};

const weight = (severity: HalalAlert['severity']): number =>
  severity === 'critical' ? 3 : severity === 'warning' ? 2 : 1;

export const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(dateLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const relativeDate = (iso: string, today: Date = new Date()): string => {
  const diff = daysBetween(new Date(iso), today);
  const ms = getActiveLang() === 'ms';
  if (diff === 0) return ms ? 'Hari ini' : 'Today';
  if (diff === 1) return ms ? 'Semalam' : 'Yesterday';
  if (diff < 7) return ms ? `${diff} hari lalu` : `${diff} days ago`;
  if (diff < 30)
    return ms ? `${Math.floor(diff / 7)} minggu lalu` : `${Math.floor(diff / 7)} weeks ago`;
  return formatDate(iso);
};
