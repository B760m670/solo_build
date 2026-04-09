import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const saved = localStorage.getItem('brabble_theme');
    const tgScheme = window.Telegram?.WebApp?.colorScheme;
    const theme = saved || tgScheme || 'dark';

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('brabble_theme', theme);
  }, []);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('brabble_theme', next);
}

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
