import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kanban, List, Plus } from 'lucide-react';
import { ApplicationDialog } from '@/components/tracker/ApplicationDialog';
import { KanbanBoard } from '@/components/tracker/KanbanBoard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { DeadlineBadge } from '@/components/scholarship/DeadlineBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buttonClass } from '@/components/ui/buttonStyles';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { scholarshipMap } from '@/lib/catalog';
import { buildTrackedRows, checklistProgress } from '@/lib/tracker';
import { ROUTES, scholarshipPath } from '@/lib/routes';
import { toast } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';
import { STATUS_LABELS, type ApplicationStatus } from '@/types/tracker';

type TrackerView = 'board' | 'list';

const VIEW_ITEMS = [
  { id: 'board' as const, label: 'Board', icon: <Kanban size={16} aria-hidden="true" /> },
  { id: 'list' as const, label: 'List', icon: <List size={16} aria-hidden="true" /> },
];

export const TrackerPage = () => {
  useDocumentTitle('Application tracker');
  const applications = useTrackerStore((state) => state.applications);
  const placeApplication = useTrackerStore((state) => state.placeApplication);
  const removeApplication = useTrackerStore((state) => state.removeApplication);
  const [view, setView] = useState<TrackerView>('board');
  const [openId, setOpenId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const rows = useMemo(() => buildTrackedRows(applications, scholarshipMap), [applications]);
  const removing = removeId ? scholarshipMap.get(removeId) : undefined;

  const handleMove = (scholarshipId: string, status: ApplicationStatus) => {
    placeApplication(scholarshipId, status);
    const name = scholarshipMap.get(scholarshipId)?.name ?? 'Application';
    toast.success(status === 'won' ? 'Scholarship won!' : `Moved to ${STATUS_LABELS[status]}`, name);
  };

  const handleRemove = () => {
    if (!removeId) return;
    const name = scholarshipMap.get(removeId)?.name ?? 'Application';
    removeApplication(removeId);
    setRemoveId(null);
    toast.info('Removed from tracker', name);
  };

  return (
    <>
      <PageHeader
        eyebrow="Prepare and track"
        title="Application tracker"
        description="Drag cards across the board or use the menu on each card. Everything is saved in this browser."
        action={
          <Link to={ROUTES.discover} className={buttonClass('primary', 'md')}>
            <Plus size={18} aria-hidden="true" />
            Find scholarships
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Kanban size={32} aria-hidden="true" />}
          title="Your tracker is empty"
          description="Save a scholarship from Discover and it appears here, ready for you to move through each stage."
          action={
            <Link to={ROUTES.discover} className={buttonClass('primary', 'lg')}>
              Browse scholarships
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Tabs label="Tracker view" items={VIEW_ITEMS} value={view} onChange={setView} className="w-fit" />
          </div>

          {view === 'board' ? (
            <KanbanBoard rows={rows} onOpen={setOpenId} onMove={handleMove} onRemove={setRemoveId} />
          ) : (
            <Card className="divide-y divide-line/70 p-2">
              <ul>
                {rows.map(({ application, scholarship }) => {
                  const progress = checklistProgress(application, scholarship);
                  return (
                    <li key={scholarship.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <Link to={scholarshipPath(scholarship.id)} className="font-semibold text-fg hover:text-link">
                          {scholarship.name}
                        </Link>
                        <p className="text-sm text-muted">
                          {progress.done}/{progress.total} documents ready
                        </p>
                      </div>
                      <DeadlineBadge deadline={scholarship.deadline} />
                      <Badge tone={application.status === 'won' ? 'success' : application.status === 'rejected' ? 'danger' : 'info'}>
                        {STATUS_LABELS[application.status]}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setOpenId(scholarship.id)}>
                          Checklist
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRemoveId(scholarship.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      <ApplicationDialog scholarshipId={openId} onClose={() => setOpenId(null)} />
      <ConfirmDialog
        open={removeId !== null}
        title={`Remove ${removing?.name ?? 'this application'}?`}
        description="This removes the application, its checklist and notes from your tracker."
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onClose={() => setRemoveId(null)}
      />
    </>
  );
};
