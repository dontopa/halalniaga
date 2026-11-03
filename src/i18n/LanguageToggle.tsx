import { Languages } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLang } from './index';

const OPTIONS: Array<{ code: 'ms' | 'en'; label: string; title: string }> = [
  { code: 'ms', label: 'BM', title: 'Bahasa Melayu' },
  { code: 'en', label: 'EN', title: 'English' },
];

/**
 * Segmented BM/EN switch. `tone="dark"` is for forest-coloured surfaces.
 */
export const LanguageToggle = ({
  tone = 'light',
  className,
  showIcon = true,
}: {
  tone?: 'light' | 'dark';
  className?: string;
  showIcon?: boolean;
}) => {
  const { lang, setLang } = useLang();
  const dark = tone === 'dark';

  return (
    <div
      role="group"
      aria-label={lang === 'ms' ? 'Tukar bahasa' : 'Change language'}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-0.5',
        dark
          ? 'border border-ivory/20 bg-ivory/10'
          : 'border border-line bg-paper',
        className,
      )}
    >
      {showIcon && (
        <Languages
          aria-hidden="true"
          className={cn(
            'mx-1 h-3.5 w-3.5 shrink-0',
            dark ? 'text-ivory/55' : 'text-ink-3',
          )}
        />
      )}
      {OPTIONS.map((option) => {
        const active = lang === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLang(option.code)}
            aria-pressed={active}
            title={option.title}
            className={cn(
              'cursor-pointer rounded-full px-2 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] transition-colors',
              active
                ? dark
                  ? 'bg-gold-300 text-forest-950'
                  : 'bg-forest-800 text-ivory'
                : dark
                  ? 'text-ivory/55 hover:text-ivory'
                  : 'text-ink-3 hover:text-forest-800',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
