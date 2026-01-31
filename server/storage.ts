import { users, analysis, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { neon, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

// Configure Neon for better performance
neonConfig.fetchConnectionCache = true;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getHistory(userId: number): Promise<Analysis[]>;
}

// Use direct Neon SQL instead of Drizzle to avoid HTTP API parsing issues
export class NeonDirectStorage implements IStorage {
  public sql: ReturnType<typeof neon>;

  constructor(connectionString: string) {
    this.sql = neon(connectionString);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.sql`SELECT * FROM users WHERE id = ${id}` as unknown as User[];
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.sql`SELECT * FROM users WHERE username = ${username}` as unknown as User[];
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.sql`
      INSERT INTO users (username, password)
      VALUES (${insertUser.username}, ${insertUser.password})
      RETURNING *
    ` as unknown as User[];
    return result[0];
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const result = await this.sql`
      INSERT INTO analysis (user_id, text, label, confidence, explanation)
      VALUES (${insertAnalysis.userId}, ${insertAnalysis.text}, ${insertAnalysis.label}, ${insertAnalysis.confidence}, ${insertAnalysis.explanation})
      RETURNING *
    ` as unknown as Analysis[];
    return result[0];
  }

  async getHistory(userId: number): Promise<Analysis[]> {
    const results = await this.sql`
      SELECT * FROM analysis
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return results as Analysis[];
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('getUser error:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('getUserByUsername error:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('createUser error:', error);
      throw error;
    }
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    try {
      const [result] = await db.insert(analysis).values(insertAnalysis).returning();
      return result;
    } catch (error) {
      console.error('createAnalysis error:', error);
      throw error;
    }
  }

  async getHistory(userId: number): Promise<Analysis[]> {
    try {
      return db
        .select()
        .from(analysis)
        .where(eq(analysis.userId, userId))
        .orderBy(desc(analysis.createdAt));
    } catch (error) {
      console.error('getHistory error:', error);
      throw error;
    }
  }
}

// Try to use database, but fallback to memory storage if connection fails
import { MemoryStorage } from "./memory-storage";

let usingMemoryStorage = false;

// Test database connection
async function initStorage(): Promise<IStorage> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️  DATABASE_URL not set. Using in-memory storage (data will not persist)");
      usingMemoryStorage = true;
      return new MemoryStorage();
    }
    
    console.log('🔄 Testing database connection...');
    // Use NeonDirectStorage instead of DatabaseStorage to avoid Drizzle HTTP API issues
    const neonStorage = new NeonDirectStorage(process.env.DATABASE_URL);
    
    // Test the connection with a simple query
    await Promise.race([
      neonStorage.sql`SELECT 1 as test`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    console.log('✅ Using Neon database storage (direct SQL)');
    return neonStorage;
  } catch (error) {
    const err = error as Error;
    console.error('❌ Database connection error:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
    console.warn('⚠️  Database unavailable, using in-memory storage (data will not persist)');
    usingMemoryStorage = true;
    return new MemoryStorage();
  }
}

// Export storage initialization for both ESM and CJS
let storagePromise: Promise<IStorage> | null = null;
let storageInstanceCache: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (!storagePromise) {
    storagePromise = initStorage();
    storageInstanceCache = await storagePromise;
  }
  return storageInstanceCache!;
}

// Legacy export for backward compatibility (will throw in production if not initialized)
export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!storageInstanceCache) {
      throw new Error('Storage not initialized. Use getStorage() instead.');
    }
    return storageInstanceCache[prop as keyof IStorage];
  }
});

export { usingMemoryStorage };
