import type { Page } from "@playwright/test";

export async function handOf(page: Page): Promise<ReadonlyArray<string>> {
  const cards = page.getByRole("list", { name: "Your hand" }).getByRole("button");
  return cards.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("aria-label") ?? ""),
  );
}
