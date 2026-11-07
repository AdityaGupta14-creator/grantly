import { Moon, Sun } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { resolveTheme } from '@/hooks/useThemeSync';
import { usePreferencesStore } from '@/store/preferencesStore';

export const ThemeToggle = () => {
  const mode = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isDark = resolveTheme(mode, systemDark) === 'dark';
  const nextLabel = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${nextLabel} mode`}
      title={`Switch to ${nextLabel} mode`}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-surface p-2.5 text-fg shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
};
