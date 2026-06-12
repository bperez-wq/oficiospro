"use client";

import { readBrowserSession, sessionIsExpired } from "@/lib/auth/session";
import { roleCanAccess } from "@/lib/auth/roles";
import type { AuthDecision, OperationalRole } from "@/lib/auth/types";

export function requireBrowserRole(allowed: OperationalRole[]): AuthDecision {
  const session = readBrowserSession();
  if (!session) return { ok: false, reason: "missing_session" };
  if (sessionIsExpired(session)) return { ok: false, reason: "expired_session", session };
  if (!roleCanAccess(session.role, allowed)) return { ok: false, reason: "forbidden_role", session };
  return { ok: true, session };
}

export function requireAdminBrowserSession() {
  return requireBrowserRole(["admin"]);
}
