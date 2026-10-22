import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lots = await prisma.cargoLot.findMany({
    select: { id: true, stage: true, pipelineStatus: true },
  });

  for (const lot of lots) {
    let pipelineStatus = lot.pipelineStatus;
    if (lot.stage === "ACTIVE") {
      pipelineStatus = "IN_ACTIVE_SALES_STOCK";
    } else if (pipelineStatus === "ORDER_PLACED") {
      pipelineStatus = "ADVANCE_PAID";
    } else if (pipelineStatus === "IN_TRANSIT") {
      pipelineStatus = "SHIPPING_LINE_BILL_PAID";
    } else if (pipelineStatus === "ARRIVED_AT_CFS") {
      pipelineStatus = "CARGO_ARRIVED_AT_CFS";
    }

    if (pipelineStatus !== lot.pipelineStatus) {
      await prisma.cargoLot.update({
        where: { id: lot.id },
        data: { pipelineStatus },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
