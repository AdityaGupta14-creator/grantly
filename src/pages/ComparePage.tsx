import { Scale, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMatches } from '@/hooks/useMatches';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/format';
import { ROUTES, scholarshipPath } from '@/lib/routes';
import { DOCUMENT_CATALOG } from '@/data/documents';
import { useCompareStore } from '@/store/compareStore';
import type { ScholarshipEntry } from '@/lib/discover';
import { AMOUNT_TYPE_LABELS, PROVIDER_LABELS } from '@/types/options';

const bestIndex = (values: number[], pick: 'max' | 'min'): number => {
  if (values.length === 0) return -1;
  const target = pick === 'max' ? Math.max(...values) : Math.min(...values);
  return values.indexOf(target);
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <tr className="border-t border-line/70">
    <th scope="row" className="w-40 bg-raised/60 px-4 py-4 text-left text-sm font-semibold text-fg">
      {label}
    </th>
    {children}
  </tr>
);

export const ComparePage = () => {
  useDocumentTitle('Compare scholarships');
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const entries = useMatches();
  const chosen: ScholarshipEntry[] = selectedIds
    .map((id) => entries.find((entry) => entry.scholarship.id === id))
    .filter((entry): entry is ScholarshipEntry => entry !== undefined);

  if (chosen.length < 2) {
    return (
      <>
        <PageHeader title="Compare scholarships" />
        <EmptyState
          icon={<Scale size={32} aria-hidden="true" />}
          title="Pick at least two scholarships"
          description="Tick the Compare box on any scholarship card. Your selections appear in the tray at the bottom."
          action={
            <Link to={ROUTES.discover} className={buttonClass('primary', 'lg')}>
              Browse scholarships
            </Link>
          }
        />
      </>
    );
  }

  const amountBest = bestIndex(chosen.map((entry) => entry.scholarship.amount), 'max');
  const scoreBest = bestIndex(chosen.map((entry) => entry.match.score), 'max');
  const deadlineBest = bestIndex(
    chosen.map((entry) => new Date(entry.scholarship.deadline).getTime()),
    'min',
  );

  const cell = (highlight: boolean, content: ReactNode) => (
    <td className={cn('px-4 py-4 align-top text-sm text-fg', highlight && 'bg-pale/60')}>
      {highlight && (
        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-cyan px-2 py-0.5 text-xs font-bold text-ink">
          <Trophy size={12} aria-hidden="true" />
          Best
        </span>
      )}
      <div>{content}</div>
    </td>
  );

  return (
    <>
      <PageHeader
        eyebrow="Side by side"
        title="Compare scholarships"
        description="The best value in each row is highlighted with a label, not only colour."
      />
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[40rem] border-collapse">
          <caption className="sr-only">Comparison of selected scholarships</caption>
          <thead>
            <tr>
              <th scope="col" className="w-40 px-4 py-4 text-left text-sm font-semibold text-muted">
                Scholarship
              </th>
              {chosen.map((entry) => (
                <th key={entry.scholarship.id} scope="col" className="px-4 py-4 text-left align-top">
                  <Link to={scholarshipPath(entry.scholarship.id)} className="font-heading text-base font-semibold text-fg hover:text-link">
                    {entry.scholarship.name}
                  </Link>
                  <p className="mt-1 text-xs font-normal text-muted">{entry.scholarship.provider}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Amount">
              {chosen.map((entry, index) =>
                cell(
                  index === amountBest,
                  <>
                    <span className="font-heading text-lg font-bold">{formatAmount(entry.scholarship)}</span>
                    <p className="text-xs text-muted">{AMOUNT_TYPE_LABELS[entry.scholarship.amountType]}</p>
                  </>,
                ),
              )}
            </Row>
            <Row label="Deadline">
              {chosen.map((entry, index) => cell(index === deadlineBest, <DeadlineBadge deadline={entry.scholarship.deadline} />))}
            </Row>
            <Row label="Match score">
              {chosen.map((entry, index) =>
                cell(
                  index === scoreBest,
                  <span className="font-heading text-lg font-bold">
                    {entry.match.score}/100 {entry.match.eligible ? '(eligible)' : '(not eligible)'}
                  </span>,
                ),
              )}
            </Row>
            <Row label="Provider">
              {chosen.map((entry) => cell(false, PROVIDER_LABELS[entry.scholarship.providerType]))}
            </Row>
            <Row label="Eligibility">
              {chosen.map((entry) => cell(false, <span className="text-muted">{entry.scholarship.plainEligibilityText}</span>))}
            </Row>
            <Row label="Documents">
              {chosen.map((entry) =>
                cell(
                  false,
                  <ul className="space-y-1">
                    {entry.scholarship.documents.map((doc) => (
                      <li key={doc}>{DOCUMENT_CATALOG[doc].label}</li>
                    ))}
                  </ul>,
                ),
              )}
            </Row>
            <Row label="Status">
              {chosen.map((entry) =>
                cell(
                  false,
                  <Badge tone={entry.match.eligible ? 'success' : 'danger'}>
                    {entry.match.eligible ? 'You are eligible' : 'Not eligible yet'}
                  </Badge>,
                ),
              )}
            </Row>
          </tbody>
        </table>
      </Card>
    </>
  );
};
