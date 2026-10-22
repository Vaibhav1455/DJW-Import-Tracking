"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function ConfirmDeleteButton({
  message,
  action,
  redirectTo,
  label = "Delete",
}: {
  message: string;
  action: () => Promise<void>;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        setOpen(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not delete this record.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      >
        <TrashIcon />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
          onClick={() => {
            if (!pending) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm leading-6 text-ink-800">{message}</p>
            {error ? (
              <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-ink-100 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirm}
                className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M5 6h10m-1 0-.7 9.1a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4L6 6m3 0V4.8A1.8 1.8 0 0 1 10.8 3h.4A1.8 1.8 0 0 1 13 4.8V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
