import { PageHeader } from "@/components/PageHeader";
import { PipelineFileCard } from "@/components/PipelineFileCard";
import { getPipelineOrders } from "@/lib/queries";

export default async function PipelinePage() {
  const orders = await getPipelineOrders();

  return (
    <div>
      <PageHeader
        kicker="Pre-CFS"
        title="Import pipeline"
        description="Deep Jyoti import file board. Stage 6 posts CFS Quantity Received into Active CFS stock."
        actionHref="/pipeline/new"
        actionLabel="New file"
      />

      <div className="mb-3 hidden grid-cols-4 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-700/40 sm:grid">
        <span>File No.</span>
        <span>Supplier</span>
        <span>Product</span>
        <span>Quantity</span>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <PipelineFileCard key={order.id} order={order} />
        ))}
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-100 p-8 text-sm text-ink-700/60">
            No open import files. Create a file, then tap stage 6 when cargo
            arrives at CFS.
          </p>
        ) : null}
      </div>
    </div>
  );
}
