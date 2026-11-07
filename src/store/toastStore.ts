import { create } from 'zustand';

export type ToastTone = 'success' | 'info' | 'danger';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  pushToast: (toast) =>
    set((state) => ({ toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }].slice(-4) })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().pushToast({ title, description, tone: 'success' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().pushToast({ title, description, tone: 'info' }),
  danger: (title: string, description?: string) =>
    useToastStore.getState().pushToast({ title, description, tone: 'danger' }),
};
