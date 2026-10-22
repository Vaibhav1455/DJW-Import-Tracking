"use client";

import {
  PIPELINE_STATUSES,
  pipelineStepIndex,
  type PipelineStatus,
} from "@/lib/constants";

export function StageTracker({
  status,
  disabled,
  pending,
  onSelect,
}: {
  status: string;
  disabled?: boolean;
  pending?: boolean;
  onSelect: (value: PipelineStatus) => void;
}) {
  const current = pipelineStepIndex(status);

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {PIPELINE_STATUSES.map((stage, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <button
            key={stage.value}
            type="button"
            disabled={disabled || pending}
            onClick={() => onSelect(stage.value)}
            className={`flex min-w-[7.5rem] flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition sm:min-w-0 ${
              active
                ? "border-ink-800 bg-ink-800 text-white"
                : done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-ink-100 bg-white text-ink-700/70 hover:border-ink-800/30"
            } ${disabled || pending ? "opacity-60" : ""}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                active
                  ? "bg-white/15"
                  : done
                    ? "bg-emerald-600 text-white"
                    : "bg-paper-100"
              }`}
            >
              {done ? "✓" : stage.step}
            </span>
            <span className="text-[11px] font-semibold leading-tight">
              {stage.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
