"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RestoreButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await action();
              router.refresh();
            } catch (caught) {
              setError(
                caught instanceof Error
                  ? caught.message
                  : "Could not restore this record.",
              );
            }
          });
        }}
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
      >
        {pending ? "Restoring…" : "Restore"}
      </button>
      {error ? (
        <p className="max-w-[16rem] text-right text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
