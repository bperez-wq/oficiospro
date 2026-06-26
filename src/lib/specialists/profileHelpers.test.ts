import assert from "node:assert/strict";
import { test } from "node:test";

import type { PendingSpecialistProfile } from "@/lib/storage";
import {
  isPublicSpecialistStatus,
  specialistPublicationReadiness,
  specialistSlug,
  uniqueSpecialistSlug,
} from "./profileHelpers";

test("specialistSlug normaliza acentos, espacios y mayusculas", () => {
  assert.equal(specialistSlug("Juan Pérez", "Gasfitería", "Ñuñoa"), "juan-perez-gasfiteria-nunoa");
  assert.equal(specialistSlug("  Ana  ", "Electricidad"), "ana-electricidad");
});

test("specialistSlug usa fallback cuando no hay datos utiles", () => {
  assert.equal(specialistSlug("", undefined, undefined, "especialista-123"), "especialista-123");
});

test("uniqueSpecialistSlug respeta el base si esta libre y desambigua si choca", () => {
  assert.equal(uniqueSpecialistSlug("juan-gasfiter", []), "juan-gasfiter");
  assert.equal(uniqueSpecialistSlug("juan-gasfiter", ["juan-gasfiter"]), "juan-gasfiter-2");
  assert.equal(uniqueSpecialistSlug("juan-gasfiter", ["juan-gasfiter", "juan-gasfiter-2"]), "juan-gasfiter-3");
});

test("isPublicSpecialistStatus solo es publico sin estado o 'published'", () => {
  assert.equal(isPublicSpecialistStatus(undefined), true);
  assert.equal(isPublicSpecialistStatus("published"), true);
  assert.equal(isPublicSpecialistStatus("pending_review"), false);
  assert.equal(isPublicSpecialistStatus("suspended"), false);
});

const completeProfile = {
  id: "sp_1",
  name: "Juan Pérez",
  commune: "Ñuñoa",
  coverageRadiusKm: 12,
  profilePhoto: "/p.jpg",
  identityVerification: {
    verificationStatus: "approved",
    profilePhotoUrl: "/p.jpg",
    idFrontUrl: "r2://front",
    idBackUrl: "r2://back",
    selfieUrl: "r2://selfie",
  },
  references: [
    { name: "Ref 1", phone: "1", work: "Trabajo 1" },
    { name: "Ref 2", phone: "2", work: "Trabajo 2" },
    { name: "Ref 3", phone: "3", work: "Trabajo 3" },
  ],
  services: [{ pricingMode: "fixed", specialistExpectedPayoutCLP: 25000 }],
} as unknown as PendingSpecialistProfile;

test("specialistPublicationReadiness aprueba un perfil completo", () => {
  const result = specialistPublicationReadiness(completeProfile);
  assert.equal(result.ok, true);
  assert.equal(result.missing.length, 0);
});

test("specialistPublicationReadiness lista lo que falta en un perfil incompleto", () => {
  const incomplete = { id: "sp_2", name: "Pedro", services: [] } as unknown as PendingSpecialistProfile;
  const result = specialistPublicationReadiness(incomplete);
  assert.equal(result.ok, false);
  assert.ok(result.missing.includes("Identidad aprobada"));
  assert.ok(result.missing.includes("3 referencias completas"));
  assert.ok(result.missing.includes("Servicios declarados"));
});
