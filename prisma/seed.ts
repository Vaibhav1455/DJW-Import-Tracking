import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.salesBooking.deleteMany();
  await prisma.cargoLot.deleteMany();

  const caustic = await prisma.cargoLot.create({
    data: {
      lotNumber: "DJW-MUN-24018",
      productName: "Caustic Soda Flakes",
      portLocation: "Mundra",
      totalInitialInwardMt: 496.4,
      stage: "ACTIVE",
      pipelineStatus: "IN_ACTIVE_SALES_STOCK",
      blWeightMt: 500,
      cfsActualWeightMt: 496.4,
      arrivedAtCfsAt: new Date("2026-10-12"),
      supplierName: "Gulf Chlor-Alkali LLC",
      quantityMt: 500,
      vesselName: "MV Desert Pearl",
      beNumber: "BE/2026/1180",
      dutyAmountInr: 2145000,
      bookingNo: "BK-24018",
      piNo: "PI-2026-018",
      rateAed: 1850,
      rateUsd: 504,
      freightTerms: "CFR",
      documentStatus: "RECEIVED",
      shippingLine: "MSC",
      shipmentBillDoNumber: "DO-1180",
      deliveryQuantityMt: 496.4,
      notes: "CFS stuffing in progress. Moisture spec 0.5% max.",
    },
  });

  const meg = await prisma.cargoLot.create({
    data: {
      lotNumber: "DJW-NSA-24022",
      productName: "Mono Ethylene Glycol",
      portLocation: "Nhava Sheva",
      totalInitialInwardMt: 320,
      stage: "ACTIVE",
      pipelineStatus: "IN_ACTIVE_SALES_STOCK",
      blWeightMt: 320,
      cfsActualWeightMt: 320,
      arrivedAtCfsAt: new Date("2026-10-08"),
      supplierName: "Sabic Asia Pacific",
      quantityMt: 320,
      vesselName: "MV Ocean Trader",
      beNumber: "BE/2026/9021",
      dutyAmountInr: 1680000,
      bookingNo: "BK-24022",
      piNo: "PI-2026-022",
      rateAed: 2240,
      rateUsd: 610,
      freightTerms: "CIF",
      documentStatus: "RECEIVED",
      shippingLine: "Maersk",
      shipmentBillDoNumber: "DO-9021",
      deliveryQuantityMt: 320,
      notes: "ISO tank discharge completed 12 Oct.",
    },
  });

  await prisma.cargoLot.create({
    data: {
      lotNumber: "DJW-KAN-24031",
      productName: "Linear Alkyl Benzene",
      portLocation: "Kandla",
      totalInitialInwardMt: 178.25,
      stage: "ACTIVE",
      pipelineStatus: "IN_ACTIVE_SALES_STOCK",
      blWeightMt: 180,
      cfsActualWeightMt: 178.25,
      arrivedAtCfsAt: new Date("2026-10-15"),
      supplierName: "Farabi Petrochemicals",
      quantityMt: 180,
      vesselName: "MV Kandla Pride",
      beNumber: "BE/2026/3318",
      dutyAmountInr: 940000,
      bookingNo: "BK-24031",
      piNo: "PI-2026-031",
      rateAed: 1980,
      rateUsd: 539,
      freightTerms: "FOB",
      documentStatus: "RECEIVED",
      shippingLine: "CMA CGM",
      shipmentBillDoNumber: "DO-3318",
      deliveryQuantityMt: 177.9,
      notes: "Fresh parcel, not yet offered to market.",
    },
  });

  await prisma.cargoLot.create({
    data: {
      lotNumber: "DJW-MUN-24040",
      productName: "Sodium Hypochlorite",
      portLocation: "Mundra",
      totalInitialInwardMt: 0,
      stage: "PIPELINE",
      pipelineStatus: "SHIPPING_LINE_BILL_PAID",
      blWeightMt: 240,
      supplierName: "Abu Dhabi Chemicals",
      quantityMt: 240,
      vesselName: "MV Pacific Star",
      beNumber: "BE/2026/4412",
      dutyAmountInr: 1250000,
      bookingNo: "BK-24040",
      piNo: "PI-2026-040",
      rateAed: 920,
      rateUsd: 250,
      freightTerms: "CFR",
      documentStatus: "PENDING",
      shippingLine: "Hapag-Lloyd",
      shipmentBillDoNumber: "DO-4412",
      notes: "ETA Mundra 22 Oct.",
    },
  });

  await prisma.cargoLot.create({
    data: {
      lotNumber: "DJW-NSA-24041",
      productName: "Glacial Acetic Acid",
      portLocation: "Nhava Sheva",
      totalInitialInwardMt: 0,
      stage: "PIPELINE",
      pipelineStatus: "DUTY_PAID",
      blWeightMt: 110.5,
      cfsActualWeightMt: 107.8,
      supplierName: "Celanese Singapore",
      quantityMt: 110.5,
      vesselName: "MV Harbour Light",
      beNumber: "BE/2026/7744",
      dutyAmountInr: 612000,
      bookingNo: "BK-24041",
      piNo: "PI-2026-041",
      rateAed: 2100,
      rateUsd: 572,
      freightTerms: "CFR",
      documentStatus: "RECEIVED",
      shippingLine: "ONE",
      shipmentBillDoNumber: "DO-7744",
      deliveryQuantityMt: 107.4,
      notes: "CFS weighment in; waiting to mark arrived.",
    },
  });

  await prisma.salesBooking.createMany({
    data: [
      {
        lotId: caustic.id,
        buyerName: "Aarav Speciality Chemicals",
        agreedRateInrPerMt: 48500,
        qtyBookedMt: 80,
        vehicleNumber: "GJ12 AB 4412",
        actualLoadedWeightMt: 79.64,
        liftingStatus: "LIFTED",
        paymentStatus: "PAID",
      },
      {
        lotId: caustic.id,
        buyerName: "West Coast Polymers Pvt Ltd",
        agreedRateInrPerMt: 49200,
        qtyBookedMt: 120,
        vehicleNumber: "MH04 CD 8821",
        liftingStatus: "LOADED_AT_CFS",
        paymentStatus: "PARTIAL",
      },
      {
        lotId: caustic.id,
        buyerName: "Kaveri Industries",
        agreedRateInrPerMt: 49000,
        qtyBookedMt: 50,
        liftingStatus: "ORDER_CONFIRMED",
        paymentStatus: "PENDING",
      },
      {
        lotId: meg.id,
        buyerName: "Summit Resins",
        agreedRateInrPerMt: 61200,
        qtyBookedMt: 40,
        vehicleNumber: "TN07 EF 2190",
        actualLoadedWeightMt: 40.12,
        liftingStatus: "LIFTED",
        paymentStatus: "PAID",
      },
      {
        lotId: meg.id,
        buyerName: "Narmada Coatings",
        agreedRateInrPerMt: 60850,
        qtyBookedMt: 60,
        liftingStatus: "ORDER_CONFIRMED",
        paymentStatus: "PENDING",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
