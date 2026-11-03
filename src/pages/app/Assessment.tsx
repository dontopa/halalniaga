import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Info,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Modal,
  Progress,
} from '@/components/ui';
import { PageHeader, ScoreRing, Toast, useToast } from '@/components/app/shared';
import {
  ASSESSMENT_VALID_DAYS,
  daysBetween,
  formatDate,
  latestAssessment,
  scoreAssessment,
} from '@/domain/compliance';
import { ASSESSMENT_QUESTIONS } from '@/domain/seed';
import { useApp } from '@/domain/store';
import type { AssessmentValue } from '@/domain/types';
import { cn } from '@/lib/cn';

const options: Array<{ value: AssessmentValue; label: string; hint: string }> = [
  { value: 'yes', label: 'Yes', hint: 'In place and consistent' },
  { value: 'partial', label: 'Partly', hint: 'Sometimes or incomplete' },
  { value: 'no', label: 'No', hint: 'Not in place' },
  { value: 'na', label: 'N/A', hint: 'Not applicable' },
];

const bandFor = (score: number) => {
  if (score >= 90) return { label: 'Strong', tone: 'success' as const };
  if (score >= 80) return { label: 'Passing', tone: 'forest' as const };
  if (score >= 60) return { label: 'Needs work', tone: 'warning' as const };
  return { label: 'Action required', tone: 'danger' as const };
};

