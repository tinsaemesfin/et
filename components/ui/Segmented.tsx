import * as React from "react";
// icons are provided by caller in labels; no direct imports here

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: React.ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-lg border border-white/15 bg-black/30 p-0.5"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors outline-none ${
              active
                ? "bg-[--color-brand] text-white shadow-sm ring-2 ring-[--color-brand] ring-offset-1"
                : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {active && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-white" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}


