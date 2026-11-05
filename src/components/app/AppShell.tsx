import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  ClipboardCheck,
  Download,
  GraduationCap,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessagesSquare,
  PackageOpen,
  QrCode,
  ReceiptText,
  ScanBarcode,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { Wordmark } from '@/components/Logo';
import { TierBadge } from '@/components/badges';
import { Badge } from '@/components/ui';
import { openInstallHelp } from '@/components/pwa/PwaExperience';
import { ASSESSMENT_QUESTIONS } from '@/domain/seed';
import { deriveAlerts, getCompliance } from '@/domain/compliance';
import { useApp } from '@/domain/store';
import { LanguageToggle } from '@/i18n/LanguageToggle';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const groups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Workspace',
    items: [
      { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/app/suppliers', label: 'Supplier finder', icon: Store },
      { to: '/app/purchases', label: 'Purchase log', icon: ReceiptText },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/app/academy', label: 'Halal academy', icon: GraduationCap },
      { to: '/app/assessment', label: 'Self-assessment', icon: ClipboardCheck },
      { to: '/app/verification', label: 'Verification & QR', icon: QrCode },
      { to: '/app/monitoring', label: 'Monitoring', icon: Activity },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/app/community', label: 'Community', icon: MessagesSquare },
      { to: '/app/starter-kit', label: 'Starter kit', icon: PackageOpen },
      { to: '/app/scanner', label: 'Ingredient scanner', icon: ScanBarcode },
      { to: '/app/mentor', label: 'Halal mentor', icon: LifeBuoy },
    ],
  },
];

const titles: Record<string, string> = {
  '/app': 'Overview',
  '/app/suppliers': 'Supplier finder',
  '/app/purchases': 'Purchase log',
  '/app/academy': 'Halal academy',
  '/app/assessment': 'Self-assessment',
  '/app/verification': 'Verification & QR',
  '/app/monitoring': 'Monitoring',
  '/app/community': 'Community',
  '/app/scanner': 'Ingredient scanner',
  '/app/mentor': 'Halal mentor',
  '/app/starter-kit': 'Starter kit',
};

