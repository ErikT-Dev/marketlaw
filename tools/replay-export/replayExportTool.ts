import { fileURLToPath, pathToFileURL } from "node:url";
import { bundleForNode } from "../bundleForNode.ts";

const ENTRY = fileURLToPath(new URL("./replayExportEntry.ts", import.meta.url));

const bundle = await bundleForNode(ENTRY, "replayExportEntry");
await import(pathToFileURL(bundle).href);
