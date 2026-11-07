import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ open, onClose, title, description, children, footer }: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((item) => item.offsetParent !== null);
        if (focusable.length === 0) { event.preventDefault(); panel.focus(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-surface p-6 shadow-lift outline-none sm:max-w-lg sm:rounded-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-fg">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-muted transition hover:bg-raised hover:text-fg"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
