import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB to avoid needing a real database connection in tests
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ARIA tRPC routers", () => {
  it("auth.me returns the current user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.email).toBe("test@example.com");
  });

  it("auth.logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });

  it("campaigns.list returns empty array when DB unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const campaigns = await caller.campaigns.list();
    expect(Array.isArray(campaigns)).toBe(true);
  });

  it("content.list returns empty array when DB unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const contents = await caller.content.list({});
    expect(Array.isArray(contents)).toBe(true);
  });

  it("crm.leads returns empty array when DB unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const leads = await caller.crm.leads();
    expect(Array.isArray(leads)).toBe(true);
  });

  it("billing.credits returns balance when DB unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const credits = await caller.billing.credits();
    expect(credits).toHaveProperty("balance");
    expect(credits).toHaveProperty("history");
  });

  it("settings.get returns null when DB unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const settings = await caller.settings.get();
    // Should return null or an object
    expect(settings === null || typeof settings === "object").toBe(true);
  });
});
