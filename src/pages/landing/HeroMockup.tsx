import { AlertTriangle, ArrowUpRight, MapPin, QrCode, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Progress } from '@/components/ui';
import { TierBadge } from '@/components/badges';
import { cn } from '@/lib/cn';

const score = 68;
const radius = 34;
const circumference = 2 * Math.PI * radius;

const metrics = [
  { label: 'Training', value: 100, tone: 'forest' as const },
  { label: 'Sourcing', value: 89, tone: 'forest' as const },
  { label: 'Assessment', value: 83, tone: 'gold' as const },
  { label: 'Monitoring', value: 0, tone: 'clay' as const },
];

export const HeroMockup = ({ className }: { className?: string }) => {
  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/vendor/dapur-kak-nur`
      : 'https://halalniaga.pages.dev/vendor/dapur-kak-nur';

  return (
    <div className={cn('relative mx-auto w-full max-w-[540px]', className)}>
      <div
        aria-hidden="true"
        className="absolute -inset-5 -rotate-2 rounded-[2.6rem] border border-gold-300/40 bg-forest-50/80 pattern-geo"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-10 hidden h-28 w-28 text-gold-300/70 sm:block"
      >
        <svg viewBox="0 0 256 256" className="h-full w-full">
          <path
            d="M 128 24 L 154.02 65.18 L 201.54 54.46 L 190.82 101.98 L 232 128 L 190.82 154.02 L 201.54 201.54 L 154.02 190.82 L 128 232 L 101.98 190.82 L 54.46 201.54 L 65.18 154.02 L 24 128 L 65.18 101.98 L 54.46 54.46 L 101.98 65.18 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-ivory shadow-lift">
        <div className="flex items-center gap-2 border-b border-line-soft bg-paper/70 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-clay/60" />
          <span className="h-2 w-2 rounded-full bg-gold-400/80" />
          <span className="h-2 w-2 rounded-full bg-forest-500/60" />
          <span className="ml-2 flex-1 truncate rounded-md bg-sand/70 px-2.5 py-1 font-mono text-[10px] text-ink-3">
            halalniaga.app / overview
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-forest-700">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-forest-500" />
            Live
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-xs text-gold-300">
                NH
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">
                  Dapur Kak Nur
                </p>
                <p className="truncate text-[10.5px] text-ink-3">
                  Tanjung Aru · Kota Kinabalu
                </p>
              </div>
            </div>
            <TierBadge tier="verified" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-3">
                    Compliance record
                  </p>
                  <p className="mt-1 text-[11px] text-ink-3">Updated today</p>
                </div>
                <Badge tone="success" dot>
                  Current
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-[88px] w-[88px] shrink-0">
                  <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
                    <circle cx="44" cy="44" r={radius} fill="none" stroke="#E9E2D5" strokeWidth="7" />
                    <circle
                      cx="44"
                      cy="44"
                      r={radius}
                      fill="none"
                      stroke="#0F6049"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - score / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl leading-none text-ink">
                      {score}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-wider text-ink-3">
                      / 100
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] text-ink-2">
                          {metric.label}
                        </span>
                        <span className="font-mono text-[9px] text-ink-3">
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} tone={metric.tone} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-line-soft pt-2.5 text-[10px] text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                Monitoring due · book an inspection
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-warn/20 bg-warn-soft/70 p-3.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                  <div>
                    <p className="text-[11.5px] font-semibold leading-snug text-ink">
                      Certificate expires in 24 days
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-ink-2">
                      Sri Tanjung Poultry · request renewal before purchases
                      resume.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11.5px] font-semibold text-ink">
                      Sri Tanjung Poultry
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-3">
                      <MapPin className="h-3 w-3" /> 6.4 km · Inanam
                    </p>
                  </div>
                  <Badge tone="success" dot>
                    Certified
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line-soft pt-2.5">
                  <span className="flex items-center gap-1 text-[10px] text-ink-2">
                    <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                    4.8 · 126 reviews
                  </span>
                  <span className="font-mono text-[9px] text-forest-700">
                    Fresh daily
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-line bg-forest-800 p-3.5 text-ivory">
            <div className="rounded-xl bg-ivory p-1.5">
              <QRCodeSVG
                value={profileUrl}
                size={58}
                bgColor="#FAF7F0"
                fgColor="#0B4F3C"
                level="M"
                aria-label="Vendor verification QR code"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gold-300">
                Customer verification
              </p>
              <p className="mt-0.5 text-[12px] font-medium leading-snug">
                Scan the stall QR to see the record behind the food.
              </p>
              <p className="mt-1 text-[10px] text-ivory/60">
                Training · Sourcing · Assessment · Inspections
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-300" />
          </div>

          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-ink-3">
            <span className="inline-flex items-center gap-1">
              <QrCode className="h-3 w-3" /> HN-VERIFIED-PARTICIPANT
            </span>
            <span>NOT A JAKIM CERTIFICATE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
