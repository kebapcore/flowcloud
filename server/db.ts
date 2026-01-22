import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function runMigrations() {
  console.log("Running migrations...");
  try {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const path = await import("path");
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    console.log("Migrations completed successfully");
  } catch (err: any) {
    if (err.code === '42P07') {
      console.log("Migrations already applied (relation exists)");
    } else {
      console.error("Migration failed:", err);
    }
  }
}
