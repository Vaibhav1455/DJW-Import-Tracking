import type { CargoLot, SalesBooking } from "@prisma/client";
import { COMMITTED_STATUSES, type LiftingStatus } from "./constants";

export type LotWithBookings = CargoLot & { bookings: SalesBooking[] };

export type LotStock = {
  initialMt: number;
  committedMt: number;
  liftedMt: number;
  availableToSellMt: number;
};

function liftedQty(
  booking: Pick<SalesBooking, "qtyBookedMt" | "actualLoadedWeightMt">,
) {
  if (booking.actualLoadedWeightMt && booking.actualLoadedWeightMt > 0) {
    return booking.actualLoadedWeightMt;
  }
  return booking.qtyBookedMt;
}

export function computeLotStock(
  initialMt: number,
  bookings: Pick<
    SalesBooking,
    "qtyBookedMt" | "actualLoadedWeightMt" | "liftingStatus"
  >[],
  excludeBookingId?: string,
): LotStock {
  const relevant = bookings.filter((booking) =>
    excludeBookingId ? !("id" in booking && (booking as SalesBooking).id === excludeBookingId) : true,
  );

  const committedMt = relevant
    .filter((booking) =>
      COMMITTED_STATUSES.includes(booking.liftingStatus as LiftingStatus),
    )
    .reduce((sum, booking) => sum + booking.qtyBookedMt, 0);

  const liftedMt = relevant
    .filter((booking) => booking.liftingStatus === "LIFTED")
    .reduce((sum, booking) => sum + liftedQty(booking), 0);

  return {
    initialMt,
    committedMt,
    liftedMt,
    availableToSellMt: initialMt - committedMt - liftedMt,
  };
}

export function computeLotStockExcluding(
  lot: LotWithBookings,
  excludeBookingId?: string,
) {
  const bookings = excludeBookingId
    ? lot.bookings.filter((booking) => booking.id !== excludeBookingId)
    : lot.bookings;
  return computeLotStock(lot.totalInitialInwardMt, bookings);
}

export type CommodityStock = {
  productName: string;
  availableToSellMt: number;
  committedMt: number;
  initialMt: number;
};

export type PortStockGroup = {
  portLocation: string;
  availableToSellMt: number;
  committedMt: number;
  initialMt: number;
  commodities: CommodityStock[];
};

export function groupStockByPort(
  lots: {
    portLocation: string;
    productName: string;
    stock: LotStock;
  }[],
): PortStockGroup[] {
  const ports = new Map<string, PortStockGroup>();

  for (const lot of lots) {
    const portLocation = lot.portLocation.trim() || "Unspecified";
    const portKey = portLocation.toLowerCase();
    const existing = ports.get(portKey) ?? {
      portLocation,
      availableToSellMt: 0,
      committedMt: 0,
      initialMt: 0,
      commodities: [],
    };

    existing.availableToSellMt += lot.stock.availableToSellMt;
    existing.committedMt += lot.stock.committedMt;
    existing.initialMt += lot.stock.initialMt;

    const productName = lot.productName.trim() || "Unspecified";
    const commodity = existing.commodities.find(
      (item) => item.productName.toLowerCase() === productName.toLowerCase(),
    );
    if (commodity) {
      commodity.availableToSellMt += lot.stock.availableToSellMt;
      commodity.committedMt += lot.stock.committedMt;
      commodity.initialMt += lot.stock.initialMt;
    } else {
      existing.commodities.push({
        productName,
        availableToSellMt: lot.stock.availableToSellMt,
        committedMt: lot.stock.committedMt,
        initialMt: lot.stock.initialMt,
      });
    }

    ports.set(portKey, existing);
  }

  return [...ports.values()]
    .filter((port) => port.availableToSellMt > 0.0005)
    .map((port) => ({
      ...port,
      commodities: port.commodities
        .slice()
        .sort((a, b) => b.availableToSellMt - a.availableToSellMt),
    }))
    .sort((a, b) => b.availableToSellMt - a.availableToSellMt);
}

export function assertCanReserve(availableToSellMt: number, qtyBookedMt: number) {
  if (qtyBookedMt <= 0) {
    throw new Error("Booked quantity must be greater than zero.");
  }
  const roundedAvailable = Math.round(availableToSellMt * 1000) / 1000;
  const roundedQty = Math.round(qtyBookedMt * 1000) / 1000;
  if (roundedQty > roundedAvailable + 0.0005) {
    throw new Error(
      `Insufficient available stock. Available-to-sell is ${roundedAvailable.toFixed(3)} MT.`,
    );
  }
}
