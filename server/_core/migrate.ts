import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

/**
 * Run pending database migrations at startup
 * This allows DATABASE_URL to be available at runtime (not build time)
 * Railway's reference variables (${{ MYSQL_URL }}) resolve at runtime only
 */
export async function runMigrations() {
  if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
    console.warn("[Migrations] DATABASE_URL or MYSQL_URL not set, skipping migrations");
    return;
  }

  try {
    const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    if (!connectionUrl) {
      throw new Error("No database connection URL available");
    }

    console.log("[Migrations] Starting migration runner...");
    
    const connection = await mysql.createConnection(connectionUrl);
    const db = drizzle(connection);
    
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("[Migrations] ✓ Completed successfully");
    await connection.end();
  } catch (error) {
    console.error("[Migrations] ✗ Failed:", error);
    // Don't throw - allow app to start even if migrations fail
    // This prevents startup crashes if DB is temporarily unavailable
    console.warn("[Migrations] App will continue starting, but database may be out of sync");
  }
}
