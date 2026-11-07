import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'urgent' | 'success' | 'info' | 'warning' | 'danger' | 'cyan';

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'border border-line bg-raised text-fg',
  urgent: 'bg-urgent text-ink-900',
  success: 'border border-success-200 bg-success-50 text-success-800',
  info: 'border border-action-200 bg-action-50 text-action-800',
  warning: 'border border-warning-200 bg-warning-50 text-warning-800',
  danger: 'border border-danger-200 bg-danger-50 text-danger-800',
  cyan: 'bg-cyan text-ink',
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Badge = ({ tone = 'neutral', icon, children, className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
      TONE_CLASS[tone],
      className,
    )}
  >
    {icon}
    {children}
  </span>
);
