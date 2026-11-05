import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Camera,
  CheckCircle2,
  CircleDashed,
  FileText,
  PackagePlus,
  ReceiptText,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Modal,
  Progress,
  Select,
} from '@/components/ui';
import { PageHeader, Toast, useToast } from '@/components/app/shared';
import { PurchaseModal } from '@/components/app/PurchaseModal';
import { formatDate } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

export const Purchases = () => {
  const t = useT();
  const { state } = useApp();
  const { toast, show, clear } = useToast();
  const [query, setQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const supplierName = (id: string) =>
    state.suppliers.find((supplier) => supplier.id === id)?.shortName ?? '—';
  const productName = (id: string) =>
    state.products.find((product) => product.id === id)?.name ?? '—';

  const purchases = useMemo(
    () =>
      [...state.purchases]
        .filter((purchase) => {
          const matchesSupplier =
            supplierFilter === 'all' || purchase.supplierId === supplierFilter;
          const text = query.trim().toLowerCase();
          const matchesQuery =
            !text ||
            productName(purchase.productId).toLowerCase().includes(text) ||
            supplierName(purchase.supplierId).toLowerCase().includes(text) ||
            purchase.receiptNo.toLowerCase().includes(text);
          return matchesSupplier && matchesQuery;
        })
        .sort(
          (a, b) =>
            new Date(b.purchasedAt).getTime() -
            new Date(a.purchasedAt).getTime(),
        ),
    // Recompute whenever the underlying records or filters change.
    [state.purchases, state.suppliers, state.products, supplierFilter, query],
  );

  const totalSpend = state.purchases.reduce(
    (sum, purchase) => sum + purchase.amount,
    0,
  );
  const verifiedCount = state.purchases.filter((p) => p.verifiedSource).length;
  const verifiedSpend = state.purchases
    .filter((p) => p.verifiedSource)
    .reduce((sum, purchase) => sum + purchase.amount, 0);
  const withReceipt = state.purchases.filter((p) => p.receiptNo).length;
  const uniqueSuppliers = new Set(state.purchases.map((p) => p.supplierId)).size;

  const supplierTotals = useMemo(() => {
    const map = new Map<string, { total: number; count: number; verified: boolean }>();
    for (const purchase of state.purchases) {
      const supplier = state.suppliers.find((item) => item.id === purchase.supplierId);
      const current = map.get(purchase.supplierId) ?? {
        total: 0,
        count: 0,
        verified: Boolean(
          supplier && (supplier.status === 'certified' || supplier.status === 'verified'),
        ),
      };
      map.set(purchase.supplierId, {
        total: current.total + purchase.amount,
        count: current.count + 1,
        verified: current.verified,
      });
    }
    return [...map.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.total - a.total);
  }, [state.purchases, state.suppliers]);

  const exportCsv = () => {
    const header = [
      t('Date'),
      t('Supplier'),
      t('Product'),
      t('Quantity'),
      t('Unit'),
      t('Receipt'),
      t('Evidence'),
      t('Verified source'),
      t('Amount (MYR)'),
    ];
    const rows = [...state.purchases]
      .sort(
        (a, b) =>
          new Date(b.purchasedAt).getTime() -
          new Date(a.purchasedAt).getTime(),
      )
      .map((purchase) => [
        new Date(purchase.purchasedAt).toISOString().slice(0, 10),
        supplierName(purchase.supplierId),
        t(productName(purchase.productId)),
        purchase.quantity,
        t(purchase.unit),
        purchase.receiptNo,
        purchase.evidencePhoto ? t('Yes') : t('No'),
        purchase.verifiedSource ? t('Yes') : t('No'),
        purchase.amount.toFixed(2),
      ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'halalniaga-purchases.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    show(t('Purchase log exported as CSV.'));
  };

  return (
    <>
      <PageHeader
        eyebrow={t('Module 03 · Purchase tracking')}
        title={t('Every ingredient, with a source.')}
        description={t(
          'A purchase record is only useful if it answers four questions: who supplied it, what it was, how much, and when. This log captures all four.',
        )}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              <ArrowDownToLine className="h-3.5 w-3.5" /> {t('Export CSV')}
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <PackagePlus className="h-3.5 w-3.5" /> {t('Record purchase')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total recorded spend',
            value: `RM ${totalSpend.toFixed(0)}`,
            hint: t('{count} records', { count: state.purchases.length }),
            icon: ReceiptText,
          },
          {
            label: 'Verified-source spend',
            value: `RM ${verifiedSpend.toFixed(0)}`,
            hint: t('{percent}% of total spend', {
              percent: Math.round((verifiedSpend / Math.max(totalSpend, 1)) * 100),
            }),
            icon: ShieldCheck,
          },
          {
            label: 'Traceable purchases',
            value: `${verifiedCount}/${state.purchases.length}`,
            hint: t('{percent}% of records', {
              percent: Math.round((verifiedCount / Math.max(state.purchases.length, 1)) * 100),
            }),
            icon: TrendingUp,
          },
          {
            label: 'Suppliers used',
            value: `${uniqueSuppliers}`,
            hint: t('Across the current menu cycle'),
            icon: Store,
          },
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-start justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                {t(item.label)}
              </p>
              <item.icon className="h-4 w-4 text-forest-700" />
            </div>
            <p className="mt-2 font-display text-[1.7rem] leading-none tracking-[-0.04em] text-ink">
              {item.value}
            </p>
            <p className="mt-2 text-[10.5px] text-ink-3">{item.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Search product, supplier or receipt…')}
                className="pl-10"
                aria-label={t('Search purchases')}
              />
            </div>
            <Select
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
              className="sm:max-w-[220px]"
              aria-label={t('Filter by supplier')}
            >
              <option value="all">{t('All suppliers')}</option>
              {state.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.shortName}
                </option>
              ))}
            </Select>
          </div>
          <Badge tone="neutral">
            {t('{count} records', { count: purchases.length })}
          </Badge>
        </div>

        {purchases.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<ReceiptText className="h-5 w-5" />}
              title={t('No purchases match this filter')}
              description={t('Try clearing the search or choosing another supplier.')}
              action={
                <Button size="sm" onClick={() => { setQuery(''); setSupplierFilter('all'); }}>
                  {t('Clear filters')}
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line-soft bg-sand/30 text-[9px] uppercase tracking-[0.13em] text-ink-3">
                  <th className="px-5 py-3 font-medium">{t('Product')}</th>
                  <th className="px-3 py-3 font-medium">{t('Supplier')}</th>
                  <th className="px-3 py-3 font-medium">{t('Receipt')}</th>
                  <th className="px-3 py-3 font-medium">{t('Evidence')}</th>
                  <th className="px-3 py-3 font-medium">{t('Source')}</th>
                  <th className="px-3 py-3 text-right font-medium">{t('Amount')}</th>
                  <th className="px-5 py-3 text-right font-medium">{t('Date')}</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-line-soft last:border-0 hover:bg-sand/20"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-[12px] font-medium text-ink">
                        {t(productName(purchase.productId))}
                      </p>
                      <p className="font-mono text-[9.5px] text-ink-3">
                        {purchase.quantity} {t(purchase.unit)}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-[11.5px] text-ink-2">
                      {supplierName(purchase.supplierId)}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-[10px] text-ink-3">
                      {purchase.receiptNo}
                    </td>
                    <td className="px-3 py-3.5">
                      {purchase.evidencePhoto ? (
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(purchase.evidencePhoto!)}
                          className="group relative inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-1.5 py-1 text-[9.5px] text-ink-3 hover:border-forest-300 hover:text-forest-800"
                          title={t('View evidence')}
                        >
                          <img
                            src={purchase.evidencePhoto}
                            alt=""
                            className="h-7 w-7 rounded object-cover"
                          />
                          <Camera className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-ink-3">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      {purchase.verifiedSource ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-ok/15 bg-ok-soft px-2 py-0.5 text-[9.5px] text-ok">
                          <CheckCircle2 className="h-3 w-3" /> {t('Verified')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warn/20 bg-warn-soft px-2 py-0.5 text-[9.5px] text-warn">
                          <CircleDashed className="h-3 w-3" /> {t('Unverified')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-[11px] text-ink">
                      RM {purchase.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[10.5px] text-ink-3">
                      {formatDate(purchase.purchasedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t('Source mix')}
            description={t(
              'Where your recorded spend goes, and whether the source is verified.',
            )}
          />
          <div className="p-5">
            <div className="space-y-3">
              {supplierTotals.map((supplier) => (
                <div key={supplier.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
                      {supplierName(supplier.id)}
                      {supplier.verified ? (
                        <ShieldCheck className="h-3 w-3 text-forest-600" />
                      ) : (
                        <CircleDashed className="h-3 w-3 text-warn" />
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-ink-3">
                      RM {supplier.total.toFixed(0)} · {supplier.count}
                    </span>
                  </div>
                  <Progress
                    value={(supplier.total / Math.max(supplierTotals[0]?.total ?? 1, 1)) * 100}
                    tone={supplier.verified ? 'forest' : 'clay'}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t('Record integrity')}
            description={t(
              'The checks a programme officer will make during a visit.',
            )}
          />
          <div className="space-y-2.5 p-5">
            {[
              {
                label: 'Receipt or invoice number on every record',
                value: `${withReceipt}/${state.purchases.length}`,
                ok: withReceipt === state.purchases.length,
              },
              {
                label: 'Supplier linked to each purchase',
                value: `${state.purchases.length}/${state.purchases.length}`,
                ok: true,
              },
              {
                label: 'Verified source for recent purchases',
                value: `${verifiedCount}/${state.purchases.length}`,
                ok: verifiedCount / state.purchases.length >= 0.8,
              },
              {
                label: 'Records within the last 30 days',
                value: `${state.purchases.filter((purchase) => Date.now() - new Date(purchase.purchasedAt).getTime() <= 30 * 86_400_000).length}`,
                ok: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ivory px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-warn" />
                  )}
                  <span className="text-[11px] text-ink-2">{t(item.label)}</span>
                </div>
                <span
                  className={cn(
                    'font-mono text-[10px]',
                    item.ok ? 'text-forest-700' : 'text-warn',
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
            <p className="flex items-start gap-1.5 pt-1 text-[10px] leading-relaxed text-ink-3">
              <FileText className="mt-0.5 h-3 w-3 shrink-0" />
              {t(
                'A missing receipt does not make food non-halal, but it weakens the evidence trail. The log flags gaps before an inspection does.',
              )}
            </p>
          </div>
        </Card>
      </div>

      <PurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Modal
        open={Boolean(photoPreview)}
        onClose={() => setPhotoPreview(null)}
        title={t('Purchase evidence')}
        size="lg"
      >
        {photoPreview && (
          <img
            src={photoPreview}
            alt={t('Purchase evidence')}
            className="w-full rounded-xl border border-line bg-paper object-contain"
          />
        )}
      </Modal>
      <Toast toast={toast} onClose={clear} />
    </>
  );
};
