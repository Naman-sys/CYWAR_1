import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Load environment variables
config();

// Configure Neon for better connection handling
neonConfig.fetchConnectionCache = true;
neonConfig.fetchEndpoint = (host) => {
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
};

const rawDatabaseUrl = process.env.DATABASE_URL;

function removeQueryParam(url: string, param: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete(param);
    return parsed.toString();
  } catch {
    return url.replace(`&${param}=require`, "").replace(`?${param}=require`, "?").replace(/\?$/, "");
  }
}

const cleanDatabaseUrl = rawDatabaseUrl
  ? removeQueryParam(rawDatabaseUrl, "channel_binding")
  : null;

if (!cleanDatabaseUrl) {
  console.warn("⚠️  DATABASE_URL is not set. Database features will be unavailable.");
}

// Use Neon HTTP driver to avoid TCP timeouts
const sql = cleanDatabaseUrl ? neon(cleanDatabaseUrl) : null;

export const db = sql
  ? drizzle(sql)
  : (new Proxy(
      {},
      {
        get() {
          throw new Error("DATABASE_URL is not set or invalid.");
        },
      },
    ) as ReturnType<typeof drizzle>);
