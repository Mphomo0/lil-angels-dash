// Copies static assets into .next/standalone so the folder can be uploaded to
// cPanel (or any plain Node host) and started with `node server.js`.
import { cpSync, existsSync } from "node:fs";

const out = ".next/standalone";
if (!existsSync(out)) {
  console.error("No .next/standalone folder. Run `npm run build` first.");
  process.exit(1);
}
cpSync(".next/static", `${out}/.next/static`, { recursive: true });
if (existsSync("public")) cpSync("public", `${out}/public`, { recursive: true });
console.log("Standalone build ready in .next/standalone (start with: node server.js)");
