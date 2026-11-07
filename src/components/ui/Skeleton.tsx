import { cn } from '@/lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn('skeleton', className)} />
);

export const ScholarshipCardSkeleton = () => (
  <div className="rounded-2xl border border-line/70 bg-surface p-6 shadow-card" aria-hidden="true">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-14 w-14 rounded-full" />
    </div>
    <Skeleton className="mt-6 h-8 w-1/3" />
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);
