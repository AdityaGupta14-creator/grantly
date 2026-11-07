import { describe, expect, it } from 'vitest';
import { profileToForm, validateProfileForm } from '@/lib/profileForm';

describe('profile onboarding validation', () => {
  it('requires every matching field before a new profile can be saved', () => {
    const form = profileToForm(null);
    const errors = validateProfileForm(form);

    expect(errors.name).toBeTruthy();
    expect(errors.level).toBeTruthy();
    expect(errors.field).toBeTruthy();
    expect(errors.state).toBeTruthy();
    expect(errors.category).toBeTruthy();
    expect(errors.incomeBand).toBeTruthy();
    expect(errors.percentage).toBeTruthy();
  });

  it('accepts a complete profile while leaving optional gender and flags unknown', () => {
    const form = {
      ...profileToForm(null),
      name: 'Ananya Rao',
      level: 'class12' as const,
      field: 'science' as const,
      state: 'Maharashtra' as const,
      category: 'general' as const,
      incomeBand: '2_5l_5l' as const,
      percentage: '78',
      gender: '' as const,
      flags: [],
      flagsKnown: false,
    };

    expect(validateProfileForm(form)).toEqual({});
  });
});
