import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ─── Troque 'aurora' pelo nome exato do seu repositório no GitHub ───
const REPO_NAME = 'aurora'

export default defineConfig({
  plugins: [vue()],

  // base garante que os caminhos funcionem no GitHub Pages
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
})
