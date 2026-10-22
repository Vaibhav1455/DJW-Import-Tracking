import { notFound, redirect } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { PipelineForm } from "@/components/PipelineForm";
import { StatCard } from "@/components/StatCard";
import { PipelineBadge } from "@/components/StatusBadge";
import { ShortagePair } from "@/components/WeightShortageAlert";
import { deleteLot } from "@/lib/actions";
import { IN_ACTIVE_SALES_STOCK, LOT_STAGE } from "@/lib/constants";
import { formatDate, formatMoney, formatMt } from "@/lib/format";
import { getLotWithStock } from "@/lib/queries";
import { computeDeliveryShortage, computeWeightShortage } from "@/lib/weights";

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getLotWithStock(id);
  if (!order) notFound();
  if (
    order.stage === LOT_STAGE.ACTIVE ||
    order.pipelineStatus === IN_ACTIVE_SALES_STOCK
  ) {
    redirect(`/lots/${id}`);
  }

  const cfsCheck = computeWeightShortage(order.blWeightMt, order.cfsActualWeightMt);
  const deliveryCheck = computeDeliveryShortage(
    order.blWeightMt,
    order.deliveryQuantityMt,
  );

  return (
    <div>
      <PageHeader
        kicker={order.portLocation || "Import file"}
        title={order.lotNumber}
        description={`${order.productName}. Stage 7 moves CFS Quantity Received into Active CFS stock.`}
      />

      <div className="mb-4 flex items-center gap-3">
        <PipelineBadge status={order.pipelineStatus} />
        <ConfirmDeleteButton
          label={`Delete file ${order.lotNumber}`}
          message="Move this import lot to the Recycle Bin? It will leave pipeline, CFS stock, and Available-to-Sell until you restore it."
          action={deleteLot.bind(null, order.id)}
          redirectTo="/pipeline"
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Quantity as per BL"
          value={order.blWeightMt != null ? formatMt(order.blWeightMt) : "—"}
        />
        <StatCard
          label="CFS Quantity Received"
          value={
            order.cfsActualWeightMt != null
              ? formatMt(order.cfsActualWeightMt)
              : "—"
          }
        />
        <StatCard
          label="Delivery Quantity Received"
          value={
            order.deliveryQuantityMt != null
              ? formatMt(order.deliveryQuantityMt)
              : "—"
          }
        />
        <StatCard
          label="Additional freight"
          value={order.additionalFreightPaid ? "Paid" : "Pending"}
        />
        <StatCard
          label="Additional freight amount"
          value={
            order.additionalFreightAmount != null
              ? formatMoney(order.additionalFreightAmount, "AED")
              : "—"
          }
        />
        <StatCard
          label="UTR / payment date"
          value={
            [
              order.additionalFreightUtr,
              order.additionalFreightPaidDate
                ? formatDate(order.additionalFreightPaidDate)
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
        />
      </div>

      <div className="mb-8 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <ShortagePair cfs={cfsCheck} delivery={deliveryCheck} />
      </div>

      <h2 className="mb-4 font-display text-2xl">Edit import file</h2>
      <PipelineForm order={order} />
    </div>
  );
}
