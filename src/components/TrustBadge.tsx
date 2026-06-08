export function TrustBadge({ label, detail }: { label: string; detail?: string }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand/15 bg-white px-4 py-2 text-sm font-black text-brand-dark shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      <span>
        {label}
        {detail ? <small className="ml-1 font-bold text-muted">{detail}</small> : null}
      </span>
    </span>
  );
}
