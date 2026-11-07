import { describe, expect, it } from 'vitest';
import { buildMonthGrid, groupByDeadline, isSameMonth } from '@/lib/calendar';
import { scholarships } from '@/data/scholarships';

describe('calendar helpers', () => {
  it('builds a six-week Monday-first grid and marks adjacent days', () => {
    const grid = buildMonthGrid(2026, 10);
    expect(grid).toHaveLength(6);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid[0][0].date.getDay()).toBe(1);
    expect(grid.flat().some((cell) => !cell.inMonth)).toBe(true);
  });

  it('groups deadlines and checks month membership', () => {
    const grouped = groupByDeadline(scholarships.slice(0, 3));
    expect([...grouped.values()].flat()).toHaveLength(3);
    expect(isSameMonth('2026-11-30', 2026, 10)).toBe(true);
    expect(isSameMonth('2026-12-01', 2026, 10)).toBe(false);
  });
});
