import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { RestoreButton } from "@/components/RestoreButton";
import {
  permanentlyDeleteBooking,
  permanentlyDeleteLot,
  restoreBooking,
  restoreLot,
} from "@/lib/actions";
import { formatDateTime, formatMt } from "@/lib/format";
import { getDeletedBookings, getDeletedLots } from "@/lib/queries";

export default async function RecycleBinPage() {
  const [lots, bookings] = await Promise.all([
    getDeletedLots(),
    getDeletedBookings(),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Recovery"
        title="Recycle Bin"
        description="Soft-deleted import lots and sale bookings stay here until you restore them or permanently delete them."
      />

      <section>
        <h2 className="mb-3 font-display text-xl">Import lots</h2>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="flex flex-col gap-3 border-t border-ink-100 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{lot.lotNumber}</p>
                <p className="text-sm text-ink-700/65">
                  {lot.productName}
                  {lot.supplierName ? ` · ${lot.supplierName}` : ""}
                </p>
                <p className="mt-1 text-xs text-ink-700/50">
                  Deleted {formatDateTime(lot.deletedAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RestoreButton action={restoreLot.bind(null, lot.id)} />
                <ConfirmDeleteButton
                  variant="text"
                  label="Permanently Delete"
                  message="Permanently delete this import lot? This cannot be undone."
                  confirmMessage="This is the last confirmation. The lot and all of its sale bookings will be removed from the database forever."
                  confirmLabel="Yes, Delete Permanently"
                  pendingLabel="Deleting…"
                  requireDoubleConfirm
                  action={permanentlyDeleteLot.bind(null, lot.id)}
                />
              </div>
            </div>
          ))}
          {lots.length === 0 ? (
            <p className="p-8 text-sm text-ink-700/60">
              No deleted import lots.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl">Sale bookings</h2>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-3 border-t border-ink-100 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{booking.buyerName}</p>
                <p className="text-sm text-ink-700/65">
                  {booking.lot.lotNumber} · {booking.lot.productName} ·{" "}
                  {formatMt(booking.qtyBookedMt)}
                </p>
                <p className="mt-1 text-xs text-ink-700/50">
                  Deleted {formatDateTime(booking.deletedAt)}
                  {booking.lot.isDeleted
                    ? " · Restore the import lot first"
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RestoreButton action={restoreBooking.bind(null, booking.id)} />
                <ConfirmDeleteButton
                  variant="text"
                  label="Permanently Delete"
                  message="Permanently delete this sale booking? This cannot be undone."
                  confirmMessage="This is the last confirmation. The booking will be removed from the database forever."
                  confirmLabel="Yes, Delete Permanently"
                  pendingLabel="Deleting…"
                  requireDoubleConfirm
                  action={permanentlyDeleteBooking.bind(null, booking.id)}
                />
              </div>
            </div>
          ))}
          {bookings.length === 0 ? (
            <p className="p-8 text-sm text-ink-700/60">
              No deleted sale bookings.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
