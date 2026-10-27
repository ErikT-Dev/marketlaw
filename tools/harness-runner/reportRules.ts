import { collectDefinedRules } from "../harness-check/collectDefinedRules.ts";
import type { CoverageException } from "../harness-check/CoverageException.ts";
import { HARNESS_PATHS } from "../harness-check/HARNESS_PATHS.ts";
import { escapeHtml } from "./escapeHtml.ts";
import { reportScenarioItem } from "./reportScenarioItem.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

type RuleSpec = { readonly path: string; readonly text: string };

function ruleRow(
  rule: string,
  runs: ReadonlyArray<ScenarioRun>,
  exception: CoverageException | undefined,
): string {
  const covering = runs.filter(({ scenario }) => scenario.covers.includes(rule));
  const items = covering.map(reportScenarioItem).join("");
  const otherWay =
    exception === undefined ? "" : `<p>Checked another way: ${escapeHtml(exception.how)}</p>`;
  return `<tr><td>${rule}</td><td><ul>${items}</ul>${otherWay}</td></tr>`;
}

export function reportRules(
  ruleSpecs: ReadonlyArray<RuleSpec>,
  runs: ReadonlyArray<ScenarioRun>,
  exceptions: ReadonlyMap<string, CoverageException>,
): string {
  return HARNESS_PATHS.ruleSpecs
    .map((spec) => {
      const text = ruleSpecs.find((loaded) => loaded.path === spec.path)?.text ?? "";
      const rows = collectDefinedRules(text)
        .map((rule) => ruleRow(rule, runs, exceptions.get(rule)))
        .join("");
      return `<h3>${escapeHtml(spec.title)}</h3><table><tr><th>Rule</th><th>Scenarios</th></tr>${rows}</table>`;
    })
    .join("");
}
