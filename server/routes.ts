import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getStorage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import { compare, hash } from "bcryptjs";
import { scrapeURL } from "./utils/scraper";

// Initialize Hugging Face API (using new Inference Providers)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Using Llama model through HF Inference Providers for fake news detection
async function queryHuggingFace(text: string) {
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are an expert fake news detection AI. Analyze the given text and determine if it's Real, Fake, or Suspicious news. Respond ONLY with valid JSON in this exact format:
{
  "label": "Real" | "Fake" | "Suspicious",
  "confidence": <number between 0-100>,
  "explanation": "<brief 1-2 sentence explanation>"
}

Guidelines:
- If text is too short (<6 words) or lacks substance, mark as "Suspicious" with 40-55% confidence
- Only mark as "Real" or "Fake" with high confidence (>70%) if you have strong evidence
- For unclear cases, use "Suspicious" with moderate confidence`
        },
        {
          role: "user",
          content: `Analyze this text for fake news: "${text}"`
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${response.statusText} - ${error}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || "{}";
  
  // Extract JSON from response (might be wrapped in markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return JSON.parse(content);
}

const MemoryStore = createMemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize storage for production (CJS) builds
  const storageInstance = process.env.NODE_ENV === 'production' ? await getStorage() : storage;

  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: app.get("env") === "production",
        httpOnly: true,
        sameSite: "lax",
      },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
    })
  );

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      console.log('Registration attempt for username:', input.username);
      
      const existingUser = await storageInstance.getUserByUsername(input.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hash(input.password, 10);
      const user = await storageInstance.createUser({
        ...input,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session error" });
        }
        res.status(201).json(user);
      });
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        // Database connection error
        res.status(500).json({ 
          message: "Database connection failed. Please check your database configuration or try again later." 
        });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storageInstance.getUserByUsername(input.username);

      if (!user || !(await compare(input.password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session error" });
        }
        res.json(user);
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storageInstance.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  });

  // Analysis Routes
  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const { text } = api.analysis.analyze.input.parse(req.body);
      
      // Check for empty or too short text
      const words = text.trim().split(/\s+/);
      if (words.length < 3) {
        const analysisRecord = await storage.createAnalysis({
          userId: req.session.userId || null,
          text,
          label: "Suspicious",
          confidence: 45,
          explanation: "Input too short to analyze meaningfully. Please provide more context."
        });
        return res.json(analysisRecord);
      }

      // Query Hugging Face model
      const hfResult = await queryHuggingFace(text);
      
      // Parse response from LLM (returns JSON with label, confidence, explanation)
      let label = hfResult.label || "Suspicious";
      let confidence = hfResult.confidence || 50;
      let explanation = hfResult.explanation || "Unable to determine with confidence.";

      // Validate and normalize
      if (!["Real", "Fake", "Suspicious"].includes(label)) {
        label = "Suspicious";
      }
      confidence = Math.max(0, Math.min(100, confidence));

      // Save to database
      const userId = req.session.userId || null;
      const analysisRecord = await storageInstance.createAnalysis({
        userId,
        text,
        label,
        confidence,
        explanation
      });

      res.json(analysisRecord);

    } catch (err) {
      console.error("Analysis error:", err);
      res.status(500).json({ message: "Failed to analyze text. Please check your Hugging Face API key." });
    }
  });

  app.get(api.analysis.history.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const history = await storageInstance.getHistory(req.session.userId);
    
    // Apply filters if provided
    let filtered = history;
    
    if (req.query.label) {
      filtered = filtered.filter(item => item.label === req.query.label);
    }
    
    if (req.query.minConfidence || req.query.maxConfidence) {
      const min = parseInt(req.query.minConfidence as string) || 0;
      const max = parseInt(req.query.maxConfidence as string) || 100;
      filtered = filtered.filter(item => item.confidence >= min && item.confidence <= max);
    }
    
    if (req.query.search) {
      const searchTerm = (req.query.search as string).toLowerCase();
      filtered = filtered.filter(item => item.text.toLowerCase().includes(searchTerm));
    }
    
    res.json(filtered);
  });

  // URL Analysis endpoint
  app.post("/api/analyze-url", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL is required" });
      }

      // Scrape URL content
      const { title, content } = await scrapeURL(url);
      
      // Analyze the scraped content
      const analysisText = `${title}\n${content}`.substring(0, 1000);
      
      // Get analysis from Hugging Face
      const analysis = await queryHuggingFace(analysisText);
      const { label, confidence, explanation } = analysis;

      // Save to database
      const userId = req.session.userId || null;
      const analysisRecord = await storage.createAnalysis({
        userId,
        text: `URL: ${url}\n\n${analysisText}`,
        label,
        confidence,
        explanation
      });

      res.json({
        ...analysisRecord,
        sourceUrl: url,
        sourceTitle: title
      });

    } catch (err) {
      console.error("URL analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ message: `Failed to analyze URL: ${errorMessage}` });
    }
  });

  // Export endpoint
  app.get("/api/export", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const format = (req.query.format as string) || "json";
      const history = await storageInstance.getHistory(req.session.userId);

      if (format === "csv") {
        // Convert to CSV
        const headers = ["ID", "Label", "Confidence", "Text", "Explanation", "Date"];
        const rows = history.map(item => [
          item.id,
          item.label,
          item.confidence,
          `"${item.text.replace(/"/g, '""')}"`,
          `"${item.explanation.replace(/"/g, '""')}"`,
          new Date(item.createdAt || Date.now()).toISOString()
        ]);

        const csv = [headers, ...rows]
          .map(row => row.join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=analysis-results.csv");
        res.send(csv);
      } else {
        // JSON format
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=analysis-results.json");
        res.json({
          exportDate: new Date().toISOString(),
          count: history.length,
          analyses: history
        });
      }
    } catch (err) {
      console.error("Export error:", err);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Seeding - with error handling to prevent startup failures
  if (app.get("env") === "development") {
    try {
      const existingUser = await storageInstance.getUserByUsername("demo");
      if (!existingUser) {
        const hashedPassword = await hash("demo123", 10);
        const user = await storageInstance.createUser({
          username: "demo",
          password: hashedPassword,
        });
        console.log("Seeded demo user: demo / demo123");

        await storageInstance.createAnalysis({
          userId: user.id,
          text: "Breaking: Scientists discover water on the sun!",
          label: "Fake",
          confidence: 99,
          explanation: "This claim is scientifically impossible as the sun's surface temperature is far too high for liquid water to exist."
        });
      }
    } catch (error) {
      console.warn("Warning: Could not seed demo data. Database might not be accessible:", error.message);
      console.warn("Server will continue without seeded data.");
    }
  }

  return httpServer;
}
