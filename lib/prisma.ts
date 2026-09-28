import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@/app/generated/prisma/client";

// Cloudflare D1 (binding name: DB, see wrangler.jsonc).
// One PrismaClient per D1 binding object, reused within the same Worker isolate.
const clients = new WeakMap<D1Database, PrismaClient>();

export function getPrisma(): PrismaClient {
  const { env } = getCloudflareContext();
  const db = env.DB as D1Database;
  let client = clients.get(db);
  if (!client) {
    client = new PrismaClient({ adapter: new PrismaD1(db) });
    clients.set(db, client);
  }
  return client;
}
