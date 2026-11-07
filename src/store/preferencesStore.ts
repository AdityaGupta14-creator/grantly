import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

export const PREFERENCES_STORAGE_KEY = 'grantly-preferences';

export type ThemeMode = 'light' | 'dark' | 'system';

interface PreferencesState {
  theme: ThemeMode;
  seenNotificationIds: string[];
  setTheme: (theme: ThemeMode) => void;
  markNotificationsSeen: (ids: string[]) => void;
  clearSeenNotifications: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      seenNotificationIds: [],
      setTheme: (theme) => set({ theme }),
      markNotificationsSeen: (ids) =>
        set((state) => ({ seenNotificationIds: Array.from(new Set([...state.seenNotificationIds, ...ids])) })),
      clearSeenNotifications: () => set({ seenNotificationIds: [] }),
    }),
    { name: PREFERENCES_STORAGE_KEY, storage: createJSONStorage(() => localStorage) },
  ),
);
