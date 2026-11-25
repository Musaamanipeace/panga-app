// src/theme/theme.ts
// Light/dark theme choice, stored on this device and applied as data-theme on <html>.

export type ThemeId = "dark" | "light";

const THEME_KEY = "panga_theme";

export function getTheme(): ThemeId {
  if (typeof window === "undefined" || !window.localStorage) return "dark";
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" ? "light" : "dark";
}

export function applyTheme(theme: ThemeId = getTheme()): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0a24" : "#f4f3ff");
}

export function setTheme(theme: ThemeId): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(theme);
}

export function toggleTheme(): ThemeId {
  const next: ThemeId = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
