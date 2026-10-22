"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
        Could not save
      </p>
      <h1 className="mt-2 font-display text-3xl">Check the stock position</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-700/70">
        {error.message || "Something went wrong while updating lots or bookings."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
