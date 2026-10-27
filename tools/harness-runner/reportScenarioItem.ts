import { escapeHtml } from "./escapeHtml.ts";
import { reportStatusOf } from "./reportStatusOf.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";
import { statusBadge } from "./statusBadge.ts";

function detailOf(run: ScenarioRun): string {
  switch (run.result.status) {
    case "passes":
      return "";
    case "fails":
      return run.result.problems.join("; ");
    case "not_yet":
      return `needs ${run.result.missing.join(", ")}`;
    default: {
      const unexpected: never = run.result;
      return String(unexpected);
    }
  }
}

export function reportScenarioItem(run: ScenarioRun): string {
  const { file, number, name } = run.scenario;
  const detail = detailOf(run);
  const detailHtml = detail === "" ? "" : `<span class="detail">${escapeHtml(detail)}</span>`;
  return `<li>${statusBadge(reportStatusOf(run))}${escapeHtml(`${file} #${number}: ${name}`)}${detailHtml}</li>`;
}
