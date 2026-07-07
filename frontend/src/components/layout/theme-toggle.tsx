"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "smartlogix-theme";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextTheme: ThemeMode = prefersDark ? "dark" : "light";
      setTheme(nextTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    setMounted(true);
  }, []);

  const onToggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(THEME_KEY, nextTheme);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-accent"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}