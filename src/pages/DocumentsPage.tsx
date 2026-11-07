import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { DOCUMENT_CATALOG } from '@/data/documents';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { scholarshipMap } from '@/lib/catalog';
import { buildDocumentVault } from '@/lib/tracker';
import { ROUTES, scholarshipPath } from '@/lib/routes';
import { useTrackerStore } from '@/store/trackerStore';
import { buttonClass } from '@/components/ui/buttonStyles';
import { cn } from '@/lib/cn';

export const DocumentsPage = () => {
  useDocumentTitle('Document vault');
  const applications = useTrackerStore((state) => state.applications);
  const vault = buildDocumentVault(Object.values(applications), scholarshipMap);

  return (
    <>
      <PageHeader
        eyebrow="Prepare once"
        title="Document vault"
        description="Every document your tracked applications need, grouped so you can prepare each one once."
      />

      {vault.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} aria-hidden="true" />}
          title="No documents to prepare yet"
          description="Save an application and its document checklist will be grouped here."
          action={
            <Link to={ROUTES.discover} className={buttonClass('primary', 'lg')}>
              Find scholarships
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {vault.map((entry) => {
            const percent = Math.round((entry.readyCount / entry.items.length) * 100);
            const complete = entry.readyCount === entry.items.length;
            return (
              <li key={entry.documentId}>
                <Card className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-lg font-semibold text-fg">{DOCUMENT_CATALOG[entry.documentId].label}</h2>
                      <p className="text-sm text-muted">{DOCUMENT_CATALOG[entry.documentId].description}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
                        complete ? 'bg-success-100 text-success-700' : 'bg-urgent-100 text-urgent-900',
                      )}
                    >
                      {complete ? 'All ready' : `${entry.readyCount}/${entry.items.length} ready`}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-fg">
                    Needed for {entry.items.length} scholarship{entry.items.length === 1 ? '' : 's'}
                  </p>
                  <div
                    role="progressbar"
                    aria-label={`${DOCUMENT_CATALOG[entry.documentId].label} readiness`}
                    aria-valuemin={0}
                    aria-valuemax={entry.items.length}
                    aria-valuenow={entry.readyCount}
                    className="h-2 overflow-hidden rounded-full bg-raised"
                  >
                    <div className="h-full rounded-full bg-action" style={{ width: `${percent}%` }} />
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {entry.items.map((item) => (
                      <li key={item.scholarshipId}>
                        <Link
                          to={scholarshipPath(item.scholarshipId)}
                          className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-fg hover:bg-raised"
                        >
                          {item.ready ? 'Ready: ' : 'Needed: '}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
