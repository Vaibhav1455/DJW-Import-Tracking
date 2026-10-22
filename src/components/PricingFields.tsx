"use client";

import { updateDocumentStatus } from "@/lib/actions";
import {
  DOCUMENT_STATUSES,
  FREIGHT_TERMS,
  USD_TO_AED,
  aedFromUsd,
  usdFromAed,
} from "@/lib/constants";
import { formatMoney, isoDateInput, totalOrderPrice } from "@/lib/format";
import type { CargoLot } from "@prisma/client";
import { useMemo, useState, useTransition, type ReactNode } from "react";

export function PricingFields({
  order,
  prefix,
}: {
  order?: CargoLot;
  prefix: string;
}) {
  const [qty, setQty] = useState(
    order?.quantityMt != null ? String(order.quantityMt) : "",
  );
  const [rateAed, setRateAed] = useState(
    order?.rateAed != null ? String(order.rateAed) : "",
  );
  const [rateUsd, setRateUsd] = useState(
    order?.rateUsd != null ? String(order.rateUsd) : "",
  );
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const quantity = qty === "" ? null : Number(qty);
    return {
      aed: totalOrderPrice(quantity, rateAed === "" ? null : Number(rateAed)),
      usd: totalOrderPrice(quantity, rateUsd === "" ? null : Number(rateUsd)),
    };
  }, [qty, rateAed, rateUsd]);

  return (
    <>
      <Section title="Quantities & pricing">
        <Field label="Order Quantity (MT)" htmlFor={`${prefix}quantityMt`}>
          <input
            id={`${prefix}quantityMt`}
            name="quantityMt"
            type="number"
            min="0"
            step="0.001"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            placeholder="240"
          />
        </Field>
        <Field label="Rate in AED" htmlFor={`${prefix}rateAed`}>
          <input
            id={`${prefix}rateAed`}
            name="rateAed"
            type="number"
            min="0"
            step="0.01"
            value={rateAed}
            onChange={(event) => setRateAed(event.target.value)}
            placeholder="1850"
          />
        </Field>
        <Field label="Rate in USD" htmlFor={`${prefix}rateUsd`}>
          <input
            id={`${prefix}rateUsd`}
            name="rateUsd"
            type="number"
            min="0"
            step="0.01"
            value={rateUsd}
            onChange={(event) => setRateUsd(event.target.value)}
            placeholder="505"
          />
        </Field>
        <Field label="Freight Terms" htmlFor={`${prefix}freightTerms`}>
          <select
            id={`${prefix}freightTerms`}
            name="freightTerms"
            defaultValue={order?.freightTerms ?? ""}
          >
            <option value="">Select</option>
            {FREIGHT_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </Field>
        <div className="rounded-xl bg-paper-50 px-3 py-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/45">
            Total Order Price
          </p>
          <p className="mt-1 text-sm font-semibold">
            {totals.aed != null ? formatMoney(totals.aed, "AED") : "—"}
            {totals.usd != null ? ` · ${formatMoney(totals.usd, "USD")}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-700/50">
            Order Quantity × Rate (AED and/or USD)
          </p>
        </div>
      </Section>

      <Section title="Advance & financials">
        <Field label="Date of Advance" htmlFor={`${prefix}dateOfAdvance`}>
          <input
            id={`${prefix}dateOfAdvance`}
            name="dateOfAdvance"
            type="date"
            defaultValue={isoDateInput(order?.dateOfAdvance)}
          />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs text-ink-700/50">
            Advance and balance convert at a fixed 1 USD = {USD_TO_AED} AED.
            Fill either currency and the other is calculated.
          </p>
        </div>
        <AedUsdPair
          prefix={prefix}
          aedName="advanceAmountPaid"
          usdName="advanceAmountUsd"
          aedLabel="Advance Amount (AED)"
          usdLabel="Advance Amount (USD)"
          defaultAed={order?.advanceAmountPaid}
          defaultUsd={order?.advanceAmountUsd}
        />
        <Field label="Document Status" htmlFor={`${prefix}documentStatus`}>
          <select
            id={`${prefix}documentStatus`}
            name="documentStatus"
            defaultValue={order?.documentStatus ?? "PENDING"}
            disabled={pending}
            onChange={(event) => {
              if (!order?.id) return;
              const value = event.target.value;
              startTransition(async () => {
                await updateDocumentStatus(order.id, value);
              });
            }}
          >
            {DOCUMENT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Date of Balance Payment"
          htmlFor={`${prefix}dateOfBalancePayment`}
        >
          <input
            id={`${prefix}dateOfBalancePayment`}
            name="dateOfBalancePayment"
            type="date"
            defaultValue={isoDateInput(order?.dateOfBalancePayment)}
          />
        </Field>
        <AedUsdPair
          prefix={prefix}
          aedName="balanceAmountPaid"
          usdName="balanceAmountUsd"
          aedLabel="Balance Amount (AED)"
          usdLabel="Balance Amount (USD)"
          defaultAed={order?.balanceAmountPaid}
          defaultUsd={order?.balanceAmountUsd}
        />
      </Section>

      <Section title="Additional Balance / Freight Payment">
        <label className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3.5 py-3 sm:col-span-2">
          <input
            type="checkbox"
            name="additionalFreightPaid"
            value="true"
            defaultChecked={Boolean(order?.additionalFreightPaid)}
          />
          <span className="text-sm font-medium text-ink-800">
            Additional balance / freight paid
          </span>
        </label>
        <Field
          label="Payment date"
          htmlFor={`${prefix}additionalFreightPaidDate`}
        >
          <input
            id={`${prefix}additionalFreightPaidDate`}
            name="additionalFreightPaidDate"
            type="date"
            defaultValue={isoDateInput(order?.additionalFreightPaidDate)}
          />
        </Field>
        <Field
          label="UTR / reference"
          htmlFor={`${prefix}additionalFreightUtr`}
        >
          <input
            id={`${prefix}additionalFreightUtr`}
            name="additionalFreightUtr"
            defaultValue={order?.additionalFreightUtr ?? ""}
            placeholder="UTR / bank reference"
          />
        </Field>
        <AedUsdPair
          prefix={prefix}
          aedName="additionalFreightAmount"
          usdName="additionalFreightAmountUsd"
          aedLabel="Additional amount (AED)"
          usdLabel="Additional amount (USD)"
          defaultAed={order?.additionalFreightAmount}
          defaultUsd={order?.additionalFreightAmountUsd}
        />
      </Section>
    </>
  );
}

function AedUsdPair({
  prefix,
  aedName,
  usdName,
  aedLabel,
  usdLabel,
  defaultAed,
  defaultUsd,
}: {
  prefix: string;
  aedName: string;
  usdName: string;
  aedLabel: string;
  usdLabel: string;
  defaultAed?: number | null;
  defaultUsd?: number | null;
}) {
  const [aed, setAed] = useState(
    defaultAed != null ? String(defaultAed) : "",
  );
  const [usd, setUsd] = useState(
    defaultUsd != null ? String(defaultUsd) : "",
  );

  function fromAed(raw: string) {
    setAed(raw);
    if (raw === "") {
      setUsd("");
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setUsd(String(usdFromAed(value)));
  }

  function fromUsd(raw: string) {
    setUsd(raw);
    if (raw === "") {
      setAed("");
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setAed(String(aedFromUsd(value)));
  }

  return (
    <>
      <Field label={aedLabel} htmlFor={`${prefix}${aedName}`}>
        <input
          id={`${prefix}${aedName}`}
          name={aedName}
          type="number"
          min="0"
          step="0.01"
          value={aed}
          onChange={(event) => fromAed(event.target.value)}
        />
      </Field>
      <Field label={usdLabel} htmlFor={`${prefix}${usdName}`}>
        <input
          id={`${prefix}${usdName}`}
          name={usdName}
          type="number"
          min="0"
          step="0.01"
          value={usd}
          onChange={(event) => fromUsd(event.target.value)}
        />
      </Field>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-copper-600">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
