/* ═══════════════════════════════════════════════════════════
   src/api/auth.js — Auth próprio (tabela users + sessão localStorage)

   NÃO usa Supabase Auth — tudo manual pra fugir do rate limit e
   das validações de email. Hash SHA-256 + salt fixo (demo-grade).
═══════════════════════════════════════════════════════════ */

import { supabase } from './supabase.js'
import { t }        from '../locales/i18n.js'

const SALT          = 'aurora-salt-v1'                  // mesmo salt no JS e no SQL de seed
const SESSION_KEY   = 'aurora-session'                  // chave no localStorage

/* ── Hash SHA-256 nativo do browser ──────────────────────── */
async function hashPassword(password) {
  const data = new TextEncoder().encode(SALT + password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/* ── Validações ──────────────────────────────────────────── */
function validarUsername(username) {
  const u = username?.trim() ?? ''
  if (u.length < 3) throw new Error(t.value.auth.errors.usernameMin)
  if (u.length > 20) throw new Error(t.value.auth.errors.usernameMax)
  if (!/^[a-zA-Z0-9_-]+$/.test(u)) throw new Error(t.value.auth.errors.usernameInvalid)
  return u.toLowerCase()
}

function validarSenha(senha) {
  if (!senha || senha.length < 6) throw new Error(t.value.auth.errors.passwordMin)
}

/* ── Sessão em localStorage ──────────────────────────────── */
function salvarSessao(user) {
  const s = { id: user.id, username: user.username }
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  return s
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function limparSessao() {
  localStorage.removeItem(SESSION_KEY)
}

/* ── Cadastro ────────────────────────────────────────────── */
export async function signUp(username, password) {
  const cleanUser = validarUsername(username)
  validarSenha(password)
  const password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .insert({ username: cleanUser, password_hash })
    .select('id, username')
    .single()

  if (error) {
    // 23505 = unique_violation no Postgres
    if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
      throw new Error(t.value.auth.errors.usernameTaken)
    }
    throw new Error(error.message || t.value.auth.errors.generic)
  }

  return salvarSessao(data)
}

/* ── Login ───────────────────────────────────────────────── */
export async function signIn(username, password) {
  const cleanUser = validarUsername(username)
  validarSenha(password)
  const password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', cleanUser)
    .eq('password_hash', password_hash)
    .maybeSingle()

  if (error) throw new Error(error.message || t.value.auth.errors.generic)
  if (!data)  throw new Error(t.value.auth.errors.invalidCredentials)

  return salvarSessao(data)
}

/* ── Logout ──────────────────────────────────────────────── */
export async function signOut() {
  limparSessao()
}

/* ── Compatibilidade: stub para watcher antigo ──────────── */
export function onAuthChange(_callback) {
  // não temos eventos externos de auth nesse modelo;
  // mantemos a função pra não quebrar imports existentes.
  return { data: { subscription: { unsubscribe() {} } } }
}
