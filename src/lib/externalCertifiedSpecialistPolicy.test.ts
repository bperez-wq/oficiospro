import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import {
  companyTechnicalResponsiblesPrototype,
  externalCertifiedProfessionalsPrototype,
  externalCertifiedRegistryPolicy,
  type ExternalCertifiedProfessional,
} from "@/data/externalCertifiedSpecialists";
import {
  assertRealSecImportAllowed,
  canCreateExternalBooking,
  canCreateExternalQuotation,
  canEnableClaimedProfessionalQuotation,
  canExposeExternalContact,
  canIndexExternalProfile,
  projectUnclaimedPublicFields,
  showCompanyCertifiedSecBadge,
  visibleCompanyTechnicalResponsibles,
} from "@/lib/externalCertifiedSpecialistPolicy";

test("unclaimed prototype records are fake, noindex and commercial-action blocked", () => {
  for (const profile of externalCertifiedProfessionalsPrototype) {
    assert.equal(profile.fakeData, true);
    assert.equal(profile.indexable, false);
    assert.equal(canIndexExternalProfile(profile), false);
    assert.equal(canExposeExternalContact(profile), false);
    assert.equal(canCreateExternalBooking(profile), false);
    assert.equal(canCreateExternalQuotation(profile), false);
  }
});

test("unclaimed public projection excludes contact and reputation fields", () => {
  const visible = projectUnclaimedPublicFields(externalCertifiedProfessionalsPrototype[0]);
  assert.deepEqual(Object.keys(visible).sort(), [
    "certificationStatus",
    "comuna",
    "fakeData",
    "fullName",
    "id",
    "lastVerifiedAt",
    "licenseClass",
    "region",
    "serviceType",
    "sourceName",
    "sourceUrl",
  ].sort());
  for (const field of externalCertifiedRegistryPolicy.prohibitedUnclaimedFields) {
    assert.equal(field in visible, false);
  }
});

test("claimed professional can enable quotation only after consent and publication scope", () => {
  const claimed: ExternalCertifiedProfessional = {
    ...externalCertifiedProfessionalsPrototype[0],
    profileStatus: "CLAIMED_PROFESSIONAL_PROFILE",
    quotationEnabled: true,
    termsAcceptedAt: "2026-07-04T12:00:00.000Z",
    privacyAcceptedAt: "2026-07-04T12:00:00.000Z",
    publicationScope: ["commercial_actions"],
  };
  assert.equal(canEnableClaimedProfessionalQuotation(claimed), true);
  assert.equal(canEnableClaimedProfessionalQuotation({ ...claimed, publicationScope: [] }), false);
});

test("companies cannot inherit a SEC certified badge from a person", () => {
  assert.equal(showCompanyCertifiedSecBadge(), false);
});

test("company technical responsibles display only with accepted consent and verified status", () => {
  assert.equal(visibleCompanyTechnicalResponsibles(companyTechnicalResponsiblesPrototype).length, 0);
  assert.equal(
    visibleCompanyTechnicalResponsibles([
      { ...companyTechnicalResponsiblesPrototype[0], consentStatus: "ACCEPTED", verificationStatus: "VERIFIED" },
    ]).length,
    1,
  );
});

test("real SEC import is blocked by default", () => {
  assert.throws(() => assertRealSecImportAllowed(undefined), /real_sec_import_blocked_pending_legal_review/);
  assert.doesNotThrow(() => assertRealSecImportAllowed("true"));
});

test("unclaimed external registry routes are excluded from sitemap", () => {
  const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
  assert.equal(sitemap.includes("/registro-publico-externo/"), false);
});
