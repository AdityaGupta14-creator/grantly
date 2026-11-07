import { describe, expect, it, vi } from 'vitest';
import { safeLocalStorage } from '@/lib/persistStorage';

describe('safeLocalStorage', () => {
  it('removes malformed persisted JSON and tolerates storage access failures', () => {
    window.localStorage.setItem('broken', '{');
    expect(safeLocalStorage.getItem('broken')).toBeNull();
    expect(window.localStorage.getItem('broken')).toBeNull();
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('disabled'); });
    expect(safeLocalStorage.getItem('disabled')).toBeNull();
    getSpy.mockRestore();
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    expect(() => safeLocalStorage.setItem('full', 'value')).not.toThrow();
    setSpy.mockRestore();
  });
});
