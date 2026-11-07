import { DOCUMENT_IDS, type DocumentId } from '@/types/options';
import type { Scholarship } from '@/types/scholarship';
import type { ApplicationStatus, TrackedApplication } from '@/types/tracker';
import { DEADLINE_WINDOW_DAYS, selectRelevantDeadlines } from '@/lib/deadlines';
import type { ScholarshipEntry } from '@/lib/discover';

export const BOARD_COLUMNS = ['saved', 'preparing', 'submitted', 'result'] as const;
export type BoardColumnId = (typeof BOARD_COLUMNS)[number];

export const columnForStatus = (status: ApplicationStatus): BoardColumnId => {
  if (status === 'won' || status === 'rejected') return 'result';
  return status;
};

export interface ChecklistProgress {
  done: number;
  total: number;
}

export const checklistProgress = (application: TrackedApplication, scholarship: Scholarship): ChecklistProgress => ({
  done: scholarship.documents.filter((doc) => application.checklist[doc] === true).length,
  total: scholarship.documents.length,
});

export interface VaultItem {
  scholarshipId: string;
  name: string;
  ready: boolean;
}

export interface VaultEntry {
  documentId: DocumentId;
  items: VaultItem[];
  readyCount: number;
}

export const buildDocumentVault = (
  applications: TrackedApplication[],
  scholarshipsById: Map<string, Scholarship>,
): VaultEntry[] => {
  const entries = new Map<DocumentId, VaultItem[]>();

  for (const application of applications) {
    if (application.status === 'rejected') continue;
    const scholarship = scholarshipsById.get(application.scholarshipId);
    if (!scholarship) continue;
    for (const documentId of scholarship.documents) {
      const items = entries.get(documentId) ?? [];
      items.push({
        scholarshipId: scholarship.id,
        name: scholarship.name,
        ready: application.checklist[documentId] === true,
      });
      entries.set(documentId, items);
    }
  }

  return DOCUMENT_IDS.filter((id) => entries.has(id))
    .map((documentId) => {
      const items = entries.get(documentId) ?? [];
      return { documentId, items, readyCount: items.filter((item) => item.ready).length };
    })
    .sort((a, b) => b.items.length - a.items.length);
};

export interface TrackedRow {
  application: TrackedApplication;
  scholarship: Scholarship;
}

export const buildTrackedRows = (
  applications: Record<string, TrackedApplication>,
  scholarshipsById: Map<string, Scholarship>,
): TrackedRow[] =>
  Object.values(applications).flatMap((application) => {
    const scholarship = scholarshipsById.get(application.scholarshipId);
    return scholarship ? [{ application, scholarship }] : [];
  });

export type NotificationKind = 'deadline' | 'overdue' | 'prep';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  scholarshipId: string;
  title: string;
  body: string;
}

export const DEADLINE_ALERT_DAYS = DEADLINE_WINDOW_DAYS;

export const buildNotifications = (
  applications: TrackedApplication[],
  entries: ScholarshipEntry[],
): AppNotification[] => {
  const notifications: AppNotification[] = [];
  const applicationById = new Map(applications.map((application) => [application.scholarshipId, application]));
  const relevantDeadlines = selectRelevantDeadlines(entries, applications);

  for (const deadline of relevantDeadlines) {
    const { scholarship, daysUntil: days } = deadline;
    const application = applicationById.get(scholarship.id);
    if (days < 0 && application && (application.status === 'saved' || application.status === 'preparing')) {
      notifications.push({
        id: `overdue:${scholarship.id}`,
        kind: 'overdue',
        scholarshipId: scholarship.id,
        title: `${scholarship.name} has closed`,
        body: 'The deadline passed before you submitted. Check the official portal for late windows.',
      });
    }

    if (days >= 0 && days <= DEADLINE_ALERT_DAYS) {
      notifications.push({
        id: `deadline:${scholarship.id}`,
        kind: 'deadline',
        scholarshipId: scholarship.id,
        title: `${scholarship.name} closes ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`,
        body: 'Submit before the deadline to stay in the running.',
      });
    }

    if (application?.status === 'preparing' && days <= DEADLINE_ALERT_DAYS) {
      const { done, total } = checklistProgress(application, scholarship);
      const missing = total - done;
      if (missing === 0) continue;
      notifications.push({
        id: `prep:${scholarship.id}`,
        kind: 'prep',
        scholarshipId: scholarship.id,
        title: `${missing} document${missing === 1 ? '' : 's'} still needed`,
        body: `Finish the checklist for ${scholarship.name}.`,
      });
    }
  }

  return notifications.sort((a, b) => a.kind.localeCompare(b.kind));
};
