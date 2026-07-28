import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
};

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => ({ auth: mockAuth }),
}));

// Imported after the mock is registered.
import { supabaseAuthService } from "./supabaseAuthService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("supabaseAuthService.signUp", () => {
  it("stores full name and maps an admin email to the admin role", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "ada@admin.nella",
          user_metadata: { full_name: "Ada Lovelace" },
        },
        session: { access_token: "tok" },
      },
      error: null,
    });

    const session = await supabaseAuthService.signUp(
      "Ada Lovelace",
      "ada@admin.nella",
      "password123",
    );

    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "ada@admin.nella",
      password: "password123",
      options: { data: { full_name: "Ada Lovelace" } },
    });
    expect(session.user).toEqual({
      id: "u1",
      email: "ada@admin.nella",
      fullName: "Ada Lovelace",
      role: "admin",
    });
    expect(session.token).toBe("tok");
  });

  it("throws when Supabase returns an error", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error("User already registered"),
    });

    await expect(
      supabaseAuthService.signUp("Bob", "bob@example.com", "password123"),
    ).rejects.toThrow(/already registered/i);
  });
});

describe("supabaseAuthService.login", () => {
  it("maps a normal email to the shopper role", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "u2",
          email: "bob@example.com",
          user_metadata: { full_name: "Bob Shopper" },
        },
        session: { access_token: "tok2" },
      },
      error: null,
    });

    const session = await supabaseAuthService.login("bob@example.com", "password123");
    expect(session.user.role).toBe("shopper");
    expect(session.user.fullName).toBe("Bob Shopper");
  });
});

describe("supabaseAuthService.getSession", () => {
  it("returns null when there is no active session", async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    expect(await supabaseAuthService.getSession()).toBeNull();
  });
});
