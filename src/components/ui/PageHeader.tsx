import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, action }: PageHeaderProps) => (
  <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0 space-y-2">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-link">{eyebrow}</p>}
      <h1 className="font-heading text-3xl font-bold text-fg sm:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-base text-muted">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
  </header>
);
