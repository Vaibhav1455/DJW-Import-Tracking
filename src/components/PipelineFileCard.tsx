"use client";

import { setPipelineStage } from "@/lib/actions";
import { type PipelineStatus } from "@/lib/constants";
import { fileQuantityMt, formatMt } from "@/lib/format";
import {
  computeDeliveryShortage,
  computeWeightShortage,
} from "@/lib/weights";
import type { CargoLot } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { PipelineForm } from "./PipelineForm";
import { ShortagePair } from "./WeightShortageAlert";
import { StageTracker } from "./StageTracker";

export function PipelineFileCard({ order }: { order: CargoLot }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [bl, setBl] = useState(
    order.blWeightMt != null ? String(order.blWeightMt) : "",
  );
  const [cfs, setCfs] = useState(
    order.cfsActualWeightMt != null ? String(order.cfsActualWeightMt) : "",
  );
  const [delivery, setDelivery] = useState(
    order.deliveryQuantityMt != null ? String(order.deliveryQuantityMt) : "",
  );

  const blValue = bl === "" ? null : Number(bl);
  const cfsValue = cfs === "" ? null : Number(cfs);
  const deliveryValue = delivery === "" ? null : Number(delivery);

  const cfsCheck = useMemo(
    () => computeWeightShortage(blValue, cfsValue),
    [blValue, cfsValue],
  );
  const deliveryCheck = useMemo(
    () => computeDeliveryShortage(blValue, deliveryValue),
    [blValue, deliveryValue],
  );

  const quantity = fileQuantityMt({
    quantityMt: order.quantityMt,
    blWeightMt: blValue ?? order.blWeightMt,
    cfsActualWeightMt: cfsValue ?? order.cfsActualWeightMt,
  });

  function selectStage(status: PipelineStatus, nextCfs = cfsValue) {
    setError(null);
    startTransition(async () => {
      const result = await setPipelineStage(
        order.id,
        status,
        blValue,
        nextCfs,
        deliveryValue,
      );
      if (result?.error) setError(result.error);
    });
  }

  function onCfsBlur() {
    if (cfsValue != null && cfsValue > 0) {
      selectStage("CARGO_ARRIVED_AT_CFS", cfsValue);
    }
  }

  return (
    <article className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-5">
      <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
        <Field label="File No." value={order.lotNumber} />
        <Field label="Supplier Name" value={order.supplierName || "—"} />
        <Field label="Product Name" value={order.productName} />
        <Field
          label="Order Quantity"
          value={quantity != null ? formatMt(quantity, 2) : "—"}
        />
      </div>

      <div className="mt-4">
        <StageTracker
          status={order.pipelineStatus}
          pending={pending}
          onSelect={selectStage}
        />
        <p className="mt-2 text-xs text-ink-700/50">
          Balance, duty, or shipping-line bill (amount + date) advances the
          matching stage on save. CFS quantity automatically marks Cargo Arrived
          at CFS.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-paper-50 p-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`bl-${order.id}`}>Quantity as per BL (MT)</label>
          <input
            id={`bl-${order.id}`}
            type="number"
            min="0"
            step="0.001"
            value={bl}
            onChange={(event) => setBl(event.target.value)}
            placeholder="—"
          />
        </div>
        <div>
          <label htmlFor={`cfs-${order.id}`}>CFS Quantity Received (MT)</label>
          <input
            id={`cfs-${order.id}`}
            type="number"
            min="0"
            step="0.001"
            value={cfs}
            onChange={(event) => setCfs(event.target.value)}
            onBlur={onCfsBlur}
            placeholder="—"
          />
        </div>
        <div>
          <label htmlFor={`delivery-${order.id}`}>
            Delivery Quantity Received (MT)
          </label>
          <input
            id={`delivery-${order.id}`}
            type="number"
            min="0"
            step="0.001"
            value={delivery}
            onChange={(event) => setDelivery(event.target.value)}
            placeholder="—"
          />
        </div>
        <div className="sm:col-span-3">
          <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} compact />
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 text-sm font-semibold text-ink-700/70 hover:text-ink-800"
      >
        {open ? "Hide details" : "Details / Edit"}
      </button>

      {open ? (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <PipelineForm order={order} compact />
        </div>
      ) : null}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/45">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
