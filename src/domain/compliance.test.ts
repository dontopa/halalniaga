import { describe, expect, it } from 'vitest';
import {
  deriveAlerts,
  getCompliance,
  latestAssessment,
  scoreAssessment,
} from './compliance';
import {
  ASSESSMENT_QUESTIONS,
  createInitialState,
  daysAgo,
  daysAhead,
} from './seed';
import type { AppState, AssessmentValue } from './types';

const today = new Date();

const allYes = (): Record<string, AssessmentValue> =>
  Object.fromEntries(ASSESSMENT_QUESTIONS.map((q) => [q.id, 'yes']));

describe('scoreAssessment', () => {
  it('awards 100 when every applicable answer is yes', () => {
    expect(scoreAssessment(allYes(), ASSESSMENT_QUESTIONS)).toBe(100);
  });

  it('excludes not-applicable questions from the denominator', () => {
    const answers = allYes();
    answers['aq-cleanliness'] = 'na';
    expect(scoreAssessment(answers, ASSESSMENT_QUESTIONS)).toBe(100);
  });

  it('awards half credit for partial answers', () => {
    const answers = allYes();
    answers['aq-cleanliness'] = 'partial';
    // 17.5 of 18 possible points => 97%
    expect(scoreAssessment(answers, ASSESSMENT_QUESTIONS)).toBe(97);
  });

  it('caps the score when a critical control fails', () => {
    const answers = allYes();
    answers['aq-equipment'] = 'no';
    expect(scoreAssessment(answers, ASSESSMENT_QUESTIONS)).toBeLessThanOrEqual(55);
  });
});

describe('getCompliance on the seeded vendor', () => {
  const state = createInitialState();

  it('reads as a verified participant with monitoring outstanding', () => {
    const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS, today);
    expect(snapshot.trainingPct).toBe(100);
    expect(snapshot.sourcingPct).toBeGreaterThanOrEqual(80);
    expect(snapshot.tier).toBe('verified');
    expect(snapshot.nextTier).toBe('monitored');
  });

  it('gives no monitoring credit for an inspection older than six months', () => {
    const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS, today);
    expect(snapshot.monitoringPct).toBe(0);
    expect(snapshot.score).toBeGreaterThan(60);
    expect(snapshot.score).toBeLessThan(75);
  });

  it('promotes to monitored after a recent passing inspection', () => {
    const withInspection: AppState = {
      ...state,
      vendor: {
        ...state.vendor,
        inspections: [
          ...state.vendor.inspections,
          {
            id: 'insp-new',
            inspectedAt: daysAgo(10),
            officer: 'Test officer',
            score: 92,
            findings: [],
            passed: true,
          },
        ],
      },
    };
    const snapshot = getCompliance(
      withInspection,
      ASSESSMENT_QUESTIONS,
      new Date(),
    );
    expect(snapshot.tier).toBe('monitored');
    expect(snapshot.nextTier).toBeNull();
    expect(snapshot.tierProgress).toBe(100);
  });

  it('drops sourcing credit when recent purchases are untraceable', () => {
    const weakState: AppState = {
      ...state,
      purchases: state.purchases.slice(0, 4).map((purchase) => ({
        ...purchase,
        verifiedSource: false,
      })),
    };
    const snapshot = getCompliance(weakState, ASSESSMENT_QUESTIONS, new Date());
    expect(snapshot.sourcingPct).toBe(0);
    expect(snapshot.tier).toBe('learner');
    expect(snapshot.gaps.join(' ')).toContain('traceable');
  });
});

describe('latestAssessment', () => {
  it('returns the most recent record', () => {
    const state = createInitialState();
    const later = {
      ...state.assessments[0],
      id: 'asm-later',
      completedAt: daysAhead(1),
      score: 99,
    };
    expect(latestAssessment([state.assessments[0], later])?.id).toBe('asm-later');
  });
});

describe('deriveAlerts', () => {
  const state = createInitialState();

  it('surfaces expiring and lapsed supplier certificates', () => {
    const alerts = deriveAlerts(state, today);
    expect(alerts.some((a) => a.id === 'cert-expired-sup-tawau-sea')).toBe(true);
    expect(alerts.some((a) => a.id === 'cert-soon-sup-sazarah')).toBe(true);
    expect(alerts.some((a) => a.id === 'cert-soon-sup-sri-tanjung')).toBe(true);
  });

  it('flags an expired programme inspection', () => {
    const alerts = deriveAlerts(state, today);
    expect(alerts.some((a) => a.id === 'inspection-overdue')).toBe(true);
  });

  it('flags purchases without a verified source', () => {
    const alerts = deriveAlerts(state, today);
    expect(alerts.some((a) => a.id === 'untraceable-purchases')).toBe(true);
  });

  it('honours dismissed alerts', () => {
    const dismissed = {
      ...state,
      dismissedAlerts: ['inspection-overdue'],
    };
    const alerts = deriveAlerts(dismissed, today);
    expect(alerts.some((a) => a.id === 'inspection-overdue')).toBe(false);
  });

  it('orders critical alerts before warnings', () => {
    const alerts = deriveAlerts(state, today);
    expect(alerts[0].severity).toBe('critical');
  });
});

describe('seed integrity', () => {
  it('contains six training modules with passing scores', () => {
    const state = createInitialState();
    expect(state.training).toHaveLength(6);
    expect(state.training.every((t) => (t.bestScore ?? 0) >= 80)).toBe(true);
  });

  it('keeps every purchase linked to a real product and supplier', () => {
    const state = createInitialState();
    for (const purchase of state.purchases) {
      expect(state.suppliers.some((s) => s.id === purchase.supplierId)).toBe(true);
      expect(state.products.some((p) => p.id === purchase.productId)).toBe(true);
    }
  });
});
