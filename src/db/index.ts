import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return pool;
}

export const pool = new Proxy({} as Pool, {
  get(_target, property) {
    const actualPool = getPool();
    const value = Reflect.get(actualPool, property, actualPool);
    return typeof value === "function" ? value.bind(actualPool) : value;
  },
});

function createDatabase() {
  return drizzle(getPool(), { schema });
}

type Database = ReturnType<typeof createDatabase>;
let database: Database | undefined;

export const db = new Proxy({} as Database, {
  get(_target, property) {
    database ??= createDatabase();
    const value = Reflect.get(database, property, database);
    return typeof value === "function" ? value.bind(database) : value;
  },
});

export * from "./schema";
