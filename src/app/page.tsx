import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LiftingBadge, PaymentBadge } from "@/components/StatusBadge";
import { formatInr, formatMt, invoiceAmount } from "@/lib/format";
import { getBookings, getLotsWithStock, getPipelineOrders } from "@/lib/queries";
import { ShortagePair } from "@/components/WeightShortageAlert";
import {
  computeDeliveryShortage,
  computeWeightShortage,
  hasAnyShortage,
} from "@/lib/weights";

export default async function DashboardPage() {
  const [lots, bookings, pipeline] = await Promise.all([
    getLotsWithStock(),
    getBookings(),
    getPipelineOrders(),
  ]);
  const shortageLots = [...pipeline, ...lots].filter((lot) =>
    hasAnyShortage(lot.blWeightMt, lot.cfsActualWeightMt, lot.deliveryQuantityMt),
  );

  const initial = lots.reduce((sum, lot) => sum + lot.stock.initialMt, 0);
  const committed = lots.reduce((sum, lot) => sum + lot.stock.committedMt, 0);
  const lifted = lots.reduce((sum, lot) => sum + lot.stock.liftedMt, 0);
  const available = lots.reduce((sum, lot) => sum + lot.stock.availableToSellMt, 0);
  const invoiceBook = bookings.reduce(
    (sum, booking) =>
      sum +
      invoiceAmount(
        booking.agreedRateInrPerMt,
        booking.qtyBookedMt,
        booking.actualLoadedWeightMt,
      ),
    0,
  );

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="Cargo position"
        description="Available-to-sell updates when a sale is confirmed."
        actionHref="/bookings/new"
        actionLabel="New booking"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available" value={formatMt(available, 1)} hint={`${lots.length} active lots`} />
        <StatCard label="Committed" value={formatMt(committed, 1)} hint={`${formatMt(initial, 1)} inward`} />
        <StatCard label="Pipeline" value={`${pipeline.length}`} hint={`${shortageLots.length} shortages`} />
        <StatCard label="Invoice book" value={formatInr(invoiceBook)} hint={`${formatMt(lifted, 1)} lifted`} />
      </div>

      {pipeline.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Pipeline</h2>
            <Link href="/pipeline" className="text-sm font-semibold text-copper-600">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {pipeline.map((order) => {
              const cfsCheck = computeWeightShortage(
                order.blWeightMt,
                order.cfsActualWeightMt,
              );
              const deliveryCheck = computeDeliveryShortage(
                order.blWeightMt,
                order.deliveryQuantityMt,
              );
              return (
                <Link
                  key={order.id}
                  href="/pipeline"
                  className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{order.lotNumber}</p>
                      <p className="text-sm text-ink-700/65">
                        {order.supplierName || "Supplier pending"} · {order.productName}
                      </p>
                    </div>
                    <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} compact />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Active stock</h2>
          <Link href="/lots" className="text-sm font-semibold text-copper-600">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          <div className="hidden grid-cols-12 bg-paper-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/40 md:grid">
            <span className="col-span-3">File / product</span>
            <span className="col-span-2">Supplier</span>
            <span className="col-span-2 text-right">Inward</span>
            <span className="col-span-2 text-right">Committed</span>
            <span className="col-span-1 text-right">Lifted</span>
            <span className="col-span-2 text-right">Available</span>
          </div>
          {lots.length === 0 ? (
            <p className="px-4 py-8 text-sm text-ink-700/60">No lots yet. Create an import cargo lot to start.</p>
          ) : (
            lots.map((lot) => (
              <Link
                key={lot.id}
                href={`/lots/${lot.id}`}
                className="grid gap-1 border-t border-ink-100 px-4 py-4 hover:bg-paper-50 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-3">
                  <p className="font-semibold">{lot.lotNumber}</p>
                  <p className="text-sm text-ink-700/65">{lot.productName}</p>
                </div>
                <p className="text-sm md:col-span-2">{lot.supplierName || "—"}</p>
                <p className="tabular text-sm md:col-span-2 md:text-right">
                  {formatMt(lot.stock.initialMt)}
                </p>
                <p className="tabular text-sm md:col-span-2 md:text-right">
                  {formatMt(lot.stock.committedMt)}
                </p>
                <p className="tabular text-sm md:col-span-1 md:text-right">
                  {formatMt(lot.stock.liftedMt)}
                </p>
                <p className="tabular text-sm font-semibold text-copper-600 md:col-span-2 md:text-right">
                  {formatMt(lot.stock.availableToSellMt)}
                </p>
                {hasAnyShortage(
                  lot.blWeightMt,
                  lot.cfsActualWeightMt,
                  lot.deliveryQuantityMt,
                ) ? (
                  <div className="md:col-span-12">
                    <ShortagePair
                      cfs={computeWeightShortage(
                        lot.blWeightMt,
                        lot.cfsActualWeightMt,
                      )}
                      delivery={computeDeliveryShortage(
                        lot.blWeightMt,
                        lot.deliveryQuantityMt,
                      )}
                      compact
                    />
                  </div>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent bookings</h2>
          <Link href="/bookings" className="text-sm font-semibold text-copper-600">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {bookings.slice(0, 6).map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{booking.buyerName}</p>
                  <p className="text-sm text-ink-700/65">
                    {booking.lot.lotNumber} · {booking.lot.productName}
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
              </div>
            </Link>
          ))}
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-700/60">No sales bookings yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
