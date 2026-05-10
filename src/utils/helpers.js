/* ═══════════════════════════════════════════════════════════
   src/utils/helpers.js — Funções auxiliares de clima (i18n)
═══════════════════════════════════════════════════════════ */

import { t } from '../locales/i18n.js'

/* Emoji por código WMO (Open-Meteo) */
export function wmoIcon(code, isDay = true) {
  if (code === 0)  return isDay ? '☀️' : '🌙'
  if (code <= 2)   return isDay ? '🌤️' : '🌙'
  if (code === 3)  return '☁️'
  if (code <= 49)  return '🌫️'
  if (code <= 59)  return '🌦️'
  if (code <= 69)  return '🌧️'
  if (code <= 79)  return '❄️'
  if (code <= 82)  return '🌦️'
  if (code <= 86)  return '❄️'
  if (code <= 99)  return '⛈️'
  return '🌡️'
}

/* Descrição por código WMO — usa idioma atual */
export function wmoDescription(code) {
  const map = t.value.wmo
  return map[code] ?? map.default
}

/* Graus → direção cardeal (N, NE, etc.) — usa idioma atual */
export function windDir(deg) {
  const dirs = t.value.windDir
  return dirs[Math.round(deg / 45) % 8]
}

/* Converte temperatura */
export function toFahrenheit(c) { return Math.round(c * 9 / 5 + 32) }

/* Converte velocidade do vento: m/s → mph */
export function toMph(ms) { return Math.round(ms * 2.237) }
