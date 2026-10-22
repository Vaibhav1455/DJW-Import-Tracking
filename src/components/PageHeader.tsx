import Link from "next/link";

export function PageHeader({
  kicker,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-600">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-ink-700/65">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-xl bg-copper-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-copper-600"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
