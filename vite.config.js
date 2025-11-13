import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const basePath = process.env.BASE_PATH || "/APP-min-sa-de/";

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
