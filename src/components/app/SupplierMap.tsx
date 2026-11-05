import { ExternalLink, MapPin } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { StatusBadge } from '@/components/badges';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { Supplier } from '@/domain/types';

const PIN_TONE: Record<Supplier['status'], string> = {
  certified: 'bg-forest-800',
  verified: 'bg-forest-500',
  pending: 'bg-gold-500',
  expired: 'bg-[#b4553f]',
};

const googleMapsUrl = (supplier: Supplier) =>
  `https://www.google.com/maps/search/?api=1&query=${supplier.lat},${supplier.lng}`;

/**
 * Keyless map panel: pins are projected from the supplier coordinates, so the
 * prototype works offline and needs no Google Maps API key. Each shop links out
 * to Google Maps for directions.
 */
export const SupplierMap = ({
  suppliers,
  selectedId,
  onSelect,
  onDetails,
}: {
  suppliers: Supplier[];
  selectedId?: string;
  onSelect: (supplier: Supplier) => void;
  onDetails?: (supplier: Supplier) => void;
}) => {
  const t = useT();
  const located = suppliers.filter(
    (supplier) =>
      typeof supplier.lat === 'number' && typeof supplier.lng === 'number',
  );

  const lats = located.map((supplier) => supplier.lat as number);
  const lngs = located.map((supplier) => supplier.lng as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 0.01;
  const spanLng = maxLng - minLng || 0.01;

  const basePoints = located.map((supplier, index) => {
    const x = ((supplier.lng! - minLng) / spanLng) * 0.84 + 0.08;
    const y = (1 - (supplier.lat! - minLat) / spanLat) * 0.72 + 0.14;
    return { supplier, x, y, index };
  });

  // Nudge pins apart where several shops sit in the same part of town.
  const points: typeof basePoints = [];
  for (const point of basePoints) {
    let { x, y } = point;
    let attempt = 0;
    while (
      points.some((placed) => Math.hypot(placed.x - x, placed.y - y) < 0.055) &&
      attempt < 16
    ) {
      const angle = (attempt + 1) * 1.9 + point.index;
      const radius = 0.04 + Math.floor(attempt / 8) * 0.03;
      x = Math.min(0.94, Math.max(0.06, point.x + Math.cos(angle) * radius));
      y = Math.min(0.88, Math.max(0.12, point.y + Math.sin(angle) * radius));
      attempt += 1;
    }
    points.push({ ...point, x, y });
  }

  const selected = suppliers.find((supplier) => supplier.id === selectedId);
  const selectedHasPoint =
    selected && typeof selected.lat === 'number' && selected.lng !== undefined;

  return (
    <Card id="map" className="scroll-mt-24 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-5 py-3.5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">
            {t('Supplier map')}
          </h2>
          <p className="mt-0.5 text-[10.5px] text-ink-3">
            {t('Nearby shops for raw ingredients, pinned by area.')}
          </p>
        </div>
        <Badge tone="neutral">{t('Illustrative map')}</Badge>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative h-[280px] overflow-hidden bg-[#eef1e8] sm:h-[320px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_45%),radial-gradient(circle_at_78%_70%,rgba(201,154,75,0.14),transparent_40%)]"
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 600 340"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#0b4f3c"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="600" height="340" fill="url(#map-grid)" />
            <path
              d="M -20 250 C 90 210, 140 270, 250 230 S 430 160, 640 205"
              fill="none"
              stroke="#0b4f3c"
              strokeOpacity="0.14"
              strokeWidth="3"
            />
            <path
              d="M 90 -20 C 120 90, 60 150, 110 240 S 180 320, 210 360"
              fill="none"
              stroke="#c99a4b"
              strokeOpacity="0.35"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <path
              d="M 330 -20 C 350 100, 300 180, 360 260 S 420 330, 410 360"
              fill="none"
              stroke="#0b4f3c"
              strokeOpacity="0.12"
              strokeWidth="2"
            />
            <path
              d="M 470 0 C 500 80, 460 150, 520 230 S 540 310, 560 340"
              fill="none"
              stroke="#0b4f3c"
              strokeOpacity="0.1"
              strokeWidth="2"
            />
          </svg>

          {points.map(({ supplier, x, y }) => {
            const active = supplier.id === selectedId;
            return (
              <button
                key={supplier.id}
                type="button"
                onClick={() => onSelect(supplier)}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                aria-label={t('Map pin for {name}', { name: supplier.shortName })}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    'relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-ivory shadow-[0_2px_6px_rgba(11,79,60,0.35)] transition-transform group-hover:scale-125',
                    PIN_TONE[supplier.status],
                    active && 'scale-125 ring-2 ring-forest-900/20',
                  )}
                >
                  <span className="h-1 w-1 rounded-full bg-ivory/90" />
                </span>
                <span
                  className={cn(
                    'pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink/85 px-2 py-1 text-[9px] text-ivory opacity-0 transition-opacity group-hover:opacity-100',
                    active && 'opacity-100',
                  )}
                >
                  {supplier.shortName}
                </span>
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-line/70 bg-ivory/90 px-2.5 py-1.5 text-[8.5px] text-ink-3 backdrop-blur">
            {(
              [
                ['certified', 'Certified'],
                ['verified', 'Verified'],
                ['pending', 'Pending'],
              ] as const
            ).map(([status, label]) => (
              <span key={status} className="inline-flex items-center gap-1">
                <span className={cn('h-2 w-2 rounded-full', PIN_TONE[status])} />
                {t(label)}
              </span>
            ))}
          </div>

          <p className="absolute bottom-3 right-3 text-[8px] uppercase tracking-[0.14em] text-ink-3">
            {t('Sabah · illustrative')}
          </p>
        </div>

        <div className="border-t border-line-soft bg-paper p-4 lg:border-l lg:border-t-0">
          {selected && selectedHasPoint ? (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                    {selected.area}
                  </p>
                  <h3 className="mt-1 text-[13px] font-semibold leading-snug text-ink">
                    {selected.name}
                  </h3>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-3">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                {selected.address}
              </p>
              <p className="mt-1 text-[10.5px] text-ink-3">
                {t('{distance} km from your stall', {
                  distance: selected.distanceKm.toFixed(1),
                })}
              </p>
              <div className="mt-auto space-y-2 pt-3">
                <a
                  href={googleMapsUrl(selected)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-[11px] font-medium text-forest-800 transition-colors hover:bg-forest-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('Open in Google Maps')}
                </a>
                {onDetails && (
                  <button
                    type="button"
                    onClick={() => onDetails(selected)}
                    className="flex w-full items-center justify-center rounded-lg border border-line bg-ivory px-3 py-2 text-[11px] font-medium text-ink-2 transition-colors hover:border-forest-200 hover:text-forest-800"
                  >
                    {t('View supplier details')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <MapPin className="h-5 w-5 text-forest-600" />
              <p className="text-[11px] leading-relaxed text-ink-3">
                {t('Select a pin to see the shop and open directions.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
