import { businessModelHealthConfig } from "@/config/businessModelHealthConfig";
import type {
  BusinessHealthAlert,
  BusinessHealthConfig,
  BusinessHealthDimensionConfig,
  BusinessHealthDimensionResult,
  BusinessHealthInsufficientSignal,
  BusinessHealthMetricUnit,
  BusinessHealthResult,
  BusinessHealthSnapshot,
  BusinessHealthStatus,
  BusinessHealthThreshold,
} from "./types";

const statusRank: Record<BusinessHealthStatus, number> = {
  healthy: 0,
  insufficient_data: 1,
  watch: 2,
  warning: 3,
  critical: 4,
};

const statusScore: Record<Exclude<BusinessHealthStatus, "insufficient_data">, number> = {
  healthy: 100,
  watch: 75,
  warning: 45,
  critical: 15,
};

export function calculateBusinessHealth(
  snapshot: BusinessHealthSnapshot,
  config: BusinessHealthConfig = businessModelHealthConfig,
): BusinessHealthResult {
  const dimensions = config.dimensions.map((dimension) => calculateDimension(dimension, snapshot, config.thresholds));
  const alerts = dimensions.flatMap((dimension) => dimension.alerts);
  const insufficientSignals = dimensions.flatMap((dimension) => dimension.insufficientSignals);
  const measurableDimensions = dimensions.filter((dimension) => dimension.status !== "insufficient_data");
  const status = aggregateGlobalStatus(dimensions);
  const score =
    measurableDimensions.length > 0
      ? Math.round(measurableDimensions.reduce((sum, dimension) => sum + (dimension.score ?? 0), 0) / measurableDimensions.length)
      : null;

  return {
    generatedAt: snapshot.generatedAt,
    status,
    score,
    dimensions,
    alerts,
    insufficientSignals,
    priorities: buildPriorities(alerts, insufficientSignals),
    nextMetric: nextMetricFor(alerts, insufficientSignals),
  };
}

export function ratio(numerator: number | undefined, denominator: number | undefined) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || !denominator) return undefined;
  return Number(numerator) / Number(denominator);
}

export function formatBusinessMetric(value: number | undefined, unit?: BusinessHealthMetricUnit) {
  if (!Number.isFinite(value)) return "sin datos";
  const numberValue = Number(value);
  if (unit === "rate") return `${Math.round(numberValue * 1000) / 10}%`;
  if (unit === "clp") return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(numberValue);
  if (unit === "hours") return `${Math.round(numberValue * 10) / 10} h`;
  if (unit === "days") return `${Math.round(numberValue * 10) / 10} dias`;
  if (unit === "score") return `${Math.round(numberValue)}/100`;
  return new Intl.NumberFormat("es-CL").format(numberValue);
}

function calculateDimension(
  dimension: BusinessHealthDimensionConfig,
  snapshot: BusinessHealthSnapshot,
  thresholds: BusinessHealthThreshold[],
): BusinessHealthDimensionResult {
  const dimensionThresholds = thresholds.filter((threshold) => threshold.dimension === dimension.id);
  const alerts: BusinessHealthAlert[] = [];
  const insufficientSignals: BusinessHealthInsufficientSignal[] = [];

  for (const threshold of dimensionThresholds) {
    const evaluation = evaluateThreshold(threshold, snapshot);
    if (evaluation.kind === "alert") alerts.push(evaluation.alert);
    else if (evaluation.kind === "insufficient") insufficientSignals.push(evaluation.signal);
  }

  const status = aggregateDimensionStatus(alerts, insufficientSignals, dimensionThresholds);
  const score = status === "insufficient_data" ? null : statusScore[status];
  const metrics = Object.fromEntries(dimension.metricKeys.map((metricKey) => [metricKey, snapshot.metrics[metricKey]]));

  return {
    id: dimension.id,
    label: dimension.label,
    description: dimension.description,
    status,
    score,
    metrics,
    alerts,
    insufficientSignals,
  };
}

