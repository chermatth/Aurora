<template>
  <div class="hero fade-up">
    <div>
      <div class="hero-cidade">
        📍 {{ dados.cidade }}{{ dados.estado ? ', ' + dados.estado : '' }}, {{ dados.pais }}
        <img
          v-if="dados.countryCode"
          :src="`https://flagpedia.net/data/flags/w160/${dados.countryCode.toLowerCase()}.webp`"
          :alt="dados.pais"
          class="hero-flag"
          loading="lazy"
        />
        <button
          class="hero-fav-btn"
          :class="{ ativo: ehFavorito }"
          :title="ehFavorito ? t.favorites.removeTip : t.favorites.addTip"
          @click="$emit('toggleFavorito')"
        >
          {{ ehFavorito ? '❤️' : '🤍' }}
        </button>
      </div>
      <div class="hero-desc">{{ dados.descricao }}</div>
      <div class="hero-data">{{ dataFormatada() }}</div>
    </div>
    <div class="hero-right">
      <span class="hero-icone">{{ dados.icone }}</span>
      <span class="hero-minmax">
        ↑ {{ tempDisplay(dados.tempMax) }} {{ unidadeSimbolo }}
        &nbsp;↓ {{ tempDisplay(dados.tempMin) }} {{ unidadeSimbolo }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { dataFormatada } from '../utils/format.js'
import { toFahrenheit }  from '../utils/helpers.js'
import { t }             from '../locales/i18n.js'

const props = defineProps({
  dados:      Object,
  unidade:    String,
  ehFavorito: Boolean,
})

defineEmits(['toggleFavorito'])

const unidadeSimbolo = computed(() => props.unidade === 'F' ? '°F' : '°C')

function tempDisplay(c) {
  return props.unidade === 'F' ? toFahrenheit(c) : c
}
</script>

<style scoped>
.hero-flag {
  height: 15px;
  vertical-align: middle;
  margin-left: 6px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}
.hero-fav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  margin-left: 8px;
  padding: 4px 6px;
  border-radius: 8px;
  transition: transform .15s ease, background .15s ease;
}
.hero-fav-btn:hover {
  background: rgba(239, 68, 68, .12);
  transform: scale(1.15);
}
.hero-fav-btn.ativo {
  animation: fav-pop .35s ease;
}
@keyframes fav-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}
</style>
