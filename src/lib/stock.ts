import type { CargoLot, SalesBooking } from "@prisma/client";
import { COMMITTED_STATUSES, type LiftingStatus } from "./constants";

export type LotWithBookings = CargoLot & { bookings: SalesBooking[] };

export type LotStock = {
  initialMt: number;
  committedMt: number;
  liftedMt: number;
  availableToSellMt: number;
};

function liftedQty(booking: SalesBooking) {
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
