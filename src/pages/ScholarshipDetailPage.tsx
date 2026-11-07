import { ArrowUpRight, CalendarDays, CircleCheck, ListChecks, Play, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { MatchBreakdown } from '@/components/scholarship/MatchBreakdown';
import { SaveButton } from '@/components/scholarship/SaveButton';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Toggle } from '@/components/ui/Toggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DOCUMENT_CATALOG } from '@/data/documents';
import { findScholarship } from '@/lib/catalog';
import { safeExternalUrl } from '@/lib/externalUrl';
import { formatAmount } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { evaluateScholarship, scoreTone } from '@/lib/match';
import { ROUTES } from '@/lib/routes';
import { toast } from '@/store/toastStore';
import { useProfileStore } from '@/store/profileStore';
import { useTrackerStore } from '@/store/trackerStore';
import { AMOUNT_TYPE_LABELS, PROVIDER_LABELS } from '@/types/options';

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: 'Can I apply if I am still in school?',
    answer: 'Most schemes accept students who are enrolled in a recognised institution on the date of application. Check the eligibility list above.',
  },
  {
    question: 'Is there an application fee?',
    answer: 'Government portals are free. Some private and NGO schemes may ask for a small processing fee, which is always shown on their official site.',
  },
  {
    question: 'What if I miss the deadline?',
    answer: 'Late windows are rare. Keep the application in your tracker so you can apply the moment a new window opens.',
  },
  {
    question: 'How is the money paid?',
    answer: 'Most schemes transfer money directly to the bank account you link during registration, so keep your passbook details accurate.',
  },
];

export const ScholarshipDetailPage = () => {
  const { id = '' } = useParams();
  const scholarship = findScholarship(id);
  const officialUrl = scholarship ? safeExternalUrl(scholarship.officialUrl) : null;
  const profile = useProfileStore((state) => state.profile);
  const tracked = useTrackerStore((state) => (scholarship ? state.applications[scholarship.id] : undefined));
  const placeApplication = useTrackerStore((state) => state.placeApplication);
  const [plain, setPlain] = useState(false);

  useDocumentTitle(scholarship ? scholarship.name : 'Scholarship not found');

  if (!scholarship) {
    return (
      <>
        <PageHeader title="Scholarship not found" />
        <EmptyState
          icon={<ListChecks size={32} aria-hidden="true" />}
          title="We could not find that scholarship"
          description="It may have been removed or the link is incorrect."
          action={
            <Link to={ROUTES.discover} className={buttonClass('primary', 'lg')}>
              Browse scholarships
            </Link>
          }
        />
      </>
    );
  }

  const match = profile ? evaluateScholarship(scholarship, profile) : null;
  const failing = match?.criteria.filter((criterion) => criterion.status === 'not_met') ?? [];

  const handleStart = () => {
    if (tracked) {
      toast.info('Already in your tracker', 'Open the tracker to continue this application.');
      return;
    }
    placeApplication(scholarship.id, 'preparing');
    toast.success('Application started', 'Use the checklist in your tracker to get documents ready.');
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link to={ROUTES.discover} className="font-semibold text-link hover:underline">
          Discover
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{scholarship.provider}</span>
      </nav>

      <PageHeader
        title={scholarship.name}
        description={scholarship.provider}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton scholarshipId={scholarship.id} name={scholarship.name} className="min-h-11" />
            <Button variant="cta" onClick={handleStart}>
              <Play size={18} aria-hidden="true" />
              Start application
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{PROVIDER_LABELS[scholarship.providerType]}</Badge>
                {scholarship.tags.map((tag) => (
                  <Badge key={tag} tone="info">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 font-heading text-3xl font-bold text-fg">
                  <Wallet size={24} aria-hidden="true" className="text-primary" />
                  {formatAmount(scholarship)}
                </span>
                <span className="text-sm text-muted">{AMOUNT_TYPE_LABELS[scholarship.amountType]}</span>
              </div>
              <DeadlineBadge deadline={scholarship.deadline} />
            </div>
            {match && (
              <div className="flex flex-col items-center gap-2">
                <ProgressRing value={match.score} label={`${match.score}% match`} tone={scoreTone(match.score)} size={96} stroke={9} />
                <p className="text-sm font-semibold text-fg">
                  {match.tier === 'eligible' ? 'You are eligible' : match.tier === 'nearly_eligible' ? 'Nearly eligible' : 'Not eligible'}
                </p>
              </div>
            )}
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-semibold text-fg">About this scholarship</h2>
              <Toggle checked={plain} onChange={setPlain} label="Plain-language mode" />
            </div>
            <p className="text-base text-fg/90">{plain ? scholarship.plainDescription : scholarship.description}</p>
            <div className="rounded-xl bg-raised p-4">
              <h3 className="font-semibold text-fg">Who can apply</h3>
              <p className="mt-1 text-base text-fg/90">{plain ? scholarship.plainEligibilityText : scholarship.eligibilityText}</p>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-heading text-xl font-semibold text-fg">Your eligibility</h2>
            {match ? (
              <>
                <p className="rounded-xl bg-raised px-4 py-3 text-sm font-semibold text-fg">
                  You meet {match.criteria.filter((criterion) => criterion.status === 'met').length} of {match.criteria.length} criteria
                  {match.criteria.some((criterion) => criterion.status === 'near') && (
                    <>; {match.criteria.filter((criterion) => criterion.status === 'near').length} nearly met</>
                  )}
                  {match.criteria.some((criterion) => criterion.status === 'unknown') && (
                    <>; {match.criteria.filter((criterion) => criterion.status === 'unknown').length} need more information</>
                  )}
                  .
                </p>
                {match.tier === 'not_eligible' && (
                  <p role="status" className="rounded-xl bg-danger-50 p-4 text-sm font-medium text-danger-700">
                    You do not meet: {failing.map((criterion) => criterion.label.toLowerCase()).join(', ')}. The reasons are listed below.
                  </p>
                )}
                <MatchBreakdown criteria={match.criteria} />
              </>
            ) : (
              <p className="text-sm text-muted">
                <Link to={ROUTES.onboarding} className="font-semibold text-link hover:underline">
                  Build your profile
                </Link>{' '}
                to see which criteria you meet.
              </p>
            )}
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-heading text-xl font-semibold text-fg">How to apply</h2>
            <ol className="space-y-4">
              {scholarship.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-base text-fg/90">{step}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-heading text-xl font-semibold text-fg">Frequently asked</h2>
            <Accordion items={FAQ_ITEMS} />
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-fg">
              <ListChecks size={20} aria-hidden="true" className="text-primary" />
              Documents you need
            </h2>
            <ul className="space-y-3">
              {scholarship.documents.map((doc) => (
                <li key={doc} className="flex items-start gap-3">
                  <CircleCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <p className="text-sm font-semibold text-fg">{DOCUMENT_CATALOG[doc].label}</p>
                    <p className="text-sm text-muted">{DOCUMENT_CATALOG[doc].description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-fg">
              <CalendarDays size={20} aria-hidden="true" className="text-primary" />
              Important dates
            </h2>
            <p className="text-sm text-fg/90">
              Closes <strong>{formatDate(scholarship.deadline)}</strong>
            </p>
          </Card>

          <Card className="space-y-3 p-6">
            <p className="text-sm text-muted">Always confirm details on the official website before you apply.</p>
            {officialUrl && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('secondary', 'md', 'w-full')}
              >
                Visit official website
                <ArrowUpRight size={18} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
};
