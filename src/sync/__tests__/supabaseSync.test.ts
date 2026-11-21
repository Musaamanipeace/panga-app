import { describe, expect, it } from "vitest";
import { shouldApplyRemote, usernameToEmail, validateCredentials } from "../supabaseSync";

describe("usernameToEmail", () => {
  it("turns a username into an address on the login domain", () => {
    expect(usernameToEmail("Musa_1", "panga.invalid")).toBe("musa_1@panga.invalid");
  });
  it("keeps a real email as typed (lower-cased)", () => {
    expect(usernameToEmail("Me@Example.org", "panga.invalid")).toBe("me@example.org");
  });
});

describe("validateCredentials", () => {
  it("rejects short usernames, odd characters and short passwords", () => {
    expect(validateCredentials("ab", "longenough")).toMatch(/at least 3/);
    expect(validateCredentials("a b!", "longenough")).toMatch(/letters/);
    expect(validateCredentials("musa", "short")).toMatch(/8 characters/);
    expect(validateCredentials("musa", "longenough")).toBeNull();
  });
});

describe("shouldApplyRemote (last write wins)", () => {
  it("applies when there is no local copy or the remote is newer", () => {
    expect(shouldApplyRemote(undefined, 5)).toBe(true);
    expect(shouldApplyRemote(4, 5)).toBe(true);
  });
  it("keeps the local copy when it is newer or equal", () => {
    expect(shouldApplyRemote(5, 5)).toBe(false);
    expect(shouldApplyRemote(6, 5)).toBe(false);
  });
});
