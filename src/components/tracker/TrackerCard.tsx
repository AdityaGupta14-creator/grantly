import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, NotebookPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { cn } from '@/lib/cn';
import { checklistProgress, type TrackedRow } from '@/lib/tracker';
import { scholarshipPath } from '@/lib/routes';
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from '@/types/tracker';

interface TrackerCardProps {
  row: TrackedRow;
  onOpen: (scholarshipId: string) => void;
  onMove: (scholarshipId: string, status: ApplicationStatus) => void;
  onRemove: (scholarshipId: string) => void;
}

export const TrackerCard = ({ row, onOpen, onMove, onRemove }: TrackerCardProps) => {
  const { application, scholarship } = row;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: scholarship.id,
  });
  const progress = checklistProgress(application, scholarship);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'rounded-2xl border border-line bg-surface p-4 shadow-card transition-shadow',
        isDragging && 'z-10 opacity-90 shadow-lift ring-2 ring-action/40',
      )}
      aria-label={scholarship.name}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={`Drag ${scholarship.name}. Use arrow keys to move between columns.`}
          className="-ml-1 mt-0.5 flex min-h-11 min-w-11 cursor-grab touch-none items-center justify-center rounded-md p-1 text-muted hover:bg-raised hover:text-fg active:cursor-grabbing"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <Link
            to={scholarshipPath(scholarship.id)}
            className="block font-heading text-base font-semibold leading-snug text-fg hover:text-link"
          >
            {scholarship.name}
          </Link>
          <DeadlineBadge deadline={scholarship.deadline} />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Documents</span>
              <span>
                {progress.done}/{progress.total} ready
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${scholarship.name} documents ready`}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              className="h-2 overflow-hidden rounded-full bg-raised"
            >
              <div className="h-full rounded-full bg-action transition-[width] duration-500" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {application.notes && <p className="line-clamp-2 text-sm text-muted">{application.notes}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label className="sr-only" htmlFor={`move-${scholarship.id}`}>
              Move {scholarship.name} to
            </label>
            <select
              id={`move-${scholarship.id}`}
              value={application.status}
              onChange={(event) => onMove(scholarship.id, event.target.value as ApplicationStatus)}
              className="min-h-11 flex-1 rounded-lg border border-line bg-surface px-2 text-sm font-semibold text-fg focus:border-action focus:outline-none focus:ring-2 focus:ring-action/40"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onOpen(scholarship.id)}
              aria-label={`Open checklist and notes for ${scholarship.name}`}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-muted transition hover:bg-raised hover:text-fg"
            >
              <NotebookPen size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(scholarship.id)}
              aria-label={`Remove ${scholarship.name} from tracker`}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-muted transition hover:bg-danger-50 hover:text-danger-700"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
