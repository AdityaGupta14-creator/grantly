import { useMemo } from 'react';
import { scholarships } from '@/data/scholarships';
import type { ScholarshipEntry } from '@/lib/discover';
import { evaluateScholarship } from '@/lib/match';
import { useProfileStore } from '@/store/profileStore';

export const useMatches = (): ScholarshipEntry[] => {
  const profile = useProfileStore((state) => state.profile);
  return useMemo(
    () =>
      profile ? scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, profile) })) : [],
    [profile],
  );
};
