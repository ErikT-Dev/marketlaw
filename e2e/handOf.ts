import type { Page } from "@playwright/test";

export async function handOf(page: Page): Promise<ReadonlyArray<string>> {
  const items = page.getByRole("list", { name: "Your hand" }).getByRole("listitem");
  return items.evaluateAll((elements) =>
    elements.map((element) => element.querySelector("span")?.textContent ?? ""),
  );
}
