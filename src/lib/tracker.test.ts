import { describe, expect, it, vi } from 'vitest';
import { buildDocumentVault, buildNotifications, buildTrackedRows, checklistProgress, columnForStatus } from '@/lib/tracker';
import { scholarships } from '@/data/scholarships';
import type { TrackedApplication } from '@/types/tracker';

const application = (scholarshipId: string, status: TrackedApplication['status'], checklist: TrackedApplication['checklist'] = {}): TrackedApplication => {
  const now = new Date().toISOString();
  return { scholarshipId, status, checklist, notes: '', createdAt: now, updatedAt: now };
};

describe('tracker helpers', () => {
  it('maps outcomes to result and calculates document progress', () => {
    expect(columnForStatus('won')).toBe('result');
    expect(columnForStatus('rejected')).toBe('result');
    expect(columnForStatus('preparing')).toBe('preparing');
    const scholarship = scholarships.find((item) => item.id === 'pragati')!;
    const progress = checklistProgress(application('pragati', 'preparing', { aadhaar: true }), scholarship);
    expect(progress.done).toBe(1);
    expect(progress.total).toBe(scholarship.documents.length);
  });

  it('builds a shared document vault while omitting rejected and unknown entries', () => {
    const items = buildDocumentVault([
      application('pragati', 'preparing', { aadhaar: true }),
      application('maharashtra-obc', 'rejected'),
      application('unknown-id', 'saved'),
    ], new Map(scholarships.map((item) => [item.id, item])));
    expect(items.some((item) => item.documentId === 'aadhaar' && item.readyCount > 0)).toBe(true);
    expect(items.every((item) => item.items.every((row) => row.scholarshipId !== 'maharashtra-obc'))).toBe(true);
  });

  it('joins only catalog rows and prepares deadline and checklist notifications', () => {
    const rows = buildTrackedRows({ pragati: application('pragati', 'preparing'), missing: application('missing', 'saved') }, new Map(scholarships.map((item) => [item.id, item])));
    expect(rows).toHaveLength(1);
    const notifications = buildNotifications([application('pragati', 'preparing')], []);
    expect(notifications.some((item) => item.kind === 'deadline')).toBe(true);
    expect(notifications.some((item) => item.kind === 'prep')).toBe(true);
  });

  it('marks an unsubmitted tracked deadline overdue after time has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 200 * 86_400_000));
    try {
      const notifications = buildNotifications([application('pragati', 'saved')], []);
      expect(notifications.some((item) => item.kind === 'overdue')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
