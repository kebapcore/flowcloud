import * as path from "path";
import * as esbuild from "esbuild";

async function build() {
  console.log("Starting Deno-compatible build...");
  
  try {
    // Build server
    await esbuild.build({
      entryPoints: ["server/index.ts"],
      bundle: true,
      platform: "node",
      format: "cjs",
      outfile: "dist/index.cjs",
      external: [
        "express",
        "cors",
        "drizzle-orm",
        "pg",
        "express-session",
        "passport",
        "passport-local",
        "memorystore",
        "connect-pg-simple",
        "path",
        "fs",
        "http",
        "url",
        "crypto"
      ],
    });
    
    console.log("Server build complete: dist/index.cjs");
    
    // In a real Deno deploy environment, you might also need to handle frontend build
    // but usually Deno deploy is for the server. 
    // If you need the full vite build, you'd trigger it here via esbuild or similar.
    
    esbuild.stop();
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  }
}

build();
