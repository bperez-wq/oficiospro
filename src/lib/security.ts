"use client";

export type AppRole = "guest" | "customer" | "client" | "specialist" | "company" | "admin";
export type SecurityResource =
  | "admin"
  | "customer_dashboard"
  | "specialist_dashboard"
  | "company_dashboard"
  | "credits"
  | "payments"
  | "specialist_approval"
  | "company_leads";
export type SecurityAction = "read" | "create" | "update" | "delete" | "approve" | "reconcile";

const accessMatrix: Record<SecurityResource, Partial<Record<SecurityAction, AppRole[]>>> = {
  admin: { read: ["admin"], update: ["admin"], delete: ["admin"] },
  customer_dashboard: { read: ["customer", "client", "admin"], update: ["customer", "client", "admin"] },
  specialist_dashboard: { read: ["specialist", "admin"], update: ["specialist", "admin"] },
  company_dashboard: { read: ["company", "admin"], update: ["company", "admin"] },
  credits: { read: ["customer", "client", "company", "admin"], create: ["admin"], update: ["admin"], reconcile: ["admin"] },
  payments: { read: ["customer", "client", "company", "admin"], create: ["customer", "client", "company", "admin"], reconcile: ["admin"] },
  specialist_approval: { read: ["admin"], approve: ["admin"], update: ["admin"] },
  company_leads: { read: ["company", "admin"], update: ["admin"] },
};

export function canAccess(role: AppRole | null | undefined, resource: SecurityResource, action: SecurityAction) {
  const normalizedRole = role === "client" ? "customer" : role ?? "guest";
  return Boolean(accessMatrix[resource]?.[action]?.includes(normalizedRole));
}

export function sanitizePlainText(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function redactSensitive(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      if (/token|secret|password|authorization|cedula|selfie|idfront|idback/i.test(key)) return [key, "[REDACTED]"];
      return [key, redactSensitive(item)];
    }),
  );
}

function redactString(value: string) {
  return value
    .replace(/\b(\d{1,2})\.?\d{3}\.?\d{3}-?[\dkK]\b/g, "$1.***.***-*")
    .replace(/\b([^@\s])[^@\s]*@([^@\s]+\.[^@\s]+)\b/g, "$1***@$2")
    .replace(/(\+?56\s?9\s?)\d{4}\s?(\d{4})/g, "$1**** $2")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
}
