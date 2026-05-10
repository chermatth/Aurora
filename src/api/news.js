/* ═══════════════════════════════════════════════════════════
   src/api/news.js — RSS feeds filtrados por clima/desastres
   Usa múltiplos proxies como fallback para contornar CORS
═══════════════════════════════════════════════════════════ */

import { computed } from 'vue'
import { t } from '../locales/i18n.js'

/* ── Proxies RSS em ordem de prioridade ─────────────────────── */
const PROXIES = [
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
]

/* ── Feeds RSS especializados em clima e meio ambiente ──────── */
const RSS_FEEDS = [
  // Internacional — inglês (clima, meteorologia, meio ambiente)
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', fonte: 'BBC Science' },
  { url: 'https://www.theguardian.com/uk/environment/rss',                fonte: 'Guardian Environment' },
  { url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss', fonte: 'NASA Earth' },
  { url: 'https://e360.yale.edu/rss.xml',                                 fonte: 'Yale E360' },
  { url: 'https://insideclimatenews.org/feed',                            fonte: 'Inside Climate News' },
  { url: 'https://www.carbonbrief.org/feed',                              fonte: 'Carbon Brief' },
  { url: 'https://climatechangenews.com/feed',                            fonte: 'Climate Home News' },
  // Português
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',                  fonte: 'BBC Brasil' },
  { url: 'https://g1.globo.com/rss/g1/',                                  fonte: 'G1' },
]

/* ── Palavras-chave de clima (português + inglês) ───────────── */
const KEYWORDS = [
  // Português
  'clima','temperatura','chuva','seca','enchente','inundação','alagamento',
  'tempestade','furacão','ciclone','tornado','neve','granizo','geada',
  'incêndio','queimada','umidade','previsão do tempo','onda de calor',
  'frio','vento','meteorologia','desastre natural','estiagem','neblina',
  'aquecimento global','emissões','efeito estufa','meio ambiente',
  // English
  'weather','storm','hurricane','tornado','flood','drought','climate',
  'temperature','rain','snow','ice','wind','heat','wildfire','fire',
  'typhoon','cyclone','warming','greenhouse','emission','environment',
  'extreme','severe','disaster','meteorology','atmosphere','sea level',
  'arctic','glacier','ozone','pollution','carbon','fossil','renewable',
]

/* ── Categorias visuais (reativas ao idioma) ────────────────── */
export const CATEGORIAS = computed(() => {
  const c = t.value.news.categories
  return [
    { id: 'todas',    label: c.all      },
    { id: 'chuva',    label: c.rain     },
    { id: 'calor',    label: c.heat     },
    { id: 'frio',     label: c.cold     },
    { id: 'vento',    label: c.wind     },
    { id: 'desastre', label: c.disaster },
    { id: 'incendio', label: c.fire     },
  ]
})

const MAP_KW = {
  chuva:    ['chuva','enchente','inundação','alagamento','temporal','precipitação'],
  calor:    ['calor','onda de calor','seca','estiagem','temperatura alta'],
  frio:     ['frio','geada','neve','granizo','nevasca','temperatura baixa'],
  vento:    ['vento','furacão','ciclone','tornado','vendaval','tempestade'],
  desastre: ['desastre','catástrofe','emergência','evacuação','destruição'],
  incendio: ['incêndio','queimada','fogo','chamas'],
}

export function pertenceCategoria(noticia, id) {
  if (id === 'todas') return true
  const txt = `${noticia.titulo} ${noticia.descricao || ''}`.toLowerCase()
  return (MAP_KW[id] || []).some(k => txt.includes(k))
}

/* ── Tenta buscar via um proxy ──────────────────────────────── */
async function fetchComProxy(proxyFn, feedUrl) {
  const res = await fetch(proxyFn(feedUrl), { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const text = await res.text()

  // corsproxy.io devolve o conteúdo direto; codetabs também
  // Mas allorigins devolve JSON — verifica os dois casos
  let xmlString = text
  try {
    const json = JSON.parse(text)
    if (json.contents) xmlString = json.contents
  } catch (_) {
    // não é JSON, já é XML — tudo certo
  }

  return xmlString
}

/* ── Parse XML RSS ──────────────────────────────────────────── */
function parseRSS(xmlString, fonte) {
  const xml   = new DOMParser().parseFromString(xmlString, 'text/xml')
  const items = [...xml.querySelectorAll('item')].slice(0, 10)

  return items.map(item => {
    const titulo = (item.querySelector('title')?.textContent ?? '')
      .replace(/<!\[CDATA\[|\]\]>/g, '').trim()

    const url = (
      item.querySelector('link')?.textContent ??
      item.querySelector('guid')?.textContent ?? ''
    ).trim()

    const descricao = (item.querySelector('description')?.textContent ?? '')
      .replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim()

    const pubDate = item.querySelector('pubDate')?.textContent ?? ''

    // pubDate cru: NewsFeed.vue formata via computed para reagir a mudanças de idioma
    return { titulo, url, descricao, fonte, pubDate }
  }).filter(n => n.url && n.titulo && !n.titulo.includes('[Removed]'))
}

/* ── Função principal ───────────────────────────────────────── */
export async function fetchNoticias() {
  let todasNoticias = []

  for (const feed of RSS_FEEDS) {
    let xmlString = null

    // Tenta cada proxy até um funcionar
    for (const proxyFn of PROXIES) {
      try {
        xmlString = await fetchComProxy(proxyFn, feed.url)
        break   // proxy funcionou → sai do loop
      } catch (err) {
        console.warn(`Proxy falhou para "${feed.fonte}":`, err.message)
      }
    }

    if (!xmlString) continue   // todos os proxies falharam nesse feed

    const noticias = parseRSS(xmlString, feed.fonte)

    // Filtra por palavras-chave de clima
    const filtradas = noticias.filter(n => {
      const txt = `${n.titulo} ${n.descricao}`.toLowerCase()
      return KEYWORDS.some(k => txt.includes(k))
    })

    todasNoticias = [...todasNoticias, ...filtradas]
    if (todasNoticias.length >= 12) break
  }

  // Fallback: se nenhuma notícia passou no filtro, retorna todas sem filtro
  if (todasNoticias.length === 0) {
    for (const feed of RSS_FEEDS) {
      for (const proxyFn of PROXIES) {
        try {
          const xml = await fetchComProxy(proxyFn, feed.url)
          todasNoticias = [...todasNoticias, ...parseRSS(xml, feed.fonte)]
          break
        } catch (_) {}
      }
      if (todasNoticias.length >= 8) break
    }
  }

  if (todasNoticias.length === 0)
    throw new Error(t.value.news.load404)

  return todasNoticias.slice(0, 12)
}
