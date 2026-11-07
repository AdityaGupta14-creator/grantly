import { describe, expect, it } from 'vitest';
import { safeExternalUrl } from '@/lib/externalUrl';

describe('safeExternalUrl', () => {
  it('allows HTTPS and blocks non-HTTPS or malformed URLs', () => {
    expect(safeExternalUrl('https://scholarships.gov.in')).toBe('https://scholarships.gov.in');
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('http://example.com')).toBeNull();
    expect(safeExternalUrl('/profile')).toBeNull();
  });
});
