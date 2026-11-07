import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DOCUMENT_CATALOG } from '@/data/documents';
import { cn } from '@/lib/cn';
import { findScholarship } from '@/lib/catalog';
import { checklistProgress } from '@/lib/tracker';
import { toast } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';
import { Check } from 'lucide-react';

interface ApplicationDialogProps {
  scholarshipId: string | null;
  onClose: () => void;
}

export const ApplicationDialog = ({ scholarshipId, onClose }: ApplicationDialogProps) => {
  const application = useTrackerStore((state) => (scholarshipId ? state.applications[scholarshipId] : undefined));
  const toggleDocument = useTrackerStore((state) => state.toggleDocument);
  const setNotes = useTrackerStore((state) => state.setNotes);
  const scholarship = scholarshipId ? findScholarship(scholarshipId) : undefined;
  const [notes, setNotesDraft] = useState('');

  useEffect(() => {
    setNotesDraft(application?.notes ?? '');
  }, [application?.scholarshipId, application?.notes]);

  if (!application || !scholarship) return null;

  const progress = checklistProgress(application, scholarship);
  const notesChanged = notes !== application.notes;

  return (
    <Modal
      open
      onClose={onClose}
      title={scholarship.name}
      description={`${progress.done} of ${progress.total} documents ready`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={!notesChanged}
            onClick={() => {
              setNotes(scholarship.id, notes.trim());
              toast.success('Notes saved', scholarship.name);
            }}
          >
            Save notes
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section aria-labelledby="checklist-heading" className="space-y-3">
          <h3 id="checklist-heading" className="font-semibold text-fg">
            Document checklist
          </h3>
          <ul className="space-y-2">
            {scholarship.documents.map((doc) => {
              const ready = application.checklist[doc] === true;
              return (
                <li key={doc}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={ready}
                    onClick={() => {
                      toggleDocument(scholarship.id, doc);
                    }}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-2 text-left transition',
                      ready ? 'border-success bg-success-50' : 'border-line bg-surface hover:bg-raised',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                        ready ? 'border-success bg-success text-white' : 'border-line bg-surface',
                      )}
                    >
                      {ready && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-fg">{DOCUMENT_CATALOG[doc].label}</span>
                      <span className="block text-xs text-muted">{ready ? 'Ready' : 'Still needed'}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-2">
          <label htmlFor="application-notes" className="block font-semibold text-fg">
            Notes
          </label>
          <textarea
            id="application-notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotesDraft(event.target.value)}
            placeholder="e.g. Waiting for the income certificate from the tehsil office"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg shadow-sm placeholder:text-muted focus:border-action focus:outline-none focus:ring-2 focus:ring-action/40"
          />
        </section>
      </div>
    </Modal>
  );
};
