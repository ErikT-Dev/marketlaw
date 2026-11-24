import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UsernameWait } from "../../../shared/api/UsernameWait";
import { PLAYER_ICON_PICTURES } from "../../../shared/playerIcons/PLAYER_ICON_PICTURES";
import { TEST_PLAYER_ICON } from "../../../shared/testing/TEST_PLAYER_ICON";
import { testAccount } from "../../testing/testAccount";
import type { AccountBinding } from "./AccountBinding";
import { AccountSettingsDialog } from "./AccountSettingsDialog";

const OCTOBER_27 = Date.UTC(2026, 9, 27, 12);

function openPicker(changes: Partial<AccountBinding> = {}): {
  readonly account: AccountBinding;
  readonly picker: HTMLElement;
} {
  const account = testAccount(changes);
  render(
    <AccountSettingsDialog
      account={account}
      onSignUp={vi.fn()}
      onOpenDialog={vi.fn()}
      onLogOut={vi.fn()}
      onClose={vi.fn()}
    />,
  );
  return { account, picker: screen.getByRole("dialog", { name: "Account settings" }) };
}

async function pickerIn(settings: HTMLElement): Promise<HTMLElement> {
  const change = within(settings).getByRole("button", { name: "Change icon" });
  await waitFor(() => {
    expect(change).toHaveProperty("disabled", false);
  });
  fireEvent.click(change);
  return within(settings).getByRole("form", { name: "Change icon" });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("changing the player icon", () => {
  it("shows the own icon as You and offers every picture as a button named by the picture", async () => {
    const { picker: settings } = openPicker();
    const picker = await pickerIn(settings);
    expect(within(settings).getByRole("button", { name: "You" })).toBeDefined();
    const pictures = within(picker).getByRole("group", { name: "Pictures" });
    expect(within(pictures).getAllByRole("button")).toHaveLength(PLAYER_ICON_PICTURES.length);
    expect(
      within(pictures).getByRole("button", { name: "Bat by Delapouite", pressed: true }),
    ).toBeDefined();
    expect(within(pictures).getByRole("button", { name: "Wolf head by Lorc" })).toBeDefined();
    expect(within(picker).getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  });

  it("saves the chosen picture and colours", async () => {
    const { account, picker: settings } = openPicker();
    const picker = await pickerIn(settings);
    fireEvent.click(within(picker).getByRole("button", { name: "Wolf head by Lorc" }));
    fireEvent.change(within(picker).getByLabelText("Background colour"), {
      target: { value: "#000000" },
    });
    fireEvent.change(within(picker).getByLabelText("Picture colour"), {
      target: { value: "#ffffff" },
    });
    expect(within(picker).getByRole("img", { name: "Preview" }).style.background).toBe(
      "rgb(0, 0, 0)",
    );
    fireEvent.click(within(picker).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(account.onChangeIcon).toHaveBeenCalledWith({
        picture: "lorc/wolf-head",
        background: "#000000",
        color: "#ffffff",
      });
    });
    await waitFor(() => {
      expect(within(settings).queryByRole("form", { name: "Change icon" })).toBeNull();
    });
    expect(account.onLoadAccount).toHaveBeenCalledTimes(2);
  });

  it("disables Save while the two colours are too alike", async () => {
    const { picker: settings } = openPicker();
    const picker = await pickerIn(settings);
    fireEvent.change(within(picker).getByLabelText("Picture colour"), {
      target: { value: "#1e3a8b" },
    });
    expect(within(picker).getByText("These colours are too alike.")).toBeDefined();
    expect(within(picker).getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  });

  it("shows why an icon change was refused", async () => {
    const { picker: settings } = openPicker({
      onChangeIcon: async () => Promise.resolve("icon_change_too_soon"),
    });
    const picker = await pickerIn(settings);
    fireEvent.click(within(picker).getByRole("button", { name: "Wolf head by Lorc" }));
    fireEvent.click(within(picker).getByRole("button", { name: "Save" }));
    expect(
      await within(picker).findByText("You can change your icon at most 10 times in 24 hours."),
    ).toBeDefined();
  });

  it("disables Save with the next allowed time after 10 changes in 24 hours", async () => {
    const iconWait = v.parse(UsernameWait, { allowedAt: OCTOBER_27 });
    const { picker: settings } = openPicker({
      onLoadAccount: async () =>
        Promise.resolve({
          isLoggedIn: true,
          name: "Bea",
          usernameWait: null,
          icon: TEST_PLAYER_ICON,
          iconWait,
          email: null,
          rating: null,
        }),
    });
    const picker = await pickerIn(settings);
    fireEvent.click(within(picker).getByRole("button", { name: "Wolf head by Lorc" }));
    expect(picker.textContent).toContain(
      "You have changed it 10 times in 24 hours. You can change it again on 27 October at ",
    );
    expect(within(picker).getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  });
});
