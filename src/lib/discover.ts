import { ALL_INDIA, type Category, type EducationLevel, type FieldOfStudy, type ProviderType, type Region } from '@/types/options';
import type { Scholarship } from '@/types/scholarship';
import type { MatchResult } from '@/lib/match';
import { daysUntil } from '@/lib/dates';

export interface ScholarshipEntry {
  scholarship: Scholarship;
  match: MatchResult;
}

export const AMOUNT_STEPS = [0, 5000, 10000, 25000, 50000, 100000, 250000, 1000000, 2500000] as const;

export const DEADLINE_WINDOWS = [
  { days: null, label: 'Any time' },
  { days: 7, label: 'Next 7 days' },
  { days: 30, label: 'Next 30 days' },
  { days: 90, label: 'Next 90 days' },
] as const;

export const SORT_OPTIONS = [
  { value: 'match', label: 'Best match' },
  { value: 'deadline', label: 'Closing soonest' },
  { value: 'amount', label: 'Highest amount' },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export interface DiscoverFilters {
  query: string;
  level: EducationLevel | null;
  field: FieldOfStudy | null;
  category: Category | null;
  state: Region | null;
  providerTypes: ProviderType[];
  minAmountIndex: number;
  deadlineWithinDays: number | null;
  eligibleOnly: boolean;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  query: '',
  level: null,
  field: null,
  category: null,
  state: null,
  providerTypes: [],
  minAmountIndex: 0,
  deadlineWithinDays: null,
  eligibleOnly: false,
};

/** Apply user-selected search and eligibility filters without excluding unknown defaults. */
export const applyDiscoverFilters = (entries: ScholarshipEntry[], filters: DiscoverFilters): ScholarshipEntry[] => {
  const query = filters.query.trim().toLowerCase();
  const minAmount = AMOUNT_STEPS[filters.minAmountIndex] ?? 0;

  return entries.filter(({ scholarship, match }) => {
    if (filters.eligibleOnly && !match.eligible) return false;
    if (query) {
      const haystack = [scholarship.name, scholarship.provider, scholarship.description, ...scholarship.tags]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.level && !scholarship.levels.includes(filters.level)) return false;
    if (filters.field && !scholarship.fields.includes(filters.field)) return false;
    if (filters.category && !scholarship.categories.includes(filters.category)) return false;
    if (filters.state && !scholarship.states.includes(filters.state) && !scholarship.states.includes(ALL_INDIA)) {
      return false;
    }
    if (filters.providerTypes.length > 0 && !filters.providerTypes.includes(scholarship.providerType)) return false;
    if (scholarship.amount < minAmount) return false;
    if (filters.deadlineWithinDays !== null) {
      const days = daysUntil(scholarship.deadline);
      if (days < 0 || days > filters.deadlineWithinDays) return false;
    }
    return true;
  });
};

/** Sort scholarship results by match tier, closing date, or funding amount. */
export const sortEntries = (entries: ScholarshipEntry[], sort: SortKey): ScholarshipEntry[] => {
  const sorted = [...entries];
  if (sort === 'match') {
    const tierRank = { eligible: 0, nearly_eligible: 1, not_eligible: 2 } as const;
    return sorted.sort(
      (a, b) =>
        tierRank[a.match.tier] - tierRank[b.match.tier] ||
        b.match.score - a.match.score ||
        a.scholarship.deadline.localeCompare(b.scholarship.deadline),
    );
  }
  if (sort === 'deadline') {
    return sorted.sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline));
  }
  return sorted.sort((a, b) => b.scholarship.amount - a.scholarship.amount);
};

/** Count currently active Discover filters for the filter button badge. */
export const countActiveFilters = (filters: DiscoverFilters): number =>
  [
    filters.query.trim() !== '',
    filters.level !== null,
    filters.field !== null,
    filters.category !== null,
    filters.state !== null,
    filters.providerTypes.length > 0,
    filters.minAmountIndex > 0,
    filters.deadlineWithinDays !== null,
    filters.eligibleOnly,
  ].filter(Boolean).length;
