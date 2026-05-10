# 🌤️ Aurora — Dashboard Clima & Notícias

Projeto da disciplina **Laboratório de Desenvolvimento WEB** — FATEC Itatiba · DSM  
Professor: Leandro Felipe Carvalho

---

## 🚀 Como rodar localmente

```bash
# 1. Entrar na pasta
cd aurora

# 2. Instalar dependências (só na primeira vez)
npm install
npm install leaflet

# 3. Rodar em desenvolvimento
npm run dev
```

Abre em `http://localhost:5173` ✅

---

## 📦 Como fazer o build (antes do deploy)

```bash
npm run build
```

Gera a pasta `dist/` com os arquivos prontos para publicação.

---

## 🌐 Deploy no GitHub Pages

### Passo 1 — Criar repositório no GitHub
- Acesse github.com → New repository
- Nome: `aurora` (deve ser igual ao `REPO_NAME` no `vite.config.js`)
- Deixe público

### Passo 2 — Subir o código fonte
```bash
git init
git add .
git commit -m "feat: Aurora - setup inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/aurora.git
git push -u origin main
```

### Passo 3 — Fazer o build e publicar
```bash
npm run build
```

```bash
# Instala o gh-pages (só uma vez)
npm install --save-dev gh-pages
```

Adicione no `package.json`, dentro de `"scripts"`:
```json
"deploy": "gh-pages -d dist"
```

Depois rode:
```bash
npm run deploy
```

### Passo 4 — Ativar GitHub Pages
- Vá em: seu repositório → **Settings** → **Pages**
- Source: `Deploy from a branch`
- Branch: `gh-pages` → `/ (root)`
- Clique **Save**

Aguarde ~2 minutos e acesse:
```
https://SEU-USUARIO.github.io/aurora/
```

---

## 📁 Estrutura do projeto

```
aurora/
├── index.html
├── vite.config.js          ← configurado para GitHub Pages
├── package.json
│
└── src/
    ├── main.js
    ├── App.vue             ← componente raiz
    ├── config/
    │   └── config.js       ← chaves e configurações
    ├── assets/
    │   └── style.css
    ├── api/
    │   ├── weather.js      ← OpenWeatherMap
    │   └── news.js         ← RSS feeds climáticos
    ├── utils/
    │   ├── helpers.js
    │   └── format.js
    └── components/
        ├── NavBar.vue
        ├── CityHero.vue
        ├── WeatherCards.vue
        ├── TempChart.vue
        ├── NewsFeed.vue
        └── WeatherMap.vue  ← Leaflet + Open-Meteo + Nominatim
```

---

## 🔧 APIs utilizadas

| API | Uso | Chave |
|---|---|---|
| OpenWeatherMap | Clima atual + forecast | Necessária (gratuita) |
| Open-Meteo | Clima pelo mapa | ❌ Sem chave |
| Nominatim | Geocoding reverso | ❌ Sem chave |
| Leaflet + OSM | Mapa interativo | ❌ Sem chave |
| RSS G1 / BBC | Notícias climáticas | ❌ Sem chave |

---

## ✅ Critérios do Projeto

- [x] Consumo de API externa (OpenWeatherMap)
- [x] Interface responsiva (mobile + desktop)
- [x] Toggle tema claro/escuro com localStorage
- [x] Toggle °C/°F + m/s/mph em tempo real
- [x] Notícias climáticas com filtros por categoria
- [x] Mapa mundial interativo (Leaflet)
- [x] Código organizado em componentes Vue
- [x] Compatível com GitHub Pages
