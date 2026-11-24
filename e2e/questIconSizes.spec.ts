import { expect, test } from "@playwright/test";
import { startTestRoom } from "./startTestRoom";

test("a marked player icon in a quest is as big as an unmarked one, picture included", async ({
  page,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 3,
    turn: 20,
    quests: [{ quest: "Trading post" }],
    seats: [{ seat: 2, city: ["Apparel Store"], stats: { income: 40 } }],
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", { name: "Turn 20 of 40" })).toBeVisible();
  const quest = page
    .getByRole("list", { name: "Quests table" })
    .getByRole("region", { name: "Trading post" });
  await expect(quest.getByText("could complete it now")).toHaveCount(1);
  const icons = await quest
    .getByRole("list", { name: "Progress on Trading post" })
    .getByRole("button")
    .evaluateAll((buttons) =>
      buttons.map((button) => {
        const circle = button.getBoundingClientRect();
        const picture = button.firstElementChild?.getBoundingClientRect();
        return {
          isMarked: button.parentElement?.textContent.includes("could complete it now") ?? false,
          circle: [circle.width, circle.height],
          picture: picture === undefined ? null : [picture.width, picture.height],
        };
      }),
    );
  expect(icons).toHaveLength(3);
  const [marked, ...unmarked] = [...icons].sort(
    (first, second) => Number(second.isMarked) - Number(first.isMarked),
  );
  expect(marked?.isMarked).toBe(true);
  for (const icon of unmarked) {
    expect(icon.isMarked).toBe(false);
    expect(icon.circle).toEqual(marked?.circle);
    expect(icon.picture).toEqual(marked?.picture);
  }
  expect(marked?.picture).not.toBeNull();
});
