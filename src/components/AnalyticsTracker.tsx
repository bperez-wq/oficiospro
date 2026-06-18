"use client";

import { useEffect } from "react";
import { trackPageView, type AnalyticsEventName, type AnalyticsMetadata } from "@/lib/analytics";

export function AnalyticsPageView({
  eventName = "page_view",
  metadata = {},
  oncePerSession = true,
}: {
  eventName?: AnalyticsEventName;
  metadata?: AnalyticsMetadata;
  oncePerSession?: boolean;
}) {
  useEffect(() => {
    const key = `oficiospro.analytics.page.${eventName}.${window.location.pathname}`;
    if (oncePerSession && window.sessionStorage.getItem(key)) return;
    if (oncePerSession) window.sessionStorage.setItem(key, "1");
    void trackPageView(eventName, metadata);
  }, [eventName, metadata, oncePerSession]);

  return null;
}
