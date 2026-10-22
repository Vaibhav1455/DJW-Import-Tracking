"use client";

import { createBooking, updateBooking } from "@/lib/actions";
import { LIFTING_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { formatInr, formatMt, invoiceAmount } from "@/lib/format";
import type { CargoLot, SalesBooking } from "@prisma/client";
import { useMemo, useState } from "react";

type LotOption = CargoLot & {
  availableToSellMt: number;
};

export function BookingForm({
  lots,
  booking,
}: {
  lots: LotOption[];
  booking?: SalesBooking;
}) {
  const [lotId, setLotId] = useState(booking?.lotId ?? lots[0]?.id ?? "");
  const [qty, setQty] = useState(booking?.qtyBookedMt?.toString() ?? "");
  const [rate, setRate] = useState(booking?.agreedRateInrPerMt?.toString() ?? "");
  const [loaded, setLoaded] = useState(
    booking?.actualLoadedWeightMt?.toString() ?? "",
  );
  const [status, setStatus] = useState(
    booking?.liftingStatus ?? "ORDER_CONFIRMED",
  );

  const selected = lots.find((lot) => lot.id === lotId);
  const qtyNumber = Number(qty) || 0;
  const rateNumber = Number(rate) || 0;
  const loadedNumber = Number(loaded) || 0;
  const invoice = invoiceAmount(rateNumber, qtyNumber, loadedNumber || null);

  const remaining = useMemo(() => {
    if (!selected) return 0;
    return selected.availableToSellMt;
  }, [selected]);

  return (
    <form
      action={booking ? updateBooking : createBooking}
      className="grid gap-5 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8"
    >
      {booking ? <input type="hidden" name="id" value={booking.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="lotId">Import cargo lot</label>
          <select
            id="lotId"
            name="lotId"
            required
            value={lotId}
            onChange={(event) => setLotId(event.target.value)}
          >
            {lots.length === 0 ? (
              <option value="">No lots available</option>
            ) : null}
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.lotNumber} · {lot.productName} · {formatMt(lot.availableToSellMt)} free
              </option>
            ))}
          </select>
          {selected ? (
            <p className="mt-2 text-sm text-ink-700/65">
              {selected.portLocation}. Available-to-sell on this lot:{" "}
              <span className="font-semibold tabular text-copper-600">
                {formatMt(remaining)}
              </span>
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="buyerName">Buyer name</label>
          <input
            id="buyerName"
            name="buyerName"
            required
            defaultValue={booking?.buyerName}
            placeholder="West Coast Polymers Pvt Ltd"
          />
        </div>
        <div>
          <label htmlFor="agreedRateInrPerMt">Agreed rate (INR / MT)</label>
          <input
            id="agreedRateInrPerMt"
            name="agreedRateInrPerMt"
            type="number"
            min="1"
            step="0.01"
            required
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="49000"
          />
        </div>
        <div>
          <label htmlFor="qtyBookedMt">Qty booked (MT)</label>
          <input
            id="qtyBookedMt"
            name="qtyBookedMt"
            type="number"
            min="0.001"
            step="0.001"
            required
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            placeholder="50"
          />
        </div>
        <div>
          <label htmlFor="vehicleNumber">Vehicle number</label>
          <input
            id="vehicleNumber"
            name="vehicleNumber"
            defaultValue={booking?.vehicleNumber ?? ""}
            placeholder="GJ12 AB 4412"
          />
        </div>
        <div>
          <label htmlFor="actualLoadedWeightMt">Actual loaded weight (MT)</label>
          <input
            id="actualLoadedWeightMt"
            name="actualLoadedWeightMt"
            type="number"
            min="0"
            step="0.001"
            value={loaded}
            onChange={(event) => setLoaded(event.target.value)}
            placeholder="Required when Lifted"
          />
        </div>
        <div>
          <label htmlFor="liftingStatus">Lifting status</label>
          <select
            id="liftingStatus"
            name="liftingStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {LIFTING_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="paymentStatus">Payment status</label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={booking?.paymentStatus ?? "PENDING"}
          >
            {PAYMENT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={booking?.notes ?? ""}
        />
      </div>
      <div className="rounded-2xl bg-paper-100 p-4 text-sm">
        <p className="font-semibold">Live invoice formula</p>
        <p className="mt-1 text-ink-700/70">
          Final invoice = Agreed rate × Actual loaded weight (falls back to booked qty
          until weighment is entered).
        </p>
        <p className="mt-3 font-display text-2xl tabular">{formatInr(invoice)}</p>
        {status === "ORDER_CONFIRMED" || status === "LOADED_AT_CFS" ? (
          <p className="mt-2 text-ink-700/70">
            Confirming this booking commits {formatMt(qtyNumber)} against the lot and
            reduces available-to-sell immediately.
          </p>
        ) : (
          <p className="mt-2 text-ink-700/70">
            Lifted quantity moves from committed into lifted stock.
          </p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-xl bg-ink-800 px-4 py-3 text-sm font-semibold text-white hover:bg-ink-900"
      >
        {booking ? "Save booking" : "Create sales booking"}
      </button>
    </form>
  );
}
