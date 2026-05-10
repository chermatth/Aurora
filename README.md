# 🌤️ Aurora — Dashboard de Clima & Notícias

Projeto da disciplina **Laboratório de Desenvolvimento WEB**
FATEC Itatiba · Curso de Desenvolvimento de Software Multiplataforma (DSM)
Professor: Leandro Felipe Carvalho

Aurora é um painel completo de clima e notícias climáticas em tempo real. Em uma única tela você consulta as condições atuais de qualquer cidade do mundo, vê a previsão para os próximos cinco dias, navega por um mapa interativo e acompanha notícias internacionais sobre meteorologia, meio ambiente e desastres naturais.

---

## 🧠 Sumário

- [O que o Aurora faz](#-o-que-o-aurora-faz)
- [Funcionalidades](#-funcionalidades)
- [Como usar](#-como-usar)
- [Conversão de unidades](#-conversão-de-unidades)
- [Sistema de idiomas](#-sistema-de-idiomas)
- [Mapa climático mundial](#-mapa-climático-mundial)
- [Notícias climáticas](#-notícias-climáticas)
- [Tecnologias & fontes de dados](#-tecnologias--fontes-de-dados)

---

## 🌍 O que o Aurora faz

O Aurora reúne em um só lugar:

- ☁️ **Clima atual** detalhado de qualquer cidade do mundo
- 📊 **Previsão de cinco dias** em gráfico animado
- 🗺️ **Mapa interativo** para escolher localização clicando em qualquer ponto do globo
- 📰 **Notícias internacionais** filtradas automaticamente por temas climáticos (chuva, calor, frio, vento, desastres, incêndios)
- 🌐 **Suporte a dois idiomas** (Português e Inglês) com troca em tempo real
- 🌡️ **Sistema métrico ou imperial** com conversão completa em todas as medidas

Tudo funciona direto no navegador — sem cadastro, sem login, sem custos.

---

## ✨ Funcionalidades

### Núcleo

- 🔍 **Busca por nome de cidade** — multilíngue: pesquisar *"Tóquio"* encontra Tokyo, *"Moscou"* encontra Moscow, *"Londres"* encontra London e vice-versa
- 🗺️ **Mapa interativo** — clique em qualquer ponto do mundo e o Aurora atualiza tudo (clima, previsão, notícias)
- 📊 **Previsão de 5 dias** — gráfico de linha animado com temperaturas máximas
- 🌤️ **4 cards de condições atuais** — temperatura, umidade, vento e visibilidade, com sensação térmica, ponto de orvalho, direção do vento e pressão como informação complementar
- 🚩 **Bandeira do país ativo** — exibida automaticamente ao lado do nome da localização
- 📰 **Feed de notícias climáticas** — fontes internacionais filtradas por palavras-chave de meteorologia e clima

### Toggles globais (canto superior direito)

- 🌐 **PT / EN** — alterna entre Português e Inglês
- 🌡️ **°C / °F** — alterna entre sistema métrico e imperial
- 🌓 **Tema claro / escuro** — clique no sol/lua

Todas as preferências são salvas no navegador e mantidas na próxima visita.

### Experiência

- 📱 **Totalmente responsivo** — funciona bem em desktop, tablet e celular
- 🔴 **Pin pulsante** — bolinha vermelha animada destaca a localização ativa no mapa
- 🌀 **Animação suave do mapa** — câmera "voa" até a nova localização ao clicar
- 🌍 **Mapa infinito** — o mundo se repete continuamente quando você arrasta horizontalmente

---

## 🎯 Como usar

### Pesquisar uma cidade

Use o campo de busca na barra superior. Você pode:

- Digitar o nome em **qualquer idioma** — o sistema reconhece traduções (ex: digitar "Pequim" encontra Beijing)
- Clicar em uma das **sugestões automáticas** que aparecem
- Pressionar **Enter** ou clicar no botão *Buscar*

### Selecionar pelo mapa

Clique em qualquer ponto do mapa interativo. O Aurora vai:

1. Identificar a cidade mais próxima do clique
2. Buscar todos os dados climáticos do local
3. Atualizar o pin vermelho na nova posição
4. Animar o mapa até centralizar no ponto selecionado
5. Recarregar previsão, cards e gráficos automaticamente

### Filtrar notícias

No painel de notícias, clique em qualquer categoria para filtrar:
🌐 Todas · 🌧️ Chuva · 🌡️ Calor · ❄️ Frio · 💨 Vento · ⚠️ Desastres · 🔥 Incêndios

---

## 🌡️ Conversão de unidades

Quando você alterna entre °C e °F, **todas** as medidas convertem em tempo real:

| Medida | Métrico (°C) | Imperial (°F) |
|---|---|---|
| Temperatura | °C | °F |
| Sensação térmica | °C | °F |
| Vento | m/s | mph |
| Visibilidade | km | mi |
| Pressão | hPa | inHg |
| Umidade | % | % |

Não há recarga de página — a conversão é instantânea.

---

## 🌎 Sistema de idiomas

Aurora oferece interface completa em **Português (PT-BR)** e **Inglês (EN)**.

Ao trocar o idioma:
- Toda a interface (botões, labels, mensagens) muda
- Descrições do clima são re-traduzidas (*"Céu limpo"* ↔ *"Clear sky"*)
- Direções do vento mudam (*"NE/L/SO"* ↔ *"NE/E/SW"*)
- Dias da semana no gráfico mudam (*"Seg/Ter/Qua"* ↔ *"Mon/Tue/Wed"*)
- Categorias de notícias mudam
- Tempo relativo das notícias muda (*"há 5min"* ↔ *"5min ago"*)
- Os dados da cidade ativa são **re-buscados automaticamente** para retornar nomes da cidade, estado e país no novo idioma

A preferência de idioma é detectada do navegador na primeira visita e depois persistida.

---

## 🗺️ Mapa climático mundial

O mapa do Aurora utiliza tiles do **Esri World Street Map**, escolhido pela cobertura ampla de nomes em alfabeto latino — Tokyo, Moscow, Beijing, Seoul aparecem em forma legível em vez dos caracteres locais.

**Comportamento ao clicar:**
- Coordenadas são validadas e normalizadas (impede erros nas bordas do mundo)
- Marcador anterior é removido e um novo pin vermelho pulsante aparece no local
- A câmera realiza um *flyTo* animado de ~1.2 segundos
- O zoom atual é mantido (mínimo 5 para garantir visualização da cidade)
- A localização ativa torna-se o foco principal da visualização

**Mapa infinito:** ao arrastar horizontalmente, o mundo se repete continuamente — não há áreas cinzas/vazias nas bordas.

---

## 📰 Notícias climáticas

Aurora reúne notícias de **9 fontes internacionais** focadas em meteorologia, clima, meio ambiente e desastres naturais:

| Fonte | Idioma |
|---|---|
| BBC Science & Environment | Inglês |
| The Guardian — Environment | Inglês |
| NASA Earth Observatory | Inglês |
| Yale Environment 360 | Inglês |
| Inside Climate News | Inglês |
| Carbon Brief | Inglês |
| Climate Home News | Inglês |
| BBC Brasil | Português |
| G1 | Português |

As manchetes são filtradas automaticamente por mais de 50 palavras-chave em ambos os idiomas (`tempestade`, `furacão`, `storm`, `hurricane`, `flood`, `heat wave`, etc.) garantindo que apenas conteúdo relevante apareça.

Cada notícia exibe a fonte, o tempo desde a publicação e abre na fonte original ao ser clicada.

---

## 🛠️ Tecnologias & fontes de dados

### Stack frontend

- **Vue 3** (Composition API) com **Vite**
- **Chart.js** para o gráfico de previsão
- **Leaflet** para o mapa interativo
- **CSS puro** com variáveis customizadas (sem framework CSS)
- **Google Fonts** — DM Sans + Space Mono

### APIs e serviços (todos gratuitos, sem chave de API)

| Serviço | O que fornece |
|---|---|
| [Open-Meteo](https://open-meteo.com) | Clima atual, previsão e visibilidade |
| [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org) | Conversão entre nome de cidade e coordenadas geográficas |
| [Esri ArcGIS](https://www.esri.com) | Tiles do mapa interativo |
| [Flagpedia](https://flagpedia.net) | Bandeiras dos países em alta resolução |
| Feeds RSS públicos | Notícias climáticas internacionais |

Aurora não armazena dados pessoais, não rastreia usuários e funciona inteiramente no navegador.

---

**Aurora · FATEC Itatiba · DSM**
Projeto de Laboratório de Desenvolvimento WEB
