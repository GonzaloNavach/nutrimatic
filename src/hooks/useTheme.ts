"use client";

import { useCallback, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "nutrimatic-theme";

export type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      // Default: oscuro. Solo claro si el usuario lo eligió explícito.
      const next: ThemeMode = stored === "light" ? "light" : "dark";
      setThemeState(next);
      applyTheme(next);
      if (stored == null) {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      }
    } catch {
      applyTheme("dark");
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
