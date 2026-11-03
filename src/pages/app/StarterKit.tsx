import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Download,
  Droplets,
  PackageOpen,
  Printer,
  QrCode,
  Scissors,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Utensils,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { LogoMark } from '@/components/Logo';
import { PageHeader } from '@/components/app/shared';
import { Badge, Button, Card, CardHeader } from '@/components/ui';
import { useApp } from '@/domain/store';
import { cn } from '@/lib/cn';

const handlingSteps = [
  {
    title: 'Buy from a verified source',
    body: 'Check the supplier and product status before you pay. A company certificate does not automatically cover every product.',
    icon: ShieldCheck,
  },
  {
    title: 'Record the purchase',
    body: 'Supplier, product, quantity and receipt. Four fields turn an ingredient into a traceable record.',
    icon: PackageOpen,
  },
  {
    title: 'Separate raw and cooked',
    body: 'Use a red board for raw meat, blue for seafood, green for produce and white for cooked food. Clean and sanitise between tasks.',
    icon: Utensils,
  },
  {
    title: 'Store covered, labelled and cold',
    body: 'Raw food on the bottom shelf, cooked food above it. Keep chilled food at 4°C or below and label the date opened.',
    icon: Snowflake,
  },
  {
    title: 'Keep the record current',
    body: 'Run the self-assessment every 90 days and book a programme inspection before the 180-day window closes.',
    icon: Check,
  },
];

const storageLabels = [
  'RAW MEAT · CHILLER',
  'RAW POULTRY · CHILLER',
  'SEAFOOD · FREEZER',
  'COOKED · CHILLER',
  'PRODUCE · CHILLER',
  'OPENED · DATE ____',
];

const equipment = [
  {
    colour: 'Red',
    use: 'Raw meat',
    note: 'Board, knife, container',
    className: 'border-clay/40 bg-danger-soft/60 text-clay',
  },
  {
    colour: 'Blue',
    use: 'Seafood',
    note: 'Board, knife, tray',
    className: 'border-info/30 bg-info-soft text-info',
  },
  {
    colour: 'Green',
    use: 'Produce',
    note: 'Board, knife, colander',
    className: 'border-forest-200 bg-forest-50 text-forest-800',
  },
  {
    colour: 'White',
    use: 'Cooked / ready-to-eat',
    note: 'Board, knife, serving tray',
    className: 'border-line bg-paper text-ink',
  },
];

const checklist = [
  'Hands washed and apron clean before prep.',
  'Raw and cooked food use separate boards and knives.',
  'Boards and knives cleaned and sanitised between tasks.',
  'Chiller at 4°C or below; freezer at -18°C or below.',
  'Raw food stored below cooked food and covered.',
  'Every open container labelled with the date.',
  'Main ingredients traceable to a verified supplier.',
  'Receipts or invoices filed for the last 30 days.',
  'No unknown sauces, stock cubes or flavourings in use.',
  'Waste removed, bin covered and prep area pest-free.',
];

