import { mkdirSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";
import { DESIGN_FILES } from "./DESIGN_FILES.ts";
import { imageFileName } from "./imageFileName.ts";

const KNOWN_FOLDERS = new Set<string>(DESIGN_FILES.map((file) => file.folder));

export function receiveBoardImages(): void {
  let saved = 0;
  const server = createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "*");
    response.setHeader("Access-Control-Allow-Private-Network", "true");
    if (request.method === "OPTIONS") {
      response.end();
      return;
    }
    const [folder = "", encodedBoard = ""] = (request.url ?? "")
      .split("/")
      .filter((part) => part !== "");
    if (folder === "done") {
      response.end("bye");
      console.log(`Saved ${saved} board images.`);
      server.close();
      return;
    }
    if (request.method !== "POST" || !KNOWN_FOLDERS.has(folder) || encodedBoard === "") {
      reply(response, 400, "expected POST /<folder>/<board name>");
      return;
    }
    void saveImage(request, response, folder, decodeURIComponent(encodedBoard)).then(() => {
      saved += 1;
    });
  });
  server.listen(DESIGN_EXPORT_PATHS.imageReceiverPort, () => {
    console.log(`Waiting for board images on port ${DESIGN_EXPORT_PATHS.imageReceiverPort}`);
  });
}

async function saveImage(
  request: IncomingMessage,
  response: ServerResponse,
  folder: string,
  boardName: string,
): Promise<void> {
  const chunks: Array<Buffer> = [];
  for await (const chunk of request) {
    const piece: unknown = chunk;
    if (Buffer.isBuffer(piece)) {
      chunks.push(piece);
    }
  }
  const directory = join(DESIGN_EXPORT_PATHS.root, folder, "images");
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, imageFileName(boardName)), Buffer.concat(chunks));
  console.log(`${folder}/${imageFileName(boardName)}`);
  reply(response, 200, "saved");
}

function reply(response: ServerResponse, status: number, message: string): void {
  response.statusCode = status;
  response.end(message);
}

receiveBoardImages();
