/* ═══════════════════════════════════════════════════════════
   src/api/favorites.js — CRUD de cidades favoritas
   user_id vem da sessão local (não usamos auth.uid())
═══════════════════════════════════════════════════════════ */

import { supabase }   from './supabase.js'
import { getSession } from './auth.js'

function currentUserId() {
  return getSession()?.id ?? null
}

/* Lista favoritos do usuário logado */
export async function listFavorites() {
  const userId = currentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('favorite_cities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/* Adiciona favorito */
export async function addFavorite(clima) {
  const userId = currentUserId()
  if (!userId) throw new Error('Não autenticado')

  const row = {
    user_id:      userId,
    city_name:    clima.cidade,
    country:      clima.pais,
    country_code: clima.countryCode || null,
    lat:          Number(clima.lat),
    lon:          Number(clima.lon),
  }

  const { data, error } = await supabase
    .from('favorite_cities')
    .upsert(row, { onConflict: 'user_id,lat,lon' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/* Remove favorito por coordenadas (do usuário logado) */
export async function removeFavorite(lat, lon) {
  const userId = currentUserId()
  if (!userId) return

  const { error } = await supabase
    .from('favorite_cities')
    .delete()
    .eq('user_id', userId)
    .eq('lat', Number(lat))
    .eq('lon', Number(lon))

  if (error) throw new Error(error.message)
}

/* Verifica se uma cidade é favorita */
export async function isFavorite(lat, lon) {
  const userId = currentUserId()
  if (!userId) return false

  const { data } = await supabase
    .from('favorite_cities')
    .select('id')
    .eq('user_id', userId)
    .eq('lat', Number(lat))
    .eq('lon', Number(lon))
    .maybeSingle()

  return !!data
}
