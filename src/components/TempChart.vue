<template>
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">{{ t.forecast.title }}</span>
      <span class="panel-badge">Chart.js</span>
    </div>
    <div class="chart-wrap">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, LineElement, PointElement, LineController,
         CategoryScale, LinearScale, Tooltip, Filler } from 'chart.js'
import { toFahrenheit } from '../utils/helpers.js'
import { t, idioma } from '../locales/i18n.js'

// Registra apenas os módulos necessários (tree-shaking)
Chart.register(LineElement, PointElement, LineController,
               CategoryScale, LinearScale, Tooltip, Filler)

const props = defineProps({
  labels:  Array,
  data:    Array,
  unidade: String,
  tema:    String,
})

const canvasRef     = ref(null)
let   chartInstance = null

function buildChart() {
  if (!canvasRef.value || !props.data?.length) return
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }

  const dark    = props.tema === 'dark'
  const gridClr = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'
  const tickClr = dark ? '#7878a8' : '#6666aa'
  const bgCard  = dark ? '#1a1a35' : '#ffffff'
  const bgText  = dark ? '#e8e8ff' : '#1a1a3a'

  const dadosExibidos  = props.unidade === 'F'
    ? props.data.map(toFahrenheit)
    : props.data
  const simbolo = props.unidade === 'F' ? '°F' : '°C'

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label:                `${t.value.forecast.tempLeg} (${simbolo})`,
        data:                 dadosExibidos,
        borderColor:          '#6366f1',
        backgroundColor:      'rgba(99,102,241,.1)',
        pointBackgroundColor: '#38bdf8',
        pointBorderColor:     bgCard,
        pointBorderWidth:     2,
        pointRadius:          6,
        tension:              0.4,
        fill:                 true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: bgCard,
          titleColor:      bgText,
          bodyColor:       '#6366f1',
          borderColor:     '#6366f1',
          borderWidth:     1,
          callbacks: { label: ctx => ` ${ctx.parsed.y} ${simbolo}` },
        },
      },
      scales: {
        x: {
          grid:  { color: gridClr },
          ticks: { color: tickClr, font: { family: 'Space Mono', size: 11 } },
        },
        y: {
          grid:  { color: gridClr },
          ticks: {
            color: tickClr,
            font:  { family: 'Space Mono', size: 11 },
            callback: v => v + (props.unidade === 'F' ? '°F' : '°'),
          },
        },
      },
    },
  })
}

onMounted(buildChart)
onBeforeUnmount(() => chartInstance?.destroy())
watch(() => [props.data, props.unidade, props.tema, idioma.value], buildChart, { deep: true })
</script>
