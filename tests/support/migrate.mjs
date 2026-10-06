import { execFileSync } from "node:child_process";

export default function migrate() {
  // Configure the migration subprocess without mutating the parent Jest environment.
  execFileSync(process.execPath, ["tests/support/migrate-db.mjs"], { stdio: "inherit" });
}
