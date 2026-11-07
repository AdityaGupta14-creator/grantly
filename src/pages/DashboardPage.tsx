import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarClock, Compass, FileText, Sparkles, UserRound, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMatches } from '@/hooks/useMatches';
import { DOCUMENT_CATALOG } from '@/data/documents';
import { buildTrackedRows, checklistProgress, type TrackedRow } from '@/lib/tracker';
import { formatShortDate } from '@/lib/dates';
import { deadlinesWithinDays, DEADLINE_WINDOW_DAYS, selectRelevantDeadlines } from '@/lib/deadlines';
import { scholarshipMap } from '@/lib/catalog';
import { formatINR } from '@/lib/format';
import { ROUTES, scholarshipPath } from '@/lib/routes';
import { useProfileStore } from '@/store/profileStore';
import { useTrackerStore } from '@/store/trackerStore';
import { STATUS_LABELS, type ApplicationStatus } from '@/types/tracker';

const ACTIVE_STATUSES: ApplicationStatus[] = ['saved', 'preparing', 'submitted'];

const KpiCard = ({ icon: Icon, label, value, format }: { icon: typeof Wallet; label: string; value: number; format?: (n: number) => string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pale text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
    </div>
    <p className="mt-3 font-heading text-3xl font-bold text-fg">
      <AnimatedNumber value={value} format={format} />
    </p>
  </Card>
);

const nextActionFor = (allRows: TrackedRow[]): { title: string; body: string; to: string } => {
  const rows = allRows.filter((row) => ACTIVE_STATUSES.includes(row.application.status));
  const withMissing = rows
    .map((row) => ({ ...row, progress: checklistProgress(row.application, row.scholarship) }))
    .filter((row) => row.progress.done < row.progress.total)
    .sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline));
  const first = withMissing[0];
  if (first) {
    const missingDoc = first.scholarship.documents.find((doc) => first.application.checklist[doc] !== true);
    const docLabel = missingDoc ? DOCUMENT_CATALOG[missingDoc].label : 'your documents';
    return {
      title: `Get ${docLabel} ready for ${first.scholarship.name}`,
      body: `Due ${formatShortDate(first.scholarship.deadline)}. Ticking it off keeps this application on track.`,
      to: scholarshipPath(first.scholarship.id),
    };
  }
  if (allRows.length === 0) {
    return {
      title: 'Save your first scholarship to get a personalised next step',
      body: 'Browse your matches and save the ones you want to pursue.',
      to: ROUTES.discover,
    };
  }
  return {
    title: 'Review your tracker',
    body: 'Everything is ready. Move applications forward as you submit them.',
    to: ROUTES.tracker,
  };
};

