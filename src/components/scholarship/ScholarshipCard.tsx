import { AlertTriangle, ArrowUpRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { SaveButton } from '@/components/scholarship/SaveButton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { ScholarshipEntry } from '@/lib/discover';
import { formatAmount } from '@/lib/format';
import { pickHighlights, scoreTone } from '@/lib/match';
import { scholarshipPath } from '@/lib/routes';
import { cn } from '@/lib/cn';
import { MAX_COMPARE_ITEMS, useCompareStore } from '@/store/compareStore';
import { toast } from '@/store/toastStore';
import { PROVIDER_LABELS } from '@/types/options';

interface ScholarshipCardProps {
  entry: ScholarshipEntry;
  viewMode?: 'grid' | 'list';
}

export const ScholarshipCard = ({ entry, viewMode = 'grid' }: ScholarshipCardProps) => {
  const { scholarship, match } = entry;
  const selected = useCompareStore((state) => state.selectedIds.includes(scholarship.id));
  const toggleCompare = useCompareStore((state) => state.toggleCompare);
  const reasons = pickHighlights(match.criteria, 2);
  const titleId = `card-${scholarship.id}`;

  const handleCompare = () => {
    const result = toggleCompare(scholarship.id);
    if (result === 'full') toast.danger('Compare is full', `Remove one of the ${MAX_COMPARE_ITEMS} scholarships first.`);
  };

  return (
    <Card interactive className={cn('flex h-full flex-col gap-4 p-5', viewMode === 'grid' ? 'min-h-[25rem]' : 'min-h-[16rem]')} aria-labelledby={titleId}>
      <div className="flex items-start justify-between gap-4">
        <div className={cn('min-w-0', viewMode === 'list' && 'min-w-[12rem]')}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {PROVIDER_LABELS[scholarship.providerType]}
          </p>
          <h3 id={titleId} className={cn('mt-1 font-heading text-lg font-semibold leading-snug text-fg', viewMode === 'list' && 'line-clamp-2')}>
            <Link to={scholarshipPath(scholarship.id)} className="relative rounded-md after:absolute after:inset-0 hover:text-link">
              {scholarship.name}
            </Link>
          </h3>
          <p className="mt-1 truncate text-sm text-muted">{scholarship.provider}</p>
        </div>
        <ProgressRing value={match.score} label={`${match.score}% match`} tone={scoreTone(match.score)} size={56} stroke={6} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="cyan">{formatAmount(scholarship)}</Badge>
        <DeadlineBadge deadline={scholarship.deadline} />
        {match.tier === 'not_eligible' && <Badge tone="danger" icon={<X size={12} aria-hidden="true" />}>Not eligible</Badge>}
        {match.tier === 'nearly_eligible' && <Badge tone="warning" icon={<AlertTriangle size={12} aria-hidden="true" />}>Nearly eligible</Badge>}
      </div>

      <ul className="space-y-1.5">
        {reasons.map((reason) => (
          <li key={reason.id} className="flex items-start gap-2 text-sm text-muted">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                reason.status === 'met' ? 'bg-success-100 text-success-700' : reason.status === 'near' ? 'bg-warning-100 text-warning-700' : reason.status === 'unknown' ? 'bg-action-100 text-action-700' : 'bg-danger-100 text-danger-700',
              )}
              aria-hidden="true"
            >
              {reason.status === 'met' ? <Check size={10} strokeWidth={3} /> : reason.status === 'near' || reason.status === 'unknown' ? <AlertTriangle size={10} /> : <X size={10} strokeWidth={3} />}
            </span>
            <span>{reason.explanation}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">
        <SaveButton scholarshipId={scholarship.id} name={scholarship.name} />
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-semibold text-fg">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCompare}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          Compare
        </label>
        <Link
          to={scholarshipPath(scholarship.id)}
          className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline"
        >
          Details
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
};
