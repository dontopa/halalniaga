import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ImagePlus,
  PackageCheck,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
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
import { useT } from '@/i18n';
import { fileToCompressedDataUrl } from '@/lib/image';
import { cn } from '@/lib/cn';
import type { Area, SupplierCategory } from '@/domain/types';

const AREAS: Area[] = [
  'Kota Kinabalu',
  'Sandakan',
  'Tawau',
  'Keningau',
  'Lahad Datu',
];

const CATEGORIES: SupplierCategory[] = [
  'Poultry & meat',
  'Seafood',
  'Produce',
  'Dairy & eggs',
  'Dry goods',
  'Sauces & condiments',
];

export const PurchaseModal = ({
  open,
  onClose,
  defaultSupplierId,
}: {
  open: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
}) => {
  const t = useT();
  const { state, addPurchase, addManualPurchase } = useApp();
  const { toast, show, clear } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'directory' | 'manual'>('directory');
  const [supplierId, setSupplierId] = useState(
    defaultSupplierId ?? state.suppliers[0]?.id ?? '',
  );
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [receiptNo, setReceiptNo] = useState('');
  const [halalStampSeen, setHalalStampSeen] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState<string | undefined>();
  const [photoBusy, setPhotoBusy] = useState(false);

  const [manualSupplierName, setManualSupplierName] = useState('');
  const [manualArea, setManualArea] = useState<Area>('Kota Kinabalu');
  const [manualAddress, setManualAddress] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [manualCategory, setManualCategory] =
    useState<SupplierCategory>('Poultry & meat');
  const [manualUnit, setManualUnit] = useState('kg');
  const [manualPrice, setManualPrice] = useState('');

  const products = useMemo(
    () => state.products.filter((product) => product.supplierId === supplierId),
    [state.products, supplierId],
  );
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  const product = state.products.find((item) => item.id === productId);
  const verified =
    supplier?.status === 'certified' || supplier?.status === 'verified';

  const quantityValue = Number(quantity);
  const manualPriceValue = Number(manualPrice);
  const amount =
    mode === 'manual'
      ? Number.isFinite(manualPriceValue)
        ? manualPriceValue * Math.max(quantityValue || 0, 0)
        : 0
      : product
        ? product.price * Math.max(quantityValue || 0, 0)
        : 0;

  const manualReady =
    manualSupplierName.trim().length > 0 &&
    manualProductName.trim().length > 0 &&
    Number.isFinite(manualPriceValue) &&
    manualPriceValue >= 0 &&
    Number.isFinite(quantityValue) &&
    quantityValue > 0;

  const ready =
    Number.isFinite(quantityValue) &&
    quantityValue > 0 &&
    (mode === 'manual' ? manualReady : Boolean(supplierId && productId));

  useEffect(() => {
    if (!open) return;
    const nextSupplier = defaultSupplierId ?? state.suppliers[0]?.id ?? '';
    setMode('directory');
    setSupplierId(nextSupplier);
    setProductId(
      state.products.find((p) => p.supplierId === nextSupplier)?.id ?? '',
    );
    setQuantity('1');
    setReceiptNo('');
    setHalalStampSeen(false);
    setEvidencePhoto(undefined);
    setManualSupplierName('');
    setManualArea('Kota Kinabalu');
    setManualAddress('');
    setManualProductName('');
    setManualCategory('Poultry & meat');
    setManualUnit('kg');
    setManualPrice('');
  }, [open, defaultSupplierId, state.products, state.suppliers]);

  useEffect(() => {
    if (!products.some((p) => p.id === productId)) {
      setProductId(products[0]?.id ?? '');
    }
  }, [products, productId]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      setEvidencePhoto(await fileToCompressedDataUrl(file));
    } catch {
      show(t('Could not read that photo. Try a JPG or PNG.'), 'warning');
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;

    if (mode === 'manual') {
      addManualPurchase({
        supplierName: manualSupplierName,
        area: manualArea,
        address: manualAddress,
        productName: manualProductName,
        category: manualCategory,
        unit: manualUnit.trim() || 'unit',
        price: manualPriceValue,
        quantity: quantityValue,
        receiptNo,
        evidencePhoto,
        halalStampSeen,
      });
      show(
        t('New supplier recorded — waiting for programme review.'),
        'info',
      );
    } else {
      addPurchase({
        supplierId,
        productId,
        quantity: quantityValue,
        receiptNo,
        evidencePhoto,
        halalStampSeen,
      });
      show(
        verified
          ? t('{product} recorded from {supplier}. Source verified.', {
              product: product?.name ?? t('Purchase'),
              supplier: supplier?.shortName ?? '',
            })
          : t(
              '{product} recorded — this supplier is not verified, so it will not earn sourcing credit.',
              { product: product?.name ?? t('Purchase') },
            ),
        verified ? 'success' : 'warning',
      );
    }
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="lg"
        title={t('Record a purchase')}
        description={t(
          'Every record adds a traceable link between your stall and the source of the ingredient.',
        )}
        footer={
          <>
            <Button variant="ghost" onClick={onClose} type="button">
              {t('Cancel')}
            </Button>
            <Button type="submit" form="purchase-form" disabled={!ready}>
              <PackageCheck className="h-4 w-4" />
              {mode === 'manual'
                ? t('Save supplier and purchase')
                : t('Save purchase')}
            </Button>
          </>
        }
      >
        <form id="purchase-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-sand/40 p-1">
            {(
              [
                { value: 'directory', label: 'From the directory', icon: Store },
                { value: 'manual', label: 'Key in a new supplier', icon: ImagePlus },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11.5px] font-medium transition-colors',
                  mode === option.value
                    ? 'bg-ivory text-forest-900 shadow-sm'
                    : 'text-ink-3 hover:text-ink',
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {t(option.label)}
              </button>
            ))}
          </div>

          {mode === 'directory' ? (
            <>
              <Field label={t('Supplier')} htmlFor="purchase-supplier">
                <Select
                  id="purchase-supplier"
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                >
                  {state.suppliers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.status === 'certified' ? t('Certified') : item.status === 'verified' ? t('Verified') : item.status === 'pending' ? t('Pending') : t('Lapsed')}
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
                        ? t(
                            'Certificate valid until {date}. This purchase will count toward verified sourcing.',
                            { date: formatDate(supplier.validUntil) },
                          )
                        : t(
                            'This supplier is not currently verified. The purchase will be logged, but it will not count toward your sourcing score.',
                          )}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Product')} htmlFor="purchase-product">
                  <Select
                    id="purchase-product"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                  >
                    {products.length === 0 && (
                      <option value="">{t('No products listed')}</option>
                    )}
                    {products.map((item) => (
                      <option key={item.id} value={item.id}>
                        {t(item.name)} · RM {item.price.toFixed(2)}/{item.unit}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label={t('Quantity')}
                  htmlFor="purchase-quantity"
                  hint={
                    product
                      ? t('Unit: {unit}', { unit: product.unit })
                      : undefined
                  }
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
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-gold-500/30 bg-gold-100/40 p-3 text-[11.5px] leading-relaxed text-ink-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                {t(
                  'Use this when the shop is not in the directory. A photo of the invoice or the halal stamp helps the programme review it.',
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Supplier name')} htmlFor="manual-supplier">
                  <Input
                    id="manual-supplier"
                    value={manualSupplierName}
                    onChange={(event) => setManualSupplierName(event.target.value)}
                    placeholder={t('e.g. Kedai Ayam Acen')}
                  />
                </Field>
                <Field label={t('Area')} htmlFor="manual-area">
                  <Select
                    id="manual-area"
                    value={manualArea}
                    onChange={(event) => setManualArea(event.target.value as Area)}
                  >
                    {AREAS.map((area) => (
                      <option key={area} value={area}>
                        {t(area)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                label={t('Address (optional)')}
                htmlFor="manual-address"
              >
                <Input
                  id="manual-address"
                  value={manualAddress}
                  onChange={(event) => setManualAddress(event.target.value)}
                  placeholder={t('Shop or market stall')}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Product name')} htmlFor="manual-product">
                  <Input
                    id="manual-product"
                    value={manualProductName}
                    onChange={(event) => setManualProductName(event.target.value)}
                    placeholder={t('e.g. Fresh chicken')}
                  />
                </Field>
                <Field label={t('Category')} htmlFor="manual-category">
                  <Select
                    id="manual-category"
                    value={manualCategory}
                    onChange={(event) =>
                      setManualCategory(event.target.value as SupplierCategory)
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(category)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t('Unit')} htmlFor="manual-unit">
                  <Input
                    id="manual-unit"
                    value={manualUnit}
                    onChange={(event) => setManualUnit(event.target.value)}
                    placeholder={t('kg')}
                  />
                </Field>
                <Field label={t('Price per unit (RM)')} htmlFor="manual-price">
                  <Input
                    id="manual-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualPrice}
                    onChange={(event) => setManualPrice(event.target.value)}
                    placeholder="0.00"
                  />
                </Field>
                <Field label={t('Quantity')} htmlFor="manual-quantity">
                  <Input
                    id="manual-quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          <Field
            label={t('Receipt / invoice number')}
            htmlFor="purchase-receipt"
            hint={t(
              'Optional. A receipt number makes the record easier to verify during inspection.',
            )}
          >
            <Input
              id="purchase-receipt"
              placeholder={t('e.g. INV-2026-0421')}
              value={receiptNo}
              onChange={(event) => setReceiptNo(event.target.value)}
            />
          </Field>

          <Field
            label={t('Invoice or halal-stamp photo (optional)')}
            hint={t(
              'Stored on this device and visible on your public record for monitoring.',
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => void handlePhoto(event.target.files?.[0])}
            />
            {evidencePhoto ? (
              <div className="relative overflow-hidden rounded-xl border border-line bg-paper">
                <img
                  src={evidencePhoto}
                  alt={t('Purchase evidence preview')}
                  className="max-h-44 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setEvidencePhoto(undefined)}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-ivory"
                  aria-label={t('Remove photo')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {photoBusy ? t('Compressing photo…') : t('Add photo')}
              </Button>
            )}
          </Field>

          <label className="flex items-start gap-2.5 rounded-xl border border-line bg-paper p-3 text-[11.5px] leading-relaxed text-ink-2">
            <input
              type="checkbox"
              checked={halalStampSeen}
              onChange={(event) => setHalalStampSeen(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-forest-700"
            />
            <span>
              <span className="font-semibold text-ink">
                {t('Halal stamp on the packaging')}
              </span>
              <span className="block text-ink-3">
                {t(
                  'Tick this if the packaging carries a halal stamp. The programme still reviews the supplier before it counts as verified.',
                )}
              </span>
            </span>
          </label>

          <div className="rounded-xl border border-line bg-sand/40 p-3.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-ink-3">{t('Estimated total')}</span>
              <span className="font-mono text-[14px] font-medium text-ink">
                RM {amount.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
              <span>{t('Source record')}</span>
              <span
                className={
                  mode === 'manual' || !verified ? 'text-warn' : 'text-forest-700'
                }
              >
                {mode === 'manual'
                  ? t('New supplier · pending review')
                  : verified
                    ? t('Verified supplier')
                    : t('Unverified supplier')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
              <span>{t('Logged by')}</span>
              <span>{state.vendor.owner}</span>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-3">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
            {t(
              'In this prototype the purchase is stored locally in your browser. No payment is processed and no order is sent to the supplier.',
            )}
          </p>
        </form>
      </Modal>
      <Toast toast={toast} onClose={clear} />
    </>
  );
};
