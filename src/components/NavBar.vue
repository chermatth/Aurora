<template>
  <nav class="navbar">
    <!-- Branding -->
    <div class="brand">
      <span class="brand-icon">🌤️</span>
      <span class="brand-name">Aurora</span>
    </div>

    <!-- Busca com sugestões combinadas (favoritos + histórico + estáticas) -->
    <div class="search-wrap">
      <input
        class="search-input"
        v-model="inputCidade"
        @keyup.enter="onBuscar"
        @input="onInput"
        @focus="mostrarSugestoes = true"
        :placeholder="t.nav.placeholder"
        autocomplete="off"
        spellcheck="false"
      />

      <div class="suggestions" v-if="mostrarSugestoes && sugestoesAgrupadas.length">
        <template v-for="grupo in sugestoesAgrupadas" :key="grupo.tipo">
          <div class="sug-group-label">{{ grupo.label }}</div>
          <div
            class="sug-item"
            v-for="(s, i) in grupo.items"
            :key="grupo.tipo + '-' + i"
            @click="selecionar(s.nome)"
          >
            <span>{{ grupo.icone }} {{ s.nome }}</span>
          </div>
        </template>
      </div>

      <button class="btn-search" @click="onBuscar">{{ t.nav.searchBtn }}</button>
    </div>

    <!-- Favoritos -->
    <div class="nav-dropdown-wrap">
      <button class="btn-icon" :title="t.nav.tipFavorites" @click.stop="toggleDropdown('fav')">
        ❤️
      </button>
      <div class="nav-dropdown" v-if="dropdownAberto === 'fav'">
        <div class="nav-dropdown-head">{{ t.favorites.title }}</div>
        <div class="nav-dropdown-empty" v-if="!favoritos.length">{{ t.favorites.empty }}</div>
        <div class="nav-dropdown-list" v-else>
          <div
            class="nav-dropdown-item"
            v-for="f in favoritos"
            :key="f.id"
          >
            <span class="nav-dd-info" @click="onSelecionarFav(f)">
              <img
                v-if="f.country_code"
                :src="`https://flagpedia.net/data/flags/w40/${f.country_code.toLowerCase()}.webp`"
                :alt="f.country"
                class="nav-dd-flag"
              />
              <span class="nav-dd-name">{{ f.city_name }}</span>
              <span class="nav-dd-country" v-if="f.country">· {{ f.country }}</span>
            </span>
            <button class="nav-dd-remove" :title="t.favorites.removeTip" @click.stop="$emit('removerFavorito', f)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Histórico -->
    <div class="nav-dropdown-wrap">
      <button class="btn-icon" :title="t.nav.tipHistory" @click.stop="toggleDropdown('hist')">
        🕐
      </button>
      <div class="nav-dropdown" v-if="dropdownAberto === 'hist'">
        <div class="nav-dropdown-head nav-dropdown-head-row">
          <span>{{ t.history.title }}</span>
          <button
            v-if="historico.length"
            class="nav-dd-clear"
            :title="t.history.clearTip"
            @click.stop="onLimparHistorico"
          >🗑️</button>
        </div>
        <div class="nav-dropdown-empty" v-if="!historico.length">{{ t.history.empty }}</div>
        <div class="nav-dropdown-list" v-else>
          <div
            class="nav-dropdown-item"
            v-for="h in historico"
            :key="h.id"
            @click="onSelecionarHist(h)"
          >
            <span class="nav-dd-info">
              <span class="nav-dd-name">{{ h.city_name }}</span>
              <span class="nav-dd-country" v-if="h.country">· {{ h.country }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle idioma -->
    <button class="btn-unit" @click="toggleIdioma" :title="t.nav.tipLang">
      <span :class="idioma === 'pt-BR' ? 'unit-active' : 'unit-inactive'">PT</span>
      <span class="unit-sep">/</span>
      <span :class="idioma === 'en' ? 'unit-active' : 'unit-inactive'">EN</span>
    </button>

    <!-- Toggle °C / °F -->
    <button class="btn-unit" @click="$emit('toggleUnidade')" :title="t.nav.tipUnit">
      <span :class="unidade === 'C' ? 'unit-active' : 'unit-inactive'">°C</span>
      <span class="unit-sep">/</span>
      <span :class="unidade === 'F' ? 'unit-active' : 'unit-inactive'">°F</span>
    </button>

    <!-- Toggle tema -->
    <button class="btn-icon" @click="$emit('toggleTema')" :title="tema === 'dark' ? t.nav.tipThemeDark : t.nav.tipThemeLight">
      {{ tema === 'dark' ? '☀️' : '🌙' }}
    </button>

    <!-- Menu do usuário -->
    <div class="nav-dropdown-wrap nav-user-wrap">
      <button class="btn-user" @click.stop="toggleDropdown('user')">
        👤 <span class="nav-user-name">{{ usuario?.username }}</span>
      </button>
      <div class="nav-dropdown nav-user-dropdown" v-if="dropdownAberto === 'user'">
        <div class="nav-dropdown-head">{{ t.auth.loggedInAs }}</div>
        <div class="nav-user-greeting">{{ usuario?.username }}</div>
        <button class="nav-logout-btn" @click="$emit('logout')">
          🚪 {{ t.auth.logoutLabel }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CONFIG } from '../config/config.js'
import { t, idioma, setIdioma } from '../locales/i18n.js'

const props = defineProps({
  tema:      String,
  unidade:   String,
  usuario:   Object,
  favoritos: { type: Array, default: () => [] },
  historico: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'buscar', 'toggleTema', 'toggleUnidade', 'logout',
  'selecionarFavorito', 'selecionarHistorico', 'removerFavorito',
  'limparHistorico',
])

function onLimparHistorico() {
  if (confirm(t.value.history.clearConfirm)) {
    emit('limparHistorico')
  }
}

const inputCidade      = ref('')
const mostrarSugestoes = ref(false)
const dropdownAberto   = ref(null)     // 'fav' | 'hist' | 'user' | null
let timeout            = null

function toggleIdioma() {
  setIdioma(idioma.value === 'pt-BR' ? 'en' : 'pt-BR')
}

function toggleDropdown(qual) {
  dropdownAberto.value = dropdownAberto.value === qual ? null : qual
  mostrarSugestoes.value = false
}

/* ── Sugestões combinadas: favoritos + histórico + estáticas ── */
const sugestoesAgrupadas = computed(() => {
  const q = inputCidade.value.trim().toLowerCase()
  if (q.length < 1) return []

  const grupos  = []
  const usados  = new Set()

  // 1. Favoritos que casam
  const favsMatch = props.favoritos
    .filter(f => f.city_name?.toLowerCase().includes(q))
    .slice(0, 3)
    .map(f => ({ nome: f.city_name }))
  favsMatch.forEach(s => usados.add(s.nome.toLowerCase()))
  if (favsMatch.length) {
    grupos.push({ tipo: 'fav', icone: '❤️', label: t.value.favorites.title, items: favsMatch })
  }

  // 2. Histórico que casa (sem duplicar com favoritos)
  const histMatch = props.historico
    .filter(h => h.city_name?.toLowerCase().includes(q) && !usados.has(h.city_name.toLowerCase()))
    .slice(0, 3)
    .map(h => ({ nome: h.city_name }))
  histMatch.forEach(s => usados.add(s.nome.toLowerCase()))
  if (histMatch.length) {
    grupos.push({ tipo: 'hist', icone: '🕐', label: t.value.history.title, items: histMatch })
  }

  // 3. Sugestões estáticas (sem duplicar)
  const sugMatch = (CONFIG.CIDADES_SUG || [])
    .filter(c => c.toLowerCase().includes(q) && !usados.has(c.toLowerCase()))
    .slice(0, 5)
    .map(c => ({ nome: c }))
  if (sugMatch.length) {
    grupos.push({ tipo: 'sug', icone: '📍', label: 'Sugestões', items: sugMatch })
  }

  return grupos
})

function onInput() {
  clearTimeout(timeout)
  mostrarSugestoes.value = false
  if (inputCidade.value.trim().length < 1) return
  timeout = setTimeout(() => {
    mostrarSugestoes.value = true
    dropdownAberto.value   = null
  }, 200)
}

function selecionar(cidade) {
  inputCidade.value      = cidade
  mostrarSugestoes.value = false
  emit('buscar', cidade)
}

function onBuscar() {
  const cidade = inputCidade.value.trim()
  if (!cidade) return
  mostrarSugestoes.value = false
  emit('buscar', cidade)
}

function onSelecionarFav(f) {
  dropdownAberto.value = null
  emit('selecionarFavorito', { lat: f.lat, lon: f.lon, cidade: f.city_name })
}

function onSelecionarHist(h) {
  dropdownAberto.value = null
  emit('selecionarHistorico', { lat: h.lat, lon: h.lon, cidade: h.city_name })
}

// Fecha dropdowns/sugestões ao clicar fora
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) mostrarSugestoes.value = false
  if (!e.target.closest('.nav-dropdown-wrap')) dropdownAberto.value = null
})
</script>
