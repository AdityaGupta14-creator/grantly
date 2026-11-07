import { describe, expect, it } from 'vitest';
import { validateWorkspaceExport } from '@/lib/workspace';

const validExport = () => JSON.stringify({
  version: 1,
  exportedAt: new Date().toISOString(),
  profile: null,
  tracker: { applications: {}, reminderIds: [] },
});

describe('validateWorkspaceExport', () => {
  it('accepts a complete export without mutating workspace state', () => {
    const raw = validExport();
    expect(validateWorkspaceExport(raw)).toMatchObject({ version: 1, profile: null, tracker: { applications: {}, reminderIds: [] } });
  });

  it.each(['{', JSON.stringify({ version: 2, tracker: { applications: {}, reminderIds: [] } }), JSON.stringify({ version: 1, exportedAt: 'bad-date', profile: null, tracker: { applications: {}, reminderIds: [] } }), JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile: null, tracker: { applications: [], reminderIds: [] } })])('rejects malformed or unsupported export data', (raw) => {
    expect(() => validateWorkspaceExport(raw)).toThrow();
  });
});
