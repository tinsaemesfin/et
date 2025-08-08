import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

function classesFor(variant: ButtonVariant, size: ButtonSize, disabled?: boolean) {
  const base = "inline-flex items-center justify-center rounded-md font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed gap-2";
  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3.5 py-2.5",
    lg: "text-base px-4.5 py-3",
  };
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[--color-brand] text-white hover:brightness-110 hover:shadow-sm active:translate-y-[0.5px] focus-visible:ring-[--color-brand]",
    secondary:
      "bg-black/5 dark:bg-white/10 text-foreground hover:bg-black/10 dark:hover:bg-white/15 active:translate-y-[0.5px]",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 active:translate-y-[0.5px]",
  };
  return [base, sizes[size], variants[variant], disabled ? "pointer-events-none" : ""].join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", leftIcon, rightIcon, className = "", disabled, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={`${classesFor(variant, size, disabled)} ${className}`}
        disabled={disabled}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);


