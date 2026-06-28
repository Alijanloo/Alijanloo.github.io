import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// alijanloo.github.io is a user/org GitHub Pages site served from the domain
// root, so the base path is "/".
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "static",
  },
});
