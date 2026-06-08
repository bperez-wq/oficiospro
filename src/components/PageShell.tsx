import type { ReactNode } from "react";

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`section grid gap-8 ${className}`}>{children}</main>;
}
