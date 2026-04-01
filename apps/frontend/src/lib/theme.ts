export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "slh_theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : null;
}

export function getResolvedTheme(): ThemeMode {
  return getStoredTheme() ?? "dark";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
