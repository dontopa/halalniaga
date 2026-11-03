import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  QrCode,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Badge, Button, Card, CardHeader, Progress } from '@/components/ui';
import { TierBadge } from '@/components/badges';
import { PageHeader, ScoreRing, Toast, useToast } from '@/components/app/shared';
import {
  formatDate,
  getCompliance,
  relativeDate,
} from '@/domain/compliance';
import { ASSESSMENT_QUESTIONS } from '@/domain/seed';
import { useApp } from '@/domain/store';

const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const anchor = document.createElement('a');
  anchor.href = canvas.toDataURL('image/png');
  anchor.download = filename;
  anchor.click();
};

export const Verification = () => {
  const { state } = useApp();
  const { toast, show, clear } = useToast();
  const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [stickerBusy, setStickerBusy] = useState(false);

  const profileUrl = `${window.location.origin}/vendor/${state.vendor.qrSlug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      show('Verification link copied to the clipboard.');
    } catch {
      show('Clipboard unavailable — copy the link from the address bar.', 'warning');
    }
  };

  const downloadQr = () => {
    if (!qrRef.current) return;
    downloadCanvas(qrRef.current, `halalniaga-qr-${state.vendor.qrSlug}.png`);
    show('QR code downloaded as a PNG.');
  };

  const downloadSticker = () => {
    const source = qrRef.current;
    if (!source) return;
    setStickerBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setStickerBusy(false);
      return;
    }

    ctx.fillStyle = '#0B4F3C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(216,174,98,0.12)';
    for (let x = 40; x < 900; x += 96) {
      for (let y = 40; y < 1200; y += 96) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = '#C99A4B';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 840, 1140);

    ctx.fillStyle = '#E4C48C';
    ctx.font = '600 22px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HALALNIAGA · SABAH PILOT', 450, 120);

    ctx.fillStyle = '#FBF8F1';
    ctx.font = '600 44px "Fraunces Variable", Georgia, serif';
    ctx.fillText('Scan to verify', 450, 190);
    ctx.font = '400 22px "Inter Variable", sans-serif';
    ctx.fillStyle = 'rgba(251,248,241,0.65)';
    ctx.fillText('the programme record behind the food', 450, 226);

    ctx.fillStyle = '#FBF8F1';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(240, 280, 420, 420, 28);
      ctx.fill();
    } else {
      ctx.fillRect(240, 280, 420, 420);
    }
    ctx.drawImage(source, 270, 310, 360, 360);

    ctx.fillStyle = '#FBF8F1';
    ctx.font = '600 38px "Inter Variable", sans-serif';
    ctx.fillText(state.vendor.name, 450, 800);
    ctx.font = '400 22px "Inter Variable", sans-serif';
    ctx.fillStyle = 'rgba(251,248,241,0.7)';
    ctx.fillText(`${state.vendor.stall} · ${state.vendor.area}`, 450, 840);

    ctx.fillStyle = '#C99A4B';
    ctx.font = '600 24px "Inter Variable", sans-serif';
    ctx.fillText(`${snapshot.tier === 'monitored' ? 'MONITORED' : snapshot.tier === 'verified' ? 'VERIFIED' : 'LEARNER'} PARTICIPANT`, 450, 900);

    ctx.fillStyle = 'rgba(251,248,241,0.55)';
    ctx.font = '400 17px "Inter Variable", sans-serif';
    ctx.fillText('Programme recognition — not a JAKIM halal certificate.', 450, 1040);
    ctx.fillText('Official certification is issued by JAKIM or a recognised state authority.', 450, 1068);
    ctx.fillText(formatDate(new Date().toISOString()), 450, 1110);

    downloadCanvas(canvas, `halalniaga-sticker-${state.vendor.qrSlug}.png`);
    setStickerBusy(false);
    show('Stall sticker downloaded.');
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 05 · Verification & QR"
        title="Make the record visible at the stall."
        description="A customer scans a sticker. No account, no app — just the current programme record, the last inspection date, and a clear disclaimer."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={downloadQr}>
              <Download className="h-3.5 w-3.5" /> QR image
            </Button>
            <Button size="sm" onClick={downloadSticker} disabled={stickerBusy}>
              <Download className="h-3.5 w-3.5" />
              {stickerBusy ? 'Preparing…' : 'Stall sticker'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative bg-forest-800 p-6 text-ivory">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08] pattern-geo"
              />
              <div className="relative mx-auto max-w-[320px] text-center">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-gold-300">
                  Customer verification
                </p>
                <h3 className="mt-2 font-display text-2xl tracking-[-0.02em]">
                  {state.vendor.name}
                </h3>
                <p className="mt-1 text-[11px] text-ivory/60">
                  {state.vendor.stall} · {state.vendor.area}
                </p>

                <div className="mx-auto mt-5 w-fit rounded-2xl bg-ivory p-3 shadow-lift">
                  <QRCodeSVG
                    value={profileUrl}
                    size={196}
                    bgColor="#FAF7F0"
                    fgColor="#0B4F3C"
                    level="M"
                    aria-label="Vendor verification QR code"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <TierBadge tier={snapshot.tier} />
                  <Badge tone="gold">Live record</Badge>
                </div>
                <p className="mt-3 text-[9.5px] leading-relaxed text-ivory/50">
                  HALALNiaga programme recognition. Not a JAKIM halal
                  certificate.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              <Button variant="secondary" size="sm" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </Button>
              <Link
                to={`/vendor/${state.vendor.qrSlug}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[12px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open record
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5 rounded-xl border border-line bg-sand/40 p-3.5">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              <div>
                <p className="text-[11.5px] font-semibold text-ink">
                  What the customer sees
                </p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    'Programme tier and the date it was last checked',
                    'Training modules passed and quiz scores',
                    'Recent verified supplier records',
                    'Latest self-assessment band',
                    'Inspection date, findings and corrective actions',
                    'A plain-language disclaimer about certification',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-2">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-forest-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-ink-3">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              The QR is a transparency tool. It cannot prove that every meal was
              prepared correctly on a given day — it shows whether the vendor has
              the systems, training and records in place.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Verification record"
              description="This is the summary published to the public page."
              action={<Badge tone="forest">Updated {relativeDate(new Date().toISOString())}</Badge>}
            />
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              <ScoreRing
                score={snapshot.score}
                size={118}
                tone={snapshot.score >= 80 ? 'forest' : 'gold'}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={snapshot.tier} />
                  <Badge tone="neutral">
                    Joined {formatDate(state.vendor.joinedAt)}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ['Training', snapshot.trainingPct],
                    ['Sourcing', snapshot.sourcingPct],
                    ['Assessment', snapshot.assessmentPct],
                    ['Monitoring', snapshot.monitoringPct],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <div className="flex items-center justify-between text-[10px] text-ink-3">
                        <span>{label}</span>
                        <span className="font-mono">{value}%</span>
                      </div>
                      <Progress value={Number(value)} className="mt-1 h-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-line-soft px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                    Last inspection
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink">
                    {snapshot.latestInspection
                      ? formatDate(snapshot.latestInspection.inspectedAt)
                      : 'Not yet inspected'}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                    Last assessment
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink">
                    {snapshot.latestAssessment
                      ? formatDate(snapshot.latestAssessment.completedAt)
                      : 'Not completed'}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-3">
                    Record ID
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-ink">
                    HN-{state.vendor.qrSlug.toUpperCase().slice(0, 12)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Stall sticker preview" description="A5 portrait, ready to print and laminate." />
            <div className="p-5">
              <div className="mx-auto max-w-[260px] rounded-xl border border-line bg-forest-800 p-4 text-center text-ivory shadow-soft">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-gold-300">
                  HALALNiaga · Sabah pilot
                </p>
                <p className="mt-1.5 font-display text-lg">Scan to verify</p>
                <div className="mx-auto mt-3 w-fit rounded-lg bg-ivory p-2">
                  <QRCodeSVG
                    value={profileUrl}
                    size={120}
                    bgColor="#FAF7F0"
                    fgColor="#0B4F3C"
                    level="M"
                    aria-label="Sticker QR code preview"
                  />
                </div>
                <p className="mt-3 text-[11px] font-semibold">{state.vendor.name}</p>
                <p className="mt-0.5 text-[8.5px] text-ivory/60">
                  {state.vendor.stall}
                </p>
                <p className="mt-2 text-[7px] leading-relaxed text-ivory/40">
                  Programme recognition — not a JAKIM halal certificate.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-sand/40 px-3 py-2.5">
                <span className="text-[10.5px] text-ink-3">
                  Download includes the QR, vendor name and disclaimer.
                </span>
                <QrCode className="h-4 w-4 text-forest-700" />
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-2.5 rounded-2xl border border-gold-500/25 bg-gold-100/40 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
            <div>
              <p className="text-[12px] font-semibold text-ink">
                Programme recognition, clearly labelled
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-ink-2">
                The QR record never uses the Malaysian halal logo. It states the
                programme tier and evidence, and points customers to JAKIM for
                official certification status.
              </p>
              <a
                href="https://www.halal.gov.my/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-forest-700 hover:underline"
              >
                JAKIM Halal Malaysia <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden high-resolution QR used for downloads */}
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

      <Toast toast={toast} onClose={clear} />
    </>
  );
};
