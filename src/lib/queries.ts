import { IN_ACTIVE_SALES_STOCK, LOT_STAGE } from "./constants";
import { prisma } from "./prisma";
import { computeLotStock } from "./stock";

const live = { isDeleted: false };

export async function getLotsWithStock() {
  const lots = await prisma.cargoLot.findMany({
    where: { stage: LOT_STAGE.ACTIVE, ...live },
    include: { bookings: { where: live } },
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
      ...live,
      NOT: { pipelineStatus: IN_ACTIVE_SALES_STOCK },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLotWithStock(id: string) {
  const lot = await prisma.cargoLot.findFirst({
    where: { id, ...live },
    include: { bookings: { where: live, orderBy: { createdAt: "desc" } } },
  });
  if (!lot) return null;
  return {
    ...lot,
    stock: computeLotStock(lot.totalInitialInwardMt, lot.bookings),
  };
}

export async function getBookings() {
  return prisma.salesBooking.findMany({
    where: { ...live, lot: live },
    include: { lot: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBooking(id: string) {
  return prisma.salesBooking.findFirst({
    where: { id, ...live, lot: live },
    include: { lot: { include: { bookings: { where: live } } } },
  });
}

export async function getDeletedLots() {
  return prisma.cargoLot.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: "desc" },
  });
}

export async function getDeletedBookings() {
  return prisma.salesBooking.findMany({
    where: { isDeleted: true },
    include: { lot: true },
    orderBy: { deletedAt: "desc" },
  });
}
