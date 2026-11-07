import type { StateStorage } from 'zustand/middleware';

/** Prevent malformed or blocked browser storage from breaking app startup. */
export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      const value = window.localStorage.getItem(name);
      if (value === null) return null;
      JSON.parse(value);
      return value;
    } catch {
      try { window.localStorage.removeItem(name); } catch { /* Storage may be disabled. */ }
      return null;
    }
  },
  setItem: (name, value) => {
    try { window.localStorage.setItem(name, value); } catch { /* Keep the in-memory app usable when storage is full or disabled. */ }
  },
  removeItem: (name) => {
    try { window.localStorage.removeItem(name); } catch { /* Storage may be disabled. */ }
  },
};
