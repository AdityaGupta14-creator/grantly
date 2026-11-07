import { describe, expect, it } from 'vitest';
import { scholarships } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { AMOUNT_STEPS, applyDiscoverFilters, countActiveFilters, DEFAULT_FILTERS, sortEntries } from '@/lib/discover';
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

  it('applies text, location, provider, amount, deadline, and eligibility filters', () => {
    const entries = scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, DEMO_PROFILE) }));
    const first = entries[0].scholarship;
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, query: first.name.slice(0, 8) })).toContain(entries[0]);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, level: first.levels[0] }).length).toBeGreaterThan(0);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, field: first.fields[0] }).length).toBeGreaterThan(0);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, category: first.categories[0] }).length).toBeGreaterThan(0);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, state: 'Maharashtra' }).length).toBeGreaterThan(0);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, providerTypes: [first.providerType] }).every((entry) => entry.scholarship.providerType === first.providerType)).toBe(true);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, minAmountIndex: 4 }).every((entry) => entry.scholarship.amount >= AMOUNT_STEPS[4])).toBe(true);
    expect(applyDiscoverFilters(entries, { ...DEFAULT_FILTERS, deadlineWithinDays: 7 }).every((entry) => daysUntil(entry.scholarship.deadline) <= 7)).toBe(true);
  });

  it('sorts by match, deadline, or amount and counts selected filters', () => {
    const entries = scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, DEMO_PROFILE) }));
    expect(sortEntries(entries, 'amount')[0].scholarship.amount).toBe(Math.max(...entries.map((entry) => entry.scholarship.amount)));
    expect(sortEntries(entries, 'deadline')[0].scholarship.deadline).toBe([...entries].sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline))[0].scholarship.deadline);
    const sorted = sortEntries(entries, 'match');
    expect(sorted[0].match.tier).toBe('eligible');
    expect(countActiveFilters({ ...DEFAULT_FILTERS, query: 'test', level: 'class12', field: 'science', category: 'general', state: 'Maharashtra', providerTypes: ['government'], minAmountIndex: 1, deadlineWithinDays: 7, eligibleOnly: true })).toBe(9);
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  });
});
