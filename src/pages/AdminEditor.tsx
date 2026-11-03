import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import vendorSeed from '@/content/vendor.json';
import suppliersSeed from '@/content/suppliers.json';
import productsSeed from '@/content/products.json';
import siteSeed from '@/content/site.json';
import { useT } from '@/i18n';
import { LanguageToggle } from '@/i18n/LanguageToggle';
import { cn } from '@/lib/cn';

const API = 'https://halalniaga-admin.wm-mustaffa.workers.dev';
const RAW = 'https://raw.githubusercontent.com/dontopa/halalniaga/main/src/content';
const PIN_KEY = 'halalniaga.admin.pin';
const GUIDE_URL =
  'https://github.com/dontopa/halalniaga/blob/main/docs/CONTENT-GUIDE.md';

type Tab = 'vendor' | 'suppliers' | 'products' | 'landing';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'vendor', label: 'Vendor' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'products', label: 'Products' },
  { id: 'landing', label: 'Landing' },
];

const field = (
  label: string,
  value: string | number,
  onChange: (value: string) => void,
  options?: { type?: string; hint?: string; className?: string },
) => (
  <Field label={label} hint={options?.hint} className={options?.className}>
    <Input
      aria-label={label}
      type={options?.type ?? 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </Field>
);

const asList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const AdminEditor = () => {
  const t = useT();
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_KEY) ?? '');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(Boolean(pin));
  const [tab, setTab] = useState<Tab>('vendor');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [vendor, setVendor] = useState<any>(vendorSeed);
  const [suppliers, setSuppliers] = useState<any[]>(
    suppliersSeed as unknown as any[],
  );
  const [products, setProducts] = useState<any[]>(
    productsSeed as unknown as any[],
  );
  const [site, setSite] = useState<any>(siteSeed);
  const [siteDraft, setSiteDraft] = useState(JSON.stringify(siteSeed, null, 2));

  const verify = async (value: string) => {
    const response = await fetch(`${API}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: value }),
    });
    return response.ok;
  };

  const loadLatest = async () => {
    try {
      const [latestSite, latestVendor, latestSuppliers, latestProducts] =
        await Promise.all(
          ['site', 'vendor', 'suppliers', 'products'].map(async (file) => {
            const response = await fetch(`${RAW}/${file}.json?t=${Date.now()}`);
            if (!response.ok) throw new Error('fetch failed');
            return response.json();
          }),
        );
      setSite(latestSite);
      setSiteDraft(JSON.stringify(latestSite, null, 2));
      setVendor(latestVendor);
      setSuppliers(latestSuppliers);
      setProducts(latestProducts);
    } catch {
      // Bundled content is the safe fallback.
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(PIN_KEY);
    if (!stored) {
      setChecking(false);
      return;
    }
    verify(stored)
      .then((ok) => {
        if (ok) {
          setAuthed(true);
          void loadLatest();
        } else {
          sessionStorage.removeItem(PIN_KEY);
          setPin('');
          setError(t('PIN expired. Please sign in again.'));
        }
      })
      .catch(() => setError('Tidak dapat menghubungi server admin.'))
      .finally(() => setChecking(false));
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setChecking(true);
    try {
      if (await verify(pin)) {
        sessionStorage.setItem(PIN_KEY, pin);
        setAuthed(true);
        await loadLatest();
      } else {
        setError(t('Invalid PIN.'));
      }
    } catch {
      setError('Tidak dapat menghubungi server admin.');
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(PIN_KEY);
    setPin('');
    setAuthed(false);
    setMessage('');
    setError('');
  };

  const save = async (file: string, content: unknown) => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, file, content }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? t('Could not save. Please try again.'));
      }
      setMessage(
        t(
          'Saved. GitHub Actions will deploy in 1–2 minutes. Refresh the site after that.',
        ),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t('Could not save. Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (patch: Record<string, unknown>) => {
    const next = { ...site, hero: { ...site.hero, ...patch } };
    setSite(next);
    setSiteDraft(JSON.stringify(next, null, 2));
  };

  const saveLanding = () => {
    try {
      const parsed = JSON.parse(siteDraft);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(t('JSON must be an object.'));
      }
      setSite(parsed);
      void save('site', parsed);
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? t('Invalid JSON: {message}', { message: parseError.message })
          : t('Invalid JSON.'),
      );
    }
  };

  const updateSupplier = (index: number, patch: Record<string, unknown>) => {
    setSuppliers((current) =>
      current.map((supplier, itemIndex) =>
        itemIndex === index ? { ...supplier, ...patch } : supplier,
      ),
    );
  };

  const updateProduct = (index: number, patch: Record<string, unknown>) => {
    setProducts((current) =>
      current.map((product, itemIndex) =>
        itemIndex === index ? { ...product, ...patch } : product,
      ),
    );
  };

  if (checking && !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
          {t('Checking access…')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line bg-ivory/90">
        <div className="mx-auto flex h-[68px] max-w-[1100px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" aria-label={t('HALALNiaga home')}>
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle showIcon={false} />
            {authed ? (
              <>
                <Badge tone="forest" dot>
                  {t('Admin')}
                </Badge>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] text-ink-2 transition-colors hover:border-forest-200"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t('Sign out')}
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="text-[11.5px] text-ink-3 hover:text-forest-700"
              >
                {t('Back to website')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
        {!authed ? (
          <div className="mx-auto mt-10 max-w-md">
            <Badge tone="gold" dot>
              {t('Admin access')}
            </Badge>
            <h1 className="mt-4 font-display text-[2.2rem] leading-tight tracking-[-0.03em] text-ink">
              {t('Enter the admin PIN.')}
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
              {t(
                'This PIN is issued by the project owner. After signing in, you can edit the vendor, suppliers, products and landing content.',
              )}
            </p>
            <form onSubmit={login} className="mt-6 space-y-4">
              <Field label={t('Admin PIN')}>
                <Input
                  type="password"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="HN-XXXX-XXXX"
                  autoComplete="off"
                  autoFocus
                />
              </Field>
              {error && (
                <p className="rounded-xl border border-danger/20 bg-danger-soft px-3 py-2 text-[11px] text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={!pin}>
                <ShieldCheck className="h-4 w-4" /> {t('Sign in')}
              </Button>
            </form>
            <p className="mt-4 text-[10px] leading-relaxed text-ink-3">
              {t(
                'This page is restricted to authorised people. Changes are committed to GitHub and deployed by GitHub Actions.',
              )}
            </p>
            <a
              href={GUIDE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[10.5px] text-forest-700 hover:underline"
            >
              {t('Content guide')} <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <Badge tone="forest" dot>
                  {t('Content editor')}
                </Badge>
                <h1 className="mt-3 font-display text-[2rem] leading-tight tracking-[-0.03em] text-ink">
                  {t('Edit live content.')}
                </h1>
                <p className="mt-1.5 text-[12px] text-ink-3">
                  {t('Save → commit to GitHub → automatic deploy in 1–2 minutes.')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void loadLatest()}
              >
                <RefreshCw className="h-3.5 w-3.5" /> {t('Reload')}
              </Button>
            </div>

            {message && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-forest-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-[11.5px] leading-relaxed text-danger">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-1.5 border-b border-line pb-3">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setMessage('');
                    setError('');
                  }}
                  className={cn(
                    'cursor-pointer rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-colors',
                    tab === item.id
                      ? 'bg-forest-800 text-ivory'
                      : 'text-ink-2 hover:bg-sand',
                  )}
                >
                  {t(item.label)}
                </button>
              ))}
            </div>

            {tab === 'vendor' && (
              <Card className="mt-4">
                <CardHeader
                  title={t('Vendor profile')}
                  description={t('Name, location, tagline and the public QR record.')}
                />
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  {field('Stall name', vendor.name ?? '', (value) =>
                    setVendor({ ...vendor, name: value }),
                  )}
                  {field('Owner name', vendor.owner ?? '', (value) =>
                    setVendor({ ...vendor, owner: value }),
                  )}
                  {field('Stall location', vendor.stall ?? '', (value) =>
                    setVendor({ ...vendor, stall: value }),
                  )}
                  <Field label={t('Area')}>
                    <Select
                      aria-label={t('Area')}
                      value={vendor.area ?? 'Kota Kinabalu'}
                      onChange={(event) =>
                        setVendor({ ...vendor, area: event.target.value })
                      }
                    >
                      {[
                        'Kota Kinabalu',
                        'Sandakan',
                        'Tawau',
                        'Keningau',
                        'Lahad Datu',
                      ].map((area) => (
                        <option key={area}>{area}</option>
                      ))}
                    </Select>
                  </Field>
                  {field('Food category', vendor.category ?? '', (value) =>
                    setVendor({ ...vendor, category: value }),
                  )}
                  {field('Phone', vendor.phone ?? '', (value) =>
                    setVendor({ ...vendor, phone: value }),
                  )}
                  {field('Tagline', vendor.tagline ?? '', (value) =>
                    setVendor({ ...vendor, tagline: value }),
                  )}
                  {field('QR slug', vendor.qrSlug ?? '', (value) =>
                    setVendor({ ...vendor, qrSlug: value }),
                  )}
                  {field(
                    'Cover image (path/URL)',
                    vendor.coverImage ?? '',
                    (value) => setVendor({ ...vendor, coverImage: value }),
                  )}
                  {field(
                    'Joined (days ago)',
                    vendor.joinedDaysAgo ?? 0,
                    (value) =>
                      setVendor({
                        ...vendor,
                        joinedDaysAgo: Number(value) || 0,
                      }),
                    { type: 'number' },
                  )}
                </div>
                <div className="flex justify-end border-t border-line-soft px-5 py-4">
                  <Button
                    onClick={() => void save('vendor', vendor)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" /> {t('Save vendor')}
                  </Button>
                </div>
              </Card>
            )}

            {tab === 'suppliers' && (
              <Card className="mt-4">
                <CardHeader
                  title={t('Suppliers')}
                  description={t('Edit supplier details. Keep the existing IDs.')}
                  action={<Badge tone="neutral">{suppliers.length}</Badge>}
                />
                <div className="space-y-2 p-4">
                  {suppliers.map((supplier, index) => (
                    <details
                      key={supplier.id}
                      className="rounded-xl border border-line bg-paper"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 text-[12px] font-medium text-ink">
                        {supplier.name}{' '}
                        <span className="ml-1 font-mono text-[9px] text-ink-3">
                          {supplier.status}
                        </span>
                      </summary>
                      <div className="grid gap-3 border-t border-line-soft p-4 sm:grid-cols-2">
                        {field('Name', supplier.name ?? '', (value) =>
                          updateSupplier(index, { name: value }),
                        )}
                        {field('Short name', supplier.shortName ?? '', (value) =>
                          updateSupplier(index, { shortName: value }),
                        )}
                        <Field label={t('Area')}>
                          <Select
                            aria-label={t('Area')}
                            value={supplier.area}
                            onChange={(event) =>
                              updateSupplier(index, {
                                area: event.target.value,
                              })
                            }
                          >
                            {[
                              'Kota Kinabalu',
                              'Sandakan',
                              'Tawau',
                              'Keningau',
                              'Lahad Datu',
                            ].map((area) => (
                              <option key={area}>{area}</option>
                            ))}
                          </Select>
                        </Field>
                        <Field label={t('Certificate status')}>
                          <Select
                            aria-label={t('Certificate status')}
                            value={supplier.status}
                            onChange={(event) =>
                              updateSupplier(index, {
                                status: event.target.value,
                              })
                            }
                          >
                            <option value="certified">{t('Certified')}</option>
                            <option value="verified">{t('Verified')}</option>
                            <option value="pending">{t('Pending')}</option>
                            <option value="expired">{t('Lapsed')}</option>
                          </Select>
                        </Field>
                        {field('Certificate no.', supplier.certificateNo ?? '', (value) =>
                          updateSupplier(index, {
                            certificateNo: value || null,
                          }),
                        )}
                        {field(
                          'Valid for (days from today)',
                          supplier.validInDays ?? 0,
                          (value) =>
                            updateSupplier(index, {
                              validInDays: Number(value) || 0,
                            }),
                          { type: 'number' },
                        )}
                        {field('Distance (km)', supplier.distanceKm ?? 0, (value) =>
                          updateSupplier(index, {
                            distanceKm: Number(value) || 0,
                          }),
                          { type: 'number' },
                        )}
                        {field(
                          'Categories (comma separated)',
                          (supplier.categories ?? []).join(', '),
                          (value) =>
                            updateSupplier(index, {
                              categories: asList(value),
                            }),
                        )}
                        {field(
                          'Tags (comma separated)',
                          (supplier.tags ?? []).join(', '),
                          (value) =>
                            updateSupplier(index, { tags: asList(value) }),
                        )}
                        {field('Thumbnail (path/URL)', supplier.image ?? '', (value) =>
                          updateSupplier(index, { image: value }),
                        )}
                      </div>
                    </details>
                  ))}
                </div>
                <div className="flex justify-end border-t border-line-soft px-5 py-4">
                  <Button
                    onClick={() => void save('suppliers', suppliers)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" /> {t('Save suppliers')}
                  </Button>
                </div>
              </Card>
            )}

            {tab === 'products' && (
              <Card className="mt-4">
                <CardHeader
                  title={t('Products')}
                  description={t('Price, unit and halal status at product level.')}
                  action={<Badge tone="neutral">{products.length}</Badge>}
                />
                <div className="space-y-2 p-4">
                  {products.map((product, index) => (
                    <details
                      key={product.id}
                      className="rounded-xl border border-line bg-paper"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 text-[12px] font-medium text-ink">
                        {product.name}{' '}
                        <span className="ml-1 font-mono text-[9px] text-ink-3">
                          RM {Number(product.price ?? 0).toFixed(2)}
                        </span>
                      </summary>
                      <div className="grid gap-3 border-t border-line-soft p-4 sm:grid-cols-2">
                        {field('Product name', product.name ?? '', (value) =>
                          updateProduct(index, { name: value }),
                        )}
                        <Field label={t('Supplier')}>
                          <Select
                            aria-label={t('Supplier')}
                            value={product.supplierId}
                            onChange={(event) =>
                              updateProduct(index, {
                                supplierId: event.target.value,
                              })
                            }
                          >
                            {suppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.shortName ?? supplier.name}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        {field('Price (RM)', product.price ?? 0, (value) =>
                          updateProduct(index, { price: Number(value) || 0 }),
                          { type: 'number' },
                        )}
                        {field('Unit', product.unit ?? '', (value) =>
                          updateProduct(index, { unit: value }),
                        )}
                        <Field label={t('Halal status')}>
                          <Select
                            aria-label={t('Halal status')}
                            value={product.halalStatus}
                            onChange={(event) =>
                              updateProduct(index, {
                                halalStatus: event.target.value,
                              })
                            }
                          >
                            <option value="certified">{t('Certified')}</option>
                            <option value="verified">{t('Verified')}</option>
                            <option value="pending">{t('Pending')}</option>
                            <option value="expired">{t('Lapsed')}</option>
                          </Select>
                        </Field>
                        {field('Category', product.category ?? '', (value) =>
                          updateProduct(index, { category: value }),
                        )}
                        {field('Barcode', product.barcode ?? '', (value) =>
                          updateProduct(index, { barcode: value }),
                        )}
                      </div>
                    </details>
                  ))}
                </div>
                <div className="flex justify-end border-t border-line-soft px-5 py-4">
                  <Button
                    onClick={() => void save('products', products)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" /> {t('Save products')}
                  </Button>
                </div>
              </Card>
            )}

            {tab === 'landing' && (
              <div className="mt-4 space-y-4">
                <Card>
                  <CardHeader
                    title={t('Landing hero')}
                    description={t('The main text visitors see first.')}
                  />
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    {field(t('Eyebrow'), site.hero?.eyebrow ?? '', (value) =>
                      updateHero({ eyebrow: value }),
                    )}
                    {field(
                      t('Italic ending'),
                      site.hero?.titleEmphasis ?? '',
                      (value) => updateHero({ titleEmphasis: value }),
                    )}
                    <Field
                      label={t('Title lines (one per line)')}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        aria-label={t('Title lines')}
                        value={(site.hero?.titleLines ?? []).join('\n')}
                        onChange={(event) =>
                          updateHero({
                            titleLines: event.target.value.split('\n'),
                          })
                        }
                      />
                    </Field>
                    <Field label={t('Lead paragraph')} className="sm:col-span-2">
                      <Textarea
                        aria-label={t('Lead paragraph')}
                        value={site.hero?.lead ?? ''}
                        onChange={(event) =>
                          updateHero({ lead: event.target.value })
                        }
                      />
                    </Field>
                    {field(t('Primary button'), site.hero?.ctaPrimary ?? '', (value) =>
                      updateHero({ ctaPrimary: value }),
                    )}
                    {field(
                      t('Secondary button'),
                      site.hero?.ctaSecondary ?? '',
                      (value) => updateHero({ ctaSecondary: value }),
                    )}
                    <Field label={t('Disclaimer')} className="sm:col-span-2">
                      <Textarea
                        aria-label={t('Disclaimer')}
                        value={site.hero?.disclaimer ?? ''}
                        onChange={(event) =>
                          updateHero({ disclaimer: event.target.value })
                        }
                      />
                    </Field>
                    {field(
                      t('Chips (comma separated)'),
                      (site.hero?.chips ?? []).join(', '),
                      (value) => updateHero({ chips: asList(value) }),
                      { className: 'sm:col-span-2' },
                    )}
                  </div>
                  <div className="space-y-3 border-t border-line-soft p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                      {t('Hero stats')}
                    </p>
                    {(site.hero?.stats ?? []).map(
                      (stat: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-[100px_1fr] gap-3"
                        >
                          <Input
                            aria-label={t('Stat value')}
                            value={stat.value ?? ''}
                            onChange={(event) => {
                              const stats = [...site.hero.stats];
                              stats[index] = {
                                ...stats[index],
                                value: event.target.value,
                              };
                              updateHero({ stats });
                            }}
                          />
                          <Input
                            aria-label={t('Stat label')}
                            value={stat.label ?? ''}
                            onChange={(event) => {
                              const stats = [...site.hero.stats];
                              stats[index] = {
                                ...stats[index],
                                label: event.target.value,
                              };
                              updateHero({ stats });
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="flex justify-end border-t border-line-soft px-5 py-4">
                    <Button onClick={saveLanding} disabled={saving}>
                      <Save className="h-4 w-4" /> {t('Save landing')}
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title={t('Advanced JSON')}
                    description={t(
                      'For problem cards, modules, steps, tiers and other sections. Do not change the basic structure.',
                    )}
                  />
                  <div className="p-5">
                    <Textarea
                      aria-label={t('Landing JSON')}
                      value={siteDraft}
                      onChange={(event) => setSiteDraft(event.target.value)}
                      className="min-h-[420px] font-mono text-[11px] leading-relaxed"
                      spellCheck={false}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          try {
                            setSiteDraft(
                              JSON.stringify(JSON.parse(siteDraft), null, 2),
                            );
                            setError('');
                          } catch (parseError) {
                            setError(
                              parseError instanceof Error
                                ? t('Invalid JSON: {message}', {
                                    message: parseError.message,
                                  })
                                : t('Invalid JSON.'),
                            );
                          }
                        }}
                      >
                        {t('Format JSON')}
                      </Button>
                      <Button size="sm" onClick={saveLanding} disabled={saving}>
                        <Save className="h-4 w-4" /> {t('Save JSON')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <p className="mt-6 flex items-start gap-2 text-[10px] leading-relaxed text-ink-3">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
              {t(
                'Changes are saved to the GitHub repository and deployed by GitHub Actions. If a deploy fails, contact the project owner — do not edit code or tokens.',
              )}
            </p>
          </>
        )}
      </main>
    </div>
  );
};
