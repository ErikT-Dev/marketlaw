import type { PathProtection } from "./PathProtection.ts";

const PROTECTED_CONFIG = [
  /^tsconfig[^/]*\.json$/,
  /^eslint\.config\./,
  /^eslint-rules\//,
  /^\.dependency-cruiser\./,
  /^knip\./,
  /^vitest\.config\./,
  /^playwright\.config\./,
  /^\.prettierrc/,
  /^\.prettierignore$/,
  /^\.size-limit\./,
  /^\.secretlint/,
  /^\.jscpd\./,
  /^\.claude\//,
  /^tools\/hooks\//,
];

const GENERATED_OUTPUT = [
  /^dist\//,
  /^\.wrangler\//,
  /^coverage\//,
  /^worker-configuration\.d\.ts$/,
  /^harness\/report\.html$/,
  /^harness\/screens\//,
  /^harness\/coverage\.md$/,
];

const FREE_IN_HARNESS = [/^harness\/scenarios\/proposed\//];

export function protectionOf(projectPath: string): PathProtection {
  if (projectPath.startsWith("../")) {
    return { kind: "free" };
  }
  if (PROTECTED_CONFIG.some((pattern) => pattern.test(projectPath))) {
    return {
      kind: "deny",
      reason: `${projectPath} is a protected check or Claude Code config (rules/workflow.md). Propose the change in chat.`,
    };
  }
  if (GENERATED_OUTPUT.some((pattern) => pattern.test(projectPath))) {
    return {
      kind: "deny",
      reason: `${projectPath} is generated output. Change the source and regenerate it.`,
    };
  }
  if (projectPath === "wrangler.jsonc") {
    return {
      kind: "ask",
      reason: "wrangler.jsonc changes need the owner's approval (rules/cloudflare.md).",
    };
  }
  if (
    projectPath.startsWith("harness/") &&
    !FREE_IN_HARNESS.some((pattern) => pattern.test(projectPath))
  ) {
    return {
      kind: "ask",
      reason: "Changes in harness/ need the owner's approval (rules/workflow.md).",
    };
  }
  return { kind: "free" };
}
