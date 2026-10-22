import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatInr, formatMt, invoiceAmount } from "@/lib/format";
import { computeLotStockExcluding } from "@/lib/stock";
import { getBooking, getLotsWithStock } from "@/lib/queries";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, lots] = await Promise.all([getBooking(id), getLotsWithStock()]);
  if (!booking) notFound();

  const invoice = invoiceAmount(
    booking.agreedRateInrPerMt,
    booking.qtyBookedMt,
    booking.actualLoadedWeightMt,
  );

  const lotsForForm = lots.map((lot) => {
    if (lot.id !== booking.lotId) {
      return { ...lot, availableToSellMt: lot.stock.availableToSellMt };
    }
    const stockWithoutThis = computeLotStockExcluding(lot, booking.id);
    return { ...lot, availableToSellMt: stockWithoutThis.availableToSellMt };
  });

  return (
    <div>
      <PageHeader
        kicker={booking.lot.lotNumber}
        title={booking.buyerName}
        description={`${booking.lot.productName} at ${booking.lot.portLocation}. Invoice uses actual loaded weight once entered.`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Qty booked" value={formatMt(booking.qtyBookedMt)} />
        <StatCard
          label="Actual loaded"
          value={
            booking.actualLoadedWeightMt
              ? formatMt(booking.actualLoadedWeightMt)
              : "Pending"
          }
        />
        <StatCard label="Final invoice amount" value={formatInr(invoice)} />
      </div>

      <BookingForm lots={lotsForForm} booking={booking} />
    </div>
  );
}
