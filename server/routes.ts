import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

    // Only allow API routes. Block everything else (Frontend, Test, etc.)
    const isAllowedPath = req.path.startsWith("/api/");

    if (!isAllowedPath) {
      // Return empty 404 to trigger browser's default error page
      return res.status(404).end();
    }

    // CORS logic
    // If devMode is on, allow all origins. Otherwise check allowedHosts.
    if (config.devMode || (origin && config.allowedHosts.includes(origin))) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-App-Request, x-flowcloud-challenge, x-flowcloud-signature, x-flowcloud-date");
      res.header("Access-Control-Allow-Credentials", "false"); // Credentials closed as requested
    }

    next();
  });

  // Secure Proxy File Endpoint
  app.get("/api/proxy/files/:filename", async (req, res) => {
    const filename = req.params.filename;
    const origin = req.headers.origin;
    const appRequestHeader = req.headers["x-app-request"];
    const config = getAllowedConfig();

    // Security Check 1: Origin (Strict Check)
    // The origin MUST be in the allowed.json list OR devMode must be enabled.
    if (!config.devMode && (!origin || !config.allowedHosts.includes(origin))) {
      return res.status(403).send("Forbidden: Origin not allowed");
    }

    // Security Check 2: X-App-Request Header
    if (appRequestHeader !== "1") {
      return res.status(404).send("Not Found");
    }

    // Security Check 3: SYSTEM_ACCESS_KEY (Server-side only)
    if (!process.env.SYSTEM_ACCESS_KEY) {
      return res.status(404).send("Not Found");
    }

    // Security Check 4: Signed Request Verification
    // Instead of callback, we verify the signature sent by the requester.
    const signature = req.headers["x-flowcloud-signature"] as string;
    const timestamp = req.headers["x-flowcloud-date"] as string;

    if (!signature || !timestamp) {
      return res.status(403).send("Forbidden: Signature Missing");
    }

    // 4a. Verify Timestamp (Prevent Replay Attacks)
    // Allow requests within 5 minutes window
    const reqTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (isNaN(reqTime) || Math.abs(now - reqTime) > 5 * 60 * 1000) {
      return res.status(403).send("Forbidden: Request Expired");
    }

    // 4b. Verify Signature
    // Format: timestamp:filename
    const payload = `${timestamp}:${filename}`;
    const hmac = crypto.createHmac('sha256', process.env.SYSTEM_ACCESS_KEY);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Timing-safe comparison
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return res.status(403).send("Forbidden: Invalid Signature");
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
