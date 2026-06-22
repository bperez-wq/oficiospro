import rawConfig from "./businessModelHealthThresholds.json";
import type { BusinessHealthConfig } from "@/lib/businessHealth/types";

export const businessModelHealthConfig = rawConfig as BusinessHealthConfig;

export const businessHealthDimensions = businessModelHealthConfig.dimensions;

export const businessHealthThresholds = businessModelHealthConfig.thresholds;

export const businessHealthStatusLabels = {
  healthy: "Healthy",
  watch: "Watch",
  warning: "Warning",
  critical: "Critical",
  insufficient_data: "Datos insuficientes",
} as const;

export const businessHealthStatusClasses = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  watch: "border-yellow-200 bg-yellow-50 text-yellow-800",
  warning: "border-orange-200 bg-orange-50 text-orange-800",
  critical: "border-red-200 bg-red-50 text-red-800",
  insufficient_data: "border-slate-200 bg-slate-50 text-slate-700",
} as const;
