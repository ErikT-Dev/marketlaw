import { fileURLToPath, pathToFileURL } from "node:url";
import { bundleForNode } from "../bundleForNode.ts";

const ENTRY = fileURLToPath(new URL("./checkHarnessEntry.ts", import.meta.url));

const bundle = await bundleForNode(ENTRY, "checkHarnessEntry");
await import(pathToFileURL(bundle).href);
