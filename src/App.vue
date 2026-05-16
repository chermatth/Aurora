<template>
  <div>
    <!-- TELA DE LOGIN — gate antes de qualquer outra coisa -->
    <AuthScreen
      v-if="!authReady || !usuario"
      :tema="tema"
      @authenticated="onAuthenticated"
      @toggleTema="toggleTema"
    />

    <!-- APP NORMAL — somente quando logado -->
    <template v-else>
      <NavBar
        :tema="tema"
        :unidade="unidade"
        :usuario="usuario"
        :favoritos="favoritos"
        :historico="historico"
        @buscar="buscarClima"
        @toggleTema="toggleTema"
        @toggleUnidade="toggleUnidade"
        @logout="logout"
        @selecionarFavorito="selecionarLocalizacao"
        @selecionarHistorico="selecionarLocalizacao"
        @removerFavorito="onRemoverFavorito"
        @limparHistorico="onLimparHistorico"
      />

      <main class="main">

        <!-- Loading clima (só na primeira busca, antes de qualquer dado) -->
        <div class="state-box" v-if="loadingClima && !clima">
          <div class="spinner"></div>
          <span>{{ t.states.loadingClima }}</span>
        </div>

        <!-- Erro clima (apenas se ainda não há dados antigos) -->
        <div class="err-box" v-else-if="erroClima && !clima">
          <span class="err-icon">🌫️</span>
          <span class="err-msg">{{ erroClima }}</span>
          <span>{{ t.states.retryHint }}</span>
        </div>

        <!-- Conteúdo principal — mantido durante atualizações in-place -->
        <template v-else-if="clima">

          <CityHero
            :dados="clima"
            :unidade="unidade"
            :ehFavorito="ehFavorito"
            @toggleFavorito="onToggleFavorito"
          />

          <WeatherCards :dados="clima" :unidade="unidade" />

          <WeatherMap
            :unidade="unidade"
            :localizacao="{ lat: clima.lat, lon: clima.lon }"
            @buscarCoordenadas="buscarClimaByCoords"
          />

          <div class="bottom-grid">
            <TempChart
              :labels="forecast.labels"
              :data="forecast.data"
              :unidade="unidade"
              :tema="tema"
            />
            <NewsFeed
              :noticias="noticias"
              :loading="loadingNews"
              :erro="erroNews"
            />
          </div>

        </template>

      </main>

      <footer>
        Aurora · FATEC Itatiba · DSM ·
        <a href="https://open-meteo.com"             target="_blank">Open-Meteo</a> ·
        <a href="https://nominatim.openstreetmap.org" target="_blank">Nominatim</a> ·
        <a href="https://leafletjs.com"              target="_blank">Leaflet</a> ·
        <a href="https://supabase.com"               target="_blank">Supabase</a>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import NavBar       from './components/NavBar.vue'
import CityHero     from './components/CityHero.vue'
import WeatherCards from './components/WeatherCards.vue'
import TempChart    from './components/TempChart.vue'
import NewsFeed     from './components/NewsFeed.vue'
import WeatherMap   from './components/WeatherMap.vue'
import AuthScreen   from './components/AuthScreen.vue'

import { fetchClima, fetchClimaByCoords as fetchClimaCoords, fetchForecast } from './api/weather.js'
import { fetchNoticias }                  from './api/news.js'
import { getSession, signOut } from './api/auth.js'
import { listFavorites, addFavorite, removeFavorite }          from './api/favorites.js'
import { listHistory, logSearch, clearHistory }                from './api/history.js'
import { CONFIG }                          from './config/config.js'
import { t, idioma }                       from './locales/i18n.js'

/* ── Estado de auth ─────────────────────────────────────────── */
const authReady = ref(false)
const usuario   = ref(null)   // { id, username } ou null

/* ── Estado principal ──────────────────────────────────────── */
const tema         = ref('dark')
const unidade      = ref('C')
const clima        = ref(null)
const forecast     = ref({ labels: [], data: [] })
const loadingClima = ref(false)
const erroClima    = ref('')
const noticias     = ref([])
const loadingNews  = ref(false)
const erroNews     = ref('')

/* ── Favoritos e histórico ─────────────────────────────────── */
const favoritos = ref([])
const historico = ref([])

const ehFavorito = computed(() => {
  if (!clima.value) return false
  return favoritos.value.some(f =>
    Math.abs(Number(f.lat) - clima.value.lat) < 1e-4 &&
    Math.abs(Number(f.lon) - clima.value.lon) < 1e-4
  )
})

/* ── Toggle tema ────────────────────────────────────────────── */
function toggleTema() {
  tema.value = tema.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', tema.value)
  localStorage.setItem('aurora-tema', tema.value)
}

/* ── Toggle unidade °C / °F ─────────────────────────────────── */
function toggleUnidade() {
  unidade.value = unidade.value === 'C' ? 'F' : 'C'
  localStorage.setItem('aurora-unidade', unidade.value)
}

