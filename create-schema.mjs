import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

config();

// Define schema directly
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  label: text("label").notNull(),
  confidence: integer("confidence").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

console.log("🔧 Creating database tables...");

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

try {
  // Create tables manually using SQL
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `;
  console.log("✅ Created users table");

  await sql`
    CREATE TABLE IF NOT EXISTS analysis (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      text TEXT NOT NULL,
      label TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✅ Created analysis table");

  // Verify tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  
  console.log("\n📋 All tables:");
  tables.forEach(t => console.log("  -", t.table_name));
  
  console.log("\n✅ Database schema created successfully!");
  process.exit(0);
} catch (error) {
  console.error("❌ Error creating schema:", error.message);
  process.exit(1);
}
