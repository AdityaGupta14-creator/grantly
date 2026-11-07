import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { scholarships } from '@/data/scholarships';
import { deadlinesWithinDays, selectRelevantDeadlines } from '@/lib/deadlines';
import { evaluateScholarship } from '@/lib/match';
import { buildNotifications } from '@/lib/tracker';
import type { TrackedApplication } from '@/types/tracker';

describe('selectRelevantDeadlines', () => {
  it('is the shared source for due-soon KPIs, calendar entries, and deadline notifications', () => {
    const entries = scholarships.map((scholarship) => ({ scholarship, match: evaluateScholarship(scholarship, DEMO_PROFILE) }));
    const tracked: TrackedApplication = {
      scholarshipId: 'pragati',
      status: 'saved',
      checklist: {},
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const deadlines = selectRelevantDeadlines(entries, [tracked]);
    const dueSoon = deadlinesWithinDays(deadlines, 7);
    const notifications = buildNotifications([tracked], entries).filter((item) => item.kind === 'deadline');

    expect(deadlines.some((item) => item.scholarship.id === tracked.scholarshipId)).toBe(true);
    expect(deadlines.some((item) => item.match?.eligible)).toBe(true);
    expect(dueSoon.length).toBeGreaterThan(0);
    expect(notifications.length).toBe(dueSoon.length);
  });
});
