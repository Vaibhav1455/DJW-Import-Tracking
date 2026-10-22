import {
  LIFTING_STATUSES,
  PAYMENT_STATUSES,
  pipelineStatusLabel,
} from "@/lib/constants";

const liftingStyles: Record<string, string> = {
  ORDER_CONFIRMED: "bg-sky-100 text-sky-900",
  LOADED_AT_CFS: "bg-amber-100 text-amber-900",
  LIFTED: "bg-emerald-100 text-emerald-900",
};

const paymentStyles: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-700",
  PARTIAL: "bg-orange-100 text-orange-900",
  PAID: "bg-emerald-100 text-emerald-900",
  OVERDUE: "bg-rose-100 text-rose-900",
};

export function LiftingBadge({ status }: { status: string }) {
  const label =
    LIFTING_STATUSES.find((item) => item.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${liftingStyles[status] ?? "bg-stone-100"}`}
    >
      {label}
    </span>
  );
}

const pipelineStyles: Record<string, string> = {
  ADVANCE_PAID: "bg-sky-100 text-sky-900",
  BALANCE_PAID: "bg-indigo-100 text-indigo-900",
  CUSTOMS_DOCUMENTS_RECEIVED: "bg-violet-100 text-violet-900",
  DUTY_PAID: "bg-amber-100 text-amber-900",
  SHIPPING_LINE_BILL_PAID: "bg-orange-100 text-orange-900",
  CARGO_ARRIVED_AT_CFS: "bg-emerald-100 text-emerald-900",
  IN_ACTIVE_SALES_STOCK: "bg-emerald-100 text-emerald-900",
  ORDER_PLACED: "bg-sky-100 text-sky-900",
  IN_TRANSIT: "bg-orange-100 text-orange-900",
  ARRIVED_AT_CFS: "bg-emerald-100 text-emerald-900",
};

export function PipelineBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pipelineStyles[status] ?? "bg-stone-100"}`}
    >
      {pipelineStatusLabel(status)}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const label =
    PAYMENT_STATUSES.find((item) => item.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStyles[status] ?? "bg-stone-100"}`}
    >
      {label}
    </span>
  );
}
