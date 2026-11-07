export const APP_NAME = 'Grantly';

export const ROUTES = {
  landing: '/',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  discover: '/discover',
  tracker: '/tracker',
  documents: '/documents',
  calendar: '/calendar',
  compare: '/compare',
  profile: '/profile',
} as const;

export const scholarshipPath = (id: string): string => `/scholarship/${id}`;
