import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";

// Configuration paths
const ROOT_DIR = process.cwd();
const FILES_DIR = path.join(ROOT_DIR, "src", "files");
const ALLOWED_FILE = path.join(ROOT_DIR, "allowed.json");

// Ensure files directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(path.join(ROOT_DIR, "src"), { recursive: true });
  fs.mkdirSync(FILES_DIR, { recursive: true });
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
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-App-Request");
      res.header("Access-Control-Allow-Credentials", "false"); // Credentials closed as requested
    }

    next();
  });

  // Verification Endpoint (For other servers to verify us)
  app.get("/flowcloud-auth", (req, res) => {
    // Only return the key if it exists
    if (!process.env.SYSTEM_ACCESS_KEY) {
      return res.status(404).send("Not Configured");
    }
    // Return the key as plain text
    res.send(process.env.SYSTEM_ACCESS_KEY);
  });

  // Secure Proxy File Endpoint
  app.get("/api/proxy/files/:filename", async (req, res) => {
    const filename = req.params.filename;
    const origin = req.headers.origin;
    const appRequestHeader = req.headers["x-app-request"];
    const config = getAllowedConfig();

    // Security Check 1: Origin (if present)
    if (origin && !config.allowedHosts.includes(origin)) {
      return res.status(404).send("Not Found");
    }

    // Security Check 2: X-App-Request Header
    if (appRequestHeader !== "1") {
      return res.status(404).send("Not Found");
    }

    // Security Check 3: SYSTEM_ACCESS_KEY (Server-side only)
    if (!process.env.SYSTEM_ACCESS_KEY) {
      return res.status(404).send("Not Found");
    }

    // Security Check 4: Origin Verification (Server-to-Server)
    // We ask the Origin server: "Do you have the SYSTEM_ACCESS_KEY?"
    if (!origin) {
      // If no origin (e.g. direct curl), we cannot verify, so we deny.
      return res.status(403).send("Forbidden: No Origin");
    }

    try {
      // Construct the verification URL
      // Assuming the Origin implements /flowcloud-auth
      const verifyUrl = `${origin}/flowcloud-auth`;

      const verifyRes = await fetch(verifyUrl);
      if (!verifyRes.ok) {
        console.log(`Verification failed for ${origin}: Status ${verifyRes.status}`);
        return res.status(403).send("Forbidden: Verification Failed");
      }

      const remoteKey = await verifyRes.text();
      // Trim whitespace just in case
      if (remoteKey.trim() !== process.env.SYSTEM_ACCESS_KEY) {
        console.log(`Verification failed for ${origin}: Key mismatch`);
        return res.status(403).send("Forbidden: Invalid Verification Key");
      }
    } catch (err) {
      console.error(`Verification error for ${origin}:`, err);
      return res.status(403).send("Forbidden: Verification Error");
    }

    // Explicitly prevent access to internal JSON files
    if (filename.includes("keys.json") || filename.includes("allowed.json")) {
      return res.status(404).send("Not Found");
    }

    const safeFilename = filename.replace(/\/$/, '').trim();
    if (!safeFilename) {
      return res.status(404).json({ message: "File not specified" });
    }

    // Path traversal protection
    const decodedPath = decodeURIComponent(safeFilename);
    const safePath = decodedPath.replace(/\.\./g, ''); // Simple protection

    const diskPath = path.join(FILES_DIR, safePath);

    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(diskPath);
  });

  return httpServer;
}

