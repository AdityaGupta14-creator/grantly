import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Card className="flex flex-col items-center px-6 py-12 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pale text-primary" aria-hidden="true">
      {icon}
    </div>
    <h2 className="mt-5 text-lg font-semibold text-fg">{title}</h2>
    <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </Card>
);