export const StarterKit = () => {
  const { state } = useApp();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const profileUrl = `${window.location.origin}/vendor/${state.vendor.qrSlug}`;

  const downloadQr = () => {
    if (!qrRef.current) return;
    const anchor = document.createElement('a');
    anchor.href = qrRef.current.toDataURL('image/png');
    anchor.download = `halalniaga-qr-${state.vendor.qrSlug}.png`;
    anchor.click();
  };

  return (
    <>
      <div className="mb-5 hidden print:block">
        <div className="flex items-center gap-2">
          <LogoMark className="h-6 w-6 text-forest-800" />
          <span className="font-display text-xl tracking-[-0.02em] text-ink">
            HALALNiaga starter kit
          </span>
        </div>
        <p className="mt-1 text-[10px] text-ink-3">
          {state.vendor.name} · {state.vendor.stall} · Printed{' '}
          {new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="print:hidden">
        <PageHeader
          eyebrow="Support · Halal starter kit"
          title="The kit for the first week."
          description="A printable bundle for the stall: handling guide, storage labels, equipment colours, a hygiene checklist and the customer QR sticker."
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={downloadQr}>
                <Download className="h-3.5 w-3.5" /> QR image
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print kit
              </Button>
            </>
          }
        />
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-forest-200 bg-forest-50 p-4 sm:flex-row sm:items-center print:hidden">
        <div className="flex items-start gap-2.5">
          <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
          <div>
            <p className="text-[12px] font-semibold text-ink">
              Print, laminate, and keep it near the prep area.
            </p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-2">
              The print layout removes the navigation and keeps the labels,
              checklist and QR sticker on the page.
            </p>
          </div>
        </div>
        <Badge tone="gold">Programme tool — not a halal certificate</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 print:break-inside-avoid">
          <CardHeader
            title="Quick handling guide"
            description="Five habits that protect the dish — and the evidence behind it."
            action={<Badge tone="forest">Keep visible</Badge>}
          />
          <ol className="divide-y divide-line-soft">
            {handlingSteps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3.5 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest-200 bg-forest-50 text-forest-700">
                  <step.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-ink">
                    <span className="mr-2 font-mono text-[9px] text-ink-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-2 border-t border-line-soft bg-sand/30 px-5 py-3 text-[10px] leading-relaxed text-ink-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
            If something is unclear: pause, check the source, and record what you
            found. An unverified ingredient is not an emergency — an unrecorded
            one is a risk.
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <div>
              <h3 className="text-[13px] font-semibold text-ink">QR sticker</h3>
              <p className="mt-0.5 text-[10.5px] text-ink-3">
                For the stall counter.
              </p>
            </div>
            <QrCode className="h-4 w-4 text-forest-700" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-5">
            <div className="w-full max-w-[230px] rounded-xl border border-line bg-forest-800 p-4 text-center text-ivory print:border-ink/30 print:bg-white print:text-ink">
              <LogoMark className="mx-auto h-6 w-6 text-gold-300 print:text-forest-800" />
              <p className="mt-2 font-mono text-[7.5px] uppercase tracking-[0.17em] text-gold-300 print:text-gold-700">
                HALALNiaga · Sabah pilot
              </p>
              <p className="mt-1 font-display text-[15px]">Scan to verify</p>
              <div className="mx-auto mt-2.5 w-fit rounded-lg bg-ivory p-1.5">
                <QRCodeSVG
                  value={profileUrl}
                  size={104}
                  bgColor="#FAF7F0"
                  fgColor="#0B4F3C"
                  level="M"
                  aria-label="Vendor verification QR code"
                />
              </div>
              <p className="mt-2.5 text-[10px] font-semibold">
                {state.vendor.name}
              </p>
              <p className="text-[8px] text-ivory/60 print:text-ink-3">{state.vendor.stall}</p>
              <p className="mt-1.5 text-[6.5px] leading-relaxed text-ivory/45 print:text-ink-3">
                Programme recognition — not a JAKIM halal certificate.
              </p>
            </div>
          </div>
          <div className="space-y-2 border-t border-line-soft p-4 print:hidden">
            <Button variant="secondary" size="sm" className="w-full" onClick={downloadQr}>
              <Download className="h-3.5 w-3.5" /> Download QR
            </Button>
            <Link
              to="/app/verification"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[11px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50"
            >
              Open the full QR kit <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="print:break-inside-avoid">
          <CardHeader
            title="Storage labels"
            description="Print, cut and stick on containers. Write the date opened."
            action={<Scissors className="h-4 w-4 text-ink-3" />}
          />
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {storageLabels.map((label) => (
              <div
                key={label}
                className="flex h-[74px] flex-col justify-between rounded-lg border border-dashed border-ink/30 bg-paper p-2.5"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink">
                  {label}
                </p>
                <p className="text-[8px] text-ink-3">
                  {state.vendor.name} · HALALNiaga
                </p>
              </div>
            ))}
          </div>
          <p className="border-t border-line-soft px-4 py-2.5 text-[9px] leading-relaxed text-ink-3">
            Keep raw meat, poultry and seafood separate from cooked food. Label
            everything that is opened, cooked or portioned.
          </p>
        </Card>

        <Card className="print:break-inside-avoid">
          <CardHeader
            title="Equipment colour guide"
            description="One colour per food type. If you only have one board, clean and sanitise between tasks."
            action={<Utensils className="h-4 w-4 text-ink-3" />}
          />
          <div className="space-y-2 p-4">
            {equipment.map((item) => (
              <div
                key={item.colour}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper p-2.5"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[8px] font-semibold uppercase tracking-wide',
                    item.className,
                  )}
                >
                  {item.colour.slice(0, 3)}
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-ink">
                    {item.use}
                  </p>
                  <p className="text-[9.5px] text-ink-3">{item.note}</p>
                </div>
                <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.1em] text-ink-3">
                  {item.colour}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 border-t border-line-soft bg-sand/30 px-4 py-3 text-[9.5px] leading-relaxed text-ink-3">
            <Droplets className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
            Store cleaning cloths away from food. Wash hands before changing
            between raw and cooked tasks.
          </div>
        </Card>
      </div>

      <Card className="mt-4 print:break-inside-avoid">
        <CardHeader
          title="Hygiene & halal checklist"
          description="A quick daily and weekly check. Tick what is in place; note what needs fixing."
          action={<Badge tone="forest">Print & reuse</Badge>}
        />
        <div className="grid gap-x-8 gap-y-2.5 p-5 sm:grid-cols-2">
          {checklist.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-ink-2 print:cursor-auto"
            >
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-ink/30 bg-paper">
                <Check className="h-2.5 w-2.5 text-transparent print:text-transparent" />
              </span>
              {item}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5">
          <p className="text-[9.5px] text-ink-3">
            Signed by: ____________________ · Date: __________
          </p>
          <p className="flex items-center gap-1.5 text-[9px] text-ink-3">
            <Thermometer className="h-3 w-3" /> Chiller target: 4°C or below
          </p>
        </div>
      </Card>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-sand/40 p-3.5 text-[9.5px] leading-relaxed text-ink-3">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
        HALALNiaga starter kit · {state.vendor.name}. This is a programme tool for
        training and record-keeping. It is not a Malaysian halal certificate, and
        it does not replace an inspection by JAKIM or a recognised state Islamic
        authority.
      </p>

      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas
          ref={qrRef}
          value={profileUrl}
          size={720}
          bgColor="#FAF7F0"
          fgColor="#0B4F3C"
          level="M"
        />
      </div>
    </>
  );
};
