import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  MapPin,
  Package,
  PackagePlus,
  Search,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
} from '@/components/ui';
import { StatusBadge } from '@/components/badges';
import { PurchaseModal } from '@/components/app/PurchaseModal';
import { PageHeader } from '@/components/app/shared';
import { daysUntil, formatDate } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import type { HalalStatus, Supplier, SupplierCategory } from '@/domain/types';
import { cn } from '@/lib/cn';

const categories: Array<SupplierCategory | 'All categories'> = [
  'All categories',
  'Poultry & meat',
  'Seafood',
  'Produce',
  'Dairy & eggs',
  'Dry goods',
  'Sauces & condiments',
];

const statusFilters: Array<{ value: HalalStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'certified', label: 'Certified' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Lapsed' },
];

const expiryTone = (supplier: Supplier) => {
  if (!supplier.validUntil) return 'text-ink-3';
  const days = daysUntil(supplier.validUntil, new Date()) ?? 0;
  if (days < 0) return 'text-danger';
  if (days <= 30) return 'text-warn';
  return 'text-ink-3';
};

export const Suppliers = () => {
  const { state, toggleSavedSupplier } = useApp();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All areas');
  const [category, setCategory] = useState<SupplierCategory | 'All categories'>(
    'All categories',
  );
  const [status, setStatus] = useState<HalalStatus | 'all'>('all');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseSupplier, setPurchaseSupplier] = useState<string | undefined>();

  const areas = useMemo(
    () => ['All areas', ...Array.from(new Set(state.suppliers.map((s) => s.area)))],
    [state.suppliers],
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return state.suppliers.filter((supplier) => {
      const matchesQuery =
        !text ||
        supplier.name.toLowerCase().includes(text) ||
        supplier.tags.some((tag) => tag.toLowerCase().includes(text)) ||
        state.products.some(
          (product) =>
            product.supplierId === supplier.id &&
            product.name.toLowerCase().includes(text),
        );
      const matchesArea = area === 'All areas' || supplier.area === area;
      const matchesCategory =
        category === 'All categories' || supplier.categories.includes(category);
      const matchesStatus = status === 'all' || supplier.status === status;
      return matchesQuery && matchesArea && matchesCategory && matchesStatus;
    });
  }, [state.suppliers, state.products, query, area, category, status]);

  const saved = state.suppliers.filter((supplier) =>
    state.savedSupplierIds.includes(supplier.id),
  );

  const openPurchase = (supplierId: string) => {
    setSelected(null);
    setPurchaseSupplier(supplierId);
    setPurchaseOpen(true);
  };

  const countByStatus = (value: HalalStatus) =>
    state.suppliers.filter((supplier) => supplier.status === value).length;

  return (
    <>
      <PageHeader
        eyebrow="Module 01 · Supplier finder"
        title="Find a source you can stand behind."
        description="Search by area, category or product. Certification status is shown at product level, because a supplier’s company certificate does not automatically cover every item it sells."
        actions={
          <Button size="sm" onClick={() => { setPurchaseSupplier(undefined); setPurchaseOpen(true); }}>
            <PackagePlus className="h-3.5 w-3.5" /> Record purchase
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Certified', value: countByStatus('certified'), tone: 'text-forest-700' },
          { label: 'Verified sources', value: countByStatus('verified'), tone: 'text-forest-700' },
          { label: 'Pending checks', value: countByStatus('pending'), tone: 'text-warn' },
          { label: 'Lapsed', value: countByStatus('expired'), tone: 'text-danger' },
        ].map((item) => (
          <Card key={item.label} className="px-4 py-3.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
              {item.label}
            </p>
            <p className={cn('mt-1 font-display text-2xl tracking-[-0.03em]', item.tone)}>
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search supplier, product or tag…"
              className="pl-10"
              aria-label="Search suppliers"
            />
          </div>
          <Field label="Area" htmlFor="filter-area" className="[&>label]:sr-only">
            <Select id="filter-area" value={area} onChange={(event) => setArea(event.target.value)}>
              {areas.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="filter-category" className="[&>label]:sr-only">
            <Select
              id="filter-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as SupplierCategory | 'All categories')}
            >
              {categories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="filter-status" className="[&>label]:sr-only">
            <Select
              id="filter-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as HalalStatus | 'all')}
            >
              {statusFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
          <p className="text-[11px] text-ink-3">
            <span className="font-medium text-ink">{filtered.length}</span> of{' '}
            {state.suppliers.length} suppliers
          </p>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={cn(
                  'cursor-pointer rounded-full border px-2.5 py-1 text-[10.5px] transition-colors',
                  status === option.value
                    ? 'border-forest-800 bg-forest-800 text-ivory'
                    : 'border-line bg-paper text-ink-2 hover:border-forest-200',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Store className="h-5 w-5" />}
          title="No suppliers match this search"
          description="Try a different area, category or status. New suppliers are added to the pilot network as certificates are verified."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((supplier) => {
            const isSaved = state.savedSupplierIds.includes(supplier.id);
            const productCount = state.products.filter(
              (product) => product.supplierId === supplier.id,
            ).length;
            return (
              <Card key={supplier.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-[15px]"
                    style={{ backgroundColor: `${supplier.accent}16`, color: supplier.accent }}
                  >
                    {supplier.shortName
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[14px] font-semibold leading-snug text-ink">
                        {supplier.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleSavedSupplier(supplier.id)}
                        className="cursor-pointer rounded-full p-1 text-ink-3 transition-colors hover:bg-sand hover:text-forest-700"
                        aria-label={isSaved ? `Remove ${supplier.name} from saved suppliers` : `Save ${supplier.name}`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-forest-700" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-3">
                      <MapPin className="h-3 w-3" /> {supplier.area} · {supplier.distanceKm} km
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={supplier.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {supplier.categories.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-ivory px-2 py-0.5 text-[9.5px] text-ink-2"
                    >
                      {item}
                    </span>
                  ))}
                  {supplier.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-forest-200 bg-forest-50 px-2 py-0.5 text-[9.5px] text-forest-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-3 text-[10.5px]">
                  <div>
                    <p className="text-ink-3">Certificate</p>
                    <p className="mt-0.5 truncate font-mono text-[9.5px] text-ink-2">
                      {supplier.certificateNo ?? 'Not on file'}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-3">Valid until</p>
                    <p className={cn('mt-0.5 font-medium', expiryTone(supplier))}>
                      {supplier.validUntil ? formatDate(supplier.validUntil) : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10.5px] text-ink-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                      {supplier.rating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-3 w-3" /> {productCount} products
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => setSelected(supplier)}>
                      Details
                    </Button>
                    <Button size="sm" onClick={() => openPurchase(supplier.id)}>
                      Record purchase
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="border-b border-line-soft px-5 py-4">
            <h3 className="text-[14px] font-semibold text-ink">Saved suppliers</h3>
            <p className="mt-0.5 text-[11.5px] text-ink-3">
              Your shortlist for the current menu cycle.
            </p>
          </div>
          <div className="divide-y divide-line-soft">
            {saved.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-ink">
                    {supplier.shortName}
                  </p>
                  <p className="text-[10px] text-ink-3">
                    {supplier.categories.join(' · ')}
                  </p>
                </div>
                <StatusBadge status={supplier.status} />
              </div>
            ))}
            {saved.length === 0 && (
              <p className="px-5 py-6 text-[12px] text-ink-3">
                No saved suppliers yet. Use the bookmark on any supplier card.
              </p>
            )}
          </div>
        </Card>

        <Card className="border-warn/20 bg-warn-soft/30">
          <div className="p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warn" />
              <h3 className="text-[13px] font-semibold text-ink">
                Certificate watchlist
              </h3>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
              Never let a certificate lapse silently. These suppliers need a
              renewal check before the date shown.
            </p>
            <div className="mt-4 space-y-2.5">
              {state.suppliers
                .filter((supplier) => supplier.validUntil)
                .sort(
                  (a, b) =>
                    (daysUntil(a.validUntil, new Date()) ?? 0) -
                    (daysUntil(b.validUntil, new Date()) ?? 0),
                )
                .slice(0, 3)
                .map((supplier) => {
                  const days = daysUntil(supplier.validUntil, new Date()) ?? 0;
                  return (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-ink">
                          {supplier.shortName}
                        </p>
                        <p className="text-[9.5px] text-ink-3">
                          {supplier.certificateNo ?? 'No certificate'}
                        </p>
                      </div>
                      <Badge
                        tone={days < 0 ? 'danger' : days <= 30 ? 'warning' : 'success'}
                      >
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Supplier'}
        description={selected ? `${selected.address} · ${selected.distanceKm} km away` : undefined}
        size="lg"
        footer={
          selected ? (
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button onClick={() => openPurchase(selected.id)}>
                <PackagePlus className="h-4 w-4" /> Record a purchase
              </Button>
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} />
              <Badge tone="neutral">
                <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                {selected.rating.toFixed(1)} · {selected.reviewCount} reviews
              </Badge>
              <Badge tone="neutral">{selected.categories.join(' · ')}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                  Certificate
                </p>
                <p className="mt-1 break-all font-mono text-[10px] text-ink">
                  {selected.certificateNo ?? 'Not on file'}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                  Issued
                </p>
                <p className="mt-1 text-[11px] text-ink">
                  {formatDate(selected.issuedOn)}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                  Valid until
                </p>
                <p className={cn('mt-1 text-[11px] font-medium', expiryTone(selected))}>
                  {formatDate(selected.validUntil)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-[12px] font-semibold text-ink">
                  Product-level status
                </h4>
                <span className="text-[10px] text-ink-3">
                  A company certificate does not automatically cover every product.
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left">
                  <thead className="bg-sand/50 text-[9px] uppercase tracking-[0.12em] text-ink-3">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Unit</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.products
                      .filter((product) => product.supplierId === selected.id)
                      .map((product) => (
                        <tr key={product.id} className="border-t border-line-soft bg-paper">
                          <td className="px-3 py-2 text-[11.5px] text-ink">{product.name}</td>
                          <td className="px-3 py-2 text-[10.5px] text-ink-3">{product.unit}</td>
                          <td className="px-3 py-2 font-mono text-[10.5px] text-ink">
                            RM {product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge status={product.halalStatus} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selected.status === 'expired' && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft/60 p-3 text-[11.5px] leading-relaxed text-ink-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                This supplier’s certificate has lapsed. Purchases will be recorded
                but will not count toward your verified sourcing score.
              </div>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-line bg-sand/40 p-3 text-[10.5px] leading-relaxed text-ink-3">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
              Certificate details are illustrative demo data. In production this
              panel would query JAKIM’s public halal directory and the supplier’s
              own certificate record.
            </div>
          </div>
        )}
      </Modal>

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        defaultSupplierId={purchaseSupplier}
      />

      <div className="mt-6 flex items-center justify-center gap-2 text-[10.5px] text-ink-3">
        <Check className="h-3.5 w-3.5" />
        {state.suppliers.length} suppliers in the pilot network · status reviewed
        at every purchase
        <ArrowUpRight className="h-3 w-3" />
      </div>
    </>
  );
};
