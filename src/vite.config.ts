import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    // @ts-expect-error -- allowedHosts expects string[] | undefined
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
