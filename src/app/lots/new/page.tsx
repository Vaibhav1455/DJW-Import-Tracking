import { LotForm } from "@/components/LotForm";
import { PageHeader } from "@/components/PageHeader";

export default function NewLotPage() {
  return (
    <div>
      <PageHeader
        kicker="Inventory"
        title="New import lot"
        description="Record a cargo parcel as it lands. Available-to-sell starts equal to total inward MT."
      />
      <LotForm />
    </div>
  );
}
