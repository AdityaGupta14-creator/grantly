import type { Scholarship } from '@/types/scholarship';
import { parseISODate, toISODate } from '@/lib/dates';

export interface CalendarCell {
  date: Date;
  iso: string;
  inMonth: boolean;
}

export const buildMonthGrid = (year: number, month: number): CalendarCell[][] => {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const weeks: CalendarCell[][] = [];

  for (let week = 0; week < 6; week += 1) {
    const cells: CalendarCell[] = [];
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + week * 7 + day);
      cells.push({ date, iso: toISODate(date), inMonth: date.getMonth() === month });
    }
    weeks.push(cells);
  }

  return weeks;
};

export const groupByDeadline = (scholarships: Scholarship[]): Map<string, Scholarship[]> => {
  const grouped = new Map<string, Scholarship[]>();
  for (const scholarship of scholarships) {
    const list = grouped.get(scholarship.deadline) ?? [];
    list.push(scholarship);
    grouped.set(scholarship.deadline, list);
  }
  return grouped;
};

export const isSameMonth = (iso: string, year: number, month: number): boolean => {
  const date = parseISODate(iso);
  return date.getFullYear() === year && date.getMonth() === month;
};
