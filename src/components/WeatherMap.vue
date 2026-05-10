<template>
  <div class="map-section">
    <div class="sec-label">{{ t.map.title }}</div>
    <div class="panel" style="padding:0; overflow:hidden">
      <div class="map-wrap">
        <div id="aurora-map"></div>
      </div>
      <div style="padding:14px 20px; font-size:.78rem; color:var(--muted); font-family:var(--mono)">
        {{ t.map.hint }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { t } from '../locales/i18n.js'

const props = defineProps({
  unidade:     String,
  localizacao: Object,
})

const emit = defineEmits(['buscarCoordenadas'])

let mapInstance = null
let marcador    = null

function clampLat(lat) {
  return Math.max(-90, Math.min(90, lat))
}
function normalizeLng(lng) {
  const n = ((lng + 180) % 360 + 360) % 360 - 180
  return n === -180 ? 180 : n
}

function placeMarker(lat, lng) {
  if (!mapInstance) return
  if (marcador) marcador.remove()
  marcador = L.circleMarker([lat, lng], {
    radius:      9,
    fillColor:   '#ef4444',
    color:       '#ffffff',
    weight:      3,
    opacity:     1,
    fillOpacity: 0.95,
    className:   'aurora-pin',
  }).addTo(mapInstance)
}

function centralizar(lat, lng) {
  if (!mapInstance) return
  placeMarker(lat, lng)
  mapInstance.flyTo([lat, lng], Math.max(mapInstance.getZoom(), 5), {
    animate:  true,
    duration: 1.2,
  })
}

function onMapClick(e) {
  const lat = clampLat(e.latlng.lat)
  const lon = normalizeLng(e.latlng.lng)
  placeMarker(lat, lon)
  emit('buscarCoordenadas', { lat, lon })
}

onMounted(() => {
  const inicio = props.localizacao
    ? { center: [props.localizacao.lat, props.localizacao.lon], zoom: 6 }
    : { center: [-15, -50], zoom: 4 }

  mapInstance = L.map('aurora-map', {
    center:        inicio.center,
    zoom:          inicio.zoom,
    zoomControl:   true,
    worldCopyJump: true,   // ← arrastar infinitamente: mundo se repete continuamente
  })

  // Esri World Street Map — labels em inglês para a maioria dos países (Tokyo, Moscow, Beijing…)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © <a href="https://www.esri.com/">Esri</a> · OpenStreetMap contributors',
    maxZoom:     19,
    // sem noWrap → mundo se repete em todas as direções
  }).addTo(mapInstance)

  mapInstance.on('click', onMapClick)

  if (props.localizacao) {
    placeMarker(props.localizacao.lat, props.localizacao.lon)
  }
})

watch(() => props.localizacao, (loc) => {
  if (loc) centralizar(loc.lat, loc.lon)
}, { deep: true })

onBeforeUnmount(() => {
  mapInstance?.remove()
  mapInstance = null
})
</script>

<style>
.aurora-pin {
  filter: drop-shadow(0 1px 3px rgba(0,0,0,.5));
  animation: aurora-pin-pulse 1.6s ease-in-out infinite;
}
@keyframes aurora-pin-pulse {
  0%, 100% { opacity: 1;   }
  50%      { opacity: .55; }
}
</style>
