import type { ReactNode } from "react";

export function StickyMobileCTA({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 shadow-card backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-2">{children}</div>
    </div>
  );
}
