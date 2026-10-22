import { WeightVerificationFields } from "@/components/WeightVerificationFields";
import { createLot, updateLot } from "@/lib/actions";
import type { CargoLot } from "@prisma/client";

export function LotForm({ lot }: { lot?: CargoLot }) {
  const action = lot ? updateLot : createLot;

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8">
      {lot ? <input type="hidden" name="id" value={lot.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lotNumber">Lot number</label>
          <input
            id="lotNumber"
            name="lotNumber"
            required
            defaultValue={lot?.lotNumber}
            placeholder="DJW-MUN-24018"
          />
        </div>
        <div>
          <label htmlFor="productName">Product name</label>
          <input
            id="productName"
            name="productName"
            required
            defaultValue={lot?.productName}
            placeholder="Caustic Soda Flakes"
          />
        </div>
        <div>
          <label htmlFor="portLocation">Port location</label>
          <input
            id="portLocation"
            name="portLocation"
            required
            defaultValue={lot?.portLocation}
            placeholder="Mundra"
          />
        </div>
        <div>
          <label htmlFor="totalInitialInwardMt">Total initial inward MT</label>
          <input
            id="totalInitialInwardMt"
            name="totalInitialInwardMt"
            type="number"
            step="0.001"
            min="0.001"
            required
            defaultValue={lot?.totalInitialInwardMt}
            placeholder="500"
          />
        </div>
        <WeightVerificationFields
          defaultBlWeightMt={lot?.blWeightMt}
          defaultCfsActualWeightMt={lot?.cfsActualWeightMt}
          defaultDeliveryQuantityMt={lot?.deliveryQuantityMt}
        />
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={lot?.notes ?? ""}
          placeholder="Grade, packing, CFS remarks"
        />
      </div>
      <p className="text-sm text-ink-700/60">
        Available-to-sell is calculated as Initial Inward − Committed − Lifted.
        Confirmed bookings move quantity from available into committed automatically.
      </p>
      <button
        type="submit"
        className="rounded-xl bg-ink-800 px-4 py-3 text-sm font-semibold text-white hover:bg-ink-900"
      >
        {lot ? "Save lot" : "Create import lot"}
      </button>
    </form>
  );
}
