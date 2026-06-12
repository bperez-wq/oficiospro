import type { AuthRole, OperationalRole } from "@/lib/auth/types";

export const operationalRoles: OperationalRole[] = ["guest", "customer", "specialist", "company", "admin"];

export function normalizeAuthRole(role?: AuthRole | string | null): OperationalRole {
  if (role === "client" || role === "customer") return "customer";
  if (role === "specialist" || role === "company" || role === "admin") return role;
  return "guest";
}

export function roleCanAccess(role: AuthRole | string | null | undefined, allowed: OperationalRole[]) {
  const normalized = normalizeAuthRole(role);
  return allowed.includes(normalized);
}

export function isPrivilegedRole(role: AuthRole | string | null | undefined) {
  return normalizeAuthRole(role) === "admin";
}
