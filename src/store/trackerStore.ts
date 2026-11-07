import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import type { DocumentId } from '@/types/options';
import type { ApplicationStatus, TrackedApplication } from '@/types/tracker';

export const TRACKER_STORAGE_KEY = 'grantly-tracker';

export interface TrackerData {
  applications: Record<string, TrackedApplication>;
  reminderIds: string[];
}

interface TrackerState extends TrackerData {
  placeApplication: (scholarshipId: string, status: ApplicationStatus) => void;
  removeApplication: (scholarshipId: string) => void;
  toggleDocument: (scholarshipId: string, documentId: DocumentId) => void;
  setNotes: (scholarshipId: string, notes: string) => void;
  toggleReminder: (scholarshipId: string) => void;
  replaceTracker: (data: TrackerData) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      applications: {},
      reminderIds: [],
      placeApplication: (scholarshipId, status) =>
        set((state) => {
          const now = new Date().toISOString();
          const existing = state.applications[scholarshipId];
          const application: TrackedApplication = existing
            ? { ...existing, status, updatedAt: now }
            : { scholarshipId, status, checklist: {}, notes: '', createdAt: now, updatedAt: now };
          return { applications: { ...state.applications, [scholarshipId]: application } };
        }),
      removeApplication: (scholarshipId) =>
        set((state) => {
          const rest = { ...state.applications };
          delete rest[scholarshipId];
          return {
            applications: rest,
            reminderIds: state.reminderIds.filter((id) => id !== scholarshipId),
          };
        }),
      toggleDocument: (scholarshipId, documentId) =>
        set((state) => {
          const existing = state.applications[scholarshipId];
          if (!existing) return state;
          const checked = existing.checklist[documentId] === true;
          const application: TrackedApplication = {
            ...existing,
            checklist: { ...existing.checklist, [documentId]: !checked },
            updatedAt: new Date().toISOString(),
          };
          return { applications: { ...state.applications, [scholarshipId]: application } };
        }),
      setNotes: (scholarshipId, notes) =>
        set((state) => {
          const existing = state.applications[scholarshipId];
          if (!existing) return state;
          return {
            applications: {
              ...state.applications,
              [scholarshipId]: { ...existing, notes, updatedAt: new Date().toISOString() },
            },
          };
        }),
      toggleReminder: (scholarshipId) =>
        set((state) => ({
          reminderIds: state.reminderIds.includes(scholarshipId)
            ? state.reminderIds.filter((id) => id !== scholarshipId)
            : [...state.reminderIds, scholarshipId],
        })),
      replaceTracker: (data) => set({ applications: data.applications, reminderIds: data.reminderIds }),
    }),
    { name: TRACKER_STORAGE_KEY, storage: createJSONStorage(() => localStorage) },
  ),
);
