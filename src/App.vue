<template>
  <div>
    <!-- Navbar -->
    <NavBar
      :tema="tema"
      :unidade="unidade"
      @buscar="buscarClima"
      @toggleTema="toggleTema"
      @toggleUnidade="toggleUnidade"
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

        <!-- Hero da cidade -->
        <CityHero :dados="clima" :unidade="unidade" />

        <!-- Cards de clima -->
        <WeatherCards :dados="clima" :unidade="unidade" />

        <!-- Mapa climático mundial -->
        <WeatherMap
          :unidade="unidade"
          :localizacao="{ lat: clima.lat, lon: clima.lon }"
          @buscarCoordenadas="buscarClimaByCoords"
        />

        <!-- Gráfico + Notícias -->
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
      <a href="https://leafletjs.com"              target="_blank">Leaflet</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import NavBar       from './components/NavBar.vue'
import CityHero     from './components/CityHero.vue'
import WeatherCards from './components/WeatherCards.vue'
import TempChart    from './components/TempChart.vue'
import NewsFeed     from './components/NewsFeed.vue'
import WeatherMap   from './components/WeatherMap.vue'

import { fetchClima, fetchClimaByCoords as fetchClimaCoords, fetchForecast } from './api/weather.js'
import { fetchNoticias }             from './api/news.js'
import { CONFIG }                    from './config/config.js'
import { t, idioma }                 from './locales/i18n.js'

/* ── Estado global ──────────────────────────────────────────── */
const tema        = ref('dark')
const unidade     = ref('C')      // 'C' ou 'F'
const clima       = ref(null)
const forecast    = ref({ labels: [], data: [] })
const loadingClima = ref(false)
const erroClima   = ref('')
const noticias    = ref([])
const loadingNews = ref(false)
const erroNews    = ref('')

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

/* ── Buscar clima ───────────────────────────────────────────── */
async function buscarClima(cidade) {
  loadingClima.value = true
  erroClima.value    = ''
  // NÃO resetar clima.value: mantém WeatherMap montado e conteúdo visível durante a busca

  try {
    const dados = await fetchClima(cidade)
    clima.value = dados

    // Busca forecast em paralelo (não bloqueia o clima)
    fetchForecast(dados.lat, dados.lon)
      .then(f  => { forecast.value = f })
      .catch(e => console.warn('Forecast:', e.message))

  } catch (err) {
    erroClima.value = err.message
  } finally {
    loadingClima.value = false
  }
}

/* ── Buscar clima por coordenadas (clique no mapa) ──────────── */
async function buscarClimaByCoords({ lat, lon }) {
  loadingClima.value = true
  erroClima.value    = ''

  try {
    const dados = await fetchClimaCoords(lat, lon)
    clima.value = dados

    fetchForecast(dados.lat, dados.lon)
      .then(f  => { forecast.value = f })
      .catch(e => console.warn('Forecast:', e.message))

  } catch (err) {
    erroClima.value = err.message
  } finally {
    loadingClima.value = false
  }
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

/* ── Reage a mudança de idioma: refaz fetch com novos textos ── */
watch(idioma, () => {
  if (clima.value) {
    // Refaz busca por coordenadas — atualiza descricao, cidade, país etc. no novo idioma
    buscarClimaByCoords({ lat: clima.value.lat, lon: clima.value.lon })
  }
  // Notícias: títulos vêm do RSS no idioma original (não retraduzimos),
  // mas refazemos para puxar feeds da rotação enquanto estiver online
  buscarNoticias()
})

/* ── Init ───────────────────────────────────────────────────── */
onMounted(() => {
  // Restaura preferências salvas
  const temaSalvo    = localStorage.getItem('aurora-tema')    || 'dark'
  const unidadeSalva = localStorage.getItem('aurora-unidade') || 'C'
  tema.value    = temaSalvo
  unidade.value = unidadeSalva
  document.documentElement.setAttribute('data-theme', temaSalvo)
  document.documentElement.setAttribute('lang', idioma.value)

  buscarClima(CONFIG.CIDADE_PADRAO)
  buscarNoticias()
})
</script>
