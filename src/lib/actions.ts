"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  assertCanReserve,
  computeLotStock,
  computeLotStockExcluding,
} from "./stock";
import {
  DOCUMENT_STATUSES,
  FREIGHT_TERMS,
  IN_ACTIVE_SALES_STOCK,
  LOT_STAGE,
  LIFTING_STATUSES,
  PAYMENT_STATUSES,
  PIPELINE_STATUSES,
  inferPipelineStatus,
  isCargoArrivedStatus,
  pairAedUsd,
  pipelineStatusForForm,
} from "./constants";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function number(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`${key} must be a number.`);
  }
  return value;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/lots");
  revalidatePath("/bookings");
  revalidatePath("/pipeline");
  revalidatePath("/recycle");
}

const live = { isDeleted: false };

function liveLotInclude() {
  return {
    where: live,
    include: { bookings: { where: live } },
  } as const;
}

function optionalMt(formData: FormData, key: string) {
  const value = number(formData, key);
  if (value == null) return null;
  if (value < 0) {
    throw new Error(`${key} cannot be negative.`);
  }
  return value;
}

function optionalDate(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${key} is not a valid date.`);
  }
  return value;
}

function arrivalFields(
  pipelineStatus: string,
  blWeightMt: number | null,
  cfsActualWeightMt: number | null,
  existing?: {
    stage: string;
    pipelineStatus: string;
    totalInitialInwardMt: number;
    arrivedAtCfsAt: Date | null;
  },
) {
  const normalized = pipelineStatusForForm(pipelineStatus);
  if (!PIPELINE_STATUSES.some((status) => status.value === normalized)) {
    throw new Error("Invalid pipeline status.");
  }

  if (!isCargoArrivedStatus(normalized)) {
    return {
      stage: LOT_STAGE.PIPELINE,
      pipelineStatus: normalized,
      totalInitialInwardMt: 0,
      arrivedAtCfsAt: null as Date | null,
    };
  }

  const alreadyInSalesStock =
    existing?.stage === LOT_STAGE.ACTIVE &&
    existing.pipelineStatus === IN_ACTIVE_SALES_STOCK;

  if (alreadyInSalesStock) {
    return {
      stage: LOT_STAGE.ACTIVE,
      pipelineStatus: IN_ACTIVE_SALES_STOCK,
      totalInitialInwardMt: existing.totalInitialInwardMt,
      arrivedAtCfsAt: existing.arrivedAtCfsAt,
    };
  }

  if (cfsActualWeightMt == null || cfsActualWeightMt <= 0) {
    throw new Error(
      "Enter CFS Quantity Received before marking Cargo Arrived at CFS. That quantity becomes live sales stock.",
    );
  }

  return {
    stage: LOT_STAGE.ACTIVE,
    pipelineStatus: IN_ACTIVE_SALES_STOCK,
    totalInitialInwardMt: cfsActualWeightMt,
    arrivedAtCfsAt: new Date(),
  };
}

function excelFields(formData: FormData) {
  const freightTerms = text(formData, "freightTerms") || null;
  if (freightTerms && !FREIGHT_TERMS.includes(freightTerms as (typeof FREIGHT_TERMS)[number])) {
    throw new Error("Freight terms must be CFR, FOB, or CIF.");
  }

  const documentStatus = text(formData, "documentStatus") || "PENDING";
  if (!DOCUMENT_STATUSES.some((status) => status.value === documentStatus)) {
    throw new Error("Document status must be Pending or Received.");
  }

  const advance = pairAedUsd(
    optionalMt(formData, "advanceAmountPaid"),
    optionalMt(formData, "advanceAmountUsd"),
  );
  const balance = pairAedUsd(
    optionalMt(formData, "balanceAmountPaid"),
    optionalMt(formData, "balanceAmountUsd"),
  );

  return {
    bookingNo: text(formData, "bookingNo") || null,
    piNo: text(formData, "piNo") || null,
    supplierName: text(formData, "supplierName"),
    quantityMt: optionalMt(formData, "quantityMt"),
    rateAed: optionalMt(formData, "rateAed"),
    rateUsd: optionalMt(formData, "rateUsd"),
    freightTerms,
    portLocation: text(formData, "portLocation"),
    dateOfAdvance: optionalDate(formData, "dateOfAdvance"),
    advanceAmountPaid: advance.aed,
    advanceAmountUsd: advance.usd,
    documentStatus,
    dateOfBalancePayment: optionalDate(formData, "dateOfBalancePayment"),
    balanceAmountPaid: balance.aed,
    balanceAmountUsd: balance.usd,
    vesselName: text(formData, "vesselName") || null,
    shippingLine: text(formData, "shippingLine") || null,
    shipmentBillDoNumber: text(formData, "shipmentBillDoNumber") || null,
    beNumber: text(formData, "beNumber") || null,
    beDate: optionalDate(formData, "beDate"),
    dutyAmountInr: optionalMt(formData, "dutyAmountInr"),
    dutyPaidDate: optionalDate(formData, "dutyPaidDate"),
    shippingLineBillAmount: optionalMt(formData, "shippingLineBillAmount"),
    shippingLineBillDate: optionalDate(formData, "shippingLineBillDate"),
  };
}

function inferredStatus(
  pipelineStatus: string,
  fields: {
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
  },
) {
  return inferPipelineStatus({
    pipelineStatus,
    documentStatus: fields.documentStatus,
    dateOfBalancePayment: fields.dateOfBalancePayment,
    balanceAmountPaid: fields.balanceAmountPaid,
    balanceAmountUsd: fields.balanceAmountUsd,
    dutyAmountInr: fields.dutyAmountInr,
    dutyPaidDate: fields.dutyPaidDate,
    beDate: fields.beDate,
    shippingLineBillAmount: fields.shippingLineBillAmount,
    shippingLineBillDate: fields.shippingLineBillDate,
    cfsActualWeightMt: fields.cfsActualWeightMt,
  });
}

export async function createPipelineOrder(formData: FormData) {
  const lotNumber = text(formData, "lotNumber");
  const productName = text(formData, "productName");
  const pipelineStatus = text(formData, "pipelineStatus") || "ADVANCE_PAID";
  const blWeightMt = optionalMt(formData, "blWeightMt");
  const cfsActualWeightMt = optionalMt(formData, "cfsActualWeightMt");
  const deliveryQuantityMt = optionalMt(formData, "deliveryQuantityMt");
  const notes = text(formData, "notes") || null;
  const extra = excelFields(formData);

  if (!lotNumber || !productName) {
    throw new Error("File No. and product are required.");
  }

  const resolvedStatus = inferredStatus(pipelineStatus, {
    ...extra,
    cfsActualWeightMt,
  });
  const arrival = arrivalFields(resolvedStatus, blWeightMt, cfsActualWeightMt);

  const lot = await prisma.cargoLot.create({
    data: {
      lotNumber,
      productName,
      notes,
      blWeightMt,
      cfsActualWeightMt,
      deliveryQuantityMt,
      ...extra,
      ...arrival,
    },
  });

  revalidateAll();
  if (arrival.stage === LOT_STAGE.ACTIVE) {
    revalidatePath(`/lots/${lot.id}`);
    redirect(`/lots/${lot.id}`);
  }
  redirect("/pipeline");
}

export async function updatePipelineOrder(formData: FormData) {
  const id = text(formData, "id");
  const lotNumber = text(formData, "lotNumber");
  const productName = text(formData, "productName");
  const pipelineStatus = text(formData, "pipelineStatus") || "ADVANCE_PAID";
  const blWeightMt = optionalMt(formData, "blWeightMt");
  const cfsActualWeightMt = optionalMt(formData, "cfsActualWeightMt");
  const deliveryQuantityMt = optionalMt(formData, "deliveryQuantityMt");
  const notes = text(formData, "notes") || null;
  const extra = excelFields(formData);

  if (!id || !lotNumber || !productName) {
    throw new Error("File No. and product are required.");
  }

  const existing = await prisma.cargoLot.findFirst({
    ...liveLotInclude(),
    where: { id, ...live },
  });
  if (!existing) throw new Error("Pipeline order not found.");

  const nextBl = blWeightMt ?? existing.blWeightMt;
  const nextCfs = cfsActualWeightMt ?? existing.cfsActualWeightMt;
  const resolvedStatus = inferredStatus(pipelineStatus, {
    documentStatus: extra.documentStatus,
    dateOfBalancePayment: extra.dateOfBalancePayment,
    balanceAmountPaid: extra.balanceAmountPaid,
    balanceAmountUsd: extra.balanceAmountUsd,
    dutyAmountInr: extra.dutyAmountInr,
    dutyPaidDate: extra.dutyPaidDate,
    beDate: extra.beDate,
    shippingLineBillAmount: extra.shippingLineBillAmount,
    shippingLineBillDate: extra.shippingLineBillDate,
    cfsActualWeightMt: nextCfs,
  });
  const arrival = arrivalFields(
    resolvedStatus,
    nextBl,
    nextCfs,
    existing,
  );

  if (
    existing.stage === LOT_STAGE.ACTIVE &&
    arrival.stage === LOT_STAGE.PIPELINE &&
    existing.bookings.length > 0
  ) {
    throw new Error(
      "This lot already has sales bookings and cannot return to the pipeline.",
    );
  }

  await prisma.cargoLot.update({
    where: { id },
    data: {
      lotNumber,
      productName,
      notes,
      blWeightMt: blWeightMt ?? existing.blWeightMt,
      cfsActualWeightMt: cfsActualWeightMt ?? existing.cfsActualWeightMt,
      deliveryQuantityMt: deliveryQuantityMt ?? existing.deliveryQuantityMt,
      ...extra,
      ...arrival,
    },
  });

  revalidateAll();
  revalidatePath(`/pipeline/${id}`);
  revalidatePath(`/lots/${id}`);

  if (arrival.stage === LOT_STAGE.ACTIVE) {
    redirect(`/lots/${id}`);
  }
  redirect("/pipeline");
}

export async function setPipelineStage(
  id: string,
  pipelineStatus: string,
  blWeightMt: number | null,
  cfsActualWeightMt: number | null,
  deliveryQuantityMt: number | null,
): Promise<{ error?: string }> {
  const existing = await prisma.cargoLot.findFirst({
    where: { id, ...live },
  });
  if (!existing) {
    return { error: "Pipeline order not found." };
  }

  const nextBl = blWeightMt ?? existing.blWeightMt;
  const nextCfs = cfsActualWeightMt ?? existing.cfsActualWeightMt;
  const resolvedStatus = inferredStatus(pipelineStatus, {
    documentStatus: existing.documentStatus,
    dateOfBalancePayment: existing.dateOfBalancePayment,
    balanceAmountPaid: existing.balanceAmountPaid,
    balanceAmountUsd: existing.balanceAmountUsd,
    dutyAmountInr: existing.dutyAmountInr,
    dutyPaidDate: existing.dutyPaidDate,
    beDate: existing.beDate,
    shippingLineBillAmount: existing.shippingLineBillAmount,
    shippingLineBillDate: existing.shippingLineBillDate,
    cfsActualWeightMt: nextCfs,
  });

  let arrival;
  try {
    arrival = arrivalFields(
      resolvedStatus,
      nextBl,
      nextCfs,
      existing,
    );
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not update pipeline stage.",
    };
  }

  await prisma.cargoLot.update({
    where: { id },
    data: {
      blWeightMt: blWeightMt ?? existing.blWeightMt,
      cfsActualWeightMt: cfsActualWeightMt ?? existing.cfsActualWeightMt,
      deliveryQuantityMt: deliveryQuantityMt ?? existing.deliveryQuantityMt,
      ...arrival,
    },
  });

  revalidateAll();
  revalidatePath(`/lots/${id}`);
  if (arrival.stage === LOT_STAGE.ACTIVE) {
    redirect(`/lots/${id}`);
  }
  return {};
}

export async function updateDocumentStatus(
  id: string,
  documentStatus: string,
): Promise<{ error?: string }> {
  if (!DOCUMENT_STATUSES.some((status) => status.value === documentStatus)) {
    return { error: "Document status must be Pending or Received." };
  }

  const existing = await prisma.cargoLot.findFirst({
    where: { id, ...live },
  });
  if (!existing) {
    return { error: "Pipeline order not found." };
  }

  const resolvedStatus = inferredStatus(existing.pipelineStatus, {
    documentStatus,
    dateOfBalancePayment: existing.dateOfBalancePayment,
    balanceAmountPaid: existing.balanceAmountPaid,
    balanceAmountUsd: existing.balanceAmountUsd,
    dutyAmountInr: existing.dutyAmountInr,
    dutyPaidDate: existing.dutyPaidDate,
    beDate: existing.beDate,
    shippingLineBillAmount: existing.shippingLineBillAmount,
    shippingLineBillDate: existing.shippingLineBillDate,
    cfsActualWeightMt: existing.cfsActualWeightMt,
  });

  let arrival;
  try {
    arrival = arrivalFields(
      resolvedStatus,
      existing.blWeightMt,
      existing.cfsActualWeightMt,
      existing,
    );
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not update document status.",
    };
  }

  await prisma.cargoLot.update({
    where: { id },
    data: {
      documentStatus,
      ...arrival,
    },
  });

  revalidateAll();
  revalidatePath(`/lots/${id}`);
  if (arrival.stage === LOT_STAGE.ACTIVE) {
    redirect(`/lots/${id}`);
  }
  return {};
}

export async function createLot(formData: FormData) {
  const lotNumber = text(formData, "lotNumber");
  const productName = text(formData, "productName");
  const portLocation = text(formData, "portLocation");
  const totalInitialInwardMt = number(formData, "totalInitialInwardMt");
  const blWeightMt = optionalMt(formData, "blWeightMt");
  const cfsActualWeightMt = optionalMt(formData, "cfsActualWeightMt");
  const deliveryQuantityMt = optionalMt(formData, "deliveryQuantityMt");
  const notes = text(formData, "notes") || null;

  if (!lotNumber || !productName || !portLocation || !totalInitialInwardMt) {
    throw new Error("Lot number, product, port, and inward MT are required.");
  }
  if (totalInitialInwardMt <= 0) {
    throw new Error("Total initial inward MT must be greater than zero.");
  }

  await prisma.cargoLot.create({
    data: {
      lotNumber,
      productName,
      portLocation,
      totalInitialInwardMt,
      blWeightMt,
      cfsActualWeightMt: cfsActualWeightMt ?? totalInitialInwardMt,
      deliveryQuantityMt,
      stage: LOT_STAGE.ACTIVE,
      pipelineStatus: IN_ACTIVE_SALES_STOCK,
      arrivedAtCfsAt: new Date(),
      notes,
    },
  });

  revalidateAll();
  redirect("/lots");
}

export async function updateLot(formData: FormData) {
  const id = text(formData, "id");
  const lotNumber = text(formData, "lotNumber");
  const productName = text(formData, "productName");
  const portLocation = text(formData, "portLocation");
  const totalInitialInwardMt = number(formData, "totalInitialInwardMt");
  const blWeightMt = optionalMt(formData, "blWeightMt");
  const cfsActualWeightMt = optionalMt(formData, "cfsActualWeightMt");
  const deliveryQuantityMt = optionalMt(formData, "deliveryQuantityMt");
  const notes = text(formData, "notes") || null;

  if (!id || !lotNumber || !productName || !portLocation || !totalInitialInwardMt) {
    throw new Error("All required lot fields must be filled.");
  }

  const lot = await prisma.cargoLot.findFirst({
    ...liveLotInclude(),
    where: { id, ...live },
  });
  if (!lot) throw new Error("Lot not found.");

  const stock = computeLotStock(totalInitialInwardMt, lot.bookings);
  if (stock.availableToSellMt < -0.0005) {
    throw new Error(
      "New inward quantity is lower than already committed and lifted stock.",
    );
  }

  await prisma.cargoLot.update({
    where: { id },
    data: {
      lotNumber,
      productName,
      portLocation,
      totalInitialInwardMt,
      blWeightMt,
      cfsActualWeightMt,
      deliveryQuantityMt,
      notes,
    },
  });

  revalidateAll();
  revalidatePath(`/lots/${id}`);
  redirect(`/lots/${id}`);
}

export async function createBooking(formData: FormData) {
  const lotId = text(formData, "lotId");
  const buyerName = text(formData, "buyerName");
  const agreedRateInrPerMt = number(formData, "agreedRateInrPerMt");
  const qtyBookedMt = number(formData, "qtyBookedMt");
  const vehicleNumber = text(formData, "vehicleNumber") || null;
  const actualLoadedWeightMt = number(formData, "actualLoadedWeightMt");
  const liftingStatus = text(formData, "liftingStatus") || "ORDER_CONFIRMED";
  const paymentStatus = text(formData, "paymentStatus") || "PENDING";
  const notes = text(formData, "notes") || null;

  if (!lotId || !buyerName || !agreedRateInrPerMt || !qtyBookedMt) {
    throw new Error("Lot, buyer, rate, and booked quantity are required.");
  }
  if (!LIFTING_STATUSES.some((status) => status.value === liftingStatus)) {
    throw new Error("Invalid lifting status.");
  }
  if (!PAYMENT_STATUSES.some((status) => status.value === paymentStatus)) {
    throw new Error("Invalid payment status.");
  }
  if (liftingStatus === "LIFTED" && !actualLoadedWeightMt) {
    throw new Error("Actual loaded weight is required when status is Lifted.");
  }

  const lot = await prisma.cargoLot.findFirst({
    ...liveLotInclude(),
    where: { id: lotId, ...live },
  });
  if (!lot) throw new Error("Selected lot was not found.");
  if (lot.stage !== LOT_STAGE.ACTIVE) {
    throw new Error(
      "Sales can only be booked against lots that have arrived at CFS.",
    );
  }

  const stock = computeLotStock(lot.totalInitialInwardMt, lot.bookings);
  const reserveQty =
    liftingStatus === "LIFTED"
      ? actualLoadedWeightMt ?? qtyBookedMt
      : qtyBookedMt;
  assertCanReserve(stock.availableToSellMt, reserveQty);

  await prisma.salesBooking.create({
    data: {
      lotId,
      buyerName,
      agreedRateInrPerMt,
      qtyBookedMt,
      vehicleNumber,
      actualLoadedWeightMt,
      liftingStatus,
      paymentStatus,
      notes,
    },
  });

  revalidateAll();
  revalidatePath(`/lots/${lotId}`);
  redirect("/bookings");
}

export async function updateBooking(formData: FormData) {
  const id = text(formData, "id");
  const lotId = text(formData, "lotId");
  const buyerName = text(formData, "buyerName");
  const agreedRateInrPerMt = number(formData, "agreedRateInrPerMt");
  const qtyBookedMt = number(formData, "qtyBookedMt");
  const vehicleNumber = text(formData, "vehicleNumber") || null;
  const actualLoadedWeightMt = number(formData, "actualLoadedWeightMt");
  const liftingStatus = text(formData, "liftingStatus") || "ORDER_CONFIRMED";
  const paymentStatus = text(formData, "paymentStatus") || "PENDING";
  const notes = text(formData, "notes") || null;

  if (!id || !lotId || !buyerName || !agreedRateInrPerMt || !qtyBookedMt) {
    throw new Error("Required booking fields are missing.");
  }
  if (liftingStatus === "LIFTED" && !actualLoadedWeightMt) {
    throw new Error("Actual loaded weight is required when status is Lifted.");
  }

  const booking = await prisma.salesBooking.findFirst({
    where: { id, ...live },
  });
  if (!booking) throw new Error("Sale booking not found.");

  const lot = await prisma.cargoLot.findFirst({
    ...liveLotInclude(),
    where: { id: lotId, ...live },
  });
  if (!lot) throw new Error("Selected lot was not found.");
  if (lot.stage !== LOT_STAGE.ACTIVE) {
    throw new Error(
      "Sales can only be booked against lots that have arrived at CFS.",
    );
  }

  const stock = computeLotStockExcluding(lot, id);
  const reserveQty =
    liftingStatus === "LIFTED"
      ? actualLoadedWeightMt ?? qtyBookedMt
      : qtyBookedMt;
  assertCanReserve(stock.availableToSellMt, reserveQty);

  await prisma.salesBooking.update({
    where: { id },
    data: {
      lotId,
      buyerName,
      agreedRateInrPerMt,
      qtyBookedMt,
      vehicleNumber,
      actualLoadedWeightMt,
      liftingStatus,
      paymentStatus,
      notes,
    },
  });

  revalidateAll();
  revalidatePath(`/bookings/${id}`);
  revalidatePath(`/lots/${lotId}`);
  redirect(`/bookings/${id}`);
}

function markDeleted() {
  return { isDeleted: true, deletedAt: new Date() };
}

function markRestored() {
  return { isDeleted: false, deletedAt: null as Date | null };
}

export async function deleteLot(id: string) {
  const lot = await prisma.cargoLot.findFirst({
    where: { id, isDeleted: false },
  });
  if (!lot) {
    throw new Error("Import lot not found.");
  }

  await prisma.cargoLot.update({
    where: { id },
    data: markDeleted(),
  });

  revalidateAll();
  revalidatePath("/recycle");
}

export async function deleteBooking(id: string) {
  const booking = await prisma.salesBooking.findFirst({
    where: { id, isDeleted: false },
  });
  if (!booking) {
    throw new Error("Sale booking not found.");
  }

  await prisma.salesBooking.update({
    where: { id },
    data: markDeleted(),
  });

  revalidateAll();
  revalidatePath(`/lots/${booking.lotId}`);
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/recycle");
}

export async function restoreLot(id: string) {
  const lot = await prisma.cargoLot.findFirst({
    where: { id, isDeleted: true },
  });
  if (!lot) {
    throw new Error("Deleted import lot not found.");
  }

  await prisma.cargoLot.update({
    where: { id },
    data: markRestored(),
  });

  revalidateAll();
  revalidatePath("/recycle");
}

export async function restoreBooking(id: string) {
  const booking = await prisma.salesBooking.findFirst({
    where: { id, isDeleted: true },
    include: { lot: true },
  });
  if (!booking) {
    throw new Error("Deleted sale booking not found.");
  }
  if (booking.lot.isDeleted) {
    throw new Error(
      "Restore the import lot first before restoring this sale booking.",
    );
  }

  await prisma.salesBooking.update({
    where: { id },
    data: markRestored(),
  });

  revalidateAll();
  revalidatePath(`/lots/${booking.lotId}`);
  revalidatePath("/recycle");
}

export async function permanentlyDeleteLot(id: string) {
  const lot = await prisma.cargoLot.findFirst({
    where: { id, isDeleted: true },
  });
  if (!lot) {
    throw new Error("Deleted import lot not found.");
  }

  await prisma.$transaction([
    prisma.salesBooking.deleteMany({ where: { lotId: id } }),
    prisma.cargoLot.delete({ where: { id } }),
  ]);

  revalidateAll();
  revalidatePath("/recycle");
}

export async function permanentlyDeleteBooking(id: string) {
  const booking = await prisma.salesBooking.findFirst({
    where: { id, isDeleted: true },
  });
  if (!booking) {
    throw new Error("Deleted sale booking not found.");
  }

  const lotId = booking.lotId;
  await prisma.salesBooking.delete({ where: { id } });

  revalidateAll();
  revalidatePath(`/lots/${lotId}`);
  revalidatePath("/recycle");
}
