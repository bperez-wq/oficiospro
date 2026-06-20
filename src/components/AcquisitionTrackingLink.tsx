"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { submitConversionEvent } from "@/lib/leadClient";
import { getAttributionContext, type AnalyticsEventName } from "@/lib/analytics";
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
        const attribution = getAttributionContext();
        const mergedContext = { ...attribution, ...context };
        void submitConversionEvent({
          type: eventType,
          source: mergedContext.source ?? "direct",
          medium: mergedContext.utmMedium,
          campaign: mergedContext.campaign || mergedContext.utmCampaign,
          sourceButton,
          sourceComponent,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
          payload: { href, ...mergedContext },
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
    const attribution = getAttributionContext();
    const mergedContext = { ...attribution, ...context };
    void submitConversionEvent({
      type: eventType,
      source: String(context?.source ?? source ?? attribution.source ?? "direct"),
      medium: mergedContext.utmMedium,
      campaign: mergedContext.campaign || mergedContext.utmCampaign,
      sourceComponent,
      page: window.location.pathname,
      payload: mergedContext,
    });
  }, [context, eventType, source, sourceComponent]);

  return null;
}
