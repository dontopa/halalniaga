import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, Info, X } from 'lucide-react';
import type { HalalAlert } from '@/domain/types';
import { formatDate } from '@/domain/compliance';
import { cn } from '@/lib/cn';

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-700">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1.5 font-display text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.05] tracking-[-0.035em] text-ink">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-3">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Score ring                                                                  */
/* -------------------------------------------------------------------------- */

export const ScoreRing = ({
  score,
  size = 128,
  label = 'Compliance',
  tone = 'forest',
}: {
  score: number;
  size?: number;
  label?: string;
  tone?: 'forest' | 'gold' | 'clay';
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const colors = {
    forest: '#0F6049',
    gold: '#C99A4B',
    clay: '#A6543A',
  };
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${score} out of 100`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#EAE4D8" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={colors[tone]}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[2rem] leading-none tracking-[-0.04em] text-ink">
          {score}
        </span>
        <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
          {label}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Alerts                                                                      */
/* -------------------------------------------------------------------------- */

const alertIcon = {
  critical: AlertTriangle,
  warning: BellRing,
  info: Info,
};

const alertTone = {
  critical: 'border-danger/20 bg-danger-soft/70 text-danger',
  warning: 'border-warn/20 bg-warn-soft/70 text-warn',
  info: 'border-info/20 bg-info-soft/70 text-info',
};

export const AlertList = ({
  alerts,
  onDismiss,
  compact = false,
}: {
  alerts: HalalAlert[];
  onDismiss?: (id: string) => void;
  compact?: boolean;
}) => {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-ok/15 bg-ok-soft/60 px-4 py-3.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" />
        <p className="text-[12.5px] text-ink-2">
          No open alerts. Your records are current.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2.5', compact && 'space-y-2')}>
      {alerts.map((alert) => {
        const Icon = alertIcon[alert.severity];
        return (
          <div
            key={alert.id}
            className={cn(
              'relative rounded-xl border p-3.5 pr-9',
              alertTone[alert.severity],
            )}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold leading-snug text-ink">
                  {alert.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2/90">
                  {alert.detail}
                </p>
                {alert.dueAt && (
                  <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-3">
                    Due {formatDate(alert.dueAt)}
                  </p>
                )}
              </div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                aria-label={`Dismiss alert: ${alert.title}`}
                className="absolute right-2 top-2 cursor-pointer rounded-full p-1 text-ink-3 transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Toast                                                                       */
/* -------------------------------------------------------------------------- */

interface ToastState {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const show = (message: string, tone: ToastState['tone'] = 'success') =>
    setToast({ id: Date.now(), message, tone });

  return { toast, show, clear: () => setToast(null) };
};

const toastTone = {
  success: 'border-forest-200 bg-forest-800 text-ivory',
  info: 'border-line bg-paper text-ink',
  warning: 'border-warn/30 bg-warn-soft text-ink',
};

export const Toast = ({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) => {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-5 left-4 right-4 z-[60] animate-rise rounded-2xl border px-4 py-3 shadow-lift sm:left-auto sm:right-6 sm:max-w-sm',
        toastTone[toast.tone],
      )}
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="flex-1 text-[12.5px] leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="cursor-pointer rounded-full p-0.5 opacity-60 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
