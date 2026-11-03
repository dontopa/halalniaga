import { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  PlayCircle,
  RotateCcw,
  Sparkles,
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
import { TRAINING_MODULES } from '@/domain/seed';
import { useApp } from '@/domain/store';
import type { TrainingModule } from '@/domain/types';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

const PASS_MARK = 80;

export const Academy = () => {
  const { state, completeQuiz } = useApp();
  const { toast, show, clear } = useToast();
  const t = useT();
  const [selectedId, setSelectedId] = useState(
    () =>
      TRAINING_MODULES.find(
        (module) =>
          (state.training.find((item) => item.moduleId === module.id)?.bestScore ??
            0) < PASS_MARK,
      )?.id ?? TRAINING_MODULES[0].id,
  );
  const [quizModule, setQuizModule] = useState<TrainingModule | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const progressFor = (moduleId: string) =>
    state.training.find((item) => item.moduleId === moduleId);
  const isComplete = (moduleId: string) =>
    (progressFor(moduleId)?.bestScore ?? 0) >= PASS_MARK;

  const completedCount = TRAINING_MODULES.filter((module) =>
    isComplete(module.id),
  ).length;
  const averageScore = Math.round(
    TRAINING_MODULES.reduce(
      (sum, module) => sum + (progressFor(module.id)?.bestScore ?? 0),
      0,
    ) / TRAINING_MODULES.length,
  );
  const totalMinutes = TRAINING_MODULES.reduce(
    (sum, module) => sum + module.durationMin,
    0,
  );

  const selected = useMemo(
    () => TRAINING_MODULES.find((module) => module.id === selectedId) ?? TRAINING_MODULES[0],
    [selectedId],
  );
  const selectedProgress = progressFor(selected.id);

  const openQuiz = (module: TrainingModule) => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setQuizModule(module);
  };

  const allAnswered = quizModule
    ? quizModule.quiz.every((question) => answers[question.id] !== undefined)
    : false;

  const submitQuiz = () => {
    if (!quizModule) return;
    const correct = quizModule.quiz.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    const nextScore = Math.round((correct / quizModule.quiz.length) * 100);
    setScore(nextScore);
    setSubmitted(true);
    completeQuiz(quizModule.id, nextScore);
    if (nextScore >= PASS_MARK) {
      show(
        t('{title} completed with {score}%. Your training record has been updated.', {
          title: t(quizModule.title),
          score: nextScore,
        }),
      );
    } else {
      show(
        t('Score {score}% — the pass mark is {pass}%. Review the explanations and try again.', {
          score: nextScore,
          pass: PASS_MARK,
        }),
        'warning',
      );
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t('Module 02 · Halal education & training')}
        title={t('Learn the detail that protects the dish.')}
        description={t('Six short modules built around the decisions a small vendor makes every day. Each ends with a scored quiz; the pass mark is 80%.')}
        actions={
          <Badge tone="forest">
            {t('{done} of {total} complete', {
              done: completedCount,
              total: TRAINING_MODULES.length,
            })}
          </Badge>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <ScoreRing score={averageScore} size={96} label={t('Average')} tone={averageScore >= PASS_MARK ? 'forest' : 'gold'} />
          <div>
            <p className="text-[12px] font-semibold text-ink">{t('Training average')}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
              {t('Best score across all six modules.')}
            </p>
            <p className="mt-2 font-mono text-[10px] text-ink-3">
              {t('{done}/{total} passed', {
                done: completedCount,
                total: TRAINING_MODULES.length,
              })}
            </p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-forest-700" />
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
              {t('Total learning time')}
            </p>
          </div>
          <p className="mt-3 font-display text-3xl tracking-[-0.03em] text-ink">
            {totalMinutes}
            <span className="ml-1 text-base text-ink-3">min</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
            {t('Designed in short blocks that fit between prep and service.')}
          </p>
          <Progress value={100} className="mt-3 h-1" />
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-600" />
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
              {t('Recognition')}
            </p>
          </div>
          <p className="mt-3 text-[13px] font-semibold leading-snug text-ink">
            {t('Complete all six modules with 80%+ to qualify for the Learner tier.')}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            {t('Your completion record is attached to the vendor QR profile and reviewed during inspection.')}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title={t('Course modules')}
            description={t('Work through the list in order, or revisit any module at any time.')}
          />
          <ul className="divide-y divide-line-soft">
            {TRAINING_MODULES.map((module, index) => {
              const progress = progressFor(module.id);
              const complete = isComplete(module.id);
              const active = module.id === selected.id;
              return (
                <li key={module.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(module.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-sand/40',
                      active && 'bg-forest-50/60',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]',
                        complete
                          ? 'border-forest-200 bg-forest-100 text-forest-800'
                          : 'border-line bg-ivory text-ink-3',
                      )}
                    >
                      {complete ? <Check className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-ink">
                          {t(module.title)}
                        </p>
                        <span className="font-mono text-[9.5px] text-ink-3">
                          {module.durationMin} min
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11.5px] text-ink-3">
                        {t(module.summary)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {complete ? (
                          <Badge tone="success" dot>
                            {t('Passed · {score}%', { score: progress?.bestScore ?? 0 })}
                          </Badge>
                        ) : progress?.attempts ? (
                          <Badge tone="warning" dot>
                            {t('Attempted · {score}%', { score: progress.bestScore ?? 0 })}
                          </Badge>
                        ) : (
                          <Badge tone="neutral">{t('Not started')}</Badge>
                        )}
                        <div className="h-1 w-20 overflow-hidden rounded-full bg-sand">
                          <div
                            className="h-full rounded-full bg-forest-600"
                            style={{ width: `${progress?.bestScore ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="bg-forest-800 px-5 py-5 text-ivory">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold-300">
                  {t('Module {number}', { number: String(selected.order).padStart(2, '0') })}
                </span>
                {isComplete(selected.id) ? (
                  <Badge tone="success" dot>
                    {t('Completed')}
                  </Badge>
                ) : (
                  <Badge tone="gold">{t('In progress')}</Badge>
                )}
              </div>
              <h3 className="mt-3 font-display text-xl leading-snug tracking-[-0.02em]">
                {t(selected.title)}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ivory/65">
                {t(selected.summary)}
              </p>
              <div className="mt-4 flex items-center gap-4 text-[10.5px] text-ivory/60">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" /> {selected.durationMin} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {t('{count} questions', { count: selected.quiz.length })}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                  {t('What you will cover')}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {selected.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2 text-[11.5px] text-ink-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                      {t(topic)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-line bg-sand/40 p-3">
                <div className="flex items-center justify-between text-[10.5px] text-ink-3">
                  <span>{t('Best quiz score')}</span>
                  <span className="font-mono text-ink">
                    {selectedProgress?.bestScore != null ? `${selectedProgress.bestScore}%` : '—'}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-3">
                  <span>{t('Attempts')}</span>
                  <span className="font-mono text-ink">
                    {selectedProgress?.attempts ?? 0}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-3">
                  <span>{t('Pass mark')}</span>
                  <span className="font-mono text-ink">{PASS_MARK}%</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => openQuiz(selected)}>
                <PlayCircle className="h-4 w-4" />
                {isComplete(selected.id) ? t('Retake the quiz') : t('Start the quiz')}
              </Button>
              <p className="text-center text-[9.5px] leading-relaxed text-ink-3">
                {t('The quiz is a learning check, not a professional certification. Completion is recorded in your programme profile.')}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(quizModule)}
        onClose={() => setQuizModule(null)}
        title={quizModule ? t('Quiz · {title}', { title: t(quizModule.title) }) : t('Quiz')}
        description={
          submitted
            ? t('Score {score}% · pass mark {pass}%', { score, pass: PASS_MARK })
            : t('{count} questions · pass mark {pass}%', {
                count: quizModule?.quiz.length ?? 0,
                pass: PASS_MARK,
              })
        }
        size="lg"
        footer={
          quizModule ? (
            submitted ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                    setScore(0);
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> {t('Retake')}
                </Button>
                <Button onClick={() => setQuizModule(null)}>{t('Done')}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setQuizModule(null)}>
                  {t('Cancel')}
                </Button>
                <Button onClick={submitQuiz} disabled={!allAnswered}>
                  {t('Submit answers')}
                </Button>
              </>
            )
          ) : null
        }
      >
        {quizModule && (
          <div className="space-y-5">
            {submitted && (
              <div
                className={cn(
                  'flex items-center gap-4 rounded-2xl border p-4',
                  score >= PASS_MARK
                    ? 'border-forest-200 bg-forest-50'
                    : 'border-warn/25 bg-warn-soft/70',
                )}
              >
                <ScoreRing
                  score={score}
                  size={96}
                  label={t('Score')}
                  tone={score >= PASS_MARK ? 'forest' : 'gold'}
                />
                <div>
                  <p className="text-[14px] font-semibold text-ink">
                    {score >= PASS_MARK ? t('Module passed') : t('Not passed yet')}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
                    {score >= PASS_MARK
                      ? t('Your best score has been saved to the training record.')
                      : t('You need {pass}% to pass. Read the explanations below, then retake the quiz.', {
                          pass: PASS_MARK,
                        })}
                  </p>
                </div>
              </div>
            )}

            {quizModule.quiz.map((question, index) => {
              const chosen = answers[question.id];
              const correct = chosen === question.answer;
              return (
                <div key={question.id} className="rounded-2xl border border-line bg-paper p-4">
                  <p className="text-[12.5px] font-medium leading-relaxed text-ink">
                    <span className="mr-2 font-mono text-[10px] text-ink-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {t(question.prompt)}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {question.options.map((option, optionIndex) => {
                      const isChosen = chosen === optionIndex;
                      const isAnswer = question.answer === optionIndex;
                      return (
                        <label
                          key={option}
                          className={cn(
                            'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[11.5px] transition-colors',
                            submitted && isAnswer && 'border-forest-200 bg-forest-50',
                            submitted && isChosen && !correct && 'border-danger/25 bg-danger-soft/50',
                            !submitted && isChosen
                              ? 'border-forest-300 bg-forest-50'
                              : 'border-line hover:border-forest-200',
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${question.id}`}
                            checked={isChosen}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            disabled={submitted}
                            className="mt-0.5 h-3.5 w-3.5 accent-forest-700"
                          />
                          <span className="text-ink-2">{t(option)}</span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div
                      className={cn(
                        'mt-3 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed',
                        correct
                          ? 'border-forest-200 bg-forest-50 text-forest-900'
                          : 'border-warn/20 bg-warn-soft/60 text-ink-2',
                      )}
                    >
                      <p className="font-medium">
                        {correct
                          ? t('Correct.')
                          : t('The correct answer is: {answer}', {
                              answer: t(question.options[question.answer]),
                            })}
                      </p>
                      <p className="mt-1">{t(question.explanation)}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted && (
              <p className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
                <Circle className="h-3 w-3" />
                {t('Answer every question to enable submission.')}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </>
  );
};
