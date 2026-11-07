import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { scholarships } from '@/data/scholarships';
import { evaluateScholarship } from '@/lib/match';
import type { Scholarship } from '@/types/scholarship';

const matchingScholarship = (): Scholarship => ({
  ...scholarships[0],
  id: 'test-matching',
  levels: [DEMO_PROFILE.level],
  fields: [DEMO_PROFILE.field],
  categories: [DEMO_PROFILE.category],
  states: [DEMO_PROFILE.state],
  genders: [DEMO_PROFILE.gender],
  maxIncome: null,
  minMarks: null,
  flags: [],
});

describe('evaluateScholarship', () => {
  it('returns Not eligible when a hard-fail criterion is unmet', () => {
    const scholarship = { ...matchingScholarship(), categories: ['obc'] as Scholarship['categories'] };
    const result = evaluateScholarship(scholarship, DEMO_PROFILE);

    expect(result.tier).toBe('not_eligible');
    expect(result.eligible).toBe(false);
    expect(result.criteria.find((criterion) => criterion.id === 'category')?.status).toBe('not_met');
  });

  it('scores 100 when every criterion matches and optional limits are absent', () => {
    const result = evaluateScholarship(matchingScholarship(), DEMO_PROFILE);

    expect(result.score).toBe(100);
    expect(result.tier).toBe('eligible');
    expect(result.criteria.every((criterion) => criterion.status === 'met')).toBe(true);
  });

  it('marks a close miss as nearly met and ranks it near-eligible', () => {
    const scholarship = { ...matchingScholarship(), minMarks: DEMO_PROFILE.percentage + 2 };
    const result = evaluateScholarship(scholarship, DEMO_PROFILE);

    expect(result.tier).toBe('nearly_eligible');
    expect(result.criteria.find((criterion) => criterion.id === 'marks')?.status).toBe('near');
    expect(result.criteria.find((criterion) => criterion.id === 'marks')?.explanation).toContain('2% below');
  });

  it('ignores missing optional income, marks, and special-flag requirements', () => {
    const scholarship = { ...matchingScholarship(), maxIncome: null, minMarks: null, flags: [] };
    const result = evaluateScholarship(scholarship, DEMO_PROFILE);

    expect(result.score).toBe(100);
    expect(result.criteria.find((criterion) => criterion.id === 'income')?.status).toBe('met');
    expect(result.criteria.find((criterion) => criterion.id === 'marks')?.status).toBe('met');
    expect(result.criteria.find((criterion) => criterion.id === 'flags')?.status).toBe('met');
  });

  it('treats a blank percentage and unknown optional details as unknown, never as hard failures', () => {
    const profile = {
      ...DEMO_PROFILE,
      percentage: null,
      incomeBand: null,
      gender: null,
      flags: [],
      flagsKnown: false,
    };
    const scholarship = {
      ...matchingScholarship(),
      maxIncome: 250000,
      minMarks: 60,
      genders: ['female'] as Scholarship['genders'],
      flags: ['minority'] as Scholarship['flags'],
    };
    const result = evaluateScholarship(scholarship, profile);

    expect(result.eligible).toBe(false);
    expect(result.tier).toBe('nearly_eligible');
    expect(result.criteria.find((item) => item.id === 'marks')).toMatchObject({ status: 'unknown', explanation: 'Add your latest percentage to check this' });
    expect(result.criteria.find((item) => item.id === 'income')).toMatchObject({ status: 'unknown', explanation: 'Add your income band to check this' });
    expect(result.criteria.find((item) => item.id === 'gender')?.status).toBe('unknown');
    expect(result.criteria.find((item) => item.id === 'flags')?.status).toBe('unknown');
  });

  it('keeps the demo match mix within the requested range and funding target', () => {
    const results = scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, DEMO_PROFILE) }));
    const eligible = results.filter(({ match }) => match.tier === 'eligible');
    const nearlyEligible = results.filter(({ match }) => match.tier === 'nearly_eligible');
    const notEligible = results.filter(({ match }) => match.tier === 'not_eligible');
    const funding = eligible.reduce((sum, { scholarship }) => sum + scholarship.amount, 0);

    expect(eligible).toHaveLength(16);
    expect(nearlyEligible).toHaveLength(12);
    expect(notEligible).toHaveLength(8);
    expect(eligible.length).toBeGreaterThanOrEqual(15);
    expect(eligible.length).toBeLessThanOrEqual(20);
    expect(nearlyEligible.length).toBeGreaterThanOrEqual(10);
    expect(nearlyEligible.length).toBeLessThanOrEqual(14);
    expect(notEligible.length).toBeGreaterThanOrEqual(6);
    expect(notEligible.length).toBeLessThanOrEqual(8);
    expect(funding).toBeGreaterThan(1_000_000);
  });

  it.each([
    { label: 'Class 12 General Maharashtra Science', level: 'class12', field: 'science', state: 'Maharashtra', category: 'general', percentage: 78, incomeBand: '2_5l_5l', gender: null },
    { label: 'PG Female OBC Engineering', level: 'pg', field: 'engineering', state: 'Maharashtra', category: 'obc', percentage: 70, incomeBand: '5l_8l', gender: 'female' },
    { label: 'Diploma SC Karnataka', level: 'diploma', field: 'engineering', state: 'Karnataka', category: 'sc', percentage: 65, incomeBand: '1l_2_5l', gender: null },
  ] as const)('finds at least six eligible scholarships for a realistic $label profile', (details) => {
    const profile = { ...DEMO_PROFILE, ...details, flags: [], flagsKnown: false, isDemo: false };
    const eligible = scholarships.filter((scholarship) => evaluateScholarship(scholarship, profile).eligible);
    expect(eligible.length).toBeGreaterThanOrEqual(6);
  });
});
