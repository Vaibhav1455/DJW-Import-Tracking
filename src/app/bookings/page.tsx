import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { LiftingBadge, PaymentBadge } from "@/components/StatusBadge";
import { formatInr, formatMt, invoiceAmount } from "@/lib/format";
import { getBookings } from "@/lib/queries";

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <PageHeader
        kicker="Sales"
        title="Bookings & dispatches"
        description="Confirmed orders reserve lot stock. Dispatch updates move committed quantity into lifted."
        actionHref="/bookings/new"
        actionLabel="New booking"
      />

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="hidden grid-cols-12 bg-paper-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-700/55 lg:grid">
          <span className="col-span-3">Buyer / lot</span>
          <span className="col-span-2">Vehicle</span>
          <span className="col-span-2 text-right">Qty / loaded</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-3 text-right">Invoice</span>
        </div>
        {bookings.map((booking) => {
          const invoice = invoiceAmount(
            booking.agreedRateInrPerMt,
            booking.qtyBookedMt,
            booking.actualLoadedWeightMt,
          );
          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="grid gap-2 border-t border-ink-100 px-4 py-4 hover:bg-paper-50 lg:grid-cols-12 lg:items-center"
            >
              <div className="lg:col-span-3">
                <p className="font-semibold">{booking.buyerName}</p>
                <p className="text-sm text-ink-700/65">
                  {booking.lot.lotNumber} · {booking.lot.productName}
                </p>
              </div>
              <p className="text-sm lg:col-span-2">
                {booking.vehicleNumber || "Vehicle pending"}
              </p>
              <p className="tabular text-sm lg:col-span-2 lg:text-right">
                {formatMt(booking.qtyBookedMt)}
                {booking.actualLoadedWeightMt
                  ? ` / ${formatMt(booking.actualLoadedWeightMt)}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2 lg:col-span-2">
                <LiftingBadge status={booking.liftingStatus} />
                <PaymentBadge status={booking.paymentStatus} />
              </div>
              <div className="lg:col-span-3 lg:text-right">
                <p className="tabular font-semibold">{formatInr(invoice)}</p>
                <p className="text-xs text-ink-700/55">
                  {formatInr(booking.agreedRateInrPerMt)} / MT
                </p>
              </div>
            </Link>
          );
        })}
        {bookings.length === 0 ? (
          <p className="p-8 text-sm text-ink-700/60">
            No bookings yet. Confirm a sale to reserve stock on a cargo lot.
          </p>
        ) : null}
      </div>
    </div>
  );
}
