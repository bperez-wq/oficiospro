import { communeRegionCode, regionCodeForName, regionNameForCode, serviceTypeOptions } from "@/lib/catalog";

export const specialistQuickDraftKey = "oficiospro.specialistQuickDraft";

export type SpecialistQuickDraftInput = {
  firstNames?: unknown;
  lastNames?: unknown;
  rut?: unknown;
  whatsapp?: unknown;
  phone?: unknown;
  email?: unknown;
  primaryService?: unknown;
  primaryTrade?: unknown;
  serviceType?: unknown;
  serviceTypeId?: unknown;
  baseRegionCode?: unknown;
  baseRegionName?: unknown;
  region?: unknown;
  baseCommuneCode?: unknown;
  baseCommuneName?: unknown;
  commune?: unknown;
  fromQuickSpecialist?: unknown;
};

export type SpecialistQuickDraft = {
  firstNames: string;
  lastNames: string;
  rut: string;
  whatsapp: string;
  email: string;
  serviceTypeId: string;
  serviceTypeLabel: string;
  baseRegionCode: string;
  baseRegionName: string;
  baseCommuneName: string;
  fromQuickSpecialist: boolean;
  updatedAt: string;
};

export function normalizeSpecialistDraft(data: SpecialistQuickDraftInput | null | undefined): SpecialistQuickDraft {
  const serviceTypeId = normalizeServiceType(text(data?.serviceTypeId) || text(data?.serviceType) || text(data?.primaryService) || text(data?.primaryTrade));
  const serviceTypeLabel = serviceTypeOptions.find((option) => option.value === serviceTypeId)?.label ?? "";
  const baseCommuneName = text(data?.baseCommuneName) || text(data?.baseCommuneCode) || text(data?.commune);
  const explicitRegion = text(data?.baseRegionCode) || text(data?.baseRegionName) || text(data?.region);
  const inferredRegion = baseCommuneName ? communeRegionCode(baseCommuneName) : "";
  const baseRegionCode = regionCodeForName(explicitRegion) || inferredRegion || explicitRegion;

  return {
    firstNames: text(data?.firstNames),
    lastNames: text(data?.lastNames),
    rut: text(data?.rut),
    whatsapp: text(data?.whatsapp) || text(data?.phone),
    email: normalizeEmail(text(data?.email)),
    serviceTypeId,
    serviceTypeLabel,
    baseRegionCode,
    baseRegionName: baseRegionCode ? regionNameForCode(baseRegionCode) : "",
    baseCommuneName: baseRegionCode ? baseCommuneName : "",
    fromQuickSpecialist: Boolean(data?.fromQuickSpecialist),
    updatedAt: new Date().toISOString(),
  };
}

export function saveSpecialistQuickDraft(data: SpecialistQuickDraftInput) {
  if (!canUseSessionStorage()) return null;
  const existing = readSpecialistQuickDraft();
  const draft = normalizeSpecialistDraft({ ...existing, ...data });
  if (!hasDraftContent(draft)) return null;

  try {
    window.sessionStorage.setItem(specialistQuickDraftKey, JSON.stringify(draft));
    return draft;
  } catch {
    return null;
  }
}

export function readSpecialistQuickDraft() {
  if (!canUseSessionStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(specialistQuickDraftKey);
    return raw ? normalizeSpecialistDraft(JSON.parse(raw) as SpecialistQuickDraftInput) : null;
  } catch {
    return null;
  }
}

export function clearSpecialistQuickDraft() {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.removeItem(specialistQuickDraftKey);
  } catch {
    // Session-only draft cleanup should never block the submission flow.
  }
}

export function mergeSpecialistDraft<T extends Record<string, unknown>>(existingForm: T, draft: SpecialistQuickDraft | null) {
  if (!draft) return existingForm;
  const next = { ...existingForm };
  setIfEmpty(next, "firstNames", draft.firstNames);
  setIfEmpty(next, "lastNames", draft.lastNames);
  setIfEmpty(next, "rut", draft.rut);
  setIfEmpty(next, "whatsapp", draft.whatsapp);
  setIfEmpty(next, "phone", draft.whatsapp);
  setIfEmpty(next, "email", draft.email);
  setIfEmpty(next, "serviceTypeId", draft.serviceTypeId);
  setIfEmpty(next, "primaryService", draft.serviceTypeId || draft.serviceTypeLabel);
  setIfEmpty(next, "primaryTrade", draft.serviceTypeLabel);
  setIfEmpty(next, "baseRegionCode", draft.baseRegionCode);
  setIfEmpty(next, "baseRegionName", draft.baseRegionName);
  setIfEmpty(next, "region", draft.baseRegionCode);
  setIfEmpty(next, "baseCommuneName", draft.baseCommuneName);
  setIfEmpty(next, "commune", draft.baseCommuneName);
  return next;
}

function normalizeServiceType(value: string) {
  if (!value) return "";
  const normalized = normalize(value);
  return (
    serviceTypeOptions.find((option) => option.value === value)?.value ??
    serviceTypeOptions.find((option) => normalize(option.label) === normalized)?.value ??
    value
  );
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function setIfEmpty(target: Record<string, unknown>, key: string, value: string) {
  if (!value) return;
  const current = target[key];
  if (typeof current !== "string" || !current.trim()) target[key] = value;
}

function hasDraftContent(draft: SpecialistQuickDraft) {
  return Boolean(draft.firstNames || draft.lastNames || draft.rut || draft.whatsapp || draft.email || draft.serviceTypeId || draft.baseCommuneName);
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && "sessionStorage" in window;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 180) : "";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
