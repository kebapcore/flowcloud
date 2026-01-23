import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

// We are using a simple file-based approach as requested, but keeping this 
// for compatibility with the stack's requirements if we need it later.
// The prompt emphasized local JSON files for keys and config.

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, DB features will be disabled.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/postgres" });
export const db = drizzle(pool);
