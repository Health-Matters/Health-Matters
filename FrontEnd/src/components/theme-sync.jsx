import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const ThemeSync = () => {
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    window.localStorage.setItem('dashboard-theme', mode);
  }, [mode]);

  return null;
};