const NavList = ({ onNavigate }: { onNavigate?: () => void }) => {
  const t = useT();
  return (
    <nav className="space-y-6" aria-label={t('Application')}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3/70">
            {t(group.label)}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors',
                      isActive
                        ? 'bg-forest-800 text-ivory shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]'
                        : 'text-ink-2 hover:bg-sand/70 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-gold-300' : 'text-ink-3 group-hover:text-forest-700',
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{t(item.label)}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

const VendorCard = () => {
  const { state } = useApp();
  const t = useT();
  const snapshot = getCompliance(state, ASSESSMENT_QUESTIONS);
  return (
    <div className="rounded-xl border border-line bg-paper p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-[11px] text-gold-300">
          {state.vendor.owner
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0])
            .join('')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold leading-tight text-ink">
            {state.vendor.name}
          </p>
          <p className="truncate text-[10px] text-ink-3">{state.vendor.area}</p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-ink-3">
          {snapshot.score}/100
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <TierBadge tier={snapshot.tier} />
        <span className="text-[9.5px] text-ink-3">
          {t('Compliance record')}
        </span>
      </div>
    </div>
  );
};

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { state } = useApp();
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const alerts = deriveAlerts(state);
  const title = t(titles[location.pathname] ?? 'Workspace');
  const ownerInitials = state.vendor.owner
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  useEffect(() => {
    setDrawerOpen(false);
    setAlertsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!alertsOpen && !profileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setAlertsOpen(false);
        setProfileOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAlertsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [alertsOpen, profileOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f4ec] print:bg-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-line bg-ivory lg:flex print:hidden">
        <div className="flex h-[68px] items-center border-b border-line-soft px-5">
          <Link to="/" aria-label={t('HALALNiaga home')}>
            <Wordmark />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavList />
        </div>
        <div className="space-y-3 border-t border-line-soft p-4">
          <VendorCard />
          <button
            type="button"
            onClick={openInstallHelp}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-[11.5px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50 hover:text-forest-800"
          >
            <Download className="h-3.5 w-3.5" /> {t('Install app')}
          </button>
          <div className="flex flex-col gap-1.5 px-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 transition-colors hover:text-forest-700"
            >
              {t('Back to website')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div
            className="absolute inset-0 animate-fade bg-forest-950/45 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('Navigation')}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] animate-rise flex-col border-r border-line bg-ivory"
          >
            <div className="flex h-[68px] items-center justify-between border-b border-line-soft px-5">
              <Wordmark />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="cursor-pointer rounded-full p-2 text-ink-3 hover:bg-sand"
                aria-label={t('Close navigation')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="space-y-3 border-t border-line-soft p-4">
              <VendorCard />
              <button
                type="button"
                onClick={openInstallHelp}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-[11.5px] text-ink-2 transition-colors hover:border-forest-200 hover:bg-forest-50 hover:text-forest-800"
              >
                <Download className="h-3.5 w-3.5" /> {t('Install app')}
              </button>
              <div className="flex items-center justify-end gap-2">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-[272px] print:pl-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-4 border-b border-line/80 bg-[#f7f4ec]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="cursor-pointer rounded-full p-2 text-ink-2 transition-colors hover:bg-sand lg:hidden"
              aria-label={t('Open navigation')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                {t('Demo workspace · Sabah pilot')}
              </p>
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h1>
            </div>
          </div>
          <div ref={actionsRef} className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle showIcon={false} />
            <Badge tone="gold" className="hidden xl:inline-flex">
              {t('Programme recognition — not a JAKIM certificate')}
            </Badge>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setAlertsOpen((open) => !open);
                  setProfileOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={alertsOpen}
                aria-label={t('{count} open alerts', { count: alerts.length })}
                className="relative cursor-pointer rounded-full border border-line bg-paper p-2.5 text-ink-2 transition-colors hover:border-forest-200 hover:text-forest-800"
              >
                <Bell className="h-4 w-4" />
                {alerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 font-mono text-[9px] text-white">
                    {alerts.length}
                  </span>
                )}
              </button>

              {alertsOpen && (
                <div
                  role="menu"
                  aria-label={t('Alerts')}
                  className="absolute right-0 top-full z-50 mt-2 w-[330px] overflow-hidden rounded-2xl border border-line bg-ivory shadow-[0_18px_40px_rgba(11,79,60,0.18)]"
                >
                  <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                    <p className="text-[12px] font-semibold text-ink">
                      {t('Alerts')}
                    </p>
                    <Badge tone={alerts.length ? 'warning' : 'success'}>
                      {alerts.length}
                    </Badge>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="px-4 py-5 text-[11.5px] leading-relaxed text-ink-3">
                      {t('No open alerts. Your records are current.')}
                    </p>
                  ) : (
                    <ul className="max-h-[320px] divide-y divide-line-soft overflow-y-auto">
                      {alerts.slice(0, 6).map((alert) => {
                        const Icon =
                          alert.severity === 'info' ? Info : AlertTriangle;
                        const href =
                          alert.kind === 'assessment'
                            ? '/app/assessment'
                            : alert.kind === 'training'
                              ? '/app/academy'
                              : '/app/suppliers';
                        return (
                          <li key={alert.id}>
                            <Link
                              to={href}
                              onClick={() => setAlertsOpen(false)}
                              className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-sand/60"
                            >
                              <Icon
                                className={cn(
                                  'mt-0.5 h-3.5 w-3.5 shrink-0',
                                  alert.severity === 'critical'
                                    ? 'text-danger'
                                    : alert.severity === 'warning'
                                      ? 'text-warn'
                                      : 'text-ink-3',
                                )}
                              />
                              <span className="min-w-0">
                                <span className="block text-[11.5px] font-medium leading-snug text-ink">
                                  {alert.title}
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-[10px] leading-relaxed text-ink-3">
                                  {alert.detail}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link
                    to="/app#alerts"
                    onClick={() => setAlertsOpen(false)}
                    className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[11px] font-medium text-forest-800 transition-colors hover:bg-sand/60"
                  >
                    {t('View all alerts')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setAlertsOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label={t('Account menu')}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-forest-800 font-display text-[13px] text-gold-300 ring-offset-2 transition-shadow hover:ring-2 hover:ring-forest-300"
              >
                {ownerInitials}
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label={t('Account menu')}
                  className="absolute right-0 top-full z-50 mt-2 w-[264px] overflow-hidden rounded-2xl border border-line bg-ivory shadow-[0_18px_40px_rgba(11,79,60,0.18)]"
                >
                  <div className="border-b border-line-soft px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                      {t('Signed in as')}
                    </p>
                    <p className="mt-1 text-[12.5px] font-semibold text-ink">
                      {state.vendor.owner}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-ink-3">
                      {state.vendor.name} · {state.vendor.area}
                    </p>
                  </div>
                  <Link
                    to={`/vendor/${state.vendor.qrSlug}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-[11.5px] text-ink-2 transition-colors hover:bg-sand/60 hover:text-forest-800"
                  >
                    <UserRound className="h-3.5 w-3.5 text-ink-3" />
                    {t('Vendor public profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/signin');
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 border-t border-line-soft px-4 py-3 text-left text-[11.5px] text-clay transition-colors hover:bg-clay/5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t('Log out')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:p-0">
          <div className="mx-auto w-full max-w-[1180px] print:max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
};
