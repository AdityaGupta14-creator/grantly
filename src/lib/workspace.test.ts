import { describe, expect, it } from 'vitest';
import { exportWorkspace, importWorkspace, loadDemoWorkspace, resetWorkspace, validateWorkspaceExport } from '@/lib/workspace';
import { useProfileStore } from '@/store/profileStore';
import { useTrackerStore } from '@/store/trackerStore';

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

  it('rejects oversized files before parsing', () => {
    expect(() => validateWorkspaceExport('x'.repeat(1_048_577))).toThrow(/larger than 1 MB/);
  });

  it('loads and resets demo workspace, then exports and imports validated data', () => {
    loadDemoWorkspace();
    expect(useProfileStore.getState().profile?.isDemo).toBe(true);
    expect(Object.keys(useTrackerStore.getState().applications)).toHaveLength(5);
    expect(useTrackerStore.getState().reminderIds).toHaveLength(3);
    const backup = exportWorkspace();
    resetWorkspace();
    expect(useProfileStore.getState().profile).toBeNull();
    importWorkspace(backup);
    expect(useProfileStore.getState().profile?.name).toBeTruthy();
    expect(Object.keys(useTrackerStore.getState().applications)).toHaveLength(5);
  });
});
