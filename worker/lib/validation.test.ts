import assert from "node:assert/strict";
import { test } from "node:test";

import {
  escapeHtml,
  isValidEmail,
  isValidPhone,
  isValidRutFormat,
  priorityFor,
  redactSensitive,
  sanitizeEmail,
  sanitizePayloadObject,
  sanitizeText,
} from "./validation";

const SCRIPT_OPEN = "<script>";
const SCRIPT_CLOSE = "</script>";

test("sanitizeText elimina scripts, angulares y recorta al maximo", () => {
  // El regex elimina la etiqueta <script> junto con su contenido.
  assert.equal(sanitizeText(`${SCRIPT_OPEN}alert(1)${SCRIPT_CLOSE}hola`, 100), "hola");
  assert.equal(sanitizeText("a<b>c", 100), "abc");
  assert.equal(sanitizeText("abcdefgh", 4), "abcd");
  assert.equal(sanitizeText(123, 10), undefined);
  assert.equal(sanitizeText("   ", 10), undefined);
});

test("sanitizeText remueve caracteres de control", () => {
  // Construimos los bytes de control programaticamente (NUL, TAB, DEL).
  const withControls = "a" + String.fromCharCode(0) + "b" + String.fromCharCode(9) + "c" + String.fromCharCode(127) + "d";
  assert.equal(sanitizeText(withControls, 100), "a b c d");
});

test("sanitizeEmail normaliza y valida; isValidEmail lo refleja", () => {
  assert.equal(sanitizeEmail("  Foo@Bar.CL "), "foo@bar.cl");
  assert.equal(sanitizeEmail("no-es-email"), undefined);
  assert.equal(isValidEmail("a@b.cl"), true);
  assert.equal(isValidEmail("a@b"), false);
});

test("isValidPhone acepta formatos chilenos razonables y rechaza basura", () => {
  assert.equal(isValidPhone("+56 9 1234 5678"), true);
  assert.equal(isValidPhone("221234567"), true);
  assert.equal(isValidPhone("123"), false);
  assert.equal(isValidPhone("abcdefgh"), false);
});

test("isValidRutFormat valida el formato (no el digito verificador)", () => {
  assert.equal(isValidRutFormat("12.345.678-9"), true);
  assert.equal(isValidRutFormat("12345678-k"), true);
  assert.equal(isValidRutFormat("9.876.543-2"), true);
  assert.equal(isValidRutFormat("abc"), false);
  assert.equal(isValidRutFormat(""), false);
});

test("priorityFor marca alta solo en urgencias", () => {
  assert.equal(priorityFor("Lo necesito hoy"), "alta");
  assert.equal(priorityFor("urgente"), "alta");
  assert.equal(priorityFor("la proxima semana"), "normal");
  assert.equal(priorityFor(undefined), "normal");
});

test("sanitizePayloadObject elimina claves peligrosas de escalado de privilegios", () => {
  const out = sanitizePayloadObject({
    nombre: "Ana",
    role: "admin",
    isAdmin: true,
    token: "secreto",
    nested: { admin_api_token: "x", ok: 1 },
  }) as Record<string, unknown>;
  assert.equal(out.nombre, "Ana");
  assert.equal("role" in out, false);
  assert.equal("isAdmin" in out, false);
  assert.equal("token" in out, false);
  assert.equal((out.nested as Record<string, unknown>).ok, 1);
  assert.equal("admin_api_token" in (out.nested as Record<string, unknown>), false);
});

test("sanitizePayloadObject corta el tamano de arrays", () => {
  const bigArray = Array.from({ length: 200 }, (_, i) => i);
  const out = sanitizePayloadObject({ list: bigArray }) as Record<string, unknown>;
  assert.equal((out.list as unknown[]).length, 50);
});

test("redactSensitive enmascara RUT, email y Bearer en strings", () => {
  const redacted = redactSensitive("rut 12.345.678-9 mail juan@correo.cl Bearer abc.def-123") as string;
  assert.ok(!redacted.includes("12.345.678-9"));
  assert.ok(!redacted.includes("juan@correo.cl"));
  assert.ok(redacted.includes("Bearer [REDACTED]"));
});

test("redactSensitive enmascara por nombre de clave sensible en objetos", () => {
  const out = redactSensitive({ email: "x@y.cl", nota: "hola", selfieUrl: "http://x" }) as Record<string, unknown>;
  assert.equal(out.email, "[REDACTED]");
  assert.equal(out.selfieUrl, "[REDACTED]");
  assert.equal(out.nota, "hola");
});

test("escapeHtml neutraliza caracteres peligrosos", () => {
  assert.equal(escapeHtml(`<a href="x">&`), "&lt;a href=&quot;x&quot;&gt;&amp;");
});
