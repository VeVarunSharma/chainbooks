import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Type for the database instance
type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

// Lazy initialization to prevent build errors when DATABASE_URL is not set
let _db: DbInstance | null = null;
let _pool: Pool | null = null;

function getDb(): DbInstance {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure your database connection."
      );
    }
    _pool = new Pool({
      connectionString,
      max: 10, // Azure PostgreSQL tier-appropriate pool size
    });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    return getDb()[prop as keyof DbInstance];
  },
});

// Export pool for direct access if needed (e.g., for cleanup in tests)
export function getPool(): Pool | null {
  return _pool;
}

export * from "./schema";
