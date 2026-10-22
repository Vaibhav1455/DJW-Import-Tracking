"use client";

import { ShortagePair } from "@/components/WeightShortageAlert";
import {
  computeDeliveryShortage,
  computeWeightShortage,
} from "@/lib/weights";
import { useMemo, useState } from "react";

export function WeightVerificationFields({
  defaultBlWeightMt,
  defaultCfsActualWeightMt,
  defaultDeliveryQuantityMt,
  prefix = "",
}: {
  defaultBlWeightMt?: number | null;
  defaultCfsActualWeightMt?: number | null;
  defaultDeliveryQuantityMt?: number | null;
  prefix?: string;
}) {
  const [bl, setBl] = useState(
    defaultBlWeightMt != null ? String(defaultBlWeightMt) : "",
  );
  const [cfs, setCfs] = useState(
    defaultCfsActualWeightMt != null ? String(defaultCfsActualWeightMt) : "",
  );
  const [delivery, setDelivery] = useState(
    defaultDeliveryQuantityMt != null ? String(defaultDeliveryQuantityMt) : "",
  );

  const cfsCheck = useMemo(() => {
    return computeWeightShortage(
      bl === "" ? null : Number(bl),
      cfs === "" ? null : Number(cfs),
    );
  }, [bl, cfs]);

  const deliveryCheck = useMemo(() => {
    return computeDeliveryShortage(
      bl === "" ? null : Number(bl),
      delivery === "" ? null : Number(delivery),
    );
  }, [bl, delivery]);

  return (
    <div className="grid gap-4 rounded-2xl border border-ink-100 bg-paper-50 p-4 sm:col-span-2 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper-600">
          Weight verification
        </p>
        <p className="mt-1 text-sm text-ink-700/65">
          CFS Shortage = CFS Quantity Received − Quantity as per BL. Delivery
          Shortage = Delivery Quantity Received − Quantity as per BL. A negative
          result is a shortage.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${prefix}blWeightMt`}>Quantity as per BL (MT)</label>
          <input
            id={`${prefix}blWeightMt`}
            name="blWeightMt"
            type="number"
            min="0"
            step="0.001"
            value={bl}
            onChange={(event) => setBl(event.target.value)}
            placeholder="500.000"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}cfsActualWeightMt`}>
            CFS Quantity Received (MT)
          </label>
          <input
            id={`${prefix}cfsActualWeightMt`}
            name="cfsActualWeightMt"
            type="number"
            min="0"
            step="0.001"
            value={cfs}
            onChange={(event) => setCfs(event.target.value)}
            placeholder="After CFS weighment"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}deliveryQuantityMt`}>
            Delivery Quantity Received (MT)
          </label>
          <input
            id={`${prefix}deliveryQuantityMt`}
            name="deliveryQuantityMt"
            type="number"
            min="0"
            step="0.001"
            value={delivery}
            onChange={(event) => setDelivery(event.target.value)}
            placeholder="After delivery"
          />
        </div>
      </div>
      <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} />
    </div>
  );
}
