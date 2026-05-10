/* ═══════════════════════════════════════════════════════════
   src/api/weather.js — Open-Meteo + Nominatim (i18n-aware)
═══════════════════════════════════════════════════════════ */

import { CONFIG }                                from '../config/config.js'
import { wmoIcon, wmoDescription, windDir }      from '../utils/helpers.js'
import { t, langPref }                           from '../locales/i18n.js'

/* Validação defensiva contra coordenadas fora do globo */
function validarCoords(lat, lon) {
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(t.value.apiErr.coordsInvalid)
  }
  if (lat < -90 || lat > 90) {
    throw new Error(t.value.apiErr.coordsInvalid)
  }
  if (lon < -180 || lon > 180) {
    throw new Error(t.value.apiErr.coordsInvalid)
  }
}

/* ── Geocoding: nome da cidade → lat/lon + endereço ──────── */
async function geocodeCidade(cidade) {
  const lang = langPref()
  const url = `${CONFIG.NOMINATIM_BASE}/search`
    + `?q=${encodeURIComponent(cidade)}`
    + `&format=json&limit=1&addressdetails=1`
    + `&accept-language=${lang}`

  const res = await fetch(url, { headers: { 'Accept-Language': lang } })
  if (!res.ok) throw new Error(t.value.apiErr.geocode)

  const data = await res.json()
  if (!data.length) throw new Error(t.value.apiErr.cityNotFound(cidade))
  return data[0]
}

/* ── Geocoding reverso: lat/lon → endereço ───────────────── */
async function geocodeReverso(lat, lon) {
  const lang = langPref()
  const url = `${CONFIG.NOMINATIM_BASE}/reverse`
    + `?format=json&lat=${lat}&lon=${lon}`
    + `&accept-language=${lang}`

  const res = await fetch(url, { headers: { 'Accept-Language': lang } })
  if (!res.ok) throw new Error(t.value.apiErr.geocodeReverso)
  return res.json()
}

/* ── Open-Meteo: clima atual para uma coordenada ─────────── */
async function fetchMeteoAtual(lat, lon) {
  validarCoords(lat, lon)

  const url = `${CONFIG.METEO_BASE}/forecast`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure`
    + `&hourly=visibility`
    + `&daily=temperature_2m_max,temperature_2m_min`
    + `&wind_speed_unit=ms`
    + `&timezone=auto`
    + `&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 400) throw new Error(t.value.apiErr.coordsOutBox)
    throw new Error(t.value.apiErr.meteo(res.status))
  }
  return res.json()
}

/* ── Extrai visibilidade em metros da hora atual ─────────── */
function extrairVisibilidadeM(meteo) {
  const currentTime = meteo.current?.time
  if (!currentTime || !meteo.hourly?.time) return null
  const currentHour = currentTime.slice(0, 13) + ':00'
  const idx = meteo.hourly.time.findIndex(x => x === currentHour)
  return idx >= 0 ? (meteo.hourly.visibility?.[idx] ?? null) : null
}

/* ── Monta objeto clima a partir de geo + meteo ──────────── */
function buildClima(geo, meteo) {
  const addr    = geo.address ?? {}
  const current = meteo.current

  const cidade = addr.city || addr.town || addr.village || addr.municipality
    || geo.display_name?.split(',')[0]?.trim()
    || t.value.locationFallback
  const estado = addr.state || addr.region || ''
  const pais   = addr.country || ''

  return {
    cidade,
    estado,
    pais,
    countryCode:  (addr.country_code ?? '').toLowerCase(),
    descricao:    wmoDescription(current.weather_code),
    icone:        wmoIcon(current.weather_code, current.is_day === 1),
    temp:         Math.round(current.temperature_2m),
    sensacao:     Math.round(current.apparent_temperature),
    tempMin:      Math.round(meteo.daily?.temperature_2m_min?.[0] ?? current.temperature_2m),
    tempMax:      Math.round(meteo.daily?.temperature_2m_max?.[0] ?? current.temperature_2m),
    umidade:      current.relative_humidity_2m,
    pressao:      Math.round(current.surface_pressure),
    ventoMs:      current.wind_speed_10m,
    direcaoVento: windDir(current.wind_direction_10m ?? 0),
    visibilidadeM: extrairVisibilidadeM(meteo),
    lat:          meteo.latitude,
    lon:          meteo.longitude,
  }
}

/* ── Clima atual por nome de cidade ──────────────────────── */
export async function fetchClima(cidade) {
  const geo   = await geocodeCidade(cidade)
  const meteo = await fetchMeteoAtual(geo.lat, geo.lon)
  return buildClima(geo, meteo)
}

/* ── Clima atual por coordenadas ─────────────────────────── */
export async function fetchClimaByCoords(lat, lon) {
  validarCoords(lat, lon)
  const [geo, meteo] = await Promise.all([
    geocodeReverso(lat, lon),
    fetchMeteoAtual(lat, lon),
  ])
  return buildClima(geo, meteo)
}

/* ── Previsão dos próximos 5 dias ────────────────────────── */
export async function fetchForecast(lat, lon) {
  const url = `${CONFIG.METEO_BASE}/forecast`
    + `?latitude=${lat}&longitude=${lon}`
    + `&daily=temperature_2m_max`
    + `&wind_speed_unit=ms`
    + `&timezone=auto`
    + `&forecast_days=6`

  const res = await fetch(url)
  if (!res.ok) throw new Error(t.value.apiErr.forecast(res.status))

  const d     = await res.json()
  const times = d.daily?.time?.slice(0, 5) ?? []
  const dias  = t.value.days
  const labels = times.map(time => dias[new Date(time + 'T12:00:00').getDay()])
  const data   = (d.daily?.temperature_2m_max ?? []).slice(0, 5).map(x => Math.round(x))

  return { labels, data, dates: times }   // dates: cru para re-formatar quando idioma mudar
}
