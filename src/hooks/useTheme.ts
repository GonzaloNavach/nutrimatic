"use client";

import { useCallback, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "nutrimatic-theme";

export type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const next: ThemeMode = stored === "dark" ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    } catch {
      applyTheme("light");
    }
    setHydrated(true);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, hydrated, setTheme, toggleTheme, isDark: theme === "dark" };
}
