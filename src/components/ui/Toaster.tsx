import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useToastStore, type Toast, type ToastTone } from '@/store/toastStore';

const TOAST_DURATION_MS = 4000;

const TONE: Record<ToastTone, { icon: typeof CheckCircle2; accent: string; iconClass: string }> = {
  success: { icon: CheckCircle2, accent: 'border-l-success', iconClass: 'text-success-700' },
  info: { icon: Info, accent: 'border-l-action', iconClass: 'text-action-700' },
  danger: { icon: XCircle, accent: 'border-l-danger', iconClass: 'text-danger-700' },
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  const { icon: Icon, accent, iconClass } = TONE[toast.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`motion-safe:animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-line bg-surface p-4 shadow-lift ${accent}`}
    >
      <Icon size={20} aria-hidden="true" className={`mt-0.5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md p-1 text-muted hover:bg-raised hover:text-fg"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions text"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col gap-2 sm:left-auto sm:right-6 sm:w-96 lg:bottom-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
