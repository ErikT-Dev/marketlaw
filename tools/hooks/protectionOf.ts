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
  return { kind: "free" };
}
