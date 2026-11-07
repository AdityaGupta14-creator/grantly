import { AlertTriangle, Check, X } from 'lucide-react';
import type { CriterionStatus, MatchCriterion } from '@/lib/match';
import { cn } from '@/lib/cn';

const STATUS_META: Record<CriterionStatus, { icon: typeof Check; label: string; className: string }> = {
  met: { icon: Check, label: 'Met', className: 'text-success-700' },
  near: { icon: AlertTriangle, label: 'Nearly met', className: 'text-warning-700' },
  not_met: { icon: X, label: 'Not met', className: 'text-danger-700' },
  unknown: { icon: AlertTriangle, label: 'Add info', className: 'text-action-700' },
};

interface MatchBreakdownProps {
  criteria: MatchCriterion[];
}

export const MatchBreakdown = ({ criteria }: MatchBreakdownProps) => (
  <ul className="divide-y divide-line/70" aria-label="Why you match">
    {criteria.map((criterion) => {
      const meta = STATUS_META[criterion.status];
      const Icon = meta.icon;
      return (
        <li key={criterion.id} className="flex items-start gap-3 py-3">
          <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-raised', meta.className)}>
            <Icon size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg">
              {criterion.label}
              <span className={cn('ml-2 text-xs font-bold uppercase tracking-wide', meta.className)}>{meta.label}</span>
            </p>
            <p className="mt-0.5 text-sm text-muted">{criterion.explanation}</p>
          </div>
        </li>
      );
    })}
  </ul>
);
