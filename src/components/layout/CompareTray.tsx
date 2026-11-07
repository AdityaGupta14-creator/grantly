import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Scale, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { buttonClass } from '@/components/ui/buttonStyles';
import { MAX_COMPARE_ITEMS, useCompareStore } from '@/store/compareStore';
import { findScholarship } from '@/lib/catalog';
import { ROUTES } from '@/lib/routes';

export const CompareTray = () => {
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const removeCompare = useCompareStore((state) => state.removeCompare);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  const visible = selectedIds.length > 0 && pathname !== ROUTES.compare;

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          aria-label="Compare tray"
          initial={reduceMotion ? false : { y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: 120, opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-20 z-40 px-4 lg:bottom-0 lg:left-64 lg:px-6 lg:pb-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-tray sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Scale size={18} aria-hidden="true" className="text-primary" />
                Compare ({selectedIds.length}/{MAX_COMPARE_ITEMS})
              </span>
              {selectedIds.map((id) => (
                <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-pale py-1 pl-3 pr-1 text-xs font-semibold text-ink">
                  <span className="truncate">{findScholarship(id)?.name ?? 'Scholarship'}</span>
                  <button
                    type="button"
                    onClick={() => removeCompare(id)}
                    aria-label={`Remove ${findScholarship(id)?.name ?? 'scholarship'} from comparison`}
                    className="rounded-full p-1 hover:bg-white/70"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompare}>
                Clear
              </Button>
              <Link
                to={ROUTES.compare}
                className={buttonClass('primary', 'sm', selectedIds.length < 2 ? 'pointer-events-none opacity-50' : undefined)}
                aria-disabled={selectedIds.length < 2}
                tabIndex={selectedIds.length < 2 ? -1 : undefined}
              >
                Compare now
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
