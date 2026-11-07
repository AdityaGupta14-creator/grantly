import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = ({ interactive = false, className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-2xl border border-line/70 bg-surface p-5 shadow-card sm:p-6',
      interactive && 'transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift',
      className,
    )}
    {...props}
  />
);
