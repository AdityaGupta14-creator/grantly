const MS_PER_DAY = 86_400_000;

/** Format a date as a calendar-day ISO string without a time component. */
export const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Parse an ISO calendar date in local time to avoid timezone day shifts. */
export const parseISODate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Return the start of the current local calendar day. */
export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Add a number of calendar days while preserving local time. */
export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Create an ISO calendar date offset from today. */
export const daysFromNow = (days: number): string => toISODate(addDays(new Date(), days));

/** Calculate whole calendar days from today to a deadline. */
export const daysUntil = (iso: string): number =>
  Math.round((parseISODate(iso).getTime() - startOfToday().getTime()) / MS_PER_DAY);

export const URGENT_WINDOW_DAYS = 7;

export type Urgency = 'overdue' | 'urgent' | 'upcoming' | 'later';

/** Map a deadline to overdue, urgent, or upcoming urgency. */
export const getUrgency = (iso: string): Urgency => {
  const days = daysUntil(iso);
  if (days < 0) return 'overdue';
  if (days <= URGENT_WINDOW_DAYS) return 'urgent';
  if (days <= 30) return 'upcoming';
  return 'later';
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

/** Format an ISO calendar date using the user's locale. */
export const formatDate = (iso: string): string => dateFormatter.format(parseISODate(iso));

/** Format an ISO calendar date using a compact month/day display. */
export const formatShortDate = (iso: string): string => shortDateFormatter.format(parseISODate(iso));

/** Describe a deadline relative to today in plain language. */
export const formatRelativeDeadline = (iso: string): string => {
  const days = daysUntil(iso);
  if (days < 0) return `Closed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
};
