import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const Tabs = <T extends string>({ label, items, value, onChange, className }: TabsProps<T>) => {
  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + items.length) % items.length;
    onChange(items[next].id);
    const container = event.currentTarget.parentElement;
    (container?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex gap-1 overflow-x-auto rounded-2xl bg-raised p-1', className)}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKey(event, index)}
            className={cn(
              'inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition',
              selected ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-fg',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