function evaluateThreshold(
  threshold: BusinessHealthThreshold,
  snapshot: BusinessHealthSnapshot,
):
  | { kind: "healthy" }
  | { kind: "alert"; alert: BusinessHealthAlert }
  | { kind: "insufficient"; signal: BusinessHealthInsufficientSignal } {
  const value = snapshot.metrics[threshold.metricKey];
  const sampleSize = snapshot.metrics[threshold.sampleMetricKey] ?? 0;

  if (!Number.isFinite(value)) {
    return {
      kind: "insufficient",
      signal: insufficientSignal(threshold, sampleSize, "missing_metric"),
    };
  }

  if (sampleSize < threshold.minimumSampleSize) {
    return {
      kind: "insufficient",
      signal: insufficientSignal(threshold, sampleSize, "sample_too_small"),
    };
  }

  const status = thresholdStatus(threshold, Number(value));
  if (status === "healthy") return { kind: "healthy" };

  const alertStatus = threshold.type === "opportunity" ? "watch" : status;
  return {
    kind: "alert",
    alert: {
      id: threshold.id,
      type: threshold.type ?? "risk",
      status: alertStatus,
      dimension: threshold.dimension,
      label: threshold.label,
      metricKey: threshold.metricKey,
      value: Number(value),
      sampleMetricKey: threshold.sampleMetricKey,
      sampleSize,
      minimumSampleSize: threshold.minimumSampleSize,
      evaluationWindowDays: threshold.evaluationWindowDays,
      suggestedAction: threshold.suggestedAction,
      approvalRequired: Boolean(threshold.approvalRequired),
      evidence: `${threshold.metricKey}=${formatBusinessMetric(Number(value), threshold.unit)} con muestra ${sampleSize}`,
    },
  };
}

function thresholdStatus(threshold: BusinessHealthThreshold, value: number): Exclude<BusinessHealthStatus, "insufficient_data"> {
  if (threshold.direction === "max") {
    if (value >= threshold.criticalThreshold) return "critical";
    if (value >= threshold.warningThreshold) return "warning";
    if (value >= threshold.watchThreshold) return "watch";
    return "healthy";
  }

  if (value <= threshold.criticalThreshold) return "critical";
  if (value <= threshold.warningThreshold) return "warning";
  if (value <= threshold.watchThreshold) return "watch";
  return "healthy";
}

function insufficientSignal(
  threshold: BusinessHealthThreshold,
  sampleSize: number,
  reason: BusinessHealthInsufficientSignal["reason"],
): BusinessHealthInsufficientSignal {
  return {
    id: threshold.id,
    dimension: threshold.dimension,
    metricKey: threshold.metricKey,
    sampleMetricKey: threshold.sampleMetricKey,
    sampleSize,
    minimumSampleSize: threshold.minimumSampleSize,
    reason,
  };
}

function aggregateDimensionStatus(
  alerts: BusinessHealthAlert[],
  insufficientSignals: BusinessHealthInsufficientSignal[],
  thresholds: BusinessHealthThreshold[],
): BusinessHealthStatus {
  if (alerts.length) return worstStatus(alerts.map((alert) => alert.status));
  if (insufficientSignals.length === thresholds.length) return "insufficient_data";
  if (insufficientSignals.length) return "watch";
  return "healthy";
}

function aggregateGlobalStatus(dimensions: BusinessHealthDimensionResult[]): BusinessHealthStatus {
  if (dimensions.every((dimension) => dimension.status === "insufficient_data")) return "insufficient_data";
  const measurable = dimensions.filter((dimension) => dimension.status !== "insufficient_data");
  const worst = worstStatus(measurable.map((dimension) => dimension.status));
  if (worst === "healthy" && dimensions.some((dimension) => dimension.status === "insufficient_data")) return "watch";
  return worst;
}

function worstStatus<T extends BusinessHealthStatus>(statuses: T[]): T {
  return statuses.reduce((worst, status) => (statusRank[status] > statusRank[worst] ? status : worst), statuses[0] ?? ("healthy" as T));
}

function buildPriorities(alerts: BusinessHealthAlert[], insufficientSignals: BusinessHealthInsufficientSignal[]) {
  if (alerts.length) {
    return alerts
      .slice()
      .sort((a, b) => statusRank[b.status] - statusRank[a.status])
      .slice(0, 3)
      .map((alert) => `${alert.label}: ${alert.suggestedAction}`);
  }

  if (insufficientSignals.length) {
    return [
      "Consolidar medicion semanal antes de sacar conclusiones fuertes.",
      "Priorizar instrumentacion de oferta, demanda, liquidez, economia y confianza.",
      "Revisar CRM y conversion events para completar muestras minimas.",
    ];
  }

  return [
    "Mantener el ciclo semanal y buscar el siguiente cuello de botella medible.",
    "Aumentar muestra por oficio/comuna antes de escalar experimentos.",
    "Comparar oferta, demanda y economia antes de mover el modelo.",
  ];
}

function nextMetricFor(alerts: BusinessHealthAlert[], insufficientSignals: BusinessHealthInsufficientSignal[]) {
  const blockingAlert = alerts.slice().sort((a, b) => statusRank[b.status] - statusRank[a.status])[0];
  if (blockingAlert) return blockingAlert.metricKey;
  const missingSignal = insufficientSignals[0];
  if (missingSignal) return missingSignal.metricKey;
  return "servicesCompleted";
}
