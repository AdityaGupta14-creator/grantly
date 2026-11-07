import { describe, expect, it } from 'vitest';
import { scholarships } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { AMOUNT_STEPS, applyDiscoverFilters, DEFAULT_FILTERS } from '@/lib/discover';
import { evaluateScholarship } from '@/lib/match';
import { daysUntil } from '@/lib/dates';

describe('applyDiscoverFilters', () => {
  it('returns all 36 scholarships when filters are empty, including ineligible matches', () => {
    const entries = scholarships.map((scholarship) => ({
      scholarship,
      match: evaluateScholarship(scholarship, DEMO_PROFILE),
    }));

    expect(scholarships).toHaveLength(36);
    expect(DEFAULT_FILTERS.eligibleOnly).toBe(false);
    expect(applyDiscoverFilters(entries, DEFAULT_FILTERS)).toHaveLength(36);
    expect(entries.some((entry) => !entry.match.eligible)).toBe(true);
    expect(entries.filter((entry) => entry.match.eligible).length).toBeGreaterThan(0);
    expect(entries.filter((entry) => entry.match.eligible).reduce((sum, entry) => sum + entry.scholarship.amount, 0)).toBeGreaterThan(0);
    expect(entries.every((entry) => daysUntil(entry.scholarship.deadline) > 0)).toBe(true);
    expect(Math.min(...scholarships.map((item) => item.amount))).toBeGreaterThanOrEqual(AMOUNT_STEPS[0]);
    expect(AMOUNT_STEPS[AMOUNT_STEPS.length - 1]).toBeGreaterThanOrEqual(Math.max(...scholarships.map((item) => item.amount)));
  });

  it('filters to eligible matches only when the user enables the toggle', () => {
    const entries = scholarships.map((scholarship) => ({
      scholarship,
      match: evaluateScholarship(scholarship, DEMO_PROFILE),
    }));

    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, eligibleOnly: true }).every((entry) => entry.match.eligible)).toBe(true);
  });
});
