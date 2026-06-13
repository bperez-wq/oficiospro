export function shouldShowDemoData() {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "true";
}

export function isDemoDataEnabled() {
  return shouldShowDemoData();
}

export function showDemoData() {
  return shouldShowDemoData();
}

export function allowOperationalLocalSeed() {
  return shouldShowDemoData();
}

export function demoDataMode() {
  return shouldShowDemoData() ? "demo_enabled" : "real_or_empty_state";
}
