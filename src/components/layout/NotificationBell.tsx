import { AlertTriangle, BellRing, CalendarClock, CheckCircle2, Bell } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { deadlinesWithinDays, DEADLINE_WINDOW_DAYS, selectRelevantDeadlines } from '@/lib/deadlines';
import { buildNotifications, type AppNotification } from '@/lib/tracker';
import { scholarshipPath } from '@/lib/routes';
import { useMatches } from '@/hooks/useMatches';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTrackerStore } from '@/store/trackerStore';

const KIND_ICON: Record<AppNotification['kind'], typeof BellRing> = {
  deadline: CalendarClock,
  overdue: AlertTriangle,
  prep: BellRing,
};

export const NotificationBell = () => {
  const applications = useTrackerStore((state) => state.applications);
  const entries = useMatches();
  const seen = usePreferencesStore((state) => state.seenNotificationIds);
  const markSeen = usePreferencesStore((state) => state.markNotificationsSeen);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const notifications = useMemo(
    () => buildNotifications(Object.values(applications), entries),
    [applications, entries],
  );
  const deadlineCount = deadlinesWithinDays(
    selectRelevantDeadlines(entries, Object.values(applications)),
    DEADLINE_WINDOW_DAYS,
  ).length;
  const unread = notifications.filter((item) => !seen.includes(item.id));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Notifications, ${deadlineCount} deadlines within 7 days, ${unread.length} unread alerts`}
        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-surface p-2.5 text-fg shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
      >
        <Bell size={18} aria-hidden="true" />
        {deadlineCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-urgent px-1 text-[11px] font-bold text-ink"
          >
            {deadlineCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-4 shadow-lift"
        >
          <h2 className="mb-3 text-base font-semibold text-fg">Deadlines and prep</h2>
          {unread.length > 0 && <button type="button" onClick={() => markSeen(unread.map((item) => item.id))} className="mb-3 min-h-11 rounded-lg px-3 text-sm font-semibold text-primary underline underline-offset-2">Mark all read ({unread.length})</button>}
          {notifications.length === 0 ? (
            <p className="flex items-center gap-2 py-4 text-sm text-muted">
              <CheckCircle2 size={18} aria-hidden="true" className="text-success-700" />
              You are all caught up.
            </p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {notifications.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <li key={item.id}>
                    <Link
                      to={scholarshipPath(item.scholarshipId)}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-xl p-3 transition hover:bg-raised"
                    >
                      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-fg">{item.title}</span>
                          {item.kind === 'overdue' && <Badge tone="danger">Overdue</Badge>}
                          {item.kind === 'deadline' && <Badge tone="urgent">Urgent</Badge>}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">{item.body}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
