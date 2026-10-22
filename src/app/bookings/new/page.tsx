import { BookingForm } from "@/components/BookingForm";
import { PageHeader } from "@/components/PageHeader";
import { getLotsWithStock } from "@/lib/queries";

export default async function NewBookingPage() {
  const lots = await getLotsWithStock();

  return (
    <div>
      <PageHeader
        kicker="Sales"
        title="New sales booking"
        description="Selecting Order Confirmed or Loaded at CFS immediately commits quantity on the linked lot."
      />
      <BookingForm
        lots={lots.map((lot) => ({
          ...lot,
          availableToSellMt: lot.stock.availableToSellMt,
        }))}
      />
    </div>
  );
}
