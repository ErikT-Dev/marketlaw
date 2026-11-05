import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { isRecord } from "../harness-check/isRecord.ts";
import { readHookInput } from "./readHookInput.ts";

const CHECKED_PATHS = [
  "src",
  "tools",
  "eslint-rules",
  "harness",
  "e2e",
  "package.json",
  ":(exclude)harness/screens",
];
const LAST_CHECK_FILE = "node_modules/.cache/marketlaw/last-check.json";
const OUTPUT_LINES_SHOWN = 80;
const HELPER_RUNNING_FILE = "node_modules/.cache/marketlaw/helper-running";
const HELPER_MARKER_LIFETIME_MS = 3 * 60 * 60 * 1000;

type LastCheck = Readonly<{ fingerprint: string; hasPassed: boolean }>;

export async function checkBeforeStop(): Promise<void> {
  const input = await readHookInput();
  if (input["hook_event_name"] !== "SubagentStop" && isHelperRunning()) {
    return;
  }
  const fingerprint = fingerprintOfChanges();
  if (fingerprint === undefined) {
    return;
  }
  const last = readLastCheck();
  if (last?.fingerprint === fingerprint && (last.hasPassed || input["stop_hook_active"] === true)) {
    return;
  }
  const result = spawnSync("npm run check", { encoding: "utf8", shell: true });
  const hasPassed = result.status === 0;
  writeLastCheck({ fingerprint, hasPassed });
  if (!hasPassed) {
    const output = `${result.stdout}${result.stderr}`
      .split("\n")
      .slice(-OUTPUT_LINES_SHOWN)
      .join("\n");
    process.stderr.write(
      `npm run check failed. Fix it before reporting done, or tell the owner it fails:\n${output}`,
    );
    process.exitCode = 2;
  }
}

function isHelperRunning(): boolean {
  if (!existsSync(HELPER_RUNNING_FILE)) {
    return false;
  }
  const startedAt = Number(readFileSync(HELPER_RUNNING_FILE, "utf8").trim());
  return Number.isFinite(startedAt) && Date.now() - startedAt < HELPER_MARKER_LIFETIME_MS;
}

function fingerprintOfChanges(): string | undefined {
  const diff = git(["diff", "HEAD", "--", ...CHECKED_PATHS]);
  const untracked = git(["ls-files", "--others", "--exclude-standard", "--", ...CHECKED_PATHS])
    .split("\n")
    .filter((path) => path !== "");
  if (diff === "" && untracked.length === 0) {
    return undefined;
  }
  const hash = createHash("sha256").update(diff);
  for (const path of untracked) {
    hash.update(path).update(readFileSync(path));
  }
  return hash.digest("hex");
}

function git(args: ReadonlyArray<string>): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function readLastCheck(): LastCheck | undefined {
  if (!existsSync(LAST_CHECK_FILE)) {
    return undefined;
  }
  const parsed: unknown = JSON.parse(readFileSync(LAST_CHECK_FILE, "utf8"));
  if (!isRecord(parsed) || typeof parsed["fingerprint"] !== "string") {
    return undefined;
  }
  return { fingerprint: parsed["fingerprint"], hasPassed: parsed["hasPassed"] === true };
}

function writeLastCheck(lastCheck: LastCheck): void {
  mkdirSync(dirname(LAST_CHECK_FILE), { recursive: true });
  writeFileSync(LAST_CHECK_FILE, JSON.stringify(lastCheck));
}

await checkBeforeStop();
