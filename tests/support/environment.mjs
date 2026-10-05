import { config, parse } from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";

export function configureTestEnvironment() {
  // Never load .env into the test process. Read only its DB URL for safety checks.
  const development = existsSync(".env") ? parse(readFileSync(".env")).DATABASE_URL : undefined;
  const inherited = process.env.DATABASE_URL;
  config({ path: ".env.test", quiet: true });
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error("TEST_DATABASE_URL is required; no DATABASE_URL fallback is allowed");
  const url = new URL(value);
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !/(^|_)test$/.test(database)) {
    throw new Error("Test PostgreSQL database name must be test or end in _test");
  }
  const identity = (connection) => {
    const candidate = new URL(connection);
    const host = candidate.hostname.toLowerCase();
    const normalizedHost = ["localhost", "127.0.0.1", "[::1]"].includes(host) ? "loopback" : host;
    return `${normalizedHost}:${candidate.port || "5432"}/${decodeURIComponent(candidate.pathname.slice(1))}`;
  };
  for (const other of [development, inherited]) {
    if (other && identity(other) === identity(value)) {
      throw new Error("Test database must differ from the development/production DATABASE_URL");
    }
  }
  // Prisma adapter does not use Prisma CLI's ?schema= query convention.
  if (url.searchParams.has("schema") && url.searchParams.get("schema") !== "public") {
    throw new Error("Tests require a dedicated database with the public schema");
  }
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = value;
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
}

configureTestEnvironment();
