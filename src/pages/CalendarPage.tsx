import { AlertCircle, BellRing, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toggle } from '@/components/ui/Toggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buildMonthGrid, groupByDeadline } from '@/lib/calendar';
import { selectRelevantDeadlines } from '@/lib/deadlines';
import { formatDate, getUrgency, startOfToday, toISODate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { useTrackerStore } from '@/store/trackerStore';
import { useMatches } from '@/hooks/useMatches';
import type { Scholarship } from '@/types/scholarship';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dayTone = (iso: string): string => {
  const urgency = getUrgency(iso);
  if (urgency === 'overdue') return 'bg-raised text-muted line-through decoration-muted/60';
  if (urgency === 'urgent') return 'bg-urgent text-ink font-bold';
  return 'bg-pale text-ink';
};

const monthTitle = (year: number, month: number): string =>
  new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export const CalendarPage = () => {
  useDocumentTitle('Deadline calendar');
  const today = startOfToday();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(toISODate(today));
  const reminderIds = useTrackerStore((state) => state.reminderIds);
  const applications = useTrackerStore((state) => state.applications);
  const toggleReminder = useTrackerStore((state) => state.toggleReminder);
  const entries = useMatches();

  const weeks = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const byDate = useMemo(
    () => groupByDeadline(selectRelevantDeadlines(entries, Object.values(applications)).map((item) => item.scholarship)),
    [entries, applications],
  );
  const dueOnSelected: Scholarship[] = byDate.get(selected) ?? [];

  const shift = (delta: number) =>
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  return (
    <>
      <PageHeader eyebrow="Plan ahead" title="Deadline calendar" description="Orange days close within a week. Select a date to see what is due." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-2 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft size={18} aria-hidden="true" />
            </Button>
            <h2 className="font-heading text-lg font-semibold text-fg" aria-live="polite">
              {monthTitle(cursor.year, cursor.month)}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </div>
          <table className="w-full border-separate border-spacing-1 text-center" aria-label="Deadlines by day">
            <thead>
              <tr>
                {WEEKDAYS.map((day) => (
                  <th key={day} scope="col" className="pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0].iso}>
                  {week.map((cell) => {
                    const count = byDate.get(cell.iso)?.length ?? 0;
                    const isSelected = cell.iso === selected;
                    return (
                      <td key={cell.iso} className="p-0">
                        <button
                          type="button"
                          onClick={() => setSelected(cell.iso)}
                          aria-pressed={isSelected}
                          className={cn(
                            'relative flex aspect-square min-h-11 w-full flex-col items-center justify-center rounded-xl text-sm transition hover:ring-2 hover:ring-action/50',
                            count > 0 ? dayTone(cell.iso) : (!cell.inMonth ? 'text-muted hover:bg-raised' : 'text-fg hover:bg-raised'),
                            isSelected && 'ring-2 ring-primary',
                          )}
                        >
                          <span className="sr-only">
                            {formatDate(cell.iso)}{count > 0 ? `, ${count} deadline${count === 1 ? '' : 's'}, ${getUrgency(cell.iso) === 'urgent' ? 'within 7 days' : getUrgency(cell.iso) === 'overdue' ? 'closed' : 'upcoming'}` : ''}
                          </span>
                          <span aria-hidden="true">{cell.date.getDate()}</span>
                          {count > 0 && <span aria-hidden="true" className="mt-0.5 text-[10px] font-bold">{count}</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted">
            <span className="flex items-center gap-2"><AlertCircle size={14} aria-hidden="true" className="text-urgent-700" />Within 7 days</span>
            <span className="flex items-center gap-2"><Clock3 size={14} aria-hidden="true" />Upcoming</span>
            <span className="flex items-center gap-2"><span aria-hidden="true" className="font-bold">×</span>Closed</span>
          </div>
        </Card>

        <section aria-labelledby="agenda-title" className="space-y-4">
          <h2 id="agenda-title" className="font-heading text-xl font-semibold text-fg">
            Due on {formatDate(selected)}
          </h2>
          {dueOnSelected.length === 0 ? (
            <Card className="p-6 text-sm text-muted">Nothing is due on this date. Pick a highlighted day to see deadlines.</Card>
          ) : (
            <ul className="space-y-3">
              {dueOnSelected.map((scholarship) => (
                <li key={scholarship.id}>
                  <Card className="space-y-3 p-4">
                    <p className="font-semibold text-fg">{scholarship.name}</p>
                    <p className="text-sm text-muted">{scholarship.provider}</p>
                    <DeadlineBadge deadline={scholarship.deadline} />
                    <Toggle
                      checked={reminderIds.includes(scholarship.id)}
                      onChange={() => {
                        toggleReminder(scholarship.id);
                      }}
                      label="Add reminder"
                      description="Shows this deadline in your notification bell."
                    />
                  </Card>
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-center gap-2 text-xs text-muted">
            <BellRing size={14} aria-hidden="true" />
            Reminders appear in the bell icon when a deadline is within 7 days.
          </p>
        </section>
      </div>
    </>
  );
};
