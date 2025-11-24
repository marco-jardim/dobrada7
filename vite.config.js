import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.BASE_PATH || "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 30009,
    strictPort: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
  },
});
