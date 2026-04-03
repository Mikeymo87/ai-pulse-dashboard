import { useState, useEffect } from 'react';

/**
 * Returns the current theme ('dark' | 'light').
 * Listens for 'themechange' custom events dispatched by Nav when the toggle is clicked.
 * Use this in components that need theme-aware values in JS (Recharts, SVG fills).
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  useEffect(() => {
    function handler(e) { setTheme(e.detail); }
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  return theme;
}
