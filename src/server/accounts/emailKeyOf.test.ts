import { describe, expect, it } from "vitest";
import { emailKeyOf } from "./emailKeyOf";

describe("emailKeyOf", () => {
  it("ignores capital letters", () => {
    expect(emailKeyOf("Name@Example.COM")).toBe(emailKeyOf("name@example.com"));
  });

  it("ignores a part starting with a plus sign just before the at sign", () => {
    expect(emailKeyOf("name+1@example.com")).toBe("name@example.com");
    expect(emailKeyOf("name+a+b@example.com")).toBe("name@example.com");
  });

  it("keeps dots for addresses outside gmail", () => {
    expect(emailKeyOf("j.ohn@example.com")).toBe("j.ohn@example.com");
    expect(emailKeyOf("j.ohn@example.com")).not.toBe(emailKeyOf("john@example.com"));
  });

  it("counts googlemail as gmail and ignores dots before the at sign for both", () => {
    expect(emailKeyOf("j.ohn@googlemail.com")).toBe("john@gmail.com");
    expect(emailKeyOf("J.o.hn+games@GMail.com")).toBe("john@gmail.com");
  });

  it("keeps different addresses apart", () => {
    expect(emailKeyOf("john@example.com")).not.toBe(emailKeyOf("john@example.org"));
    expect(emailKeyOf("john@gmail.com")).not.toBe(emailKeyOf("jon@gmail.com"));
  });
});
