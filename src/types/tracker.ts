import type { DocumentId } from '@/types/options';
import type { UserProfile } from '@/types/profile';

export const APPLICATION_STATUSES = ['saved', 'preparing', 'submitted', 'won', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  preparing: 'Preparing',
  submitted: 'Submitted',
  won: 'Won',
  rejected: 'Rejected',
};

export interface TrackedApplication {
  scholarshipId: string;
  status: ApplicationStatus;
  checklist: Partial<Record<DocumentId, boolean>>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSnapshot {
  profile: UserProfile | null;
  applications: Record<string, TrackedApplication>;
  reminderIds: string[];
}
