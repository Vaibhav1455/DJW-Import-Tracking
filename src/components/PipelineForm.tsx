import { createPipelineOrder, updatePipelineOrder } from "@/lib/actions";
import { pipelineStatusForForm } from "@/lib/constants";
import { isoDateInput } from "@/lib/format";
import { PricingFields } from "@/components/PricingFields";
import { WeightVerificationFields } from "@/components/WeightVerificationFields";
import type { CargoLot } from "@prisma/client";

export function PipelineForm({
  order,
  compact = false,
}: {
  order?: CargoLot;
  compact?: boolean;
}) {
  const action = order ? updatePipelineOrder : createPipelineOrder;
  const prefix = order?.id ?? "new";

  return (
    <form
      action={action}
      className={
        compact
          ? "grid gap-5"
          : "grid gap-5 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-8"
      }
    >
      {order ? <input type="hidden" name="id" value={order.id} /> : null}
      <input
        type="hidden"
        name="pipelineStatus"
        value={pipelineStatusForForm(order?.pipelineStatus)}
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-copper-600">
          Order identification
        </legend>
        <div>
          <label htmlFor={`lotNumber-${prefix}`}>File No.</label>
          <input
            id={`lotNumber-${prefix}`}
            name="lotNumber"
            required
            defaultValue={order?.lotNumber}
            placeholder="DJW-MUN-24040"
          />
        </div>
        <div>
          <label htmlFor={`bookingNo-${prefix}`}>Booking No.</label>
          <input
            id={`bookingNo-${prefix}`}
            name="bookingNo"
            defaultValue={order?.bookingNo ?? ""}
            placeholder="BK-24018"
          />
        </div>
        <div>
          <label htmlFor={`piNo-${prefix}`}>PI No.</label>
          <input
            id={`piNo-${prefix}`}
            name="piNo"
            defaultValue={order?.piNo ?? ""}
            placeholder="PI-2026-041"
          />
        </div>
        <div>
          <label htmlFor={`supplierName-${prefix}`}>Supplier Name</label>
          <input
            id={`supplierName-${prefix}`}
            name="supplierName"
            defaultValue={order?.supplierName ?? ""}
            placeholder="Gulf Chlor-Alkali LLC"
          />
        </div>
        <div>
          <label htmlFor={`productName-${prefix}`}>Product Name</label>
          <input
            id={`productName-${prefix}`}
            name="productName"
            required
            defaultValue={order?.productName}
            placeholder="Caustic Soda Flakes"
          />
        </div>
        <div>
          <label htmlFor={`portLocation-${prefix}`}>Port of Discharge</label>
          <input
            id={`portLocation-${prefix}`}
            name="portLocation"
            defaultValue={order?.portLocation ?? ""}
            placeholder="Mundra"
          />
        </div>
      </fieldset>

      <PricingFields order={order} prefix={prefix} />

      {!compact ? (
        <WeightVerificationFields
          prefix={`${prefix}-`}
          defaultBlWeightMt={order?.blWeightMt}
          defaultCfsActualWeightMt={order?.cfsActualWeightMt}
          defaultDeliveryQuantityMt={order?.deliveryQuantityMt}
        />
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-copper-600">
          Customs & shipping
        </legend>
        <div>
          <label htmlFor={`vesselName-${prefix}`}>Vessel Name</label>
          <input
            id={`vesselName-${prefix}`}
            name="vesselName"
            defaultValue={order?.vesselName ?? ""}
            placeholder="MV Pacific Star"
          />
        </div>
        <div>
          <label htmlFor={`shippingLine-${prefix}`}>Shipping Line</label>
          <input
            id={`shippingLine-${prefix}`}
            name="shippingLine"
            defaultValue={order?.shippingLine ?? ""}
            placeholder="MSC / Maersk"
          />
        </div>
        <div>
          <label htmlFor={`shipmentBillDoNumber-${prefix}`}>
            Shipment Bill / DO Number
          </label>
          <input
            id={`shipmentBillDoNumber-${prefix}`}
            name="shipmentBillDoNumber"
            defaultValue={order?.shipmentBillDoNumber ?? ""}
            placeholder="DO-4412"
          />
        </div>
        <div>
          <label htmlFor={`beNumber-${prefix}`}>Bill of Entry (BE) Number</label>
          <input
            id={`beNumber-${prefix}`}
            name="beNumber"
            defaultValue={order?.beNumber ?? ""}
            placeholder="BE/2026/4412"
          />
        </div>
        <div>
          <label htmlFor={`beDate-${prefix}`}>BE Date</label>
          <input
            id={`beDate-${prefix}`}
            name="beDate"
            type="date"
            defaultValue={isoDateInput(order?.beDate)}
          />
        </div>
        <div>
          <label htmlFor={`dutyAmountInr-${prefix}`}>Duty Amount</label>
          <input
            id={`dutyAmountInr-${prefix}`}
            name="dutyAmountInr"
            type="number"
            min="0"
            step="0.01"
            defaultValue={order?.dutyAmountInr ?? ""}
            placeholder="1850000"
          />
        </div>
        <div>
          <label htmlFor={`dutyPaidDate-${prefix}`}>Duty Paid Date</label>
          <input
            id={`dutyPaidDate-${prefix}`}
            name="dutyPaidDate"
            type="date"
            defaultValue={isoDateInput(order?.dutyPaidDate)}
          />
        </div>
        <div>
          <label htmlFor={`shippingLineBillAmount-${prefix}`}>
            Shipping Line Bill Amount
          </label>
          <input
            id={`shippingLineBillAmount-${prefix}`}
            name="shippingLineBillAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={order?.shippingLineBillAmount ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`shippingLineBillDate-${prefix}`}>
            Shipping Line Bill Date
          </label>
          <input
            id={`shippingLineBillDate-${prefix}`}
            name="shippingLineBillDate"
            type="date"
            defaultValue={isoDateInput(order?.shippingLineBillDate)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`notes-${prefix}`}>Notes</label>
          <textarea
            id={`notes-${prefix}`}
            name="notes"
            defaultValue={order?.notes ?? ""}
            placeholder="Packing, CFS remarks"
          />
        </div>
      </fieldset>

      <p className="text-xs text-ink-700/50">
        Saving with balance, duty, or shipping-line bill amount and date sets
        that pipeline stage. A filled CFS quantity sets Cargo Arrived at CFS
        and moves the lot into Active CFS stock.
      </p>
      <button
        type="submit"
        className="rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-900"
      >
        {order ? "Save import file" : "Create import file"}
      </button>
    </form>
  );
}
