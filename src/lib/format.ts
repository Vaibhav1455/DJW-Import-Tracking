export function fileQuantityMt(lot: {
  quantityMt?: number | null;
  blWeightMt?: number | null;
  cfsActualWeightMt?: number | null;
}) {
  return lot.quantityMt ?? lot.blWeightMt ?? lot.cfsActualWeightMt ?? null;
}

export function totalOrderPrice(quantityMt?: number | null, rate?: number | null) {
  if (quantityMt == null || rate == null || Number.isNaN(quantityMt) || Number.isNaN(rate)) {
    return null;
  }
  return quantityMt * rate;
}

export function isoDateInput(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatMoney(value: number, currency: "AED" | "USD" | "INR") {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

export function formatMt(value: number, digits = 3) {
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} MT`;
}

export function formatInr(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function invoiceAmount(
  rateInrPerMt: number,
  qtyBookedMt: number,
  actualLoadedWeightMt?: number | null,
) {
  const billedMt = actualLoadedWeightMt && actualLoadedWeightMt > 0
    ? actualLoadedWeightMt
    : qtyBookedMt;
  return rateInrPerMt * billedMt;
}
