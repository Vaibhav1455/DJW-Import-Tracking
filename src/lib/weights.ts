export type WeightCheck = {
  blWeightMt: number;
  receivedMt: number;
  shortageMt: number;
  shortagePct: number;
  hasShortage: boolean;
  hasGain: boolean;
};

export function computeReceivedVsBl(
  blWeightMt?: number | null,
  receivedMt?: number | null,
): WeightCheck | null {
  if (
    blWeightMt == null ||
    receivedMt == null ||
    Number.isNaN(blWeightMt) ||
    Number.isNaN(receivedMt)
  ) {
    return null;
  }

  const shortageMt = receivedMt - blWeightMt;
  const shortagePct = blWeightMt > 0 ? (shortageMt / blWeightMt) * 100 : 0;

  return {
    blWeightMt,
    receivedMt,
    shortageMt,
    shortagePct,
    hasShortage: shortageMt < -0.0005,
    hasGain: shortageMt > 0.0005,
  };
}

export function computeWeightShortage(
  blWeightMt?: number | null,
  cfsActualWeightMt?: number | null,
) {
  return computeReceivedVsBl(blWeightMt, cfsActualWeightMt);
}

export function computeDeliveryShortage(
  blWeightMt?: number | null,
  deliveryQuantityMt?: number | null,
) {
  return computeReceivedVsBl(blWeightMt, deliveryQuantityMt);
}

export function hasAnyShortage(
  blWeightMt?: number | null,
  cfsActualWeightMt?: number | null,
  deliveryQuantityMt?: number | null,
) {
  return Boolean(
    computeWeightShortage(blWeightMt, cfsActualWeightMt)?.hasShortage ||
      computeDeliveryShortage(blWeightMt, deliveryQuantityMt)?.hasShortage,
  );
}
