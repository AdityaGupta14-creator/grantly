import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BrandMarkProps {
  className?: string;
  iconSize?: number;
}

export const BrandMark = ({ className, iconSize = 21 }: BrandMarkProps) => (
  <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-urgent text-ink shadow-[0_4px_0_#A13C1D]', className)}>
    <GraduationCap size={iconSize} strokeWidth={2.5} aria-hidden="true" />
  </span>
);
