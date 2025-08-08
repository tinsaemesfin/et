import * as React from "react";

export const inputClasses =
  "w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand]";

export const labelClasses = "block text-xs font-medium mb-1 opacity-80";
export const hintClasses = "mt-1 text-[11px] opacity-70";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", ...props },
  ref
) {
  return <input ref={ref} className={`${inputClasses} ${className}`} {...props} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", rows = 4, ...props }, ref) {
    return <textarea ref={ref} className={`${inputClasses} ${className}`} rows={rows} {...props} />;
  }
);


