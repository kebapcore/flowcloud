import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import fs from "fs";
import path from "path";
import { z } from "zod";

import crypto from "crypto";

// Configuration paths
const ROOT_DIR = process.cwd();
const FILES_DIR = path.join(ROOT_DIR, "src", "files");
const KEYS_FILE = path.join(ROOT_DIR, "keys.json");
const ALLOWED_FILE = path.join(ROOT_DIR, "allowed.json");

// Ensure files directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(path.join(ROOT_DIR, "src"), { recursive: true });
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Helpers to read/write config
function getKeysConfig(): Record<string, string[]> {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const content = fs.readFileSync(KEYS_FILE, "utf-8");
      const data = JSON.parse(content);
      // Migrate old format (string) to new format (string[]) if needed
      const migrated: Record<string, string[]> = {};
      for (const [file, val] of Object.entries(data)) {
        migrated[file] = Array.isArray(val) ? val : [val as string];
      }
      return migrated;
    }
  } catch (e) {
    console.error("Error reading keys.json", e);
  }
  return {};
}

function saveKeysConfig(config: Record<string, string[]>) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error("Error saving keys.json", e);
  }
}

function getAllowedConfig() {
  try {
    if (fs.existsSync(ALLOWED_FILE)) {
      return JSON.parse(fs.readFileSync(ALLOWED_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading allowed.json", e);
  }
  return { allowedHosts: [], devMode: false };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // CORS and Access Control Middleware
  app.use((req, res, next) => {
    const config = getAllowedConfig();
    const origin = req.headers.origin;

    // Allow /test, API routes, and file routes. 404 the rest (including root)
    const isAllowedPath = 
      req.path === "/test" || 
      req.path.startsWith("/api/") || 
      req.path.startsWith("/files/") ||
      // Essential static assets for the frontend to function
      req.path.startsWith("/@") || 
      req.path.startsWith("/src/") || 
      req.path.startsWith("/node_modules/") ||
      req.path.endsWith(".js") ||
      req.path.endsWith(".css") ||
      req.path.endsWith(".ico") ||
      req.path.endsWith(".png");

    if (!isAllowedPath) {
      return res.status(404).send("Not Found");
    }
    
    if (req.path === "/test" && !config.devMode) {
      return res.status(404).send("Not Found");
    }

    // CORS logic
    if (origin && config.allowedHosts.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-key");
    } else if (config.devMode) {
       // In dev mode, allow all or just log it. 
       // For now, let's strictly follow "allowed.json hosts allow, others block"
       // But if we are accessing /test locally, we might need to be lenient for same-origin
    }

    next();
  });

  // API Route: Get File Metadata
  // Using Regex to avoid path-to-regexp version issues
  app.get(/^\/api\/files\/(.+)$/, async (req, res) => {
    // Explicitly prevent access to internal JSON files
    const fullPath = req.params[0];
    if (fullPath.includes("keys.json") || fullPath.includes("allowed.json")) {
      return res.status(404).send("Not Found");
    }

    // Trim any trailing slash or whitespace from the raw capture group
    const rawPath = fullPath.replace(/\/$/, '').trim(); 
    
    if (!rawPath) {
      return res.status(404).json({ message: "File not specified" });
    }

    const accessKeyHeader = req.headers["x-access-key"];
    const systemKey = process.env.SYSTEM_ACCESS_KEY;

    // First, verify the System Access Key (e.g. 444)
    if (!systemKey || accessKeyHeader !== systemKey) {
      return res.status(403).json({ message: "Invalid system access key" });
    }

    const keys = getKeysConfig();
    
    // Normalize path: decode and remove trailing asterisk (if any)
    const decodedPath = decodeURIComponent(rawPath);
    const safePath = decodedPath.replace(/\*$/, '');
    
    // Check if file actually exists on disk before generating a key
    const diskPath = path.join(FILES_DIR, safePath);
    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Generate a new unique preview key for this request
    const newPreviewKey = crypto.randomBytes(10).toString('hex');
    
    if (!keys[safePath]) {
      keys[safePath] = [];
    }
    keys[safePath].push(newPreviewKey);
    saveKeysConfig(keys);

    const stats = fs.statSync(diskPath);
    
    // Construct response
    const response = {
      id: 21, 
      name: path.basename(safePath),
      type: "file",
      parentId: null,
      path: "/" + safePath,
      size: formatSize(stats.size),
      accessKey: newPreviewKey, // Return the newly generated key
      createdAt: new Date().toISOString()
    };

    res.json(response);
  });

  // Raw File Access Route
  // format: /files/path/to/file?key=...
  app.get(/^\/files\/(.+)$/, async (req, res) => {
    // Explicitly prevent access to internal JSON files
    const fullPath = req.params[0];
    if (fullPath.includes("keys.json") || fullPath.includes("allowed.json")) {
      return res.status(404).send("Not Found");
    }

    const rawPath = fullPath.replace(/\/$/, '').trim();
    const queryKey = req.query.key as string;
    
    if (!rawPath) return res.status(404).send("Not Found");

    const decodedPath = decodeURIComponent(rawPath);
    const safePath = decodedPath.replace(/\*$/, '');
    const keys = getKeysConfig();
    const validKeys = keys[safePath] || [];

    if (!validKeys.includes(queryKey)) {
      return res.status(404).send("Not Found"); 
    }

    const diskPath = path.join(FILES_DIR, safePath);
    if (!fs.existsSync(diskPath)) {
      return res.status(404).send("Not Found");
    }

    res.sendFile(diskPath);
  });

  return httpServer;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  const k = 1024;
  const sizes = ["KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i - 1];
}
