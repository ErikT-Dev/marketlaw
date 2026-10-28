import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";

export async function bundleForNode(entry: string, name: string): Promise<string> {
  const outDir = join(tmpdir(), `marketlaw-${name}`);
  await build({
    configFile: false,
    logLevel: "silent",
    ssr: { noExternal: true },
    build: {
      ssr: entry,
      outDir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: `${name}.mjs` } },
    },
  });
  return join(outDir, `${name}.mjs`);
}
