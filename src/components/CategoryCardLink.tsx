"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { submitConversionEvent } from "@/lib/leadClient";

export function CategoryCardLink({
  href,
  title,
  description,
  action = "Ver especialistas",
  sourceSection,
  category,
  specialty,
  chip,
  children,
  className = "",
}: {
  href: string;
  title: string;
  description: string;
  action?: string;
  sourceSection: string;
  category: string;
  specialty: string;
  chip?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`${action}: ${title}`}
      className={`group block h-full cursor-pointer rounded-[28px] border border-line bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-brand/20 ${className}`}
      onClick={() => {
        void submitConversionEvent({
          type: "category_card_clicked",
          source: sourceSection,
          sourceComponent: "CategoryCardLink",
          sourceButton: title,
          payload: {
            categoria: category,
            especialidad: specialty,
            sourceSection,
            cardTitle: title,
            timestamp: new Date().toISOString(),
          },
        });
      }}
    >
      {chip ? <div className="mb-4">{chip}</div> : null}
      <h3 className="text-xl font-black text-ink transition group-hover:text-brand-dark">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-muted">{description}</p>
      {children}
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand-dark">
        {action}
        <span aria-hidden className="transition group-hover:translate-x-1">-&gt;</span>
      </span>
    </Link>
  );
}
