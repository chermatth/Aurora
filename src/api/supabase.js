/* ═══════════════════════════════════════════════════════════
   src/api/supabase.js — Cliente Supabase (singleton)
═══════════════════════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!URL || !KEY) {
  console.error('⚠️  Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes no .env')
}

export const supabase = createClient(URL, KEY, {
  auth: {
    persistSession:   true,   // mantém usuário logado entre sessões
    autoRefreshToken: true,   // renova token automaticamente
  },
})
