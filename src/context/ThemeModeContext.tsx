import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName, Platform } from 'react-native';
import { colorScheme } from 'nativewind';

export type ThemeMode = 'light' | 'dark';

export interface ThemeModeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'hackowatt_theme_mode';

function getInitialTheme(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // ignore localStorage access error
    }
  }
  return 'light';
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  themeMode: 'light',
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);

  // Synchronize with Native Appearance and Web DOM
  useEffect(() => {
    try {
      if (Appearance && typeof Appearance.setColorScheme === 'function') {
        Appearance.setColorScheme(themeMode);
      }
    } catch {
      // ignore native appearance error if unsupported
    }
    try {
      colorScheme.set(themeMode);
    } catch {
      // ignore
    }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    }
  };

  const toggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
  };

  const isDark = themeMode === 'dark';

  return (
    <ThemeModeContext.Provider value={{ themeMode, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export function useThemeMode(): ThemeModeContextType {
  return useContext(ThemeModeContext);
}

export function useCurrentColorScheme(): ColorSchemeName {
  const context = useContext(ThemeModeContext);
  return context?.themeMode ?? 'light';
}
