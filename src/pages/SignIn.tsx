import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { Badge, Button, Field, Input } from '@/components/ui';
import { TierBadge } from '@/components/badges';

export const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nurul@dapurkaknur.my');
  const [password, setPassword] = useState('demo1234');

  return (
    <div className="grid min-h-screen bg-ivory lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-forest-950 p-10 text-ivory lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.08] pattern-geo" />
        <svg
          aria-hidden="true"
          viewBox="0 0 256 256"
          className="absolute -right-20 top-24 h-80 w-80 text-gold-300/15"
        >
          <path
            d="M 128 24 L 154.02 65.18 L 201.54 54.46 L 190.82 101.98 L 232 128 L 190.82 154.02 L 201.54 201.54 L 154.02 190.82 L 128 232 L 101.98 190.82 L 54.46 201.54 L 65.18 154.02 L 24 128 L 65.18 101.98 L 54.46 54.46 L 101.98 65.18 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="relative">
          <Link to="/" aria-label="HALALNiaga home">
            <Wordmark tone="light" />
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-300">
            Sabah pilot · 2026
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.3rem,3.6vw,3.4rem)] leading-[1.02] tracking-[-0.04em]">
            The record behind
            <br />
            the food.
          </h1>
          <p className="mt-5 text-[14px] leading-relaxed text-ivory/65">
            Sign in to your demo workspace to see the compliance record, source
            log and verification page from a working Sabah vendor.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Training, sourcing, assessment and inspection in one record',
              'Interactive: complete a quiz, add a purchase, run an assessment',
              'Customer-facing QR record with a clear certification disclaimer',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[12px] text-ivory/70">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-300/15">
                  <Check className="h-2.5 w-2.5 text-gold-300" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] text-ivory/45">Demo vendor</p>
            <p className="mt-1 text-[13px] font-medium">Dapur Kak Nur</p>
            <p className="text-[10.5px] text-ivory/45">
              Tanjung Aru Food Court · Kota Kinabalu
            </p>
          </div>
          <TierBadge tier="verified" />
        </div>
      </aside>

      <main className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Link to="/">
            <Wordmark />
          </Link>
          <Link to="/" className="text-[11.5px] text-ink-3 hover:text-forest-700">
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <Badge tone="forest" dot>
              Demo access
            </Badge>
            <h2 className="mt-4 font-display text-[2rem] leading-tight tracking-[-0.03em] text-ink">
              Vendor sign in
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
              This is a presentation prototype. No credentials are transmitted —
              any details will open the seeded demo workspace.
            </p>

            <form
              className="mt-7 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                navigate('/app');
              }}
            >
              <Field label="Email address" htmlFor="signin-email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </Field>

              <Field label="Password" htmlFor="signin-password">
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </Field>

              <Button type="submit" className="w-full" size="lg">
                <Store className="h-4 w-4" /> Enter the demo workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-line bg-paper p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                  Demo account
                </p>
                <Badge tone="gold">Pre-filled</Badge>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[10.5px] text-ink-2">
                <p>nurul@dapurkaknur.my</p>
                <p>demo1234</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
              All workspace data is stored locally in your browser. Resetting the
              demo from the sidebar restores the seeded Sabah vendor.
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px]">
              <Link to="/" className="inline-flex items-center gap-1 text-ink-3 hover:text-forest-700">
                Back to website <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link to="/vendor/dapur-kak-nur" className="text-forest-700 hover:underline">
                View a customer QR record
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
