import { AlarmClock, CalendarDays, CircleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDeadline, formatShortDate, getUrgency } from '@/lib/dates';

interface DeadlineBadgeProps {
  deadline: string;
}

export const DeadlineBadge = ({ deadline }: DeadlineBadgeProps) => {
  const urgency = getUrgency(deadline);
  const label = `${formatRelativeDeadline(deadline)} (${formatShortDate(deadline)})`;

  if (urgency === 'overdue') {
    return (
      <Badge tone="danger" icon={<CircleAlert size={14} aria-hidden="true" />}>
        Closed {formatShortDate(deadline)}
      </Badge>
    );
  }
  if (urgency === 'urgent') {
    return (
      <Badge tone="urgent" icon={<AlarmClock size={14} aria-hidden="true" />}>
        {label}
      </Badge>
    );
  }
  return (
    <Badge tone={urgency === 'upcoming' ? 'info' : 'neutral'} icon={<CalendarDays size={14} aria-hidden="true" />}>
      {label}
    </Badge>
  );
};
