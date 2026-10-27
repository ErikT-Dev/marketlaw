import { escapeHtml } from "./escapeHtml.ts";

export function statusBadge(status: string): string {
  const className = status.replace(/[^a-z]+/g, "-").replace(/-$/, "");
  return `<span class="status ${className}">${escapeHtml(status)}</span>`;
}
