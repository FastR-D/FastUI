import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  plugins: [UnoCSS()],
  root: fileURLToPath(new URL('.', import.meta.url)),
  // configure-pages returns a base_path without a trailing slash. HTML
  // %BASE_URL% replacements need it when followed by a public asset path.
  base: (process.env.DOCS_BASE_PATH || '/').replace(/\/*$/, '/'),
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1' },
  build: { outDir: 'dist', emptyOutDir: true },
})
