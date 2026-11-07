import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';

interface SaveButtonProps {
  scholarshipId: string;
  name: string;
  className?: string;
}

export const SaveButton = ({ scholarshipId, name, className }: SaveButtonProps) => {
  const saved = useTrackerStore((state) => Boolean(state.applications[scholarshipId]));
  const placeApplication = useTrackerStore((state) => state.placeApplication);
  const removeApplication = useTrackerStore((state) => state.removeApplication);

  const handleClick = () => {
    if (saved) {
      removeApplication(scholarshipId);
      toast.info('Removed from tracker', name);
    } else {
      placeApplication(scholarshipId, 'saved');
      toast.success('Saved to your tracker', name);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Save'} ${name}`}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:-translate-y-0.5',
        saved ? 'border-primary bg-primary text-white shadow-sm' : 'border-line bg-surface text-fg hover:bg-raised',
        className,
      )}
    >
      <Bookmark size={16} aria-hidden="true" className={cn(saved && 'fill-current')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
};
