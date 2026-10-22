import { PageHeader } from "@/components/PageHeader";
import { PipelineForm } from "@/components/PipelineForm";

export default function NewPipelinePage() {
  return (
    <div>
      <PageHeader
        kicker="Pre-CFS"
        title="New import file"
        description="File No. and product are required. Total Order Price is Order Quantity × Rate."
      />
      <PipelineForm />
    </div>
  );
}
