<template>
  <nav class="navbar">
    <!-- Branding -->
    <div class="brand">
      <span class="brand-icon">🌤️</span>
      <span class="brand-name">Aurora</span>
    </div>

    <!-- Busca -->
    <div class="search-wrap">
      <input
        class="search-input"
        v-model="inputCidade"
        @keyup.enter="onBuscar"
        @input="onInput"
        :placeholder="t.nav.placeholder"
        autocomplete="off"
        spellcheck="false"
      />

      <!-- Sugestões -->
      <div class="suggestions" v-if="sugestoes.length">
        <div
          class="sug-item"
          v-for="s in sugestoes" :key="s"
          @click="selecionar(s)"
        >
          📍 {{ s }}
        </div>
      </div>

      <button class="btn-search" @click="onBuscar">{{ t.nav.searchBtn }}</button>
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
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { CONFIG } from '../config/config.js'
import { t, idioma, setIdioma } from '../locales/i18n.js'

defineProps({
  tema:    String,
  unidade: String,
})

const emit = defineEmits(['buscar', 'toggleTema', 'toggleUnidade'])

const inputCidade = ref('')
const sugestoes   = ref([])
let timeout       = null

function toggleIdioma() {
  setIdioma(idioma.value === 'pt-BR' ? 'en' : 'pt-BR')
}

function onInput() {
  clearTimeout(timeout)
  sugestoes.value = []
  const q = inputCidade.value.trim().toLowerCase()
  if (q.length < 2) return
  timeout = setTimeout(() => {
    sugestoes.value = CONFIG.CIDADES_SUG
      .filter(c => c.toLowerCase().includes(q))
      .slice(0, 5)
  }, 200)
}

function selecionar(cidade) {
  inputCidade.value = cidade
  sugestoes.value   = []
  emit('buscar', cidade)
}

function onBuscar() {
  const cidade = inputCidade.value.trim()
  if (!cidade) return
  sugestoes.value = []
  emit('buscar', cidade)
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) sugestoes.value = []
})
</script>
