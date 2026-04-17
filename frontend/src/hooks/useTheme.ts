import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    const saved = localStorage.getItem('unisouq_theme');
    const tgScheme = window.Telegram?.WebApp?.colorScheme;
    const theme = saved || tgScheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('unisouq_theme', theme);

    // Restore style preference
    const style = localStorage.getItem('unisouq_style') || 'default';
    if (style === 'web3') {
      document.documentElement.setAttribute('data-style', 'web3');
    }
  }, []);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('unisouq_theme', next);
}

export function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function setStyle(style: 'default' | 'web3') {
  if (style === 'web3') {
    document.documentElement.setAttribute('data-style', 'web3');
  } else {
    document.documentElement.removeAttribute('data-style');
  }
  localStorage.setItem('unisouq_style', style);
}

export function getStyle(): string {
  return localStorage.getItem('unisouq_style') || 'default';
}
