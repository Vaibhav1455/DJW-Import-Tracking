import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  const postgresUrl = process.env.POSTGRES_PRISMA_URL;
  const databaseUrl = process.env.DATABASE_URL;
  if (postgresUrl) {
    return postgresUrl;
  }
  if (databaseUrl && !databaseUrl.startsWith("file:")) {
    return databaseUrl;
  }
  throw new Error(
    "Set POSTGRES_PRISMA_URL or DATABASE_URL to a PostgreSQL connection string.",
  );
}

process.env.DATABASE_URL = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
