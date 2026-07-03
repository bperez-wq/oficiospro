#!/usr/bin/env node
// Auditoria de drafts Soro SEO.
//
// Revisa todos los Markdown en content/soro-drafts/ (excepto README.md) y
// valida frontmatter, reglas editoriales y frases prohibidas.
//
// Este script NO publica contenido, NO modifica el sitemap y NO toca rutas
// productivas. Solo lee y reporta.
//
// Uso: npm run soro:audit  (o: node scripts/soro-content-audit.mjs)
// Sale con codigo 1 si hay errores.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const draftsDir = join(root, "content", "soro-drafts");

const REQUIRED_FIELDS = [
  "title",
  "metaTitle",
  "metaDescription",
  "keyword",
  "audience",
  "funnelStage",
  "targetPageType",
  "canonicalTarget",
  "seoStatus",
  "ctaTarget",
  "factCheckNotes",
];

const VALID_AUDIENCES = ["cliente", "especialista", "empresa", "comunidad", "institucion"];
const VALID_SEO_STATUS = ["draft", "noindex"]; // "approved" jamas por defecto en drafts.

// Frases prohibidas: claims sin evidencia, promesas y asesoria indebida.
const FORBIDDEN_PHRASES = [
  "ingresos garantizados",
  "clientes garantizados",
  "resultados garantizados",
  "trabajo garantizado",
  "100% garantizado",
  "te garantizamos",
  "garantizamos que",
  "los mejores especialistas",
  "el mejor servicio de chile",
  "la mejor plataforma",
  "numero uno",
  "número uno",
  "n°1",
  "gana dinero facil",
  "gana dinero fácil",
  "duplica tus ingresos",
  "ingresos asegurados",
  "sin riesgo",
];

// Afirmaciones de disponibilidad/cobertura que no podemos validar.
const AVAILABILITY_CLAIMS = [
  "disponible las 24 horas",
  "atencion inmediata",
  "atención inmediata",
  "llegamos en menos de",
  "respuesta en minutos",
  "hoy mismo en tu casa",
  "cobertura en todo chile",
  "en todas las comunas",
];

// Asesoria tributaria definitiva (debe ser orientacion + disclaimer).
const TAX_ADVICE_CLAIMS = [
  "no necesitas contador",
  "no pagues impuestos",
  "evita el sii",
  "sin pagar impuestos",
  "te asesoramos tributariamente",
];

const TAX_TRIGGERS = ["boleta", "factura", "iva", "retencion", "retención", "sii", "impuesto"];
const LEGAL_TRIGGERS = ["gobierno", "convenio", "municipio", "municipal", "ministerio"];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  let currentListKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(listItem[1].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    if (value === "") {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    currentListKey = null;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    data[key] = value;
  }
  return data;
}

function findPhrases(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.filter((phrase) => lower.includes(phrase));
}

function auditFile(filePath, fileName) {
  const errors = [];
  const warnings = [];
  const raw = readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(raw);

  if (!fm) {
    return { errors: ["No tiene frontmatter (--- ... ---)."], warnings };
  }

  for (const field of REQUIRED_FIELDS) {
    const value = fm[field];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && field !== "internalLinks" && value.length === 0)) {
      errors.push(`Falta el campo obligatorio "${field}".`);
    }
  }

  if (!Array.isArray(fm.internalLinks) || fm.internalLinks.length === 0) {
    errors.push('Debe declarar al menos un enlace en "internalLinks".');
  }

  if (fm.audience && !VALID_AUDIENCES.includes(fm.audience)) {
    errors.push(`audience "${fm.audience}" invalido. Validos: ${VALID_AUDIENCES.join(", ")}.`);
  }

  if (fm.seoStatus === "approved") {
    errors.push('seoStatus no puede ser "approved" en un draft: la aprobacion es humana y ocurre fuera de esta carpeta.');
  } else if (fm.seoStatus && !VALID_SEO_STATUS.includes(fm.seoStatus)) {
    errors.push(`seoStatus "${fm.seoStatus}" invalido en drafts. Validos: ${VALID_SEO_STATUS.join(", ")}.`);
  }

  if (fm.requiresTaxReview === undefined) errors.push("Falta requiresTaxReview (true/false).");
  if (fm.requiresLegalReview === undefined) errors.push("Falta requiresLegalReview (true/false).");

  const body = raw.slice(raw.indexOf("---", 3) + 3);
  const fullText = raw;

  for (const phrase of findPhrases(fullText, FORBIDDEN_PHRASES)) {
    errors.push(`Frase prohibida detectada: "${phrase}".`);
  }
  for (const phrase of findPhrases(fullText, AVAILABILITY_CLAIMS)) {
    errors.push(`Afirmacion de disponibilidad/cobertura no validada: "${phrase}".`);
  }
  for (const phrase of findPhrases(fullText, TAX_ADVICE_CLAIMS)) {
    errors.push(`Posible asesoria tributaria indebida: "${phrase}".`);
  }

  const taxHits = findPhrases(body, TAX_TRIGGERS);
  if (taxHits.length > 0 && fm.requiresTaxReview !== true) {
    errors.push(`Menciona temas tributarios (${taxHits.join(", ")}) pero requiresTaxReview no es true.`);
  }

  const legalHits = findPhrases(body, LEGAL_TRIGGERS);
  if (legalHits.length > 0 && fm.requiresLegalReview !== true && fm.institutionalReview !== true) {
    errors.push(`Menciona temas institucionales/legales (${legalHits.join(", ")}) pero requiresLegalReview (o institutionalReview) no es true.`);
  }

  if (typeof fm.metaDescription === "string" && fm.metaDescription.length > 165) {
    warnings.push(`metaDescription larga (${fm.metaDescription.length} caracteres, ideal <= 160).`);
  }
  if (typeof fm.metaTitle === "string" && fm.metaTitle.length > 65) {
    warnings.push(`metaTitle largo (${fm.metaTitle.length} caracteres, ideal <= 60).`);
  }
  if (body.trim().split(/\s+/).length < 150) {
    warnings.push("Contenido corto (<150 palabras): riesgo de pagina de baja calidad.");
  }
  if (typeof fm.canonicalTarget === "string" && fm.canonicalTarget && !fm.canonicalTarget.startsWith("/")) {
    warnings.push("canonicalTarget deberia ser una ruta interna que parte con '/'.");
  }

  return { errors, warnings };
}

function main() {
  if (!existsSync(draftsDir)) {
    console.error(`No existe ${draftsDir}.`);
    process.exit(1);
  }

  const files = readdirSync(draftsDir).filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md");

  if (files.length === 0) {
    console.log("Sin drafts que auditar en content/soro-drafts/.");
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const affected = [];

  console.log(`Auditando ${files.length} draft(s) en content/soro-drafts/\n`);

  for (const file of files) {
    const { errors, warnings } = auditFile(join(draftsDir, file), file);
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`OK       ${file}`);
      continue;
    }
    if (errors.length > 0) affected.push(file);
    for (const warning of warnings) {
      totalWarnings += 1;
      console.log(`WARNING  ${file}: ${warning}`);
    }
    for (const error of errors) {
      totalErrors += 1;
      console.log(`ERROR    ${file}: ${error}`);
    }
  }

  console.log(`\nResumen: ${files.length} archivo(s), ${totalErrors} error(es), ${totalWarnings} warning(s).`);
  if (affected.length > 0) {
    console.log(`Archivos con errores: ${affected.join(", ")}`);
  }
  console.log("Este script no publica contenido ni modifica el sitemap.");

  if (totalErrors > 0) process.exit(1);
  console.log("Auditoria Soro: OK.");
}

main();
