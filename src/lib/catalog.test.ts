import { describe, expect, it } from 'vitest';
import { findScholarship, scholarshipMap } from '@/lib/catalog';

describe('scholarship catalog lookup', () => {
  it('resolves well-formed known IDs and rejects unsafe or unknown route IDs', () => {
    expect(findScholarship('pragati')).toBe(scholarshipMap.get('pragati'));
    expect(findScholarship('../profile')).toBeUndefined();
    expect(findScholarship('missing-scheme')).toBeUndefined();
  });
});
