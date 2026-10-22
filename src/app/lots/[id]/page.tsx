import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { LotForm } from "@/components/LotForm";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LiftingBadge, PaymentBadge, PipelineBadge } from "@/components/StatusBadge";
import { ShortagePair } from "@/components/WeightShortageAlert";
import { deleteBooking, deleteLot } from "@/lib/actions";
import { LOT_STAGE } from "@/lib/constants";
import { formatInr, formatMt, invoiceAmount } from "@/lib/format";
import { getLotWithStock } from "@/lib/queries";
import { computeDeliveryShortage, computeWeightShortage } from "@/lib/weights";

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = await getLotWithStock(id);
  if (!lot) notFound();
  if (lot.stage === LOT_STAGE.PIPELINE) {
    redirect(`/pipeline/${id}`);
  }

  const cfsCheck = computeWeightShortage(
    lot.blWeightMt,
    lot.cfsActualWeightMt,
  );
  const deliveryCheck = computeDeliveryShortage(
    lot.blWeightMt,
    lot.deliveryQuantityMt,
  );

  return (
    <div>
      <PageHeader
        kicker={lot.portLocation}
        title={lot.lotNumber}
        description={`${lot.productName}. Available-to-sell = ${lot.stock.initialMt.toFixed(3)} − ${lot.stock.committedMt.toFixed(3)} committed − ${lot.stock.liftedMt.toFixed(3)} lifted.`}
        actionHref="/bookings/new"
        actionLabel="Book sale"
      />
      <div className="mb-6 flex items-center gap-3">
        <PipelineBadge status={lot.pipelineStatus} />
        <ConfirmDeleteButton
          label={`Delete lot ${lot.lotNumber}`}
          message="Are you sure you want to permanently delete this import lot? This action cannot be undone."
          action={deleteLot.bind(null, lot.id)}
          redirectTo="/lots"
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total initial inward" value={formatMt(lot.stock.initialMt)} />
        <StatCard label="Total committed" value={formatMt(lot.stock.committedMt)} />
        <StatCard label="Total lifted" value={formatMt(lot.stock.liftedMt)} />
        <StatCard label="Available to sell" value={formatMt(lot.stock.availableToSellMt)} />
      </div>

      <section className="mb-10 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="mb-3 font-display text-xl">Weight verification</h2>
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700/50">
              Quantity as per BL
            </p>
            <p className="mt-1 tabular font-semibold">
              {lot.blWeightMt != null ? formatMt(lot.blWeightMt) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700/50">
              CFS Quantity Received
            </p>
            <p className="mt-1 tabular font-semibold">
              {lot.cfsActualWeightMt != null
                ? formatMt(lot.cfsActualWeightMt)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700/50">
              Delivery Quantity Received
            </p>
            <p className="mt-1 tabular font-semibold">
              {lot.deliveryQuantityMt != null
                ? formatMt(lot.deliveryQuantityMt)
                : "—"}
            </p>
          </div>
        </div>
        <p className="mb-3 text-sm text-ink-700/65">
          Live sales stock uses CFS Quantity Received from stage 6.
        </p>
        <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl">Linked bookings</h2>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {lot.bookings.length === 0 ? (
            <p className="p-6 text-sm text-ink-700/60">No sales booked against this lot yet.</p>
          ) : (
            lot.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-stretch border-t border-ink-100 first:border-t-0"
              >
                <Link
                  href={`/bookings/${booking.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{booking.buyerName}</p>
                    <p className="text-sm text-ink-700/65">
                      {formatMt(booking.qtyBookedMt)} booked
                      {booking.vehicleNumber ? ` · ${booking.vehicleNumber}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <LiftingBadge status={booking.liftingStatus} />
                    <PaymentBadge status={booking.paymentStatus} />
                    <span className="tabular text-sm font-semibold">
                      {formatInr(
                        invoiceAmount(
                          booking.agreedRateInrPerMt,
                          booking.qtyBookedMt,
                          booking.actualLoadedWeightMt,
                        ),
                      )}
                    </span>
                  </div>
                </Link>
                <div className="flex items-center pr-3">
                  <ConfirmDeleteButton
                    label={`Delete booking for ${booking.buyerName}`}
                    message="Are you sure you want to delete this sale booking? This will restore the allocated stock back to Available-to-Sell."
                    action={deleteBooking.bind(null, booking.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <h2 className="mb-4 font-display text-2xl">Edit lot</h2>
      <LotForm lot={lot} />
    </div>
  );
}
