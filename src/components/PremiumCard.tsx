import type { ReactNode } from "react";

export function PremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <article className={`panel card-hover ${className}`}>{children}</article>;
}
