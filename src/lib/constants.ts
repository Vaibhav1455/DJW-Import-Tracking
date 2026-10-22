export const LIFTING_STATUSES = [
  { value: "ORDER_CONFIRMED", label: "Order Confirmed" },
  { value: "LOADED_AT_CFS", label: "Loaded at CFS" },
  { value: "LIFTED", label: "Lifted" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
] as const;

export type LiftingStatus = (typeof LIFTING_STATUSES)[number]["value"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]["value"];

export const COMMITTED_STATUSES: LiftingStatus[] = [
  "ORDER_CONFIRMED",
  "LOADED_AT_CFS",
];

export const PIPELINE_STATUSES = [
  { value: "ADVANCE_PAID", step: 1, name: "Advance Paid", label: "1. Advance Paid" },
  { value: "BALANCE_PAID", step: 2, name: "Balance Paid", label: "2. Balance Paid" },
  { value: "CUSTOMS_DOCUMENTS_RECEIVED", step: 3, name: "Customs Docs Received", label: "3. Customs Documents Received" },
  { value: "DUTY_PAID", step: 4, name: "Duty Paid", label: "4. Duty Paid" },
  { value: "SHIPPING_LINE_BILL_PAID", step: 5, name: "Shipping Line Bill Paid", label: "5. Shipping Line Bill Paid" },
  { value: "CARGO_ARRIVED_AT_CFS", step: 6, name: "Cargo Arrived at CFS", label: "6. Cargo Arrived at CFS" },
] as const;

export const IN_ACTIVE_SALES_STOCK = "IN_ACTIVE_SALES_STOCK";

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]["value"];

export const LEGACY_PIPELINE_STATUS: Record<string, PipelineStatus> = {
  ORDER_PLACED: "ADVANCE_PAID",
  IN_TRANSIT: "SHIPPING_LINE_BILL_PAID",
  ARRIVED_AT_CFS: "CARGO_ARRIVED_AT_CFS",
};

export function isCargoArrivedStatus(status: string) {
  return (
    status === "CARGO_ARRIVED_AT_CFS" ||
    status === "ARRIVED_AT_CFS" ||
    status === IN_ACTIVE_SALES_STOCK
  );
}

export function pipelineStatusForForm(status?: string | null) {
  if (!status) return "ADVANCE_PAID";
  if (status === IN_ACTIVE_SALES_STOCK) return "CARGO_ARRIVED_AT_CFS";
  if (LEGACY_PIPELINE_STATUS[status]) return LEGACY_PIPELINE_STATUS[status];
  if (PIPELINE_STATUSES.some((item) => item.value === status)) return status;
  return "ADVANCE_PAID";
}

export function pipelineStatusLabel(status: string) {
  if (status === IN_ACTIVE_SALES_STOCK) return "In Active Sales Stock";
  const mapped = pipelineStatusForForm(status);
  return PIPELINE_STATUSES.find((item) => item.value === mapped)?.label ?? status;
}

export function pipelineStepIndex(status: string) {
  const mapped = pipelineStatusForForm(status);
  return PIPELINE_STATUSES.findIndex((item) => item.value === mapped);
}

function hasAmountAndDate(
  amount?: number | null,
  date?: Date | string | null,
) {
  return amount != null && amount > 0 && Boolean(date);
}

export const USD_TO_AED = 3.67;

export function aedFromUsd(usd: number) {
  return Math.round(usd * USD_TO_AED * 100) / 100;
}

export function usdFromAed(aed: number) {
  return Math.round((aed / USD_TO_AED) * 100) / 100;
}

export function pairAedUsd(
  aed?: number | null,
  usd?: number | null,
): { aed: number | null; usd: number | null } {
  if (aed != null && usd == null) {
    return { aed, usd: usdFromAed(aed) };
  }
  if (usd != null && aed == null) {
    return { aed: aedFromUsd(usd), usd };
  }
  return { aed: aed ?? null, usd: usd ?? null };
}

export function inferPipelineStatus(input: {
  pipelineStatus?: string | null;
  documentStatus?: string | null;
  dateOfBalancePayment?: Date | string | null;
  balanceAmountPaid?: number | null;
  balanceAmountUsd?: number | null;
  dutyAmountInr?: number | null;
  dutyPaidDate?: Date | string | null;
  beDate?: Date | string | null;
  shippingLineBillAmount?: number | null;
  shippingLineBillDate?: Date | string | null;
  cfsActualWeightMt?: number | null;
}): PipelineStatus {
  let rank = pipelineStepIndex(input.pipelineStatus ?? "ADVANCE_PAID");
  if (rank < 0) rank = 0;

  if (
    hasAmountAndDate(
      input.balanceAmountPaid ?? input.balanceAmountUsd,
      input.dateOfBalancePayment,
    )
  ) {
    rank = Math.max(rank, 1);
  }
  if (input.documentStatus === "RECEIVED") {
    rank = Math.max(rank, 2);
  }
  if (
    hasAmountAndDate(
      input.dutyAmountInr,
      input.dutyPaidDate ?? input.beDate,
    )
  ) {
    rank = Math.max(rank, 3);
  }
  if (
    hasAmountAndDate(
      input.shippingLineBillAmount,
      input.shippingLineBillDate,
    )
  ) {
    rank = Math.max(rank, 4);
  }
  if (input.cfsActualWeightMt != null && input.cfsActualWeightMt > 0) {
    rank = Math.max(rank, 5);
  }

  return PIPELINE_STATUSES[rank]?.value ?? "ADVANCE_PAID";
}

export const FREIGHT_TERMS = ["CFR", "FOB", "CIF"] as const;

export const DOCUMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "RECEIVED", label: "Received" },
] as const;

export const LOT_STAGE = {
  PIPELINE: "PIPELINE",
  ACTIVE: "ACTIVE",
} as const;

export type LotStage = (typeof LOT_STAGE)[keyof typeof LOT_STAGE];
