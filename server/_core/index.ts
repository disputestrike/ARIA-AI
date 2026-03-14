import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { securityHeaders } from "../middleware/securityHeaders";
import { apiRateLimit } from "../middleware/rateLimit";
import { registerStripeRoutes } from "../stripe/routes";
import { registerSocialOAuthRoutes } from "../integrations/socialOAuth";
import { startPublisherCron } from "../scheduler/publisherCron";
import { uploadRouter } from "../upload";
import { runMigrations } from "./migrate";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations first (before app initializes)
  // This allows DATABASE_URL to resolve at runtime on Railway
  await runMigrations();

  const app = express();
  const server = createServer(app);

  // Security headers (applied to all routes)
  app.use(securityHeaders);

  // Stripe webhook MUST be registered before express.json() to preserve raw body
  registerStripeRoutes(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate limiting on all /api routes
  app.use("/api", apiRateLimit);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Social OAuth routes (Meta, Twitter, LinkedIn, TikTok)
  registerSocialOAuthRoutes(app);

  // File upload endpoint for ARIA chat attachments
  app.use(uploadRouter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Start the scheduled posts publisher cron (every 15 minutes)
  if (process.env.NODE_ENV !== "test") {
    startPublisherCron(15 * 60 * 1000);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
