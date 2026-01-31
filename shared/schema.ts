import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional for guest mode if we supported tracking guests, but requirement says "History section (for logged-in users)"
  text: text("text").notNull(),
  label: text("label").notNull(), // "Real", "Fake", "Suspicious"
  confidence: integer("confidence").notNull(), // 0-100
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(analysis),
}));

export const analysisRelations = relations(analysis, ({ one }) => ({
  user: one(users, {
    fields: [analysis.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAnalysisSchema = createInsertSchema(analysis).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Analysis = typeof analysis.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// API Types
export type AuthResponse = { user: User }; // Simple user object
export type AnalyzeRequest = { text: string };
export type AnalyzeResponse = Analysis;
