import { expect, type Page } from "@playwright/test";

export async function expectAllProjectsInView(page: Page): Promise<void> {
  const projects = page.getByRole("list", { name: "Your projects" }).getByRole("listitem");
  await expect(projects).toHaveCount(3);
  for (const project of await projects.all()) {
    await expect(project).toBeInViewport({ ratio: 1 });
  }
}
