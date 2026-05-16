/* ═══════════════════════════════════════════════════════════
   src/api/history.js — Histórico de pesquisas
═══════════════════════════════════════════════════════════ */

import { supabase }   from './supabase.js'
import { getSession } from './auth.js'

const MAX_HISTORY = 30
const SHOW_RECENT = 10

function currentUserId() {
  return getSession()?.id ?? null
}

/* Lista as buscas mais recentes do usuário */
export async function listHistory(limit = SHOW_RECENT) {
  const userId = currentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data || []
}

/* Registra uma busca.
   - Cada cidade aparece UMA vez por usuário (constraint no DB).
   - Re-pesquisar a mesma cidade apenas atualiza searched_at = now().
   - Faz cleanup mantendo só as últimas MAX_HISTORY cidades distintas. */
export async function logSearch(clima) {
  const userId = currentUserId()
  if (!userId) return

  const row = {
    user_id:     userId,
    city_name:   clima.cidade,
    country:     clima.pais,
    lat:         Number(clima.lat),
    lon:         Number(clima.lon),
    searched_at: new Date().toISOString(),   // força update do timestamp no upsert
  }

  // Upsert: insere se nova, atualiza searched_at se já existe
  const { error: upsertErr } = await supabase
    .from('search_history')
    .upsert(row, { onConflict: 'user_id,lat,lon' })

  if (upsertErr) {
    console.warn('Falha ao registrar busca:', upsertErr.message)
    return
  }

  // Cleanup: mantém só MAX_HISTORY cidades distintas mais recentes
  try {
    const { data: cutoff } = await supabase
      .from('search_history')
      .select('searched_at')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .range(MAX_HISTORY, MAX_HISTORY)
      .maybeSingle()

    if (cutoff?.searched_at) {
      await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId)
        .lt('searched_at', cutoff.searched_at)
    }
  } catch (_) { /* best-effort */ }
}

/* Limpa todo o histórico do usuário */
export async function clearHistory() {
  const userId = currentUserId()
  if (!userId) return

  await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId)
}
