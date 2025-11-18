import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@supabase/supabase-js")) {
            return "supabase";
          }

          if (id.includes("@tanstack/react-query")) {
            return "react-query";
          }

          if (id.includes("react-router-dom")) {
            return "router";
          }

          if (id.includes("react-dom") || id.includes("react/jsx-runtime")) {
            return "react-dom";
          }

          if (id.includes("react")) {
            return "react";
          }

          if (id.includes("@radix-ui") || id.includes("shadcn") || id.includes("sonner")) {
            return "radix-ui";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (id.includes("recharts") || id.includes("@vis.gl/react-google-maps")) {
            return "charts-maps";
          }

          if (id.includes("react-hook-form") || id.includes("@hookform/resolvers") || id.includes("zod")) {
            return "forms";
          }

          if (id.includes("date-fns")) {
            return "date-utils";
          }

          if (id.includes("clsx") || id.includes("class-variance-authority") || id.includes("tailwind-merge")) {
            return "style-utils";
          }

          // fallback chunk for other vendors
          return "vendor";
        },
      },
    },
  },
}));
