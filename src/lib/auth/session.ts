"use client";

import { normalizeAuthRole } from "@/lib/auth/roles";
import type { AuthSession } from "@/lib/auth/types";

const sessionKey = "oficiospro.session";

export function demoAuthEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";
}

export function readBrowserSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession> & { role?: string; createdAt?: string };
    const role = normalizeAuthRole(parsed.role);
    const provider = parsed.provider ?? "mock";
    if (role === "admin" && provider === "mock" && !demoAuthEnabled()) return null;
    return {
      userId: parsed.userId ?? parsed.email ?? "browser-session",
      role,
      email: parsed.email,
      phone: parsed.phone,
      name: parsed.name,
      provider,
      issuedAt: parsed.issuedAt ?? parsed.createdAt,
      expiresAt: parsed.expiresAt,
      token: parsed.token,
    };
  } catch {
    return null;
  }
}

export function sessionIsExpired(session: AuthSession | null) {
  if (!session?.expiresAt) return false;
  return new Date(session.expiresAt).getTime() <= Date.now();
}
