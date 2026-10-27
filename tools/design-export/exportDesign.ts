import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isRecord } from "../harness-check/isRecord.ts";
import { callPenpot } from "./callPenpot.ts";
import { collectComponentNames } from "./collectComponentNames.ts";
import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";
import { DESIGN_FILES } from "./DESIGN_FILES.ts";
import { describeDesignFile } from "./describeDesignFile.ts";
import { downloadDesignFile } from "./downloadDesignFile.ts";
import { imageFileName } from "./imageFileName.ts";
import { readPenpotToken } from "./readPenpotToken.ts";

export async function exportDesign(): Promise<void> {
  const token = readPenpotToken();
  const root = DESIGN_EXPORT_PATHS.root;
  rmSync(root, { recursive: true, force: true });
  const fileData = new Map<string, Readonly<Record<string, unknown>>>();
  for (const file of DESIGN_FILES) {
    console.log(`Reading ${file.name}`);
    const response = await callPenpot("get-file", { id: file.id }, token);
    const json: unknown = await response.json();
    const data = isRecord(json) ? json["data"] : undefined;
    if (!isRecord(data)) {
      throw new Error(`${file.name} has no design data`);
    }
    fileData.set(file.id, data);
  }
  const componentNames = new Map<string, string>();
  fileData.forEach((data) => {
    collectComponentNames(data, componentNames);
  });
  const index = ["# MarketLaw design export", "", `Exported ${new Date().toISOString()}`, ""];
  for (const file of DESIGN_FILES) {
    const folder = join(root, file.folder);
    mkdirSync(join(folder, "images"), { recursive: true });
    const data = fileData.get(file.id) ?? {};
    const described = describeDesignFile(file.name, data, componentNames);
    writeFileSync(join(folder, "contents.md"), described.markdown);
    writeFileSync(join(folder, "data.json"), JSON.stringify(data, null, 1));
    console.log(`Downloading ${file.name}`);
    await downloadDesignFile(file.id, join(folder, `${file.folder}.penpot`), token);
    index.push(
      `## ${file.name}`,
      "",
      `Folder \`${file.folder}\`: contents.md, data.json, ${file.folder}.penpot, images/`,
      "",
    );
    index.push(
      ...described.boards.map(
        (entry) => `- ${entry.page} / ${entry.board} -> images/${imageFileName(entry.board)}`,
      ),
      "",
    );
  }
  const library = fileData.get(DESIGN_FILES[0].id) ?? {};
  writeFileSync(join(root, "tokens.json"), JSON.stringify(library["tokensLib"] ?? {}, null, 2));
  const libraryNames = new Map<string, string>();
  collectComponentNames(library, libraryNames);
  writeFileSync(
    join(root, "components.md"),
    [
      "# Library components",
      "",
      ...[...libraryNames.values()].sort().map((name) => `- ${name}`),
      "",
    ].join("\n"),
  );
  writeFileSync(join(root, "README.md"), index.join("\n"));
  console.log(`Design exported to ${root}. Board images are added by the image export.`);
}

await exportDesign();
