import { cloudflareTest } from "@cloudflare/vitest-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/rules/**/*.ts"],
      exclude: ["**/*.test.ts"],
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
    },
    projects: [
      {
        test: {
          name: "engine",
          environment: "node",
          include: [
            "src/rules/**/*.test.ts",
            "src/bots/**/*.test.ts",
            "src/shared/**/*.test.ts",
            "tools/**/*.test.ts",
          ],
        },
      },
      {
        plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } })],
        test: { name: "server", include: ["src/server/**/*.test.ts"] },
      },
      {
        plugins: [react()],
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/client/**/*.test.tsx", "src/hosts/**/*.test.ts"],
        },
      },
    ],
  },
});
