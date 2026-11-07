import { describe, expect, it } from 'vitest';
import { profileSchema, trackerDataSchema } from '@/lib/schemas';

describe('external data schemas', () => {
  it('strips unknown profile keys, caps text, and clamps numeric marks', () => {
    const profile = profileSchema.parse({
      name: `${'A'.repeat(100)}<script>`, level: 'class12', field: 'science', state: 'Maharashtra',
      category: 'general', gender: null, incomeBand: '2_5l_5l', percentage: 150, flags: [],
      isDemo: false, updatedAt: new Date().toISOString(), admin: true,
    });
    expect(profile.name).toHaveLength(80);
    expect(profile.percentage).toBe(100);
    expect('admin' in profile).toBe(false);
  });

  it('strips unknown tracker fields and unsupported checklist document keys', () => {
    const now = new Date().toISOString();
    const tracker = trackerDataSchema.parse({
      applications: { pragati: {
        scholarshipId: 'pragati', status: 'saved', checklist: { marksheet: true, mystery_document: true },
        notes: 'A'.repeat(2100), createdAt: now, updatedAt: now, injected: '<script>',
      }, 'unknown-scheme': {
        scholarshipId: 'unknown-scheme', status: 'saved', checklist: {}, notes: '', createdAt: now, updatedAt: now,
      } }, reminderIds: ['pragati', 'unknown-scheme'], injected: true,
    });
    expect(Object.keys(tracker.applications.pragati.checklist)).toEqual(['marksheet']);
    expect(tracker.applications.pragati.notes).toHaveLength(2000);
    expect(Object.keys(tracker.applications)).toEqual(['pragati']);
    expect(tracker.reminderIds).toEqual(['pragati']);
    expect('injected' in tracker).toBe(false);
  });
});
