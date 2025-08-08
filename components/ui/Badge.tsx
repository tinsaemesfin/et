import * as React from "react";

type Variant = "neutral" | "power" | "water";

export function Badge({ variant = "neutral", children }: { variant?: Variant; children: React.ReactNode }) {
  const styles: Record<Variant, string> = {
    neutral: "bg-white/15 text-foreground",
    power: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300",
    water: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${styles[variant]}`}>{children}</span>;
}


