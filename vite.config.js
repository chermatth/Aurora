import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ─── Nome do repositório no GitHub (deve bater com a URL do Pages) ───
const REPO_NAME = 'aurora'

// Usa `command` (build vs serve) — mais confiável que process.env.NODE_ENV no Windows
export default defineConfig(({ command }) => ({
  plugins: [vue()],

  // Em build → `/aurora/` para funcionar no GitHub Pages
  // Em dev   → `/`        para funcionar no localhost
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
}))
