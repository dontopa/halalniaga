import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, MapPin } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { StatusBadge } from '@/components/badges';
import { useT } from '@/i18n';
import type { Supplier } from '@/domain/types';

const PIN_COLOUR: Record<Supplier['status'], string> = {
  certified: '#0b4f3c',
  verified: '#2f8f68',
  pending: '#c99a4b',
  expired: '#b4553f',
};

const googleMapsUrl = (supplier: Supplier) =>
  `https://www.google.com/maps/search/?api=1&query=${supplier.lat},${supplier.lng}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * OpenStreetMap map (free, no API key). Pins come from the supplier
 * coordinates; each popup links out to Google Maps for directions.
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  const tRef = useRef(t);
  onSelectRef.current = onSelect;
  tRef.current = t;

  const located = useMemo(
    () =>
      suppliers.filter(
        (supplier) =>
          typeof supplier.lat === 'number' && typeof supplier.lng === 'number',
      ),
    [suppliers],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([5.9804, 116.0735], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const points: L.LatLngExpression[] = [];

    located.forEach((supplier) => {
      const lat = supplier.lat as number;
      const lng = supplier.lng as number;
      points.push([lat, lng]);

      const icon = L.divIcon({
        className: 'halalniaga-pin',
        html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${PIN_COLOUR[supplier.status]};border:2px solid #fdfbf5;box-shadow:0 2px 8px rgba(11,79,60,0.4)"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
      });

      const marker = L.marker([lat, lng], {
        icon,
        title: supplier.name,
        alt: `${supplier.name} — ${supplier.area}`,
      }).addTo(map);

      marker.bindPopup(
        `<div style="min-width:190px;font-family:inherit">
          <p style="margin:0;font-weight:600;font-size:12px;color:#14231d">${escapeHtml(supplier.name)}</p>
          <p style="margin:4px 0 0;font-size:10.5px;line-height:1.45;color:#5c6a62">${escapeHtml(supplier.address)}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#8a7a5c">${supplier.distanceKm.toFixed(1)} km</p>
          <a href="${googleMapsUrl(supplier)}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:8px;font-size:10.5px;font-weight:600;color:#0b4f3c">${escapeHtml(tRef.current('Open in Google Maps'))} →</a>
        </div>`,
      );

      marker.on('click', () => onSelectRef.current(supplier));
      markersRef.current.set(supplier.id, marker);
    });

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [34, 34], maxZoom: 12 });
    }
  }, [located]);

  useEffect(() => {
    if (!selectedId) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker || !mapRef.current) return;
    const position = marker.getLatLng();
    mapRef.current.setView(position, Math.max(mapRef.current.getZoom(), 12), {
      animate: true,
    });
    marker.openPopup();
  }, [selectedId]);

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
        <Badge tone="forest">OpenStreetMap</Badge>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div
          ref={containerRef}
          className="relative z-0 h-[300px] w-full bg-[#eef1e8] sm:h-[340px]"
          aria-label={t('Supplier map')}
        />

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
