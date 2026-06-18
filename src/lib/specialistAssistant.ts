import {
  specialistAssistantContactLink,
  specialistAssistantFallbacks,
  specialistAssistantKnowledge,
  type SpecialistAssistantKnowledgeEntry,
  type SpecialistAssistantLink,
} from "@/data/specialistAssistantKnowledge";

export type SpecialistAssistantSession = {
  sessionId: string;
  questionCount: number;
  infoSeekingCount: number;
  lastQuestions: string[];
  escalated: boolean;
};

export type SpecialistAssistantMatch = {
  entry: SpecialistAssistantKnowledgeEntry;
  score: number;
  confidence: number;
};

export type SpecialistAssistantResponse = {
  answer: string;
  intent: string;
  confidence: number;
  relatedLinks: SpecialistAssistantLink[];
  escalationRecommended: boolean;
  fallbackType?: "unknown" | "low_confidence" | "out_of_scope" | "tax_legal" | "question_limit" | "sensitive";
  matchedEntryId?: string;
};

const contactLink = { label: "Escribir a bperez@oficiospro.cl", href: specialistAssistantContactLink };
const informationLimit = 5;
const lowConfidenceThreshold = 0.34;

const outOfScopeTerms = [
  "clima",
  "partido",
  "futbol",
  "politica",
  "presidente",
  "receta",
  "medicina",
  "diagnostico medico",
  "pelicula",
  "bitcoin",
  "inversion",
];

const taxLegalSpecificTerms = [
  "demanda",
  "juicio",
  "contrato laboral",
  "evadir",
  "impuesto exacto",
  "declaracion renta",
  "f29",
  "codigo sii",
  "asesoria legal",
  "me conviene tributar",
];

const sensitiveHarvestingTerms = [
  "token",
  "admin",
  "password",
  "contrasena",
  "base de datos",
  "rut de",
  "telefono de",
  "correo de",
  "email de",
  "cedula de",
  "selfie de",
  "documentos de otro",
  "datos de otro",
  "lista de especialistas",
  "cuanto gana",
  "payout de",
];

export function detectSpecialistAssistantIntent(question: string) {
  if (isOutOfScopeQuestion(question)) return "out_of_scope";
  if (isSpecificTaxLegalQuestion(question)) return "tax_legal_specific";
  if (containsSensitiveHarvestingQuestion(question)) return "sensitive_request";
  return findBestKnowledgeAnswer(question)?.entry.intent ?? "unknown";
}

export function findBestKnowledgeAnswer(question: string): SpecialistAssistantMatch | null {
  const normalizedQuestion = normalizeAssistantText(question);
  if (!normalizedQuestion) return null;

  let best: SpecialistAssistantMatch | null = null;
  for (const entry of specialistAssistantKnowledge) {
    const score = scoreEntry(entry, normalizedQuestion);
    if (score <= 0) continue;
    const confidence = Math.min(1, entry.confidence * Math.min(1, 0.25 + score / 8));
    if (!best || confidence > best.confidence || (confidence === best.confidence && score > best.score)) {
      best = { entry, score, confidence };
    }
  }

  return best && best.confidence >= lowConfidenceThreshold ? best : null;
}

export function buildAssistantResponse(question: string, sessionState: SpecialistAssistantSession): SpecialistAssistantResponse {
  if (isInformationHarvestingPattern(sessionState) || containsSensitiveHarvestingQuestion(question)) {
    return fallbackResponse("sensitive", "sensitive_request", specialistAssistantFallbacks.sensitive);
  }

  if (sessionState.infoSeekingCount > informationLimit) {
    return fallbackResponse("question_limit", "question_limit", specialistAssistantFallbacks.questionLimit);
  }

  if (isOutOfScopeQuestion(question)) {
    return fallbackResponse("out_of_scope", "out_of_scope", specialistAssistantFallbacks.outOfScope);
  }

  if (isSpecificTaxLegalQuestion(question)) {
    return fallbackResponse("tax_legal", "tax_legal_specific", specialistAssistantFallbacks.taxLegal);
  }

  const match = findBestKnowledgeAnswer(question);
  if (!match) {
    return fallbackResponse("unknown", "unknown", specialistAssistantFallbacks.unknown);
  }

  if (match.confidence < 0.48) {
    return fallbackResponse("low_confidence", match.entry.intent, specialistAssistantFallbacks.lowConfidence);
  }

  const answer = match.entry.escalationRecommended
    ? `${match.entry.answer} Para tu caso puntual, escribenos a bperez@oficiospro.cl.`
    : match.entry.answer;

  return {
    answer: trimAnswer(answer),
    intent: match.entry.intent,
    confidence: match.confidence,
    relatedLinks: dedupeLinks(match.entry.escalationRecommended ? [...match.entry.relatedLinks, contactLink] : match.entry.relatedLinks),
    escalationRecommended: match.entry.escalationRecommended,
    matchedEntryId: match.entry.id,
  };
}

