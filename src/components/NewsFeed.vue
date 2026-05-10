<template>
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">{{ t.news.title }}</span>
      <span class="panel-badge" style="background:var(--orange)">RSS</span>
    </div>

    <!-- Filtros de categoria -->
    <div class="news-filters" v-if="!loading && !erro">
      <button
        class="filter-btn"
        v-for="cat in CATEGORIAS" :key="cat.id"
        :class="{ active: categoriaAtiva === cat.id }"
        @click="categoriaAtiva = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div class="state-box" v-if="loading">
      <div class="spinner"></div>
      <span>{{ t.news.loading }}</span>
    </div>

    <!-- Erro -->
    <div class="err-box" v-else-if="erro">
      <span class="err-icon">📭</span>
      <span class="err-msg">{{ erro }}</span>
    </div>

    <!-- Lista filtrada -->
    <div class="news-list" v-else>
      <template v-if="noticiasFiltradas.length">
        <a
          class="news-card"
          v-for="(item, i) in noticiasFiltradas" :key="i"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="news-top">
            <span class="news-source">{{ item.fonte }}</span>
            <span class="news-time">{{ item.tempo }}</span>
          </div>
          <div class="news-title">{{ item.titulo }}</div>
          <span class="news-arrow">{{ t.news.open }}</span>
        </a>
      </template>
      <div class="state-box" v-else style="min-height:100px">
        <span>{{ t.news.empty }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CATEGORIAS, pertenceCategoria } from '../api/news.js'
import { t } from '../locales/i18n.js'
import { timeAgo } from '../utils/format.js'

const props = defineProps({
  noticias: Array,
  loading:  Boolean,
  erro:     String,
})

const categoriaAtiva = ref('todas')

// Reactiva: timeAgo é reformatado quando o idioma mudar
const noticiasComTempo = computed(() =>
  (props.noticias || []).map(n => ({
    ...n,
    tempo: n.pubDate ? timeAgo(n.pubDate) : '',
  }))
)

const noticiasFiltradas = computed(() =>
  noticiasComTempo.value.filter(n => pertenceCategoria(n, categoriaAtiva.value))
)
</script>
