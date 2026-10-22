const postgresUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (postgresUrl) {
  process.env.DATABASE_URL = postgresUrl;
}

const databaseUrl = process.env.DATABASE_URL;
const isPostgres =
  typeof databaseUrl === "string" &&
  (databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://"));

if (!isPostgres) {
  if (process.env.VERCEL) {
    throw new Error(
      "Set POSTGRES_PRISMA_URL or DATABASE_URL to the Neon PostgreSQL connection string.",
    );
  }
  // prisma generate does not connect; this keeps local builds unblocked.
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public";
}
