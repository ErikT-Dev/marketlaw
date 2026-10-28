import { fileURLToPath, pathToFileURL } from "node:url";
import { bundleForNode } from "../bundleForNode.ts";

const ENTRY = fileURLToPath(new URL("./testRoomEntry.ts", import.meta.url));

const bundle = await bundleForNode(ENTRY, "testRoomEntry");
await import(pathToFileURL(bundle).href);
