import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
  ];

  // Conditionally import Replit specific plugins
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const cartographerPlugin = await import("@replit/vite-plugin-cartographer");
    const devBannerPlugin = await import("@replit/vite-plugin-dev-banner");

    plugins.push(cartographerPlugin.cartographer());
    plugins.push(devBannerPlugin.devBanner());
  }

  return {
    plugins: plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      sourcemap: false,
      // Note: Ensure you have the 'terser' package installed, otherwise remove this line.
      minify: "terser",
    },
  };
});