"use client";
import * as React from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  // Fallback to media preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export default function ThemeToggle() {
  // Avoid hydration mismatches: render a stable placeholder until mounted
  const [isMounted, setIsMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">(getInitialTheme);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/30 hover:bg-black/5 dark:hover:bg-white/10"
      // Keep title stable during SSR/first client paint to avoid hydration mismatch
      title={isMounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
    >
      {isMounted ? (
        theme === "dark" ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )
      ) : (
        // Stable placeholder icon so server and client HTML match
        <MoonIcon className="w-4 h-4" />
      )}
      <span className="text-xs hidden sm:inline">
        {isMounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
      </span>
    </button>
  );
}


