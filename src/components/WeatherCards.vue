<template>
  <div>
    <div class="sec-label">{{ t.cards.secLabel }}</div>
    <div class="cards-grid">

      <!-- Temperatura -->
      <div class="w-card" style="--c-accent:#6366f1; animation-delay:.00s">
        <span class="w-card-icon">🌡️</span>
        <span class="w-card-label">{{ t.cards.temperature }}</span>
        <div>
          <span class="w-card-value">{{ tempDisplay(dados.temp) }}</span>
          <span class="w-card-unit"> {{ unidadeSimbolo }}</span>
        </div>
        <span class="w-card-sub">{{ t.cards.feelsLike }}: {{ tempDisplay(dados.sensacao) }} {{ unidadeSimbolo }}</span>
      </div>

      <!-- Umidade -->
      <div class="w-card" style="--c-accent:#38bdf8; animation-delay:.08s">
        <span class="w-card-icon">💧</span>
        <span class="w-card-label">{{ t.cards.humidity }}</span>
        <div>
          <span class="w-card-value">{{ dados.umidade }}</span>
          <span class="w-card-unit"> %</span>
        </div>
        <span class="w-card-sub">{{ t.cards.dewPoint }}</span>
      </div>

      <!-- Vento -->
      <div class="w-card" style="--c-accent:#f97316; animation-delay:.16s">
        <span class="w-card-icon">💨</span>
        <span class="w-card-label">{{ t.cards.wind }}</span>
        <div>
          <span class="w-card-value">{{ ventoDisplay }}</span>
          <span class="w-card-unit"> {{ ventoUnidade }}</span>
        </div>
        <span class="w-card-sub">{{ t.cards.direction }}: {{ dados.direcaoVento }}</span>
      </div>

      <!-- Visibilidade -->
      <div class="w-card" style="--c-accent:#22c55e; animation-delay:.24s">
        <span class="w-card-icon">👁️</span>
        <span class="w-card-label">{{ t.cards.visibility }}</span>
        <div>
          <span class="w-card-value">{{ visibilidadeDisplay }}</span>
          <span class="w-card-unit" v-if="dados.visibilidadeM != null"> {{ visibilidadeUnidade }}</span>
        </div>
        <span class="w-card-sub">{{ t.cards.pressure }}: {{ pressaoDisplay }} {{ pressaoUnidade }}</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { toFahrenheit, toMph } from '../utils/helpers.js'
import { t } from '../locales/i18n.js'

const props = defineProps({
  dados:   Object,
  unidade: String,   // 'C' ou 'F'
})

const unidadeSimbolo = computed(() => props.unidade === 'F' ? '°F' : '°C')

function tempDisplay(c) {
  return props.unidade === 'F' ? toFahrenheit(c) : c
}

// Vento: m/s bruto → mph (°F) ou m/s (°C)
const ventoDisplay = computed(() =>
  props.unidade === 'F'
    ? toMph(props.dados.ventoMs)
    : Math.round(props.dados.ventoMs)
)
const ventoUnidade = computed(() =>
  props.unidade === 'F' ? 'mph' : 'm/s'
)

// Visibilidade: metros brutos → km (°C) ou mi (°F)
const visibilidadeDisplay = computed(() => {
  const m = props.dados.visibilidadeM
  if (m == null) return '—'
  return props.unidade === 'F'
    ? (m / 1609.344).toFixed(1)
    : (m / 1000).toFixed(1)
})
const visibilidadeUnidade = computed(() =>
  props.unidade === 'F' ? 'mi' : 'km'
)

// Pressão: hPa (°C) ou inHg (°F)
const pressaoDisplay = computed(() =>
  props.unidade === 'F'
    ? (props.dados.pressao * 0.02953).toFixed(2)
    : props.dados.pressao
)
const pressaoUnidade = computed(() =>
  props.unidade === 'F' ? 'inHg' : 'hPa'
)
</script>
