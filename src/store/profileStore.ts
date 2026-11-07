import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import type { UserProfile } from '@/types/profile';

export const PROFILE_STORAGE_KEY = 'grantly-profile';

export type ProfileDraft = Omit<UserProfile, 'isDemo' | 'updatedAt'>;

interface ProfileState {
  profile: UserProfile | null;
  saveProfile: (draft: ProfileDraft) => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      saveProfile: (draft) => set({ profile: { ...draft, isDemo: false, updatedAt: new Date().toISOString() } }),
      setProfile: (profile) => set({ profile }),
    }),
    { name: PROFILE_STORAGE_KEY, storage: createJSONStorage(() => localStorage) },
  ),
);
