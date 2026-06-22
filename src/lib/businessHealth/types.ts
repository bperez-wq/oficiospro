export type BusinessHealthStatus = "healthy" | "watch" | "warning" | "critical" | "insufficient_data";

export type BusinessHealthDimensionId = "supply" | "demand" | "liquidity" | "economics" | "trust";

export type BusinessHealthMetricUnit = "count" | "rate" | "clp" | "hours" | "days" | "score";

export type BusinessHealthThresholdDirection = "min" | "max";

export type BusinessHealthAlertType = "risk" | "opportunity";

export type BusinessHealthDimensionConfig = {
  id: BusinessHealthDimensionId;
  label: string;
  description: string;
  metricKeys: string[];
};

export type BusinessHealthThreshold = {
  id: string;
  dimension: BusinessHealthDimensionId;
  label: string;
  metricKey: string;
  sampleMetricKey: string;
  minimumSampleSize: number;
  watchThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  direction: BusinessHealthThresholdDirection;
  evaluationWindowDays: number;
  unit?: BusinessHealthMetricUnit;
  type?: BusinessHealthAlertType;
  approvalRequired?: boolean;
  suggestedAction: string;
};

export type BusinessHealthConfig = {
  dimensions: BusinessHealthDimensionConfig[];
  thresholds: BusinessHealthThreshold[];
};

export type BusinessHealthSnapshot = {
  generatedAt: string;
  windowDays: number;
  metrics: Record<string, number | undefined>;
  sources?: string[];
  notes?: string[];
};

export type BusinessHealthAlert = {
  id: string;
  type: BusinessHealthAlertType;
  status: Exclude<BusinessHealthStatus, "healthy" | "insufficient_data">;
  dimension: BusinessHealthDimensionId;
  label: string;
  metricKey: string;
  value: number;
  sampleMetricKey: string;
  sampleSize: number;
  minimumSampleSize: number;
  evaluationWindowDays: number;
  suggestedAction: string;
  approvalRequired: boolean;
  evidence: string;
};

export type BusinessHealthInsufficientSignal = {
  id: string;
  dimension: BusinessHealthDimensionId;
  metricKey: string;
  sampleMetricKey: string;
  sampleSize: number;
  minimumSampleSize: number;
  reason: "missing_metric" | "sample_too_small";
};

export type BusinessHealthDimensionResult = {
  id: BusinessHealthDimensionId;
  label: string;
  description: string;
  status: BusinessHealthStatus;
  score: number | null;
  metrics: Record<string, number | undefined>;
  alerts: BusinessHealthAlert[];
  insufficientSignals: BusinessHealthInsufficientSignal[];
};

export type BusinessHealthResult = {
  generatedAt: string;
  status: BusinessHealthStatus;
  score: number | null;
  dimensions: BusinessHealthDimensionResult[];
  alerts: BusinessHealthAlert[];
  insufficientSignals: BusinessHealthInsufficientSignal[];
  priorities: string[];
  nextMetric: string;
};

export type ModelRecommendation = {
  id: string;
  title: string;
  evidence: string;
  hypothesis: string;
  risk: string;
  experiment: string;
  metric: string;
  durationDays: number;
  authorityRequired: "ai_can_prepare" | "benjamin_approval_required";
};

export type GrowthExperimentStatus = "proposed" | "approved" | "running" | "completed" | "stopped";

export type GrowthExperimentType =
  | "cta_copy"
  | "onboarding"
  | "short_lead_vs_full_form"
  | "whatsapp_vs_form"
  | "b2b_vs_home"
  | "trade_pilot"
  | "commune_pilot"
  | "premium_profiles"
  | "qualified_leads"
  | "business_plan"
  | "specialist_saas"
  | "institutional_model"
  | "commission_vs_lead_fee";

export type GrowthExperiment = {
  id: string;
  title: string;
  type: GrowthExperimentType;
  hypothesis: string;
  problem: string;
  segment: string;
  modelVariant: string;
  owner: "ChatGPT" | "Codex" | "Claude" | "Grok" | "Benjamin" | "Operaciones";
  status: GrowthExperimentStatus;
  startDate?: string;
  endDate?: string;
  primaryMetric: string;
  baseline?: string;
  target: string;
  guardrailMetrics: string[];
  result?: string;
  decision?: string;
  learning?: string;
  approvalRequired: boolean;
};
