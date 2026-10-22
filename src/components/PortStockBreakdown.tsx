"use client";

import { formatMt } from "@/lib/format";
import type { PortStockGroup } from "@/lib/stock";
import { useState } from "react";

export function PortStockBreakdown({ ports }: { ports: PortStockGroup[] }) {
  const [openPort, setOpenPort] = useState<string | null>(
    ports.length === 1 ? ports[0].portLocation : null,
  );

  if (ports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink-100 p-6 text-sm text-ink-700/60">
        No available-to-sell stock at any port yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {ports.map((port) => {
        const open = openPort === port.portLocation;
        return (
          <article
            key={port.portLocation}
            className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() =>
                setOpenPort(open ? null : port.portLocation)
              }
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/45">
                  Port / CFS
                </p>
                <h3 className="mt-1 truncate font-display text-xl">
                  {port.portLocation}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/45">
                    Available
                  </p>
                  <p className="mt-1 tabular text-sm font-semibold text-copper-600">
                    {formatMt(port.availableToSellMt)}
                  </p>
                </div>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-100 text-sm text-ink-700/70 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
              </div>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-ink-100 px-4 pb-4 pt-2 sm:px-5">
                  <div className="hidden grid-cols-12 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/40 sm:grid">
                    <span className="col-span-6">Commodity</span>
                    <span className="col-span-2 text-right">Available</span>
                    <span className="col-span-2 text-right">Committed</span>
                    <span className="col-span-2 text-right">Inward</span>
                  </div>
                  <ul className="divide-y divide-ink-100">
                    {port.commodities.map((commodity) => (
                      <li
                        key={commodity.productName}
                        className="grid gap-1 py-3 sm:grid-cols-12 sm:items-center"
                      >
                        <p className="font-semibold sm:col-span-6">
                          {commodity.productName}
                        </p>
                        <Metric
                          label="Available"
                          value={formatMt(commodity.availableToSellMt)}
                          accent
                        />
                        <Metric
                          label="Committed"
                          value={formatMt(commodity.committedMt)}
                        />
                        <Metric
                          label="Inward"
                          value={formatMt(commodity.initialMt)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 sm:col-span-2 sm:block sm:text-right">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/45 sm:hidden">
        {label}
      </p>
      <p
        className={`tabular text-sm ${
          accent ? "font-semibold text-copper-600" : "text-ink-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
