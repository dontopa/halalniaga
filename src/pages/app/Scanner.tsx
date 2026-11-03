import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  History,
  PackageSearch,
  ReceiptText,
  ScanBarcode,
  ShieldCheck,
  ShoppingBasket,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
} from '@/components/ui';
import { StatusBadge } from '@/components/badges';
import { PurchaseModal } from '@/components/app/PurchaseModal';
import { PageHeader } from '@/components/app/shared';
import { formatDate } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import type { Product } from '@/domain/types';
import { cn } from '@/lib/cn';

interface ScanEntry {
  barcode: string;
  productId: string | null;
  at: string;
}

const advice: Record<Product['halalStatus'], { title: string; body: string }> = {
  certified: {
    title: 'Certified product',
    body: 'This product is covered by a valid halal certificate. File the receipt with your purchase record and check the certificate scope again at renewal.',
  },
  verified: {
    title: 'Verified source',
    body: 'The supplier is verified by the programme. Confirm that the certificate scope covers the exact product you bought, not only the supplier company.',
  },
  pending: {
    title: 'Verification pending',
    body: 'This product is not yet verified. Treat the ingredient as unconfirmed until the supplier provides a certificate or a programme-verified source record.',
  },
  expired: {
    title: 'Certificate lapsed',
    body: 'The certificate covering this product has expired. Do not count it as a verified source, and pause purchases until a renewal is recorded.',
  },
};

