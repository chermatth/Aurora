/* ═══════════════════════════════════════════════════════════
   src/utils/format.js — Formatação de datas e textos (i18n)
═══════════════════════════════════════════════════════════ */

import { t, interp } from '../locales/i18n.js'

export function dataFormatada() {
  return new Date().toLocaleDateString(t.value.dateLocale, {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

export function timeAgo(str) {
  const m = (Date.now() - new Date(str)) / 60000
  const ta = t.value.news.timeAgo
  if (m < 2)    return ta.now
  if (m < 60)   return interp(ta.min, { n: Math.floor(m) })
  if (m < 1440) return interp(ta.h,   { n: Math.floor(m / 60) })
  return         interp(ta.d,   { n: Math.floor(m / 1440) })
}

export function capitalize(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
