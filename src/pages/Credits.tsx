import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { Badge } from '@/components/ui';
import { imageCredits } from '@/lib/imageCredits';

export const Credits = () => (
  <div className="min-h-screen bg-ivory">
    <header className="border-b border-line bg-ivory/90">
      <div className="mx-auto flex h-[68px] max-w-[980px] items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="HALALNiaga home">
          <Wordmark />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-3 hover:text-forest-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </div>
    </header>

    <main className="mx-auto max-w-[980px] px-5 py-12 sm:px-8">
      <Badge tone="forest" dot>
        Image credits
      </Badge>
      <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.035em] text-ink">
        Photographs from Sabah markets.
      </h1>
      <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">
        These photographs are used under their respective Creative Commons
        licences. They have been cropped, resized and converted to WebP for this
        prototype; those derivative images are shared under the same licence as
        the originals. They are illustrative and do not depict the seeded vendor
        or the named suppliers in the demo.
      </p>

      <div className="mt-8 space-y-3">
        {imageCredits.map((credit) => (
          <article
            key={credit.file}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-3 sm:flex-row sm:items-center"
          >
            <img
              src={credit.file}
              alt=""
              className="h-28 w-full rounded-xl object-cover sm:h-20 sm:w-28"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink">
                {credit.title}
              </p>
              <p className="mt-1 text-[11px] text-ink-3">
                Photograph by {credit.author}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{credit.license}</Badge>
                <a
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10.5px] text-forest-700 hover:underline"
                >
                  Licence <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
                <a
                  href={credit.source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10.5px] text-forest-700 hover:underline"
                >
                  Source <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
            <ImageIcon className="hidden h-4 w-4 shrink-0 text-ink-3 sm:block" />
          </article>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-line bg-sand/40 p-4 text-[10.5px] leading-relaxed text-ink-3">
        If you reuse a photograph, follow the linked licence — including
        attribution and, for CC BY-SA images, sharing derivatives under the same
        licence. The HALALNiaga logo and interface are original to this project.
      </p>
    </main>
  </div>
);
