import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  MonitorDown,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/Logo';
import { Button, Modal } from '@/components/ui';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'halalniaga.install-dismissed';
const INSTALL_HELP_EVENT = 'halalniaga:install-help';

export const openInstallHelp = () => {
  window.dispatchEvent(new Event(INSTALL_HELP_EVENT));
};

const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iPadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || iPadOs;
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

const steps = [
  {
    icon: Smartphone,
    label: 'Android',
    body: 'Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.',
  },
  {
    icon: Share,
    label: 'iPhone & iPad',
    body: 'Tap Share, then “Add to Home Screen”. Open HALALNiaga from the new icon.',
  },
  {
    icon: MonitorDown,
    label: 'Desktop',
    body: 'Use the install icon in the address bar, or the browser menu → “Install HALALNiaga”.',
  },
];

export const PwaExperience = () => {
  const t = useT();
  const location = useLocation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [banner, setBanner] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );
  const [offlineReady, setOfflineReady] = useState(false);

  const onLanding = location.pathname === '/';

  useEffect(() => {
    if (isStandalone()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onHelp = () => setHelpOpen(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener(INSTALL_HELP_EVENT, onHelp);

    if (sessionStorage.getItem(DISMISS_KEY) !== '1') {
      const delay = isIos() ? 6000 : 9000;
      const timer = window.setTimeout(() => setBanner(true), delay);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', onPrompt);
        window.removeEventListener(INSTALL_HELP_EVENT, onHelp);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener(INSTALL_HELP_EVENT, onHelp);
    };
  }, []);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    const onReady = () => {
      setOfflineReady(true);
      window.setTimeout(() => setOfflineReady(false), 5200);
    };
    window.addEventListener('halalniaga:offline-ready', onReady);
    return () => window.removeEventListener('halalniaga:offline-ready', onReady);
  }, []);

  const dismiss = () => {
    setBanner(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const install = async () => {
    if (!deferred) {
      dismiss();
      setHelpOpen(true);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setBanner(false);
      sessionStorage.setItem(DISMISS_KEY, '1');
    }
    setDeferred(null);
  };

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-ink px-4 py-2 text-[11px] font-medium text-ivory print:hidden"
        >
          <WifiOff className="h-3.5 w-3.5 text-gold-300" />
          {t('Offline mode — your records are saved on this device.')}
        </div>
      )}

      {offlineReady && !offline && (
        <div
          role="status"
          className="fixed left-1/2 top-[80px] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-forest-200 bg-paper px-3.5 py-2 text-[10.5px] font-medium text-ink shadow-soft print:hidden"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" />
          {t('Offline ready — the app is cached on this device.')}
        </div>
      )}

      {banner && onLanding && !isStandalone() && (
        <div className="fixed inset-x-4 bottom-4 z-[65] animate-rise sm:inset-x-auto sm:right-6 sm:max-w-sm print:hidden">
          <div className="rounded-2xl border border-gold-300/25 bg-forest-950 p-4 text-ivory shadow-lift">
            <div className="flex items-start gap-3">
              <LogoMark className="h-9 w-9 shrink-0 text-gold-300" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold">
                  {t('Install HALALNiaga')}
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-ivory/65">
                  {t(
                    'Keep the supplier list and your records on the phone. It keeps working when the signal drops at the market.',
                  )}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="gold" size="sm" onClick={install}>
                    <Download className="h-3.5 w-3.5" /> {t('Install app')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      dismiss();
                      setHelpOpen(true);
                    }}
                    className="cursor-pointer rounded-full px-2.5 py-1.5 text-[10.5px] text-ivory/55 transition-colors hover:bg-ivory/10 hover:text-ivory"
                  >
                    {t('How?')}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t('Dismiss install prompt')}
                className="cursor-pointer rounded-full p-1 text-ivory/40 transition-colors hover:bg-ivory/10 hover:text-ivory"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={t('Install HALALNiaga')}
        description={t(
          'Add it to your home screen. It opens like an app, keeps the workspace local, and works offline after the first visit.',
        )}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHelpOpen(false)}>
              {t('Close')}
            </Button>
            {deferred && (
              <Button onClick={install}>
                <Download className="h-4 w-4" /> {t('Install now')}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.label}
              className="flex items-start gap-3 rounded-xl border border-line bg-paper p-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-ink">
                  {t(step.label)}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                  {t(step.body)}
                </p>
              </div>
            </div>
          ))}
          <div
            className={cn(
              'flex items-start gap-2 rounded-xl border p-3 text-[10.5px] leading-relaxed',
              'border-forest-200 bg-forest-50 text-forest-900/80',
            )}
          >
            <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />
            {t(
              'After the first load, the app shell is cached. Supplier browsing, training and records continue to work offline; demo data stays in this browser.',
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
