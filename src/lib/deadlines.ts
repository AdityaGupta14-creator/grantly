import { scholarships } from '@/data/scholarships';
import { daysUntil } from '@/lib/dates';
import type { ScholarshipEntry } from '@/lib/discover';
import type { TrackedApplication } from '@/types/tracker';
import type { Scholarship } from '@/types/scholarship';
import type { MatchResult } from '@/lib/match';

export interface RelevantDeadline {
  scholarship: Scholarship;
  match?: MatchResult;
  application?: TrackedApplication;
  daysUntil: number;
}

export const DEADLINE_WINDOW_DAYS = 7;

/** One source of truth for deadlines relevant to a student: eligible, saved, or tracked scholarships. */
export const selectRelevantDeadlines = (
  entries: ScholarshipEntry[],
  applications: TrackedApplication[],
): RelevantDeadline[] => {
  const matchById = new Map(entries.map((entry) => [entry.scholarship.id, entry]));
  const applicationById = new Map(applications.map((application) => [application.scholarshipId, application]));

  return scholarships
    .flatMap((scholarship) => {
      const entry = matchById.get(scholarship.id);
      const application = applicationById.get(scholarship.id);
      if (!application && !entry?.match.eligible) return [];
      return [{ scholarship, match: entry?.match, application, daysUntil: daysUntil(scholarship.deadline) }];
    })
    .sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline));
};

export const deadlinesWithinDays = (deadlines: RelevantDeadline[], maxDays: number): RelevantDeadline[] =>
  deadlines.filter((deadline) => deadline.daysUntil >= 0 && deadline.daysUntil <= maxDays);
