import "./environment.mjs";
import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
});