export const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const profile = useProfileStore((state) => state.profile);
  const applications = useTrackerStore((state) => state.applications);
  const entries = useMatches();
  const reduceMotion = useReducedMotion();

  const eligible = useMemo(
    () => entries.filter((entry) => entry.match.eligible).sort((a, b) => b.match.score - a.match.score),
    [entries],
  );
  const nearlyEligible = useMemo(
    () => entries.filter((entry) => entry.match.tier === 'nearly_eligible').sort((a, b) => b.match.score - a.match.score),
    [entries],
  );

  const rows = useMemo(() => buildTrackedRows(applications, scholarshipMap), [applications]);
  const active = rows.filter((row) => ACTIVE_STATUSES.includes(row.application.status));
  const relevantDeadlines = useMemo(
    () => selectRelevantDeadlines(entries, Object.values(applications)),
    [entries, applications],
  );
  const upcoming = relevantDeadlines.filter((deadline) => deadline.daysUntil >= 0);
  const dueSoon = deadlinesWithinDays(relevantDeadlines, DEADLINE_WINDOW_DAYS);
  const potential = eligible.reduce((sum, entry) => sum + entry.scholarship.amount, 0);
  const progressTotals = active.reduce(
    (acc, row) => {
      const { done, total } = checklistProgress(row.application, row.scholarship);
      return { done: acc.done + done, total: acc.total + total };
    },
    { done: 0, total: 0 },
  );
  const readiness = progressTotals.total === 0 ? 0 : Math.round((progressTotals.done / progressTotals.total) * 100);
  const recent = [...rows].sort((a, b) => b.application.updatedAt.localeCompare(a.application.updatedAt)).slice(0, 5);
  const action = nextActionFor(rows);

  if (!profile) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={<UserRound size={32} aria-hidden="true" />}
          title="Tell us about you first"
          description="Your dashboard ranks scholarships once we know your education, category and income band."
          action={
            <Link to={ROUTES.onboarding} className={buttonClass('primary', 'lg')}>
              Build my profile
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Hello, ${profile.name.split(' ')[0]}`}
        title="Your scholarship plan"
        description="Here is what you qualify for, what needs attention and what closes next."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={Sparkles} label="Eligible scholarships" value={eligible.length} />
        <KpiCard icon={Compass} label="Nearly eligible" value={nearlyEligible.length} />
        <KpiCard icon={Wallet} label="Potential funding" value={potential} format={formatINR} />
        <KpiCard icon={FileText} label="Applications in progress" value={active.length} />
        <KpiCard icon={CalendarClock} label="Deadlines in 7 days" value={dueSoon.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-5 p-6 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Next best action</p>
          <h2 className="font-heading text-2xl font-bold text-ink">{action.title}</h2>
          <p className="text-ink">{action.body}</p>
          <Link
            to={action.to}
            className={buttonClass('primary', 'md', 'w-fit')}
          >
            {action.to === ROUTES.discover ? 'Browse scholarships' : 'Take this step'}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <ProgressRing
            value={readiness}
            label={`${readiness}% ready`}
            tone={readiness >= 75 ? 'strong' : readiness >= 50 ? 'good' : 'partial'}
            size={112}
            stroke={10}
          />
          <div>
            <h2 className="font-heading text-lg font-semibold text-fg">Application readiness</h2>
            {progressTotals.total === 0 ? (
              <p className="text-sm text-ink">Save a scholarship to start preparing documents and track your readiness here.</p>
            ) : (
              <p className="text-sm text-ink">
                {progressTotals.done} of {progressTotals.total} documents ready across {active.length} applications.
              </p>
            )}
          </div>
        </Card>
      </div>

      <section aria-labelledby="deadlines-title" className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="deadlines-title" className="font-heading text-2xl font-semibold text-fg">
            Upcoming deadlines
          </h2>
          <Link to={ROUTES.calendar} className="text-sm font-semibold text-link hover:underline">
            Open calendar
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Card className="p-6 text-sm text-ink">No relevant upcoming deadlines. Save or track a scholarship to see it here.</Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {upcoming.slice(0, 4).map((deadline) => (
              <li key={deadline.scholarship.id}>
                <Card interactive className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link to={scholarshipPath(deadline.scholarship.id)} className="block truncate font-semibold text-fg hover:text-link">
                      {deadline.scholarship.name}
                    </Link>
                    <p className="text-sm text-ink">{deadline.application ? STATUS_LABELS[deadline.application.status] : 'Eligible match'}</p>
                  </div>
                  <DeadlineBadge deadline={deadline.scholarship.deadline} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="matches-title" className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="matches-title" className="font-heading text-2xl font-semibold text-fg">
            Top matches for you
          </h2>
          <Link to={ROUTES.discover} className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
            See all
            <Compass size={16} aria-hidden="true" />
          </Link>
        </div>
        {eligible.length === 0 ? (
          <Card className="space-y-3 p-6">
            {nearlyEligible.length > 0 ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">You’re close on {nearlyEligible.length} scholarships</p>
                <h3 className="font-heading text-xl font-semibold text-fg">{nearlyEligible[0].scholarship.name}</h3>
                <p className="text-sm text-ink">
                  What to change: {nearlyEligible[0].match.criteria
                    .filter((criterion) => criterion.status === 'near' || criterion.status === 'unknown')
                    .sort((a, b) => (a.status === 'near' ? -1 : 1) - (b.status === 'near' ? -1 : 1) || b.weight - a.weight)[0]?.explanation ?? 'Review the eligibility details and complete any missing profile information.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to={scholarshipPath(nearlyEligible[0].scholarship.id)} className="text-sm font-semibold text-link underline underline-offset-4">See this match</Link>
                  <Link to={ROUTES.profile} className="text-sm font-semibold text-link underline underline-offset-4">Update your profile</Link>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-fg">No eligible scholarships match your current answers yet.</p>
                <p className="text-sm text-ink">Check that your education, marks, category and income are up to date. You can edit them at any time.</p>
                <Link to={ROUTES.profile} className="text-sm font-semibold text-link underline underline-offset-4">Review your profile</Link>
              </>
            )}
          </Card>
        ) : (
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6" aria-label="Top matches">
            {eligible.slice(0, 6).map((entry, index) => (
              <motion.li
                key={entry.scholarship.id}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: reduceMotion ? 0 : 0.35 }}
                className="w-[18rem] shrink-0 snap-start sm:w-80"
              >
                <ScholarshipCard entry={entry} />
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="activity-title" className="mt-10 space-y-4">
        <h2 id="activity-title" className="font-heading text-2xl font-semibold text-fg">
          Recent activity
        </h2>
        {recent.length === 0 ? (
          <Card className="p-6 text-sm text-ink">Your recent saves and status changes will appear here.</Card>
        ) : (
          <Card className="divide-y divide-line/70 p-2">
            <ul>
              {recent.map((row) => (
                <li key={row.application.scholarshipId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link to={scholarshipPath(row.scholarship.id)} className="font-semibold text-fg hover:text-link">
                      {row.scholarship.name}
                    </Link>
                    <p className="text-sm text-ink">Updated {formatShortDate(row.application.updatedAt.slice(0, 10))}</p>
                  </div>
                  <Badge tone={row.application.status === 'won' ? 'success' : row.application.status === 'rejected' ? 'danger' : 'info'}>
                    {STATUS_LABELS[row.application.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </>
  );
};
