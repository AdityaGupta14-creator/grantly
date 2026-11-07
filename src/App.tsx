import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useThemeSync } from '@/hooks/useThemeSync';
import { ROUTES } from '@/lib/routes';

const CalendarPage = lazy(() => import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const ComparePage = lazy(() => import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ScholarshipDetailPage = lazy(() => import('@/pages/ScholarshipDetailPage').then((m) => ({ default: m.ScholarshipDetailPage })));
const TrackerPage = lazy(() => import('@/pages/TrackerPage').then((m) => ({ default: m.TrackerPage })));

const App = () => {
  useThemeSync();

  return (
    <BrowserRouter>
      <ErrorBoundary><Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted" role="status">Loading page…</div>}><Routes>
        <Route element={<AppLayout showNav={false} />}>
          <Route path={ROUTES.landing} element={<LandingPage />} />
          <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.discover} element={<DiscoverPage />} />
          <Route path="/scholarship/:id" element={<ScholarshipDetailPage />} />
          <Route path={ROUTES.tracker} element={<TrackerPage />} />
          <Route path={ROUTES.documents} element={<DocumentsPage />} />
          <Route path={ROUTES.calendar} element={<CalendarPage />} />
          <Route path={ROUTES.compare} element={<ComparePage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes></Suspense></ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
