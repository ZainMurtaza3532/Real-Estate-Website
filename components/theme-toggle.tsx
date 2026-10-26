"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-full bg-zinc-100/90 hover:bg-zinc-200/90 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-amber-400 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs focus:outline-hidden"
      aria-label="Toggle luxury dark/light theme"
      title={isDark ? "Switch to Clean Light" : "Switch to Luxury Dark"}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform rotate-0 scale-100 text-amber-400" />
      ) : (
        <Moon className="size-4 transition-transform rotate-0 scale-100 text-zinc-700" />
      )}
    </button>
  );
}
