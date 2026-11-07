import { DEMO_PROFILE } from '@/data/demoProfile';
import { CATEGORIES, EDUCATION_LEVELS, FIELDS_OF_STUDY, GENDERS, INCOME_BANDS, SPECIAL_FLAGS, STATES, DOCUMENT_IDS } from '@/types/options';
import type { DocumentId } from '@/types/options';
import type { UserProfile } from '@/types/profile';
import { APPLICATION_STATUSES, type ApplicationStatus, type TrackedApplication } from '@/types/tracker';
import { useProfileStore } from '@/store/profileStore';
import { useTrackerStore, type TrackerData } from '@/store/trackerStore';
import { useCompareStore } from '@/store/compareStore';
import { usePreferencesStore } from '@/store/preferencesStore';

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

export const loadDemoWorkspace = (): void => {
  useProfileStore.getState().setProfile({ ...DEMO_PROFILE, updatedAt: new Date().toISOString() });
  useTrackerStore.getState().replaceTracker(buildDemoTracker());
  useCompareStore.getState().clearCompare();
  usePreferencesStore.getState().clearSeenNotifications();
};

export const resetWorkspace = (): void => {
  useProfileStore.getState().setProfile(null);
  useTrackerStore.getState().replaceTracker({ applications: {}, reminderIds: [] });
  useCompareStore.getState().clearCompare();
  usePreferencesStore.getState().clearSeenNotifications();
};

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = <T extends string>(options: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);

const isProfile = (value: unknown): value is UserProfile => {
  if (!isRecord(value)) return false;
  return (
    typeof value.name === 'string' &&
    isOneOf(EDUCATION_LEVELS, value.level) &&
    isOneOf(FIELDS_OF_STUDY, value.field) &&
    isOneOf(STATES, value.state) &&
    isOneOf(CATEGORIES, value.category) &&
    (value.gender == null || isOneOf(GENDERS, value.gender)) &&
    (value.incomeBand == null || isOneOf(INCOME_BANDS.map((band) => band.id), value.incomeBand)) &&
    (value.percentage == null || (typeof value.percentage === 'number' && value.percentage >= 0 && value.percentage <= 100)) &&
    (value.flags === undefined || (Array.isArray(value.flags) && value.flags.every((flag) => isOneOf(SPECIAL_FLAGS, flag)))) &&
    (value.flagsKnown === undefined || typeof value.flagsKnown === 'boolean') &&
    typeof value.isDemo === 'boolean' &&
    typeof value.updatedAt === 'string'
  );
};

const isTrackedApplication = (value: unknown): value is TrackedApplication => {
  if (!isRecord(value)) return false;
  if (!isRecord(value.checklist)) return false;
  const checklistValid = Object.entries(value.checklist).every(
    ([key, checked]) => isOneOf(DOCUMENT_IDS, key) && typeof checked === 'boolean',
  );
  return (
    typeof value.scholarshipId === 'string' &&
    isOneOf(APPLICATION_STATUSES, value.status) &&
    checklistValid &&
    typeof value.notes === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
};

export const validateWorkspaceExport = (text: string): WorkspaceExport => {
  const data: unknown = JSON.parse(text);
  if (!isRecord(data) || data.version !== EXPORT_VERSION || !isRecord(data.tracker) || typeof data.exportedAt !== 'string' || Number.isNaN(Date.parse(data.exportedAt))) {
    throw new Error('This file is not a Grantly export.');
  }
  const { profile, tracker } = data;
  if (profile !== null && !isProfile(profile)) throw new Error('The profile in this file is incomplete.');
  if (!isRecord(tracker.applications) || !Array.isArray(tracker.reminderIds)) {
    throw new Error('The tracker data in this file is incomplete.');
  }
  const applications = Object.values(tracker.applications);
  if (!applications.every(isTrackedApplication) || Object.entries(tracker.applications).some(([id, application]) => !isTrackedApplication(application) || application.scholarshipId !== id)) throw new Error('Some applications in this file are invalid.');
  if (!tracker.reminderIds.every((id): id is string => typeof id === 'string')) {
    throw new Error('Reminder data in this file is invalid.');
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: data.exportedAt,
    profile,
    tracker: {
      applications: tracker.applications as Record<string, TrackedApplication>,
      reminderIds: tracker.reminderIds as string[],
    },
  };
};

export const importWorkspace = (text: string): void => {
  const parsed = validateWorkspaceExport(text);
  useProfileStore.getState().setProfile(parsed.profile);
  useTrackerStore.getState().replaceTracker(parsed.tracker);
  useCompareStore.getState().clearCompare();
};
