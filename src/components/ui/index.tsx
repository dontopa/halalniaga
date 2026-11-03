import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px cursor-pointer';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-forest-800 text-ivory shadow-[0_1px_0_rgba(255,255,255,0.14)_inset] hover:bg-forest-700',
  secondary:
    'border border-line bg-paper text-ink hover:border-forest-200 hover:bg-forest-50',
  ghost: 'text-ink-2 hover:bg-sand/70 hover:text-ink',
  gold: 'bg-gold-400 text-forest-950 hover:bg-gold-300',
  danger:
    'border border-danger/20 bg-danger-soft text-danger hover:border-danger/40',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export const buttonClass = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string => cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) => (
  <button className={buttonClass(variant, size, className)} {...props}>
    {children}
  </button>
);

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

type BadgeTone =
  | 'neutral'
  | 'forest'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-line bg-sand/60 text-ink-2',
  forest: 'border-forest-200 bg-forest-50 text-forest-800',
  success: 'border-ok/15 bg-ok-soft text-ok',
  warning: 'border-warn/15 bg-warn-soft text-warn',
  danger: 'border-danger/15 bg-danger-soft text-danger',
  info: 'border-info/15 bg-info-soft text-info',
  gold: 'border-gold-500/25 bg-gold-100 text-gold-700',
};

export const Badge = ({
  tone = 'neutral',
  className,
  children,
  dot = false,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap',
      badgeTones[tone],
      className,
    )}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
    {children}
  </span>
);

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

export const Card = ({
  className,
  children,
  as: Tag = 'div',
  id,
}: {
  className?: string;
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
  id?: string;
}) => (
  <Tag
    id={id}
    className={cn(
      'rounded-2xl border border-line bg-paper shadow-[0_1px_0_rgba(16,35,29,0.02)]',
      className,
    )}
  >
    {children}
  </Tag>
);

export const CardHeader = ({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6',
      className,
    )}
  >
    <div className="min-w-0">
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

export const Progress = ({
  value,
  tone = 'forest',
  className,
  label,
}: {
  value: number;
  tone?: 'forest' | 'gold' | 'clay' | 'info';
  className?: string;
  label?: string;
}) => {
  const colors: Record<string, string> = {
    forest: 'bg-forest-600',
    gold: 'bg-gold-500',
    clay: 'bg-clay',
    info: 'bg-info',
  };
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-sand', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700', colors[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

const fieldBase =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3/60 transition-colors focus:border-forest-500 focus:outline-none';

export const Field = ({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-1.5', className)}>
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-medium tracking-wide text-ink-2"
    >
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-[11.5px] text-ink-3">{hint}</p>}
    {error && <p className="text-[11.5px] font-medium text-danger">{error}</p>}
  </div>
);

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(fieldBase, className)} {...props} />
);

export const Select = ({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(fieldBase, 'cursor-pointer', className)} {...props}>
    {children}
  </select>
);

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(fieldBase, 'min-h-28 resize-y', className)} {...props} />
);

/* -------------------------------------------------------------------------- */
/* Modal                                                                       */
/* -------------------------------------------------------------------------- */

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade bg-forest-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-ivory shadow-lift outline-none sm:rounded-3xl',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-display text-xl text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-full p-1.5 text-ink-3 transition-colors hover:bg-sand hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line-soft px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
    {icon && (
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 text-forest-700">
        {icon}
      </div>
    )}
    <p className="text-sm font-semibold text-ink">{title}</p>
    <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-3">
      {description}
    </p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
