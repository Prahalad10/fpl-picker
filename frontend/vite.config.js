import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the dev server and build tool; the plugin adds JSX support
export default defineConfig({
  plugins: [react()],
});
