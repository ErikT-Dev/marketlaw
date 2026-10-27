import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:8787";

const DESKTOP_SIZES = [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  snapshotPathTemplate: "harness/screens/{testFileName}/{arg}-{projectName}{ext}",
  fullyParallel: false,
  forbidOnly: true,
  webServer: { command: "npm run dev", url: BASE_URL, reuseExistingServer: true, timeout: 120_000 },
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: DESKTOP_SIZES.map((viewport) => ({
    name: `${viewport.width}x${viewport.height}`,
    use: { ...devices["Desktop Chrome"], viewport },
  })),
});
