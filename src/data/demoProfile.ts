import type { UserProfile } from '@/types/profile';

export const DEMO_PROFILE = {
  name: 'Priya Patil',
  level: 'phd',
  field: 'science',
  state: 'Maharashtra',
  category: 'sc',
  gender: 'female',
  incomeBand: 'below_1l',
  percentage: 95,
  flags: ['first_generation', 'minority'],
  isDemo: true,
  updatedAt: new Date(0).toISOString(),
} satisfies UserProfile;
