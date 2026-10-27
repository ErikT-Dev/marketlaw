import { editedFilePath } from "./editedFilePath.ts";
import { protectionOf } from "./protectionOf.ts";
import { readHookInput } from "./readHookInput.ts";

export async function guardProtectedPaths(): Promise<void> {
  const path = editedFilePath(await readHookInput());
  if (path === undefined) {
    return;
  }
  const protection = protectionOf(path);
  if (protection.kind === "free") {
    return;
  }
  const decision = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: protection.kind,
      permissionDecisionReason: protection.reason,
    },
  };
  process.stdout.write(JSON.stringify(decision));
}

await guardProtectedPaths();
