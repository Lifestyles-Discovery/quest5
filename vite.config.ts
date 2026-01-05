import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

// Read package.json version
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    port: 8080,
    proxy: {
      // Proxy API requests to local Liberator server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
      },
    },
  },
  build: {
    // Main bundle is ~650KB but gzips to ~160KB which is acceptable
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query', 'axios'],
          // Maps library
          'vendor-maps': ['leaflet', 'react-leaflet'],
          // Other UI libraries
          'vendor-ui': ['swiper', 'flatpickr', 'simplebar-react', 'react-dropzone'],
        },
      },
    },
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@app-types": fileURLToPath(new URL("./src/types", import.meta.url)),
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@icons": fileURLToPath(new URL("./src/icons", import.meta.url)),
      "@layout": fileURLToPath(new URL("./src/layout", import.meta.url)),
    },
  },
});
