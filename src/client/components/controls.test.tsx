import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { Tab } from "./Tab";
import { TextInput } from "./TextInput";
import { Toast } from "./Toast";

describe("Modal", () => {
  it("is a modal dialog named by its title", () => {
    render(
      <Modal title="Projects" size="large">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Projects" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.textContent).toContain("Body");
  });
});

describe("Toast", () => {
  it("is an alert for errors and closes with its close button", () => {
    const onClose = vi.fn();
    render(<Toast kind="error" title="Move rejected" text="Not your turn" onClose={onClose} />);
    expect(screen.getByRole("alert").textContent).toContain("Not your turn");
    fireEvent.click(screen.getByRole("button", { name: "Close: Move rejected" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("is a status message for everything else", () => {
    render(<Toast kind="success" title="Saved" text="Done" onClose={vi.fn()} />);
    expect(screen.getByRole("status")).toBeDefined();
  });
});

describe("Tab", () => {
  it("is a tab that reports selection and shows the unread count", () => {
    const onSelect = vi.fn();
    render(<Tab label="Chat" isSelected={false} onSelect={onSelect} count={2} />);
    const tab = screen.getByRole("tab", { name: "Chat, 2 new" });
    expect(tab.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(tab);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("hides a zero count", () => {
    render(<Tab label="Draw log" isSelected onSelect={vi.fn()} count={0} />);
    expect(screen.getByRole("tab", { name: "Draw log" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});

describe("TextInput", () => {
  it("is labelled, reports changes and is described by its hint", () => {
    const onChange = vi.fn();
    render(<TextInput label="Username" value="" onChange={onChange} hint="3 to 20 characters" />);
    const input = screen.getByRole("textbox", {
      name: "Username",
      description: "3 to 20 characters",
    });
    expect(input.getAttribute("aria-invalid")).toBe("false");
    fireEvent.change(input, { target: { value: "Ann" } });
    expect(onChange).toHaveBeenCalledWith("Ann");
  });

  it("shows an error instead of the hint and is marked invalid", () => {
    render(
      <TextInput label="Username" value="A" onChange={vi.fn()} hint="hint" error="Too short" />,
    );
    const input = screen.getByRole("textbox", { name: "Username", description: "Too short" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
