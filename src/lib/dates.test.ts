import { describe, expect, it } from 'vitest';
import { addDays, getUrgency, toISODate } from '@/lib/dates';

describe('getUrgency', () => {
  it('marks yesterday overdue, today through day seven urgent, and later dates correctly', () => {
    const today = new Date();
    expect(getUrgency(toISODate(addDays(today, -1)))).toBe('overdue');
    expect(getUrgency(toISODate(today))).toBe('urgent');
    expect(getUrgency(toISODate(addDays(today, 7)))).toBe('urgent');
    expect(getUrgency(toISODate(addDays(today, 8)))).toBe('upcoming');
    expect(getUrgency(toISODate(addDays(today, 31)))).toBe('later');
  });
});
