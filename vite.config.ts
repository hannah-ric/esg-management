import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
  },
  worker: {
    format: "es",
    rollupOptions: {
      // You might need to configure output if you have complex needs for worker chunks
      // For now, just setting the format should be the priority.
    },
  },
  plugins: [
    react(),
    tempo({
      exclude: ["src/components/AppContext.tsx"],
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-expect-error
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
