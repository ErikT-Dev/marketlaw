import { writeFileSync } from "node:fs";
import { exportReplay } from "./exportReplay.ts";

const [code, site = "http://localhost:8787"] = process.argv.slice(2);
if (code === undefined) {
  throw new Error("usage: npm run replay-export -- <room code> [site]");
}
const file = `replay-${code}.json`;
writeFileSync(file, await exportReplay(code, site));
console.log(`Saved the replay record of room ${code} to ${file}`);
