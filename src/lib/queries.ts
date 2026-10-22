import { IN_ACTIVE_SALES_STOCK, LOT_STAGE } from "./constants";
import { prisma } from "./prisma";
import { computeLotStock } from "./stock";

export async function getLotsWithStock() {
  const lots = await prisma.cargoLot.findMany({
    where: { stage: LOT_STAGE.ACTIVE },
    include: { bookings: true },
    orderBy: { createdAt: "desc" },
  });

  return lots.map((lot) => ({
    ...lot,
    stock: computeLotStock(lot.totalInitialInwardMt, lot.bookings),
  }));
}

export async function getPipelineOrders() {
  return prisma.cargoLot.findMany({
    where: {
      stage: LOT_STAGE.PIPELINE,
      NOT: { pipelineStatus: IN_ACTIVE_SALES_STOCK },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLotWithStock(id: string) {
  const lot = await prisma.cargoLot.findUnique({
    where: { id },
    include: { bookings: { orderBy: { createdAt: "desc" } } },
  });
  if (!lot) return null;
  return {
    ...lot,
    stock: computeLotStock(lot.totalInitialInwardMt, lot.bookings),
  };
}

export async function getBookings() {
  return prisma.salesBooking.findMany({
    include: { lot: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBooking(id: string) {
  return prisma.salesBooking.findUnique({
    where: { id },
    include: { lot: { include: { bookings: true } } },
  });
}
