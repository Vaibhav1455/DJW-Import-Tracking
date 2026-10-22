import { existsSync, writeFileSync } from "node:fs";

const fallbackUrl = process.env.VERCEL
  ? "file:/tmp/djw-import.db"
  : "file:./dev.db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackUrl;
}

if (!existsSync(".env")) {
  writeFileSync(".env", `DATABASE_URL="${process.env.DATABASE_URL}"\n`);
}
