import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
const VARIANT_CLASS: Record<ButtonVariant, string> = { primary: 'bg-urgent text-ink-900 shadow-[0_4px_0_#A13C1D,0_10px_18px_-12px_rgba(22,33,91,.45)] hover:bg-urgent-600 hover:shadow-[0_3px_0_#A13C1D,0_8px_14px_-12px_rgba(22,33,91,.45)]', cta: 'bg-urgent text-ink-900 shadow-[0_4px_0_#A13C1D,0_10px_18px_-12px_rgba(22,33,91,.45)] hover:bg-urgent-600 hover:shadow-[0_3px_0_#A13C1D,0_8px_14px_-12px_rgba(22,33,91,.45)]', secondary: 'border border-line bg-pale text-ink-900 shadow-sm hover:bg-pale-100', ghost: 'text-fg hover:bg-raised', danger: 'bg-danger text-white shadow-sm hover:bg-danger-600' };
const SIZE_CLASS: Record<ButtonSize, string> = { sm: 'min-h-11 px-3 text-sm', md: 'min-h-11 px-5 text-sm sm:text-base', lg: 'min-h-[3.25rem] px-6 text-base' };
export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string => cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-out', 'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50', VARIANT_CLASS[variant], SIZE_CLASS[size], className);
