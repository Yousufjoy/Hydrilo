import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, lightPalette, darkPalette } from '../constants/theme';
import { DatabaseRepository } from '../db/database';

interface ThemeContextType {
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  palette: ColorPalette;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    try {
      const saved = DatabaseRepository.getPreference<'light' | 'dark' | 'system'>('theme_mode', 'system');
      setThemeModeState(saved);
    } catch {
      // fallback
    }
  }, []);

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    try {
      DatabaseRepository.setPreference('theme_mode', mode);
    } catch {}
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setThemeMode(next);
  };

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, palette, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useAppTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
