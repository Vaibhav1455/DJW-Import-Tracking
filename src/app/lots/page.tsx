import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { ShortagePair } from "@/components/WeightShortageAlert";
import { deleteLot } from "@/lib/actions";
import { formatMt } from "@/lib/format";
import { getLotsWithStock } from "@/lib/queries";
import { computeDeliveryShortage, computeWeightShortage } from "@/lib/weights";

const LOT_DELETE_MESSAGE =
  "Move this import lot to the Recycle Bin? It will leave pipeline, CFS stock, and Available-to-Sell until you restore it.";

export default async function LotsPage() {
  const lots = await getLotsWithStock();

  return (
    <div>
      <PageHeader
        kicker="Sales import"
        title="Active CFS stock"
        description="Sales booking inventory after stage 6. Initial stock is CFS Quantity Received."
        actionHref="/lots/new"
        actionLabel="New lot"
      />

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="hidden grid-cols-12 bg-paper-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/40 md:grid">
          <span className="col-span-3">File / product</span>
          <span className="col-span-2">Supplier</span>
          <span className="col-span-2 text-right">Inward</span>
          <span className="col-span-2 text-right">Committed</span>
          <span className="col-span-1 text-right">Lifted</span>
          <span className="col-span-2 text-right">Available</span>
        </div>
        {lots.map((lot) => {
          const cfsCheck = computeWeightShortage(
            lot.blWeightMt,
            lot.cfsActualWeightMt,
          );
          const deliveryCheck = computeDeliveryShortage(
            lot.blWeightMt,
            lot.deliveryQuantityMt,
          );
          return (
            <div
              key={lot.id}
              className="flex items-stretch border-t border-ink-100"
            >
              <Link
                href={`/lots/${lot.id}`}
                className="grid min-w-0 flex-1 gap-2 px-5 py-4 hover:bg-paper-50 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-3">
                  <p className="font-semibold">{lot.lotNumber}</p>
                  <p className="text-sm text-ink-700/60">{lot.productName}</p>
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
                {cfsCheck?.hasShortage || deliveryCheck?.hasShortage ? (
                  <div className="md:col-span-12">
                    <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} compact />
                  </div>
                ) : null}
              </Link>
              <div className="flex items-center pr-4">
                <ConfirmDeleteButton
                  label={`Delete lot ${lot.lotNumber}`}
                  message={LOT_DELETE_MESSAGE}
                  action={deleteLot.bind(null, lot.id)}
                />
              </div>
            </div>
          );
        })}
        {lots.length === 0 ? (
          <p className="p-8 text-sm text-ink-700/60">
            No active stock yet. Mark a pipeline file as Cargo Arrived at CFS.
          </p>
        ) : null}
      </div>
    </div>
  );
}
