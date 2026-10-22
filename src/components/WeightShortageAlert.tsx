import { formatMt } from "@/lib/format";
import type { WeightCheck } from "@/lib/weights";

export function WeightShortageAlert({
  check,
  compact = false,
  label = "Shortage",
}: {
  check: WeightCheck | null;
  compact?: boolean;
  label?: string;
}) {
  if (!check) {
    if (compact) return null;
    return (
      <p className="text-sm text-ink-700/55">
        Enter BL and received quantities to calculate {label.toLowerCase()}.
      </p>
    );
  }

  if (check.hasShortage) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-800 ${
          compact ? "" : "w-fit"
        }`}
      >
        <span>
          ⚠️ {label}: {formatMt(check.shortageMt)}
        </span>
        <span className="font-medium text-rose-700/80">
          ({check.shortagePct.toFixed(2)}%)
        </span>
      </div>
    );
  }

  if (check.hasGain) {
    return (
      <p className="text-sm font-medium text-emerald-700">
        {label} surplus: {formatMt(check.shortageMt)} (
        {check.shortagePct.toFixed(2)}%)
      </p>
    );
  }

  return (
    <p className="text-sm font-medium text-emerald-700">{label}: 0.000 MT</p>
  );
}

export function ShortageValue({
  check,
  label,
}: {
  check: WeightCheck | null;
  label?: string;
}) {
  if (!check) {
    return <span className="text-ink-700/45">—</span>;
  }

  const text = `${label ? `${label} ` : ""}${formatMt(check.shortageMt)}`;

  if (check.hasShortage) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
        ⚠️ {text}
      </span>
    );
  }

  return <span className="font-medium text-emerald-700">{text}</span>;
}

export function ShortagePair({
  cfs,
  delivery,
  compact = false,
}: {
  cfs: WeightCheck | null;
  delivery: WeightCheck | null;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`}>
      <WeightShortageAlert check={cfs} compact={compact} label="CFS Shortage" />
      <WeightShortageAlert
        check={delivery}
        compact={compact}
        label="Delivery Shortage"
      />
    </div>
  );
}
