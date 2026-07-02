#!/usr/bin/env node
// Importador manual de drafts Soro.
//
// Valida un draft de content/soro-drafts/ y, si pasa la auditoria, lo COPIA a
// content/soro-staging/ para revision editorial humana.
//
// Este script:
// - NO publica el contenido.
// - NO lo agrega al sitemap.
// - NO cambia rutas productivas.
// - NO borra el original (la copia en staging es la que se edita en revision).
//
// Uso: node scripts/import-soro-draft.mjs example-specialist-guide.md

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const draftsDir = join(root, "content", "soro-drafts");
const stagingDir = join(root, "content", "soro-staging");

const CHECKLIST = `
Checklist editorial (completar en revision humana):

  [ ] Intencion de busqueda no cubierta mejor por una pagina existente.
  [ ] Titulo, H1 y metaDescription unicos y especificos.
  [ ] Sin claims inventados: cobertura, disponibilidad, especialistas, precios, ratings.
  [ ] Sin promesas de ingresos ni resultados.
  [ ] CTA apunta a la pagina correcta y funciona.
  [ ] Enlaces internos validados contra rutas reales.
  [ ] canonicalTarget correcto (o pagina nueva justificada).
  [ ] Si toca temas tributarios: revision tributaria hecha + disclaimer visible.
  [ ] Si menciona instituciones/municipios: revision institucional hecha.
  [ ] Tono OficiosPro: chileno, claro, profesional, sin relleno.
  [ ] Registrado en src/data/soroSeoPipeline.ts con estado editorial_review.

La publicacion y el cambio a seoStatus approved son decisiones humanas.
Este script no publica ni toca el sitemap.
`;

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Uso: node scripts/import-soro-draft.mjs <archivo.md en content/soro-drafts/>");
    process.exit(1);
  }

  const fileName = basename(arg);
  const sourcePath = join(draftsDir, fileName);

  if (!existsSync(sourcePath)) {
    console.error(`No existe ${sourcePath}.`);
    process.exit(1);
  }
  if (fileName.toLowerCase() === "readme.md") {
    console.error("README.md no es un draft importable.");
    process.exit(1);
  }

  console.log(`Validando ${fileName} con la auditoria Soro...\n`);
  try {
    const output = execFileSync(process.execPath, [join(root, "scripts", "soro-content-audit.mjs")], {
      encoding: "utf8",
    });
    console.log(output);
  } catch (error) {
    console.error(error.stdout ?? "");
    console.error("La auditoria Soro fallo. Corrige los errores antes de importar.");
    process.exit(1);
  }

  mkdirSync(stagingDir, { recursive: true });
  const targetPath = join(stagingDir, fileName);
  if (existsSync(targetPath)) {
    console.error(`Ya existe ${targetPath}. Resuelve la revision pendiente antes de reimportar.`);
    process.exit(1);
  }

  copyFileSync(sourcePath, targetPath);
  console.log(`Draft copiado a staging: content/soro-staging/${fileName}`);
  console.log(CHECKLIST);
}

main();