export const Assessment = () => {
  const { state, submitAssessment } = useApp();
  const { toast, show, clear } = useToast();
  const latest = latestAssessment(state.assessments);
  const [answers, setAnswers] = useState<Record<string, AssessmentValue>>(
    () => latest?.answers ?? {},
  );
  const [result, setResult] = useState<number | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const preview = useMemo(
    () => scoreAssessment(answers, ASSESSMENT_QUESTIONS),
    [answers],
  );
  const answeredCount = ASSESSMENT_QUESTIONS.filter(
    (question) => answers[question.id] !== undefined,
  ).length;
  const complete = answeredCount === ASSESSMENT_QUESTIONS.length;
  const band = bandFor(preview);
  const criticalFailures = ASSESSMENT_QUESTIONS.filter(
    (question) => question.critical && answers[question.id] === 'no',
  );
  const weakControls = ASSESSMENT_QUESTIONS.filter(
    (question) => answers[question.id] === 'no' || answers[question.id] === 'partial',
  );

  const age = latest
    ? daysBetween(new Date(latest.completedAt), new Date())
    : null;
  const dueSoon = age === null || age > ASSESSMENT_VALID_DAYS - 14;

  const setAnswer = (questionId: string, value: AssessmentValue) =>
    setAnswers((current) => ({ ...current, [questionId]: value }));

  const handleSubmit = () => {
    if (!complete) return;
    const score = submitAssessment(answers);
    setResult(score);
    setResultOpen(true);
    show(`Self-assessment recorded at ${score}%.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 04 · Halal self-assessment"
        title="Check the controls before someone else does."
        description="Eight weighted questions, repeated on a 90-day cycle. The assessment is designed to surface the weakest control and give you a specific correction — not just a score."
        actions={
          <Badge tone={dueSoon ? 'warning' : 'success'} dot>
            {age === null
              ? 'Not yet completed'
              : dueSoon
                ? `Renewal due · ${Math.max(ASSESSMENT_VALID_DAYS - age, 0)} days left`
                : `Current · ${ASSESSMENT_VALID_DAYS - age} days left`}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="border-forest-200 bg-forest-50/50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              <p className="text-[11.5px] leading-relaxed text-ink-2">
                Answer for the last 30 days, not for an ideal week. A “No” is
                useful information: it tells the programme where to help. Critical
                controls carry extra weight and cap the score at 55% if failed.
              </p>
            </div>
          </Card>

          {ASSESSMENT_QUESTIONS.map((question, index) => (
            <Card key={question.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 font-mono text-[10px] text-ink-3">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium leading-relaxed text-ink">
                      {question.prompt}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                      {question.help}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {question.critical && (
                    <Badge tone="danger">
                      <ShieldAlert className="h-3 w-3" /> Critical
                    </Badge>
                  )}
                  <span className="font-mono text-[9px] text-ink-3">
                    weight {question.weight}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {options.map((option) => {
                  const active = answers[question.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnswer(question.id, option.value)}
                      aria-pressed={active}
                      className={cn(
                        'cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all',
                        active
                          ? option.value === 'no'
                            ? 'border-clay/40 bg-danger-soft/60'
                            : option.value === 'partial'
                              ? 'border-warn/35 bg-warn-soft/60'
                              : option.value === 'na'
                                ? 'border-line bg-sand'
                                : 'border-forest-300 bg-forest-50'
                          : 'border-line bg-paper hover:border-forest-200',
                      )}
                    >
                      <p className="text-[11.5px] font-medium text-ink">
                        {option.label}
                      </p>
                      <p className="mt-0.5 text-[9.5px] leading-snug text-ink-3">
                        {option.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
            <p className="text-[11px] text-ink-3">
              {answeredCount} of {ASSESSMENT_QUESTIONS.length} answered
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAnswers(latest?.answers ?? {});
                  show('Answers reset to the last recorded assessment.', 'info');
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!complete}>
                <ClipboardCheck className="h-3.5 w-3.5" /> Submit assessment
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-3">
              Live score preview
            </p>
            <div className="mt-4 flex items-center gap-4">
              <ScoreRing
                score={preview}
                size={112}
                label="Projected"
                tone={preview >= 80 ? 'forest' : preview >= 60 ? 'gold' : 'clay'}
              />
              <div>
                <Badge tone={band.tone}>{band.label}</Badge>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
                  {preview >= 80
                    ? 'This would satisfy the self-assessment requirement.'
                    : 'A score of 80% or higher is required for the Verified tier.'}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-line-soft pt-3">
              <div className="flex items-center justify-between text-[10.5px] text-ink-3">
                <span>Questions answered</span>
                <span className="font-mono text-ink">
                  {answeredCount}/{ASSESSMENT_QUESTIONS.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-ink-3">
                <span>Critical controls failed</span>
                <span className={cn('font-mono', criticalFailures.length ? 'text-danger' : 'text-forest-700')}>
                  {criticalFailures.length}
                </span>
              </div>
              <Progress value={(answeredCount / ASSESSMENT_QUESTIONS.length) * 100} className="h-1" />
            </div>
            {criticalFailures.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft/60 p-3 text-[10.5px] leading-relaxed text-ink-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                Fix the critical control before submitting: {criticalFailures.map((q) => q.prompt).join(' ')}
              </div>
            )}
          </Card>

          {weakControls.length > 0 && (
            <Card>
              <CardHeader title="Corrective actions" description="Suggested next steps based on this draft." />
              <ul className="space-y-2.5 p-4">
                {weakControls.slice(0, 4).map((question) => (
                  <li key={question.id} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    <span>
                      <strong className="font-medium text-ink">
                        {answers[question.id] === 'no' ? 'Not in place: ' : 'Partly in place: '}
                      </strong>
                      {question.help}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader title="Assessment history" />
            <div className="divide-y divide-line-soft">
              {[...state.assessments]
                .sort(
                  (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime(),
                )
                .map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-[11.5px] font-medium text-ink">
                        {index === 0 ? 'Latest assessment' : 'Previous assessment'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-ink-3">
                        <Clock3 className="h-3 w-3" /> {formatDate(record.completedAt)}
                      </p>
                    </div>
                    <Badge tone={record.score >= 80 ? 'success' : 'warning'}>
                      {record.score}%
                    </Badge>
                  </div>
                ))}
              {state.assessments.length === 0 && (
                <p className="px-4 py-5 text-[11.5px] text-ink-3">
                  No assessments recorded yet.
                </p>
              )}
            </div>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-sand/40 p-3.5 text-[10px] leading-relaxed text-ink-3">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
            The self-assessment is a programme tool. It does not replace an
            official inspection by JAKIM or a state Islamic authority.
          </div>
        </div>
      </div>

      <Modal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        title="Self-assessment recorded"
        description={`Saved to ${state.vendor.name} · ${formatDate(new Date().toISOString())}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResultOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setResultOpen(false)}>Continue</Button>
          </>
        }
      >
        {result !== null && (
          <div className="space-y-4">
            <div className="flex items-center gap-5 rounded-2xl border border-line bg-paper p-4">
              <ScoreRing
                score={result}
                size={110}
                label="Recorded"
                tone={result >= 80 ? 'forest' : 'gold'}
              />
              <div>
                <Badge tone={bandFor(result).tone}>{bandFor(result).label}</Badge>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                  {result >= 80
                    ? 'Your assessment meets the programme threshold. Keep the corrective actions below on your prep list.'
                    : 'Below the 80% threshold. Address the weak controls and re-run the assessment when they are in place.'}
                </p>
              </div>
            </div>
            {weakControls.length > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                  Recommended corrections
                </p>
                <ul className="mt-2 space-y-1.5">
                  {weakControls.map((question) => (
                    <li key={question.id} className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      {question.help}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[9.5px] leading-relaxed text-ink-3">
              Assessment valid for {ASSESSMENT_VALID_DAYS} days. The next
              renewal reminder will appear on your overview.
            </p>
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};
