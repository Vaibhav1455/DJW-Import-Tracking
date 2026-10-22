import { spawnSync } from "node:child_process";

const url =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  "";

const isPostgres =
  url.startsWith("postgres://") || url.startsWith("postgresql://");
const isLocalDummy = /127\.0\.0\.1|localhost/.test(url);

if (process.env.VERCEL || (isPostgres && !isLocalDummy)) {
  const result = spawnSync("npx", ["prisma", "db push"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

console.log(
  "Skipping prisma db push because this environment has no Neon PostgreSQL URL.",
);
