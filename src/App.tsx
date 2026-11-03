import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppShell } from '@/components/app/AppShell';
import { LogoMark } from '@/components/Logo';
import { PwaExperience } from '@/components/pwa/PwaExperience';
import { AppProvider } from '@/domain/store';
import { LanguageProvider, useT } from '@/i18n';
import { Admin } from '@/pages/Admin';
import { AdminEditor } from '@/pages/AdminEditor';
import { Credits } from '@/pages/Credits';
import { Landing } from '@/pages/Landing';
import { PublicVendor } from '@/pages/PublicVendor';
import { SignIn } from '@/pages/SignIn';

const Academy = lazy(() =>
  import('@/pages/app/Academy').then((module) => ({ default: module.Academy })),
);
const Assessment = lazy(() =>
  import('@/pages/app/Assessment').then((module) => ({
    default: module.Assessment,
  })),
);
const Community = lazy(() =>
  import('@/pages/app/Community').then((module) => ({
    default: module.Community,
  })),
);
const Dashboard = lazy(() =>
  import('@/pages/app/Dashboard').then((module) => ({
    default: module.Dashboard,
  })),
);
const Mentor = lazy(() =>
  import('@/pages/app/Mentor').then((module) => ({ default: module.Mentor })),
);
const Monitoring = lazy(() =>
  import('@/pages/app/Monitoring').then((module) => ({
    default: module.Monitoring,
  })),
);
const Purchases = lazy(() =>
  import('@/pages/app/Purchases').then((module) => ({
    default: module.Purchases,
  })),
);
const Scanner = lazy(() =>
  import('@/pages/app/Scanner').then((module) => ({ default: module.Scanner })),
);
const StarterKit = lazy(() =>
  import('@/pages/app/StarterKit').then((module) => ({
    default: module.StarterKit,
  })),
);
const Suppliers = lazy(() =>
  import('@/pages/app/Suppliers').then((module) => ({
    default: module.Suppliers,
  })),
);
const Verification = lazy(() =>
  import('@/pages/app/Verification').then((module) => ({
    default: module.Verification,
  })),
);

const RouteFallback = () => {
  const t = useT();
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-line bg-paper px-4 py-2.5 shadow-soft">
        <LogoMark className="h-5 w-5 animate-pulse-soft text-forest-800" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
          {t('Loading workspace')}
        </span>
      </div>
    </div>
  );
};


const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 40);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

const AppLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

const App = () => (
  <LanguageProvider>
    <AppProvider>
      <BrowserRouter>
      <ScrollManager />
      <PwaExperience />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/vendor/:slug" element={<PublicVendor />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/admin" element={<AdminEditor />} />
          <Route path="/admin/guide" element={<Admin />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="academy" element={<Academy />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="verification" element={<Verification />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="community" element={<Community />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="mentor" element={<Mentor />} />
            <Route path="starter-kit" element={<StarterKit />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </BrowserRouter>
    </AppProvider>
  </LanguageProvider>
);

export default App;
