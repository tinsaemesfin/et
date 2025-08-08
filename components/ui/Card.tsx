import * as React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-black/[.08] dark:border-white/[.145] bg-white/70 dark:bg-black/30 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-4 sm:px-6 pt-4 sm:pt-6 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-4 sm:px-6 pb-4 sm:pb-6 ${className}`}>{children}</div>;
}


