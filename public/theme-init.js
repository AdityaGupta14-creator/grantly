(() => {
  try {
    const stored = localStorage.getItem('grantly-preferences');
    const parsed = stored ? JSON.parse(stored) : null;
    const theme = parsed?.state?.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || ((!theme || theme === 'system') && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // Corrupt or blocked local storage falls back to the system theme.
  }
})();
