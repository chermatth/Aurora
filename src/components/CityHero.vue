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

const props = defineProps({
  dados:   Object,
  unidade: String,
})

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
</style>
