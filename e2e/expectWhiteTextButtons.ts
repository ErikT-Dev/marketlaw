import { expect, type Locator } from "@playwright/test";

type Colour = {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
};

type ButtonColours = {
  readonly name: string;
  readonly text: string;
  readonly background: string;
};

const MAX_BUTTON_OPACITY = 0.9;
const MIN_CONTRAST = 4.5;

function coloursIn(computed: string): ReadonlyArray<Colour> {
  const rgb = [...computed.matchAll(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/gu)].map(
    ([, red = "0", green = "0", blue = "0", alpha = "1"]) => ({
      red: Number(red) / 255,
      green: Number(green) / 255,
      blue: Number(blue) / 255,
      alpha: Number(alpha),
    }),
  );
  const srgb = [
    ...computed.matchAll(/color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/gu),
  ].map(([, red = "0", green = "0", blue = "0", alpha = "1"]) => ({
    red: Number(red),
    green: Number(green),
    blue: Number(blue),
    alpha: Number(alpha),
  }));
  return [...rgb, ...srgb];
}

function linearChannelOf(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminanceOf({ red, green, blue }: Colour): number {
  return (
    0.2126 * linearChannelOf(red) + 0.7152 * linearChannelOf(green) + 0.0722 * linearChannelOf(blue)
  );
}

function whiteContrastOn(colour: Colour): number {
  return 1.05 / (luminanceOf(colour) + 0.05);
}

async function coloursOfButtons(scope: Locator): Promise<ReadonlyArray<ButtonColours>> {
  return scope.getByRole("button", { disabled: false }).evaluateAll((buttons) =>
    buttons.map((button) => {
      const style = getComputedStyle(button);
      return {
        name: button.getAttribute("aria-label") ?? button.textContent,
        text: style.color,
        background: `${style.backgroundColor} ${style.backgroundImage}`,
      };
    }),
  );
}

export async function expectWhiteTextButtons(
  scope: Locator,
  names: ReadonlyArray<string | RegExp>,
): Promise<void> {
  const buttons = await coloursOfButtons(scope);
  for (const name of names) {
    const shown = buttons.filter((button) =>
      typeof name === "string" ? button.name === name : name.test(button.name),
    );
    expect(shown, `button ${String(name)}`).not.toHaveLength(0);
    for (const button of shown) {
      expect(coloursIn(button.text), `text of ${button.name}`).toEqual([
        { red: 1, green: 1, blue: 1, alpha: 1 },
      ]);
      const backgrounds = coloursIn(button.background).filter(({ alpha }) => alpha > 0);
      expect(backgrounds, `background of ${button.name}`).not.toHaveLength(0);
      for (const background of backgrounds) {
        expect(background.alpha, `opacity of ${button.name}`).toBeLessThanOrEqual(
          MAX_BUTTON_OPACITY,
        );
        expect(whiteContrastOn(background), `contrast of ${button.name}`).toBeGreaterThanOrEqual(
          MIN_CONTRAST,
        );
      }
    }
  }
}
