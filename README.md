# 🌤️ Aurora — Dashboard de Clima & Notícias

Projeto da disciplina **Laboratório de Desenvolvimento WEB**
FATEC Itatiba · Curso de Desenvolvimento de Software Multiplataforma (DSM)
Professor: Leandro Felipe Carvalho

Aurora é uma SPA (Single Page Application) construída com **Vue 3** e **Vite** que reúne, em uma única tela, o clima atual de qualquer ponto do mundo, previsão dos próximos cinco dias, mapa climático interativo e notícias internacionais focadas em meteorologia, clima e desastres naturais. Não exige backend, não exige chaves de API e está pronta para deploy estático no GitHub Pages.

---

## 🧠 Sumário

- [Stack & decisões técnicas](#-stack--decisões-técnicas)
- [Arquitetura](#-arquitetura)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Funcionalidades](#-funcionalidades)
- [APIs externas](#-apis-externas)
- [Sistema de internacionalização (i18n)](#-sistema-de-internacionalização-i18n)
- [Mapa climático](#-mapa-climático)
- [Sistema de notícias (RSS)](#-sistema-de-notícias-rss)
- [Como rodar localmente](#-como-rodar-localmente)
- [Build de produção](#-build-de-produção)
- [Deploy no GitHub Pages](#-deploy-no-github-pages)
- [Critérios do projeto](#-critérios-do-projeto)

---

## 🛠️ Stack & decisões técnicas

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | **Vue 3** (Composition API + `<script setup>`) | SFC limpo, reatividade granular, sem boilerplate |
| Build tool | **Vite** | Hot reload instantâneo, build otimizado, suporte nativo a ES Modules |
| Gráficos | **Chart.js 4** (tree-shaking) | Importa apenas os módulos usados — bundle ~30 KB |
| Mapa | **Leaflet 1.9** + **Esri World Street Map** | Open-source, sem chave, labels em inglês |
| Estilo | **CSS puro** com variáveis (CSS Custom Properties) | Sem framework CSS — controle total + bundle pequeno |
| Fontes | **Google Fonts** — DM Sans + Space Mono | Tipografia moderna e legível em qualquer densidade |
| Persistência local | **localStorage** | Tema, unidade °C/°F e idioma persistem entre sessões |
| i18n | Sistema próprio (~30 linhas) | Sem dependência de Vue I18n, totalmente reativo |

> **Sem backend, sem banco de dados, sem chaves de API.** Aurora consome apenas serviços públicos abertos — funciona 100% no browser e pode ser hospedada em qualquer servidor estático.

---

## 🏗️ Arquitetura

Aurora segue um padrão simples e centralizado:

```
┌─────────────────────────────────────────────────────────────┐
│                          App.vue                             │
│  Estado global: clima, forecast, noticias, tema, unidade    │
│  Orquestra: buscarClima, buscarClimaByCoords, buscarNoticias│
└──┬──────────────────────────────────────────────────────────┘
   │
   ├── NavBar      ← busca, toggle PT/EN, °C/°F, tema
   ├── CityHero    ← cidade + país + bandeira + min/max
   ├── WeatherCards← 4 cards (temp, umidade, vento, visibilidade)
   ├── WeatherMap  ← Leaflet, pin vermelho, clique = nova localização
   ├── TempChart   ← Chart.js — previsão de 5 dias
   └── NewsFeed    ← RSS de 9 fontes filtradas por palavra-chave
```

**Fluxo de dados:**
1. NavBar emite `buscar(cidade)` ou WeatherMap emite `buscarCoordenadas({lat, lon})`
2. App.vue chama `fetchClima` ou `fetchClimaByCoords` em [`src/api/weather.js`](src/api/weather.js)
3. weather.js chama Nominatim (geocoding) + Open-Meteo (clima) em paralelo
4. O objeto `clima` populado é passado como prop para todos os componentes filhos
5. Mudanças em `unidade`, `tema` ou `idioma` disparam computeds — UI re-renderiza sem refetch
6. Trocar idioma dispara um watcher que refaz o fetch para atualizar nomes de cidade/país/descrição no novo idioma

---

## 📁 Estrutura de pastas

```
aurora/
├── index.html                    ← HTML raiz, fontes do Google
├── vite.config.js                ← base path para GitHub Pages
├── package.json
│
├── public/                       ← assets estáticos copiados como estão
│
└── src/
    ├── main.js                   ← bootstrap do Vue
    ├── App.vue                   ← estado global e composição
    │
    ├── config/
    │   └── config.js             ← endpoints (Open-Meteo, Nominatim) + cidades padrão
    │
    ├── assets/
    │   └── style.css             ← variáveis CSS, layouts, animações
    │
    ├── api/
    │   ├── weather.js            ← Open-Meteo + Nominatim
    │   └── news.js               ← RSS via 4 proxies CORS de fallback
    │
    ├── utils/
    │   ├── helpers.js            ← wmoIcon, wmoDescription, windDir, conversões
    │   └── format.js             ← dataFormatada, timeAgo, capitalize
    │
    ├── locales/
    │   ├── i18n.js               ← composable: idioma (ref), t (computed), setIdioma
    │   └── translations.js       ← dicionário PT-BR + EN
    │
    └── components/
        ├── NavBar.vue            ← branding, busca, toggles
        ├── CityHero.vue          ← localização ativa + bandeira
        ├── WeatherCards.vue      ← 4 cards de condições atuais
        ├── TempChart.vue         ← gráfico Chart.js
        ├── NewsFeed.vue          ← lista de notícias com filtros
        └── WeatherMap.vue        ← Leaflet com Esri Tiles
```

---

## ✨ Funcionalidades

### Núcleo
- 🔍 **Busca por nome de cidade** — multilíngue via Nominatim (ex: "Tóquio" encontra Tokyo)
- 🗺️ **Mapa interativo** — clique em qualquer ponto do mundo para atualizar tudo
- 📊 **Previsão de 5 dias** — gráfico de linha animado
- 📰 **Feed de notícias** — 9 fontes RSS internacionais filtradas por palavras-chave climáticas
- 🌤️ **Cards de condições atuais** — temperatura, umidade, vento, visibilidade, sensação térmica, pressão

### Toggles globais
- 🌓 **Tema** — claro / escuro (persistente em localStorage)
- 🌡️ **Unidade** — °C/°F com conversão completa em tempo real:
  - Temperatura: °C ↔ °F
  - Vento: m/s ↔ mph
  - Visibilidade: km ↔ mi
  - Pressão: hPa ↔ inHg
- 🌐 **Idioma** — PT-BR / EN com refetch automático para atualizar nomes da API

### UX/UI
- 🚩 **Bandeira do país** — imagem PNG via [flagpedia.net](https://flagpedia.net) (compatível com qualquer SO)
- 🔴 **Pin pulsante** — bolinha vermelha animada na localização ativa do mapa
- 🌀 **flyTo animado** — câmera do mapa voa suavemente até nova localização
- 🌍 **Mapa infinito** — `worldCopyJump` mantém o mundo se repetindo continuamente
- 📱 **Responsivo** — quebra em coluna única abaixo de 1100px

---

## 🌐 APIs externas

Todas gratuitas, públicas e **sem chave de API**:

| Serviço | Uso | Endpoint |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Clima atual + previsão + visibilidade | `api.open-meteo.com/v1/forecast` |
| [Nominatim](https://nominatim.openstreetmap.org) | Geocoding direto e reverso (com `accept-language`) | `nominatim.openstreetmap.org/{search,reverse}` |
| [Esri ArcGIS](https://www.esri.com) | Tiles do mapa com labels em inglês | `server.arcgisonline.com/.../World_Street_Map` |
| [flagpedia.net](https://flagpedia.net) | Imagens PNG de bandeiras (`w160` webp) | `flagpedia.net/data/flags/w160/{cc}.webp` |
| RSS Feeds | Notícias de clima e meio ambiente | BBC, Guardian, NASA, Yale E360, etc. |
| Proxies CORS | Contorna CORS de RSS (4 com fallback) | corsproxy.io, allorigins.win, codetabs, thingproxy |

### Validação defensiva de coordenadas

Toda chamada a `fetchMeteoAtual` e `fetchClimaByCoords` passa por `validarCoords()`:
- Latitude clamada em `[-90, 90]`
- Longitude normalizada para `[-180, 180]` via wrap matemático
- Mensagens de erro traduzidas (PT-BR ou EN)

Isso impede o erro 400 do Open-Meteo quando o usuário arrasta o mapa para fora do mundo.

---

## 🌎 Sistema de internacionalização (i18n)

Sem Vue I18n — apenas ~30 linhas de Vue Composition API.

### Como funciona

```js
// src/locales/i18n.js
import { ref, computed } from 'vue'
import { TRANSLATIONS } from './translations.js'

export const idioma = ref(localStorage.getItem('aurora-idioma') || 'pt-BR')
export const t      = computed(() => TRANSLATIONS[idioma.value])

export function setIdioma(novo) {
  idioma.value = novo
  localStorage.setItem('aurora-idioma', novo)
  document.documentElement.setAttribute('lang', novo)
}

export function langPref() {
  return idioma.value === 'pt-BR' ? 'pt-BR,en' : 'en,pt-BR'
}
```

### Em qualquer componente

```vue
<script setup>
import { t } from '@/locales/i18n.js'
</script>

<template>
  <h1>{{ t.cards.temperature }}</h1>
</template>
```

### O que está traduzido
- Toda a UI: NavBar, cards, gráfico, notícias, mapa, mensagens de loading/erro
- Descrições de clima (códigos WMO 0–99)
- Direções do vento (`N/NE/L/SE/...` ↔ `N/NE/E/SE/...`)
- Nomes dos dias da semana
- Categorias de notícias
- `timeAgo`: "há 5min" ↔ "5min ago"
- Format de data via `Intl.DateTimeFormat` com `dateLocale` do idioma
- `Accept-Language` enviado ao Nominatim segue o idioma ativo

### Reatividade ao trocar idioma

```
Usuário clica EN
    ↓
setIdioma('en')
    ↓ (reatividade Vue)
t computed atualiza  → todos os componentes que leem t.* re-renderizam
langPref() retorna 'en,pt-BR'
    ↓
App.vue watcher dispara
    ↓
buscarClimaByCoords({ lat, lon })  → API retorna nomes em inglês
    ↓
clima.value atualizado → CityHero, WeatherCards, TempChart refletem
TempChart watcher detecta idioma → reconstrói gráfico com Sun/Mon/...
NewsFeed re-formata timeAgo via computed
```

Tudo síncrono e sem refresh.

---

## 🗺️ Mapa climático

### Provider de tiles
Usa **Esri World Street Map** em vez do OSM padrão porque possui cobertura em inglês muito mais ampla para regiões fora do alfabeto latino — Moscow, Tokyo, Beijing, Seoul aparecem em inglês na maioria dos zooms.

> Limitação: raster tiles têm labels "queimadas" no momento da geração. Para tradução perfeita em runtime seria necessário migrar para vector tiles + MapLibre GL.

### Comportamento
- **Clique** → coordenadas normalizadas → emite `buscarCoordenadas` para o App
- **flyTo animado** (1.2s) até a localização clicada
- **Pin vermelho pulsante** (`L.circleMarker` SVG + animação CSS de opacidade)
- **`worldCopyJump: true`** — o mapa se repete infinitamente sem áreas cinzas
- **Zoom mantido** após cada clique (mínimo 5)

### Configurações

```js
mapInstance = L.map('aurora-map', {
  worldCopyJump: true,
  zoomControl:   true,
})

L.tileLayer('https://server.arcgisonline.com/.../tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri · OpenStreetMap contributors',
  maxZoom: 19,
})
```

---

## 📰 Sistema de notícias (RSS)

### Feeds (9 fontes internacionais)

| Fonte | Idioma | Foco |
|---|---|---|
| BBC Science & Environment | EN | Clima, ambiente, ciência |
| Guardian Environment | EN | Meio ambiente, política climática |
| NASA Earth Observatory | EN | Imagens da Terra, clima |
| Yale Environment 360 | EN | Jornalismo ambiental de qualidade |
| Inside Climate News | EN | Jornalismo climático investigativo |
| Carbon Brief | EN | Ciência e política do clima |
| Climate Home News | EN | Política climática global |
| BBC Brasil | PT | Notícias em português |
| G1 | PT | Fallback em português |

### Pipeline

1. Para cada feed, tenta 4 proxies CORS em ordem (corsproxy.io → allorigins → codetabs → thingproxy)
2. Parser DOM do XML extrai `<item>` (título, link, descrição, pubDate, fonte)
3. **Filtro por palavras-chave** — 50+ termos em PT e EN: `tempestade`, `furacão`, `storm`, `hurricane`, `flood`, `heat wave`, etc.
4. Categorização visual (Chuva, Calor, Frio, Vento, Desastres, Incêndios, Todas)
5. Fallback: se nenhuma notícia passar no filtro, retorna todas as encontradas (sem filtro)

### Tempo relativo reativo

Em vez de pré-calcular `tempo` no parser, retornamos `pubDate` cru. O componente `NewsFeed` formata via `computed` que re-roda quando o idioma muda — "há 5 min" vira "5min ago" sem refetch.

---

## 🚀 Como rodar localmente

Pré-requisitos: **Node.js 20.19+** ou **22.12+**.

```bash
# 1. Entre na pasta do projeto
cd aurora

# 2. Instale dependências (apenas na primeira vez)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abre em http://localhost:5173 com hot-reload.

---

## 📦 Build de produção

```bash
npm run build
```

Gera a pasta `dist/` com HTML/CSS/JS minificados e otimizados.

Para testar o build local:
```bash
npm run preview
```

---

## 🌍 Deploy no GitHub Pages

### 1. Configurar `vite.config.js`
O `base` path já está configurado para `/aurora/` em produção. Se renomear o repositório, ajuste a constante `REPO_NAME`:

```js
const REPO_NAME = 'aurora'   // ← nome do seu repo no GitHub
```

### 2. Subir o código
```bash
git init
git add .
git commit -m "feat: aurora inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/aurora.git
git push -u origin main
```

### 3. Instalar `gh-pages` e fazer deploy
```bash
npm install --save-dev gh-pages
```

Adicione em `package.json` dentro de `"scripts"`:
```json
"deploy": "npm run build && gh-pages -d dist"
```

```bash
npm run deploy
```

### 4. Ativar Pages
- Vá em **Settings → Pages**
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `(root)`
- Salve

Em ~2 minutos, acesse: `https://SEU-USUARIO.github.io/aurora/`

---

## ✅ Critérios do projeto

- [x] Consumo de API externa (Open-Meteo + Nominatim)
- [x] Interface responsiva (mobile + tablet + desktop)
- [x] Toggle tema claro/escuro com persistência (localStorage)
- [x] Toggle °C/°F com conversão completa de temperatura, vento, visibilidade e pressão
- [x] Internacionalização PT-BR ↔ EN com refetch reativo
- [x] Notícias climáticas com filtros por categoria (9 fontes RSS)
- [x] Mapa mundial interativo com pin pulsante + flyTo animado
- [x] Componentização Vue com Composition API
- [x] Validação defensiva de coordenadas (impede erro 400)
- [x] Compatível com GitHub Pages (deploy estático)
- [x] Zero chaves de API — funciona em qualquer ambiente

---

**Aurora · FATEC Itatiba · DSM**
Desenvolvido como projeto de Laboratório de Desenvolvimento WEB
