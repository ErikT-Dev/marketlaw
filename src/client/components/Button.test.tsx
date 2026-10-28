import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("calls its action when clicked", () => {
    const onClick = vi.fn();
    render(
      <Button look="primary" onClick={onClick}>
        End turn
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "End turn" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button look="secondary" onClick={onClick} isDisabled>
        Undo
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Undo" });
    fireEvent.click(button);
    expect(button).toHaveProperty("disabled", true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows its loading label and is busy and disabled while loading", () => {
    render(
      <Button look="primary" loadingLabel="Creating room...">
        Create room
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Creating room..." });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button).toHaveProperty("disabled", true);
    expect(screen.queryByRole("button", { name: "Create room" })).toBeNull();
  });

  it("submits its form when it is a submit button", () => {
    render(
      <Button look="primary" isSubmit>
        Join
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Join" }).getAttribute("type")).toBe("submit");
  });
});
