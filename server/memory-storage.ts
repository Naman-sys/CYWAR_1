import { type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";
import { IStorage } from "./storage";

// In-memory storage as fallback when database is unavailable
export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private analyses: Map<number, Analysis> = new Map();
  private userIdCounter = 1;
  private analysisIdCounter = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
      password: insertUser.password,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const analysis: Analysis = {
      id: this.analysisIdCounter++,
      userId: insertAnalysis.userId ?? null,
      text: insertAnalysis.text,
      label: insertAnalysis.label,
      confidence: insertAnalysis.confidence,
      explanation: insertAnalysis.explanation,
      createdAt: new Date(),
    };
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async getHistory(userId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
}
