/* ═══════════════════════════════════════════════════════════
   src/locales/i18n.js — Sistema de internacionalização
═══════════════════════════════════════════════════════════ */

import { ref, computed } from 'vue'
import { TRANSLATIONS } from './translations.js'

const armazenado = localStorage.getItem('aurora-idioma')
const navegador  = (typeof navigator !== 'undefined' && navigator.language?.startsWith('pt')) ? 'pt-BR' : 'en'

/* ── Idioma global reativo ──────────────────────────────────── */
export const idioma = ref(TRANSLATIONS[armazenado] ? armazenado : navegador)

/* ── Acesso reativo às traduções ────────────────────────────── */
export const t = computed(() => TRANSLATIONS[idioma.value] || TRANSLATIONS['pt-BR'])

/* ── Troca de idioma com persistência ───────────────────────── */
export function setIdioma(novo) {
  if (!TRANSLATIONS[novo]) return
  idioma.value = novo
  localStorage.setItem('aurora-idioma', novo)
  document.documentElement.setAttribute('lang', novo)
}

/* ── Idiomas a enviar ao Nominatim (preferências em ordem) ─── */
export function langPref() {
  return idioma.value === 'pt-BR' ? 'pt-BR,en' : 'en,pt-BR'
}

/* ── Interpolação simples: "há {n}min" + {n: 5} → "há 5min" ─ */
export function interp(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}
