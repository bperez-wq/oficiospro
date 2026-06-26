"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Anima su contenido cuando entra al viewport (una vez). Degrada de forma segura:
// si no hay IntersectionObserver, muestra el contenido de inmediato. El estado
// "oculto" inicial se desactiva con prefers-reduced-motion (ver globals.css).
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "scale";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const variantClass =
    variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : variant === "scale" ? "reveal-scale" : "";

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
