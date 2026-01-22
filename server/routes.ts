import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const ACCESS_KEY = process.env.ACCESS_KEY;

  // Middleware to check access key
  const checkAuth = (req: any, res: any, next: any) => {
    const providedKey = req.headers['x-access-key'] || req.query.accessKey;
    const ACCESS_KEY = process.env.ACCESS_KEY;
    
    if (providedKey && providedKey === ACCESS_KEY) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized: Invalid or missing access key" });
    }
  };

  // Serve specific file by name
  app.get("/api/files/path/:file", checkAuth, async (req, res) => {
    try {
      const { file } = req.params;
      const path = await import("path");
      const fs = await import("fs/promises");
      
      // Render-compatible path using process.cwd()
      const filePath = path.join(process.cwd(), "client", "public", "src", "files", file);

      try {
        await fs.access(filePath);
        res.sendFile(filePath);
      } catch (err) {
        res.status(404).json({ message: `File not found: ${file}` });
      }
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Auth Route
  app.post(api.auth.verify.path, (req, res) => {
    try {
      const { accessKey } = api.auth.verify.input.parse(req.body);
      if (accessKey === ACCESS_KEY) {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid Access Key" });
      }
    } catch (err) {
      res.status(400).json({ message: "Invalid Request" });
    }
  });

  // Files Routes
  app.get(api.files.list.path, checkAuth, async (req, res) => {
    const parentId = req.query.parentId ? Number(req.query.parentId) : undefined;
    const files = await storage.getFiles(parentId);
    res.json(files);
  });

  // Dynamic path access
  app.get(/^\/api\/files\/path(?:\/(.*))?$/, checkAuth, async (req: any, res: any) => {
    // req.params[0] will be the captured path after /api/files/path/
    const fullPath = req.params[0] ? `/${req.params[0]}` : "/";
    
    const file = await storage.getFileByPath(fullPath);
    if (!file) {
      return res.status(404).send("");
    }
    
    if (file.type === 'folder') {
      const children = await storage.getFiles(file.id);
      res.json(children);
    } else {
      // Generate 20-character access key if it doesn't exist
      if (!file.accessKey) {
        const crypto = await import("crypto");
        const key = crypto.randomBytes(10).toString('hex');
        await storage.updateFile(file.id, { accessKey: key });
        file.accessKey = key;
      }
      res.json(file);
    }
  });

  // Public File Access /files/filename.txt?key=KEY
  app.get("/files/:filename", async (req, res) => {
    const { filename } = req.params;
    const { key } = req.query;

    if (!key) {
      return res.status(401).send(""); // White screen
    }

    const file = await storage.getFileByAccessKey(key as string);
    if (!file || file.name !== filename) {
      return res.status(404).send("");
    }

    const path = await import("path");
    const fs = await import("fs/promises");
    const filePath = path.join(process.cwd(), "client", "public", "src", "files", file.name);

    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch (err) {
      res.status(404).send("");
    }
  });

  app.post(api.files.create.path, checkAuth, async (req, res) => {
    try {
      const input = api.files.create.input.parse(req.body);
      const file = await storage.createFile(input);
      res.status(201).json(file);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.files.delete.path, checkAuth, async (req, res) => {
    res.status(403).json({ message: "Delete operation is disabled. Files are managed via src/files directory." });
  });

  // Sync with physical files on startup
  await syncPhysicalFiles();
  
  // Seed database (only if sync didn't find anything)
  // await seedDatabase();

  return httpServer;
}

async function syncPhysicalFiles() {
  const fs = await import("fs/promises");
  const path = await import("path");
  
  const targetDir = path.join(process.cwd(), "client", "public", "src", "files");
  
  try {
    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });
    
    // Read items
    const items = await fs.readdir(targetDir, { withFileTypes: true });
    console.log("Found physical items:", items.map(i => i.name));

    // Clear existing DB records
    const { db } = await import("./db");
    const { files } = await import("@shared/schema");
    await db.delete(files);

    for (const item of items) {
      if (item.name === ".gitkeep") continue;
      
      const itemPath = path.join(targetDir, item.name);
      const stats = await fs.stat(itemPath);
      
      await storage.createFile({
        name: item.name,
        type: item.isDirectory() ? "folder" : "file",
        size: item.isDirectory() ? "--" : `${(stats.size / 1024).toFixed(1)} KB`,
        parentId: null,
        path: `/${item.name}`
      });
      console.log(`Synced: ${item.name}`);
    }
  } catch (err) {
    console.error("Failed to sync physical files:", err);
  }
}

async function seedDatabase() {
  const existingFiles = await storage.getFiles();
  if (existingFiles.length === 0) {
    console.log("Seeding database...");
    
    // Create folders
    const projectFolder = await storage.createFile({
      name: "Project Alpha",
      type: "folder",
      size: "--",
      parentId: null
    });

    await storage.createFile({
      name: "Personal",
      type: "folder",
      size: "--",
      parentId: null
    });

    // Create files
    await storage.createFile({
      name: "resume.pdf",
      type: "file",
      size: "2.4 MB",
      parentId: null
    });

    await storage.createFile({
      name: "budget_2024.xlsx",
      type: "file",
      size: "1.1 MB",
      parentId: null
    });

    // Nested file
    await storage.createFile({
      name: "specs_v1.docx",
      type: "file",
      size: "450 KB",
      parentId: projectFolder.id
    });
    
    console.log("Database seeded!");
  }
}
