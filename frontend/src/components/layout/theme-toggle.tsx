"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const onToggle = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
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

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-accent"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}