export const Scanner = () => {
  const { state } = useApp();
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<Product | null | undefined>(undefined);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const samples = useMemo(
    () =>
      state.products.filter((product) =>
        [
          'prd-chicken-whole',
          'prd-chilli-sauce',
          'prd-frozen-prawn',
          'prd-sandakan-pepper',
        ].includes(product.id),
      ),
    [state.products],
  );

  const supplier = result
    ? state.suppliers.find((item) => item.id === result.supplierId)
    : null;
  const resultAdvice = result ? advice[result.halalStatus] : null;

  const runScan = (value: string) => {
    const code = value.trim();
    if (!code) return;
    const match = state.products.find((product) => product.barcode === code);
    setResult(match ?? null);
    setBarcode(code);
    setHistory((current) =>
      [
        {
          barcode: code,
          productId: match?.id ?? null,
          at: new Date().toISOString(),
        },
        ...current.filter((entry) => entry.barcode !== code),
      ].slice(0, 6),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Tool · Halal ingredient scanner"
        title="Check the label before it reaches the pot."
        description="Scan or enter a product barcode to see what the programme record says about the product, its supplier and the certificate behind it."
        actions={<Badge tone="neutral">Demo scan · no camera access</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative bg-forest-950 px-5 py-6">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.06] pattern-geo"
              />
              <div className="relative mx-auto max-w-[300px]">
                <div className="flex items-center justify-between text-ivory/60">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                    Camera · simulated
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                    Ready
                  </span>
                </div>
                <div className="relative mt-3 h-[220px] overflow-hidden rounded-2xl border border-ivory/15 bg-forest-900/70">
                  <div className="absolute inset-0 opacity-20 pattern-geo" />
                  <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-gold-300/70" />
                  <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-gold-300/70" />
                  <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-gold-300/70" />
                  <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-gold-300/70" />
                  <div className="scanner-line absolute left-6 right-6 top-3 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-[0_0_12px_rgba(216,174,98,0.6)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <ScanBarcode className="h-10 w-10 text-ivory/25" />
                    <p className="mt-3 text-[11px] text-ivory/40">
                      Point the camera at a barcode
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-ivory/25">
                      or type the number below
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="space-y-3 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                runScan(barcode);
              }}
            >
              <Field
                label="Barcode number"
                htmlFor="barcode-input"
                hint="Try one of the sample products below."
              >
                <div className="flex gap-2">
                  <Input
                    id="barcode-input"
                    value={barcode}
                    onChange={(event) => setBarcode(event.target.value)}
                    placeholder="e.g. 9551001000017"
                    inputMode="numeric"
                    className="font-mono"
                  />
                  <Button type="submit" className="shrink-0" disabled={!barcode.trim()}>
                    <PackageSearch className="h-4 w-4" /> Scan
                  </Button>
                </div>
              </Field>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                  Sample labels
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {samples.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => runScan(product.barcode)}
                      className="cursor-pointer rounded-full border border-line bg-ivory px-2.5 py-1.5 text-[10px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50"
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-sand/40 p-3.5 text-[10px] leading-relaxed text-ink-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
            Barcode checks can confirm the product identity, not the whole supply
            chain. A certified sauce can still be contaminated by a shared utensil.
          </div>
        </div>

        <div className="space-y-4">
          {result === undefined && (
            <Card className="p-4">
              <EmptyState
                icon={<ShoppingBasket className="h-5 w-5" />}
                title="Ready to check a product"
                description="Scan or type a barcode to see the product’s halal status, its supplier and the certificate reference attached to it."
              />
            </Card>
          )}

          {result === null && (
            <Card className="border-warn/25 bg-warn-soft/30 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
                <div>
                  <p className="text-[14px] font-semibold text-ink">
                    Product not found in the programme directory
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
                    An unknown barcode is not evidence that a product is haram —
                    only that its status cannot be confirmed from this record.
                    Check the packaging certificate, ask the supplier, or choose a
                    verified alternative.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setBarcode('')}
                    >
                      Try another code
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {result && supplier && resultAdvice && (
            <>
              <Card className="overflow-hidden">
                <div
                  className={cn(
                    'flex items-start justify-between gap-3 px-5 py-4',
                    result.halalStatus === 'certified' && 'bg-ok-soft',
                    result.halalStatus === 'verified' && 'bg-forest-50',
                    result.halalStatus === 'pending' && 'bg-warn-soft',
                    result.halalStatus === 'expired' && 'bg-danger-soft',
                  )}
                >
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                      Scan result
                    </p>
                    <h3 className="mt-1 font-display text-xl tracking-[-0.02em] text-ink">
                      {result.name}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] text-ink-3">
                      {result.barcode}
                    </p>
                  </div>
                  <StatusBadge status={result.halalStatus} />
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-ivory p-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                        Supplier
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-ink">
                        {supplier.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-3">
                        {supplier.area} · {supplier.distanceKm} km
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-ivory p-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                        Certificate
                      </p>
                      <p className="mt-1 break-all font-mono text-[10px] text-ink">
                        {result.certificateRef ?? 'No certificate on file'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-3">
                        {supplier.validUntil
                          ? `Valid until ${formatDate(supplier.validUntil)}`
                          : 'Pending verification'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-xl border p-4',
                      result.halalStatus === 'expired' || result.halalStatus === 'pending'
                        ? 'border-warn/25 bg-warn-soft/50'
                        : 'border-forest-200 bg-forest-50',
                    )}
                  >
                    <p className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                      {result.halalStatus === 'expired' || result.halalStatus === 'pending' ? (
                        <AlertTriangle className="h-4 w-4 text-warn" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-forest-700" />
                      )}
                      {resultAdvice.title}
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">
                      {resultAdvice.body}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPurchaseOpen(true)}
                    >
                      <ReceiptText className="h-3.5 w-3.5" /> Record purchase
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBarcode('')}
                    >
                      Scan another
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
                  The scanner uses the programme’s product directory. In
                  production it would query JAKIM’s public halal directory and the
                  supplier’s certificate scope.
                </div>
              </Card>
            </>
          )}

          <Card>
            <CardHeader
              title="Recent scans"
              description="This session only."
              action={<History className="h-4 w-4 text-ink-3" />}
            />
            <div className="divide-y divide-line-soft">
              {history.map((entry) => {
                const product = state.products.find(
                  (item) => item.id === entry.productId,
                );
                return (
                  <button
                    key={`${entry.barcode}-${entry.at}`}
                    type="button"
                    onClick={() => runScan(entry.barcode)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-sand/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11.5px] font-medium text-ink">
                        {product?.name ?? 'Unknown product'}
                      </p>
                      <p className="font-mono text-[9px] text-ink-3">
                        {entry.barcode}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {product ? (
                        <StatusBadge status={product.halalStatus} />
                      ) : (
                        <Badge tone="warning">Unknown</Badge>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-ink-3" />
                    </div>
                  </button>
                );
              })}
              {history.length === 0 && (
                <p className="px-4 py-6 text-[11.5px] text-ink-3">
                  No scans yet. Try a sample label.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-ink-3">
        <ScanBarcode className="h-3.5 w-3.5" />
        {state.products.length} products in the demo directory · status shown
        exactly as recorded
      </div>

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        defaultSupplierId={result?.supplierId}
      />
    </>
  );
};
