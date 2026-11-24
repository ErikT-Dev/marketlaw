import { describe, expect, it } from "vitest";
import { tutorialMessagePlacementOf } from "./tutorialMessagePlacementOf";

const COLUMN = { left: 16, top: 60, right: 316, bottom: 700 };
const TABLE = { left: 0, top: 60, right: 1280, bottom: 720 };
const RIGHT_COLUMN = { left: 864, top: 60, right: 1264, bottom: 700 };

describe("the tutorial message placement", () => {
  it("puts the message left of the highlighted part with its middle level with it", () => {
    const placement = tutorialMessagePlacementOf({
      highlighted: { left: 900, top: 400, right: 1000, bottom: 500 },
      highlightedColumn: { left: 896, top: 60, right: 1264, bottom: 700 },
      column: COLUMN,
      table: TABLE,
      bigCard: null,
      boxHeight: 200,
      windowHeight: 720,
    });
    expect(placement.boxWidth).toBe(300);
    expect(placement.boxTop).toBe(350);
    expect(placement.boxLeft + placement.boxWidth).toBe(placement.arrowLeft);
    expect(placement.arrowRight).toBe(894);
    expect(placement.arrowRight - placement.arrowLeft).toBe(28);
    expect(placement.arrowY).toBe(450);
  });

  it("keeps the message inside the window below the top bar", () => {
    const placement = tutorialMessagePlacementOf({
      highlighted: { left: 900, top: 680, right: 1000, bottom: 710 },
      highlightedColumn: RIGHT_COLUMN,
      column: COLUMN,
      table: TABLE,
      bigCard: null,
      boxHeight: 300,
      windowHeight: 720,
    });
    expect(placement.boxTop).toBe(412);
    expect(placement.arrowY).toBe(692);
  });

  it("keeps the message out of the column of the highlighted part", () => {
    const placement = tutorialMessagePlacementOf({
      highlighted: { left: 1060, top: 400, right: 1200, bottom: 500 },
      highlightedColumn: RIGHT_COLUMN,
      column: COLUMN,
      table: TABLE,
      bigCard: null,
      boxHeight: 200,
      windowHeight: 720,
    });
    expect(placement.boxLeft + placement.boxWidth).toBe(836);
    expect(placement.arrowRight).toBe(1054);
  });

  it("moves left of a big card shown beside the highlighted card", () => {
    const placement = tutorialMessagePlacementOf({
      highlighted: { left: 900, top: 500, right: 1000, bottom: 560 },
      highlightedColumn: RIGHT_COLUMN,
      column: COLUMN,
      table: TABLE,
      bigCard: { left: 540, top: 200, right: 884, bottom: 700 },
      boxHeight: 200,
      windowHeight: 720,
    });
    expect(placement.boxLeft + placement.boxWidth).toBe(512);
    expect(placement.arrowRight).toBe(894);
  });
});