/* ── Buscar clima por nome ──────────────────────────────────── */
async function buscarClima(cidade) {
  loadingClima.value = true
  erroClima.value    = ''
  try {
    const dados = await fetchClima(cidade)
    clima.value = dados
    fetchForecast(dados.lat, dados.lon)
      .then(f  => { forecast.value = f })
      .catch(e => console.warn('Forecast:', e.message))

    // Loga no histórico (best-effort, não bloqueia)
    logSearch(dados).then(carregarHistorico).catch(() => {})
  } catch (err) {
    erroClima.value = err.message
  } finally {
    loadingClima.value = false
  }
}

/* ── Buscar clima por coordenadas ───────────────────────────── */
async function buscarClimaByCoords({ lat, lon }) {
  loadingClima.value = true
  erroClima.value    = ''
  try {
    const dados = await fetchClimaCoords(lat, lon)
    clima.value = dados
    fetchForecast(dados.lat, dados.lon)
      .then(f  => { forecast.value = f })
      .catch(e => console.warn('Forecast:', e.message))

    logSearch(dados).then(carregarHistorico).catch(() => {})
  } catch (err) {
    erroClima.value = err.message
  } finally {
    loadingClima.value = false
  }
}

/* ── Selecionar localização do dropdown (favoritos/histórico) ─ */
function selecionarLocalizacao(item) {
  buscarClimaByCoords({ lat: item.lat, lon: item.lon })
}

/* ── Buscar notícias ────────────────────────────────────────── */
async function buscarNoticias() {
  loadingNews.value = true
  erroNews.value    = ''
  try {
    noticias.value = await fetchNoticias()
  } catch (err) {
    erroNews.value = err.message
  } finally {
    loadingNews.value = false
  }
}

/* ── Favoritos ──────────────────────────────────────────────── */
async function carregarFavoritos() {
  try {
    favoritos.value = await listFavorites()
  } catch (e) {
    console.warn('Favoritos:', e.message)
    favoritos.value = []
  }
}

async function onToggleFavorito() {
  if (!clima.value) return
  try {
    if (ehFavorito.value) {
      await removeFavorite(clima.value.lat, clima.value.lon)
    } else {
      await addFavorite(clima.value)
    }
    await carregarFavoritos()
  } catch (e) {
    console.warn('Toggle favorito:', e.message)
  }
}

async function onRemoverFavorito({ lat, lon }) {
  try {
    await removeFavorite(lat, lon)
    await carregarFavoritos()
  } catch (e) {
    console.warn('Remover favorito:', e.message)
  }
}

/* ── Histórico ──────────────────────────────────────────────── */
async function carregarHistorico() {
  try {
    historico.value = await listHistory(10)
  } catch (e) {
    console.warn('Histórico:', e.message)
    historico.value = []
  }
}

async function onLimparHistorico() {
  try {
    await clearHistory()
    historico.value = []
  } catch (e) {
    console.warn('Limpar histórico:', e.message)
  }
}

/* ── Auth ───────────────────────────────────────────────────── */
async function onAuthenticated() {
  // chamado pelo AuthScreen quando login/cadastro tem sucesso
  await sincronizarSessao()
}

async function sincronizarSessao() {
  const session = getSession()                   // agora síncrono (lê localStorage)
  if (session?.id) {
    usuario.value = { id: session.id, username: session.username }
    await Promise.all([carregarFavoritos(), carregarHistorico()])
    if (!clima.value) {
      buscarClima(CONFIG.CIDADE_PADRAO)
      buscarNoticias()
    }
  } else {
    usuario.value   = null
    favoritos.value = []
    historico.value = []
    clima.value     = null
    forecast.value  = { labels: [], data: [] }
  }
}

async function logout() {
  try {
    await signOut()
  } finally {
    usuario.value = null
    favoritos.value = []
    historico.value = []
    clima.value     = null
  }
}

/* ── Reage a mudança de idioma ──────────────────────────────── */
watch(idioma, () => {
  if (clima.value) {
    buscarClimaByCoords({ lat: clima.value.lat, lon: clima.value.lon })
  }
  buscarNoticias()
})

/* ── Init ───────────────────────────────────────────────────── */
onMounted(async () => {
  // Restaura preferências salvas (continuam em localStorage)
  const temaSalvo    = localStorage.getItem('aurora-tema')    || 'dark'
  const unidadeSalva = localStorage.getItem('aurora-unidade') || 'C'
  tema.value    = temaSalvo
  unidade.value = unidadeSalva
  document.documentElement.setAttribute('data-theme', temaSalvo)
  document.documentElement.setAttribute('lang', idioma.value)

  // Tenta restaurar sessão existente (lê localStorage)
  await sincronizarSessao()
  authReady.value = true
})
</script>
