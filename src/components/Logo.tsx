import { useId } from 'react';
import { cn } from '@/lib/cn';

const STAR_PATH =
  'M 128 24 L 154.02 65.18 L 201.54 54.46 L 190.82 101.98 L 232 128 L 190.82 154.02 L 201.54 201.54 L 154.02 190.82 L 128 232 L 101.98 190.82 L 54.46 201.54 L 65.18 154.02 L 24 128 L 65.18 101.98 L 54.46 54.46 L 101.98 65.18 Z';

export const LogoMark = ({
  className,
  title = 'HALALNiaga',
}: {
  className?: string;
  title?: string;
}) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 256 256"
      role="img"
      aria-label={title}
      className={cn('h-8 w-8', className)}
    >
      <mask id={`cut-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
        <rect width="256" height="256" fill="white" />
        <path
          d="M 92 132 L 116 156 L 164 100"
          fill="none"
          stroke="black"
          strokeWidth="23"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </mask>
      <path d={STAR_PATH} fill="currentColor" mask={`url(#cut-${id})`} />
    </svg>
  );
};

export const Wordmark = ({
  className,
  markClassName,
  tone = 'dark',
}: {
  className?: string;
  markClassName?: string;
  tone?: 'dark' | 'light';
}) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <LogoMark
      className={cn(
        'h-8 w-8',
        tone === 'light' ? 'text-gold-300' : 'text-forest-800',
        markClassName,
      )}
    />
    <span
      className={cn(
        'text-[1.22rem] leading-none tracking-[-0.035em]',
        tone === 'light' ? 'text-ivory' : 'text-ink',
      )}
    >
      <span className="font-semibold">HALAL</span>
      <span className="font-display italic font-medium">Niaga</span>
    </span>
  </span>
);
