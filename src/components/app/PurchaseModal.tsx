import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, PackageCheck, ShieldCheck } from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
} from '@/components/ui';
import { Toast, useToast } from '@/components/app/shared';
import { StatusBadge } from '@/components/badges';
import { useApp } from '@/domain/store';
import { formatDate } from '@/domain/compliance';
import { cn } from '@/lib/cn';

export const PurchaseModal = ({
  open,
  onClose,
  defaultSupplierId,
}: {
  open: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
}) => {
  const { state, addPurchase } = useApp();
  const { toast, show, clear } = useToast();
  const [supplierId, setSupplierId] = useState(
    defaultSupplierId ?? state.suppliers[0]?.id ?? '',
  );
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [receiptNo, setReceiptNo] = useState('');

  const products = useMemo(
    () => state.products.filter((product) => product.supplierId === supplierId),
    [state.products, supplierId],
  );
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  const product = state.products.find((item) => item.id === productId);
  const amount = product ? product.price * Math.max(Number(quantity) || 0, 0) : 0;
  const verified =
    supplier?.status === 'certified' || supplier?.status === 'verified';

  useEffect(() => {
    if (!open) return;
    const nextSupplier = defaultSupplierId ?? state.suppliers[0]?.id ?? '';
    setSupplierId(nextSupplier);
    setProductId(
      state.products.find((p) => p.supplierId === nextSupplier)?.id ?? '',
    );
    setQuantity('1');
    setReceiptNo('');
  }, [open, defaultSupplierId, state.products, state.suppliers]);

  useEffect(() => {
    if (!products.some((p) => p.id === productId)) {
      setProductId(products[0]?.id ?? '');
    }
  }, [products, productId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supplierId || !productId) return;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    addPurchase({ supplierId, productId, quantity: qty, receiptNo });
    show(
      verified
        ? `${product?.name ?? 'Purchase'} recorded from ${supplier?.shortName}. Source verified.`
        : `${product?.name ?? 'Purchase'} recorded — this supplier is not verified, so it will not earn sourcing credit.`,
      verified ? 'success' : 'warning',
    );
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Record a purchase"
        description="Every record adds a traceable link between your stall and the source of the ingredient."
        footer={
          <>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              form="purchase-form"
              disabled={!productId || Number(quantity) <= 0}
            >
              <PackageCheck className="h-4 w-4" />
              Save purchase
            </Button>
          </>
        }
      >
        <form id="purchase-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Supplier" htmlFor="purchase-supplier">
            <Select
              id="purchase-supplier"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              {state.suppliers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.status === 'certified' ? 'Certified' : item.status === 'verified' ? 'Verified' : item.status === 'pending' ? 'Pending' : 'Lapsed'}
                </option>
              ))}
            </Select>
          </Field>

          {supplier && (
            <div
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3',
                verified
                  ? 'border-forest-200 bg-forest-50'
                  : 'border-warn/25 bg-warn-soft/70',
              )}
            >
              {verified ? (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              )}
              <div className="min-w-0 text-[11.5px] leading-relaxed text-ink-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={supplier.status} />
                  {supplier.certificateNo && (
                    <span className="font-mono text-[9.5px] text-ink-3">
                      {supplier.certificateNo}
                    </span>
                  )}
                </div>
                <p className="mt-1.5">
                  {verified
                    ? `Certificate valid until ${formatDate(supplier.validUntil)}. This purchase will count toward verified sourcing.`
                    : 'This supplier is not currently verified. The purchase will be logged, but it will not count toward your sourcing score.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product" htmlFor="purchase-product">
              <Select
                id="purchase-product"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {products.length === 0 && <option value="">No products listed</option>}
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · RM {item.price.toFixed(2)}/{item.unit}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Quantity"
              htmlFor="purchase-quantity"
              hint={product ? `Unit: ${product.unit}` : undefined}
            >
              <Input
                id="purchase-quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Receipt / invoice number"
            htmlFor="purchase-receipt"
            hint="Optional. A receipt number makes the record easier to verify during inspection."
          >
            <Input
              id="purchase-receipt"
              placeholder="e.g. INV-2026-0421"
              value={receiptNo}
              onChange={(event) => setReceiptNo(event.target.value)}
            />
          </Field>

          <div className="rounded-xl border border-line bg-sand/40 p-3.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-3">Estimated total</span>
              <span className="font-mono text-[14px] font-medium text-ink">
                RM {amount.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
              <span>Source record</span>
              <span className={verified ? 'text-forest-700' : 'text-warn'}>
                {verified ? 'Verified supplier' : 'Unverified supplier'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
              <span>Logged by</span>
              <span>{state.vendor.owner}</span>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-3">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
            In this prototype the purchase is stored locally in your browser. No
            payment is processed and no order is sent to the supplier.
          </p>
        </form>
      </Modal>
      <Toast toast={toast} onClose={clear} />
    </>
  );
};