export function shouldEscalateToHuman(sessionState: SpecialistAssistantSession, intent: string) {
  return (
    sessionState.infoSeekingCount > informationLimit ||
    sessionState.escalated ||
    ["unknown", "out_of_scope", "tax_legal_specific", "sensitive_request", "question_limit"].includes(intent)
  );
}

export function isInformationHarvestingPattern(sessionState: SpecialistAssistantSession) {
  const recent = sessionState.lastQuestions.slice(-4).map(normalizeAssistantText).join(" ");
  const hits = sensitiveHarvestingTerms.filter((term) => recent.includes(normalizeAssistantText(term))).length;
  return hits >= 2;
}

export function sanitizeSpecialistAssistantQuestion(question: string) {
  return question
    .replace(/\b(\d{1,2})\.?\d{3}\.?\d{3}-?[\dkK]\b/g, "$1.***.***-*")
    .replace(/\b([^@\s])[^@\s]*@([^@\s]+\.[^@\s]+)\b/g, "$1***@$2")
    .replace(/(?:\+?56)?\s?9\s?\d{4}\s?\d{4}/g, "+56 9 **** ****")
    .replace(/(cedula|selfie|documento|password|token|secret|contrasena)[=:]?\s*\S+/gi, "$1=[redacted]")
    .slice(0, 240);
}

export function normalizeAssistantText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+.%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(entry: SpecialistAssistantKnowledgeEntry, normalizedQuestion: string) {
  const keywordScore = entry.keywords.reduce((total, keyword) => {
    const normalizedKeyword = normalizeAssistantText(keyword);
    if (!normalizedKeyword) return total;
    if (normalizedQuestion.includes(normalizedKeyword)) return total + Math.min(4, normalizedKeyword.split(" ").length + 1);
    return total;
  }, 0);

  const exampleScore = entry.questionExamples.reduce((total, example) => {
    const tokens = normalizeAssistantText(example).split(" ").filter((token) => token.length > 3);
    const matches = tokens.filter((token) => normalizedQuestion.includes(token)).length;
    return total + Math.min(3, matches);
  }, 0);

  return keywordScore + exampleScore;
}

function fallbackResponse(
  fallbackType: NonNullable<SpecialistAssistantResponse["fallbackType"]>,
  intent: string,
  answer: string,
): SpecialistAssistantResponse {
  return {
    answer,
    intent,
    confidence: 0,
    relatedLinks: [contactLink],
    escalationRecommended: true,
    fallbackType,
  };
}

function isOutOfScopeQuestion(question: string) {
  const normalized = normalizeAssistantText(question);
  return outOfScopeTerms.some((term) => normalized.includes(normalizeAssistantText(term)));
}

function isSpecificTaxLegalQuestion(question: string) {
  const normalized = normalizeAssistantText(question);
  return taxLegalSpecificTerms.some((term) => normalized.includes(normalizeAssistantText(term)));
}

function containsSensitiveHarvestingQuestion(question: string) {
  const normalized = normalizeAssistantText(question);
  return sensitiveHarvestingTerms.some((term) => normalized.includes(normalizeAssistantText(term)));
}

function trimAnswer(answer: string) {
  const sentences = answer.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 4).join(" ");
}

function dedupeLinks(links: SpecialistAssistantLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
