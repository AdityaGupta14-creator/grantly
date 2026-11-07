import { useEffect } from 'react';
import { usePreferencesStore, type ThemeMode } from '@/store/preferencesStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export type ResolvedTheme = 'light' | 'dark';

export const resolveTheme = (mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme => {
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
};

export const useThemeSync = (): void => {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      document.documentElement.classList.toggle('dark', resolveTheme(theme, media.matches) === 'dark');
    };
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
};
