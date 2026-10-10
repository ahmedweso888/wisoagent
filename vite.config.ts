import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const supabaseUrl =
    env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || "";

  const supabasePublishableKey =
    env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    env["SUPABASE_PUBLISHABLE_KEY"] ||
    "";

  return {
    plugins: [
      tanstackStart({
        server: {
          entry: "server",
        },
      }),
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL":
        JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY":
        JSON.stringify(supabasePublishableKey),
    },
  };
});