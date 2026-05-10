/* ═══════════════════════════════════════════════════════════
   src/config/config.js — Configurações do Aurora
   Projeto: Aurora · FATEC Itatiba · DSM
═══════════════════════════════════════════════════════════ */

export const CONFIG = {
  /* ── Open-Meteo (clima atual e previsão — sem chave) ────── */
  METEO_BASE: 'https://api.open-meteo.com/v1',

  /* ── Nominatim geocoding (sem chave) ────────────────────── */
  NOMINATIM_BASE: 'https://nominatim.openstreetmap.org',

  /* ── Preferências ───────────────────────────────────────── */
  CIDADE_PADRAO: 'Itatiba',

  CIDADES_SUG: [
    'São Paulo','Rio de Janeiro','Campinas','Itatiba','Brasília',
    'Salvador','Curitiba','Fortaleza','Manaus','Belo Horizonte',
    'Porto Alegre','Recife','Goiânia','Belém','Florianópolis',
    'New York','London','Tokyo','Paris','Buenos Aires','Lisboa',
  ],
}
