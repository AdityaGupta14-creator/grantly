import { useId } from 'react';
import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export const Toggle = ({ checked, onChange, label, description, className }: ToggleProps) => {
  const labelId = useId();
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <span id={labelId} className="text-sm font-semibold text-fg">
          {label}
        </span>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-11 w-12 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className={cn('absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-full transition-colors duration-200', checked ? 'bg-primary' : 'bg-line')} />
        <span
          aria-hidden="true"
          className={cn('absolute left-0.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0')}
        />
      </button>
    </div>
  );
};
