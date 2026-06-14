"use client";

import { getMockSession, setMockSession, type MockSession } from "@/lib/storage";

export const adminSessionToken = "__oficiospro_admin_session__";

export function hasAdminBrowserSession() {
  const session = getMockSession();
  return session?.role === "admin" && session.provider === "admin_session";
}

export function initialAdminToken(storageKey: string) {
  if (typeof window === "undefined") return "";
  const stored = window.sessionStorage.getItem(storageKey) ?? "";
  return stored || (hasAdminBrowserSession() ? adminSessionToken : "");
}

export function persistAdminToken(storageKey: string, token: string) {
  if (typeof window === "undefined") return;
  const value = token.trim();
  if (value) window.sessionStorage.setItem(storageKey, value);
  else window.sessionStorage.removeItem(storageKey);
}

export function adminRequestHeaders(token: string, extra: HeadersInit = {}) {
  const headers = new Headers(extra);
  if (token && token !== adminSessionToken) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("x-admin-token", token);
  }
  return headers;
}

export async function loginRealAdmin(email: string, password: string) {
  const response = await fetch("/api/auth/admin-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    email?: string;
    name?: string;
    expiresAt?: string;
    error?: string;
  };
  if (!response.ok || !data.ok) throw new Error(data.error ?? `http_${response.status}`);

  const session: MockSession = {
    role: "admin",
    name: data.name ?? "Administrador OficiosPro",
    email: data.email ?? email,
    provider: "admin_session",
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt,
  };
  setMockSession(session);
  return session;
}

export function adminLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "admin_login_not_configured") {
    return "Acceso admin real no configurado. Configura ADMIN_LOGIN_EMAIL y ADMIN_LOGIN_SECRET en Cloudflare.";
  }
  if (message === "missing_credentials") return "Ingresa email y contrasena admin.";
  if (message === "unauthorized") return "Credenciales admin incorrectas.";
  if (message === "rate_limited") return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  return "No pudimos iniciar sesion admin. Revisa configuracion y conexion.";
}
