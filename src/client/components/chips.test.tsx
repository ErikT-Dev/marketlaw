import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PendingMarker } from "./PendingMarker";
import { PlayerBadge } from "./PlayerBadge";
import { StatChip } from "./StatChip";
import { TimerChip } from "./TimerChip";
import { TypeChip } from "./TypeChip";

describe("StatChip", () => {
  it("is an icon named after the stat and its value, with the name as tooltip", () => {
    render(<StatChip stat="buildPasses" value={2} />);
    const chip = screen.getByRole("img", { name: "Build passes 2" });
    expect(chip.textContent).toContain("Build passes");
  });
});

describe("TypeChip", () => {
  it("is an icon named after the type, with the name as tooltip", () => {
    render(<TypeChip type="Mass Transit" />);
    expect(screen.getByRole("img", { name: "Mass Transit" }).textContent).toBe("Mass Transit");
  });

  it("adds the count when one is given", () => {
    render(<TypeChip type="Retail" count={3} />);
    expect(screen.getByRole("img", { name: "Retail 3" })).toBeDefined();
  });
});

describe("TimerChip", () => {
  it("shows minutes and seconds", () => {
    render(<TimerChip label="Bank" ms={702_400} state="normal" />);
    expect(screen.getByRole("timer", { name: "Bank 11:42" })).toBeDefined();
  });

  it("never shows a negative time and says when it is paused", () => {
    render(<TimerChip label="Main phase" ms={-5_000} state="paused" />);
    expect(screen.getByRole("timer", { name: "Main phase (paused) 0:00" })).toBeDefined();
  });
});

describe("PlayerBadge", () => {
  it("shows the name, the status and the first player mark", () => {
    render(<PlayerBadge name="Ann" status="away" isFirstPlayer />);
    expect(screen.getByText("Ann")).toBeDefined();
    expect(screen.getByText("away")).toBeDefined();
    expect(screen.getByText("first player")).toBeDefined();
  });

  it("shows no status text when there is none and the rating when given", () => {
    render(<PlayerBadge name="Bo" status="none" rating={1212} />);
    expect(screen.getByText("1212")).toBeDefined();
    expect(screen.queryByText("online")).toBeNull();
  });
});

describe("PendingMarker", () => {
  it("announces the pending move", () => {
    render(<PendingMarker label="Waiting for the server..." />);
    expect(screen.getByRole("status").textContent).toBe("Waiting for the server...");
  });
});
