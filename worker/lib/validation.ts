// Helpers puros de validacion y saneo extraidos de worker/index.ts.
// Sin dependencias de Request/env: 100% testeable de forma aislada.
// El comportamiento es identico al que ya corria en el worker.

// Rango de caracteres de control ASCII (0x00-0x1f y 0x7f). Se construye con
// RegExp para evitar incrustar bytes de control en el codigo fuente.
const controlCharsRegex = new RegExp("[\\u0000-\\u001f\\u007f]", "g");

export function priorityFor(urgency?: string) {
  const value = (urgency ?? "").toLowerCase();
  if (value.includes("hoy") || value.includes("urg")) return "alta";
  return "normal";
}

export function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .replace(controlCharsRegex, " ")
    .trim()
    .slice(0, maxLength) || undefined;
}

export function sanitizeEmail(value: unknown) {
  const text = sanitizeText(value, 180);
  if (!text) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text.toLowerCase() : undefined;
}

export function isValidEmail(value: unknown) {
  return Boolean(sanitizeEmail(value));
}

export function isValidPhone(value: unknown) {
  const text = sanitizeText(value, 40);
  return Boolean(text && /^[+0-9()\s-]{8,24}$/.test(text));
}

export function isValidRutFormat(value: string) {
  return /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$/.test(value.trim());
}

export function sanitizePayloadObject(value: unknown, depth = 0): unknown {
  if (depth > 6) return undefined;
  if (typeof value === "string") return sanitizeText(value, 4000) ?? "";
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean" || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizePayloadObject(item, depth + 1));
  if (typeof value !== "object") return undefined;

  const dangerousKeys = new Set(["role", "isadmin", "admin", "token", "authorization", "password", "admin_token", "admin_api_token"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !dangerousKeys.has(key.toLowerCase()))
      .slice(0, 80)
      .map(([key, item]) => [sanitizeText(key, 80) ?? "field", sanitizePayloadObject(item, depth + 1)]),
  );
}

export function redactSensitive(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\b(\d{1,2})\.?\d{3}\.?\d{3}-?[\dkK]\b/g, "$1.***.***-*")
      .replace(/\b([^@\s])[^@\s]*@([^@\s]+\.[^@\s]+)\b/g, "$1***@$2")
      .replace(/(\+?56\s?9\s?)\d{4}\s?(\d{4})/g, "$1**** $2")
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
  }
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      /token|secret|password|authorization|rut|phone|whatsapp|email|cedula|selfie|idfront|idback/i.test(key) ? "[REDACTED]" : redactSensitive(item),
    ]),
  );
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
