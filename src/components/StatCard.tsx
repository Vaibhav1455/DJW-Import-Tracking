export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-700/55">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl tabular tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-sm text-ink-700/60">{hint}</p> : null}
    </article>
  );
}
