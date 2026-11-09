import { describe, expect, it } from "vitest";
import { signupProblem } from "./signupProblem";

const SIGNUP = { name: "Ann Mayor", email: "player@example.com", password: "correct horse" };

function checksOf(isHuman: boolean, isTaken = false) {
  return {
    isHuman: () => Promise.resolve(isHuman),
    isTaken: () => Promise.resolve(isTaken),
  };
}

describe("signupProblem", () => {
  it("accepts a valid signup that passed the human check", async () => {
    expect(await signupProblem(SIGNUP, checksOf(true))).toBeNull();
  });

  it("checks the human check before anything else", async () => {
    const everythingWrong = { name: "A", email: "x", password: "short" };
    expect(await signupProblem(everythingWrong, checksOf(false, true))).toBe("human_check_failed");
  });

  it("checks the username before the email address", async () => {
    expect(await signupProblem({ ...SIGNUP, name: "A", email: "x" }, checksOf(true))).toBe(
      "username_invalid",
    );
    expect(await signupProblem({ ...SIGNUP, email: "x" }, checksOf(true, true))).toBe(
      "username_taken",
    );
  });

  it("checks the email address before the password", async () => {
    expect(await signupProblem({ ...SIGNUP, email: "x", password: "short" }, checksOf(true))).toBe(
      "email_invalid",
    );
    expect(await signupProblem({ ...SIGNUP, password: "short" }, checksOf(true))).toBe(
      "password_invalid",
    );
  });
});
