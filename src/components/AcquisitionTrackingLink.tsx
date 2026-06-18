"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { submitConversionEvent } from "@/lib/leadClient";
import type { AnalyticsEventName } from "@/lib/analytics";
import type { AcquisitionContext, FounderConversionEvent } from "@/data/specialistAcquisition";

type AcquisitionTrackingLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  eventType?: FounderConversionEvent | AnalyticsEventName;
  sourceButton: string;
  sourceComponent?: string;
  context?: AcquisitionContext;
};

export function AcquisitionTrackingLink({
  href,
  children,
  className,
  eventType = "founder_cta_click",
  sourceButton,
  sourceComponent = "SpecialistAcquisition",
  context,
}: AcquisitionTrackingLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        void submitConversionEvent({
          type: eventType,
          source: context?.source ?? "direct",
          sourceButton,
          sourceComponent,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
          payload: { href, ...context },
        });
      }}
    >
      {children}
    </Link>
  );
}

export function AcquisitionPageViewTracker({
  eventType = "founder_page_view",
  source = "direct",
  sourceComponent = "SpecialistAcquisition",
  context,
}: {
  eventType?: FounderConversionEvent | AnalyticsEventName;
  source?: string;
  sourceComponent?: string;
  context?: AcquisitionContext;
}) {
  useEffect(() => {
    const key = `oficiospro.acquisition.event.${eventType}.${window.location.pathname}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void submitConversionEvent({
      type: eventType,
      source,
      sourceComponent,
      page: window.location.pathname,
      payload: context ?? {},
    });
  }, [context, eventType, source, sourceComponent]);

  return null;
}
