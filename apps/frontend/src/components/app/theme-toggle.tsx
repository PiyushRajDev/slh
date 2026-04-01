"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, getResolvedTheme, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(getResolvedTheme());
  }, []);

  function handleToggle() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="h-8"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
