import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { CompareTray } from '@/components/layout/CompareTray';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/Toaster';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useProfileStore } from '@/store/profileStore';

interface AppLayoutProps {
  showNav?: boolean;
}

export const AppLayout = ({ showNav = true }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const isDemo = useProfileStore((state) => state.profile?.isDemo ?? false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {showNav && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />}
      <div className={cn('transition-[padding] duration-300', showNav && (collapsed ? 'lg:pl-20' : 'lg:pl-64'))}>
        <Header showNotifications={showNav} />
        {isDemo && !demoBannerDismissed && (
          <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary-50 px-4 py-3 text-sm text-ink-900 sm:mx-6">
            <p><span className="font-semibold">You’re viewing demo data.</span> Reset anytime in Profile.</p>
            <button type="button" onClick={() => setDemoBannerDismissed(true)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md p-1 text-ink hover:bg-primary/10" aria-label="Dismiss demo data banner">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 outline-none sm:px-6 lg:pb-16 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {showNav && (
        <>
          <BottomNav />
          <CompareTray />
        </>
      )}
      <Toaster />
    </div>
  );
};
