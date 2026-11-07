import { DEMO_PROFILE } from '@/data/demoProfile';
import type { DocumentId } from '@/types/options';
import type { UserProfile } from '@/types/profile';
import type { ApplicationStatus, TrackedApplication } from '@/types/tracker';
import { useProfileStore } from '@/store/profileStore';
import { useTrackerStore, type TrackerData } from '@/store/trackerStore';
import { useCompareStore } from '@/store/compareStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { workspaceExportSchema } from '@/lib/schemas';

const EXPORT_VERSION = 1;

interface WorkspaceExport {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  profile: UserProfile | null;
  tracker: TrackerData;
}

const DEMO_APPLICATIONS: Array<{
  scholarshipId: string;
  status: ApplicationStatus;
  checked: DocumentId[];
  notes: string;
}> = [
  { scholarshipId: 'pragati', status: 'saved', checked: [], notes: 'Check whether the first-year admission letter is ready.' },
  {
    scholarshipId: 'maharashtra-obc',
    status: 'preparing',
    checked: ['aadhaar', 'marksheet', 'caste_certificate'],
    notes: 'Need the domicile proof from the tehsil office.',
  },
  {
    scholarshipId: 'pm-yasasvi-obc',
    status: 'preparing',
    checked: ['aadhaar', 'marksheet', 'bank_passbook', 'caste_certificate'],
    notes: 'Income certificate renewal is in progress.',
  },
  {
    scholarshipId: 'aarohi-csr',
    status: 'submitted',
    checked: ['aadhaar', 'marksheet', 'bank_passbook', 'income_certificate', 'passport_photo'],
    notes: 'Submitted via the trust portal. Result expected next month.',
  },
  {
    scholarshipId: 'first-gen-bridge',
    status: 'won',
    checked: ['aadhaar', 'income_certificate', 'bank_passbook'],
    notes: 'Mentor call scheduled for next week.',
  },
];

const buildDemoTracker = (): TrackerData => {
  const now = new Date().toISOString();
  const applications: Record<string, TrackedApplication> = {};
  for (const demo of DEMO_APPLICATIONS) {
    const checklist: Partial<Record<DocumentId, boolean>> = {};
    for (const doc of demo.checked) checklist[doc] = true;
    applications[demo.scholarshipId] = {
      scholarshipId: demo.scholarshipId,
      status: demo.status,
      checklist,
      notes: demo.notes,
      createdAt: now,
      updatedAt: now,
    };
  }
  return { applications, reminderIds: ['pragati', 'maharashtra-obc', 'pm-yasasvi-obc'] };
};

/** Load the demo profile, partial document progress, and near-term reminders. */
export const loadDemoWorkspace = (): void => {
  useProfileStore.getState().setProfile({ ...DEMO_PROFILE, updatedAt: new Date().toISOString() });
  useTrackerStore.getState().replaceTracker(buildDemoTracker());
  useCompareStore.getState().clearCompare();
  usePreferencesStore.getState().clearSeenNotifications();
};

/** Clear profile, tracker, comparison, and notification state for this browser. */
export const resetWorkspace = (): void => {
  useProfileStore.getState().setProfile(null);
  useTrackerStore.getState().replaceTracker({ applications: {}, reminderIds: [] });
  useCompareStore.getState().clearCompare();
  usePreferencesStore.getState().clearSeenNotifications();
};

/** Serialize the current local workspace into a versioned JSON backup. */
export const exportWorkspace = (): string => {
  const payload: WorkspaceExport = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: useProfileStore.getState().profile,
    tracker: {
      applications: useTrackerStore.getState().applications,
      reminderIds: useTrackerStore.getState().reminderIds,
    },
  };
  return JSON.stringify(payload, null, 2);
};

/** Validate and sanitize a size-limited workspace backup before it is imported. */
export const validateWorkspaceExport = (text: string): WorkspaceExport => {
  if (new TextEncoder().encode(text).byteLength > 1_048_576) {
    throw new Error('This backup is larger than 1 MB. Choose a smaller Grantly JSON file.');
  }
  let data: unknown;
  try { data = JSON.parse(text); } catch {
    throw new Error('This file is not valid JSON. Choose a Grantly JSON backup.');
  }
  const parsed = workspaceExportSchema.safeParse(data);
  if (!parsed.success) throw new Error('This backup is incomplete or contains invalid profile or tracker data.');
  return parsed.data as WorkspaceExport;
};

/** Replace local workspace stores only after the complete backup validates. */
export const importWorkspace = (text: string): void => {
  const parsed = validateWorkspaceExport(text);
  useProfileStore.getState().setProfile(parsed.profile);
  useTrackerStore.getState().replaceTracker(parsed.tracker);
  useCompareStore.getState().clearCompare();
};
