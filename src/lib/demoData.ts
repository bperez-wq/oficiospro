export function showDemoData() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "true") return true;
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function allowOperationalLocalSeed() {
  return showDemoData() || process.env.NEXT_PUBLIC_ALLOW_LOCAL_OPERATIONAL_SEED === "true";
}

export function demoDataMode() {
  return showDemoData() ? "demo_enabled" : "real_or_empty_state";
}
