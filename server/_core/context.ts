import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const pathname = opts.req.path || opts.req.url;
    if (pathname.includes("/aria")) {
      console.log("[Auth] Request to /aria, checking session...");
      console.log("[Auth] Cookies header:", opts.req.headers.cookie?.substring(0, 50) + "...");
    }
    user = await sdk.authenticateRequest(opts.req);
    if (user && pathname.includes("/aria")) {
      console.log("[Auth] ✓ User authenticated:", user.email);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    const pathname = opts.req.path || opts.req.url;
    if (pathname.includes("/aria")) {
      console.log("[Auth] ✗ Authentication failed:", (error as Error).message);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
