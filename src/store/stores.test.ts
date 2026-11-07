import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { MAX_COMPARE_ITEMS, useCompareStore } from '@/store/compareStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useProfileStore } from '@/store/profileStore';
import { toast, useToastStore } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';

beforeEach(() => {
  useCompareStore.getState().clearCompare();
  usePreferencesStore.setState({ theme: 'system', seenNotificationIds: [] });
  useProfileStore.setState({ profile: null });
  useTrackerStore.getState().replaceTracker({ applications: {}, reminderIds: [] });
  useToastStore.setState({ toasts: [] });
});

describe('browser state stores', () => {
  it('enforces the comparison limit and supports removal and reset', () => {
    for (const id of ['one', 'two', 'three']) expect(useCompareStore.getState().toggleCompare(id)).toBe('added');
    expect(MAX_COMPARE_ITEMS).toBe(3);
    expect(useCompareStore.getState().toggleCompare('four')).toBe('full');
    useCompareStore.getState().removeCompare('two');
    expect(useCompareStore.getState().selectedIds).toEqual(['one', 'three']);
    expect(useCompareStore.getState().toggleCompare('one')).toBe('removed');
    useCompareStore.getState().clearCompare();
    expect(useCompareStore.getState().selectedIds).toEqual([]);
  });

  it('updates profile, preferences, and unique notification read state', () => {
    useProfileStore.getState().saveProfile(DEMO_PROFILE);
    expect(useProfileStore.getState().profile?.isDemo).toBe(false);
    useProfileStore.getState().setProfile({ ...DEMO_PROFILE, isDemo: true });
    expect(useProfileStore.getState().profile?.isDemo).toBe(true);
    usePreferencesStore.getState().setTheme('dark');
    usePreferencesStore.getState().markNotificationsSeen(['a', 'a', 'b']);
    expect(usePreferencesStore.getState().theme).toBe('dark');
    expect(usePreferencesStore.getState().seenNotificationIds).toEqual(['a', 'b']);
    usePreferencesStore.getState().clearSeenNotifications();
    expect(usePreferencesStore.getState().seenNotificationIds).toEqual([]);
  });

  it('creates and updates applications, documents, notes, and reminders', () => {
    const tracker = useTrackerStore.getState();
    tracker.placeApplication('pragati', 'saved');
    tracker.placeApplication('pragati', 'preparing');
    expect(useTrackerStore.getState().applications.pragati.status).toBe('preparing');
    useTrackerStore.getState().toggleDocument('pragati', 'aadhaar');
    expect(useTrackerStore.getState().applications.pragati.checklist.aadhaar).toBe(true);
    useTrackerStore.getState().toggleDocument('pragati', 'aadhaar');
    expect(useTrackerStore.getState().applications.pragati.checklist.aadhaar).toBe(false);
    useTrackerStore.getState().setNotes('pragati', 'Plain text note');
    expect(useTrackerStore.getState().applications.pragati.notes).toBe('Plain text note');
    useTrackerStore.getState().toggleReminder('pragati');
    expect(useTrackerStore.getState().reminderIds).toContain('pragati');
    useTrackerStore.getState().toggleReminder('pragati');
    expect(useTrackerStore.getState().reminderIds).toEqual([]);
    useTrackerStore.getState().toggleDocument('missing', 'aadhaar');
    useTrackerStore.getState().setNotes('missing', 'Ignored');
    useTrackerStore.getState().removeApplication('pragati');
    expect(useTrackerStore.getState().applications).toEqual({});
  });

  it('queues each toast tone and dismisses the selected notice', () => {
    toast.success('Saved');
    toast.info('Updated');
    toast.danger('Invalid file');
    const id = useToastStore.getState().toasts[0].id;
    expect(useToastStore.getState().toasts.map((item) => item.tone)).toEqual(['success', 'info', 'danger']);
    useToastStore.getState().dismissToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });
});
