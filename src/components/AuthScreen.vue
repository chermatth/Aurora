<template>
  <div class="auth-screen">

    <!-- Toggles de tema / idioma no canto -->
    <div class="auth-topbar">
      <button class="btn-unit" @click="toggleIdioma" :title="t.nav.tipLang">
        <span :class="idioma === 'pt-BR' ? 'unit-active' : 'unit-inactive'">PT</span>
        <span class="unit-sep">/</span>
        <span :class="idioma === 'en' ? 'unit-active' : 'unit-inactive'">EN</span>
      </button>
      <button class="btn-icon" @click="$emit('toggleTema')" :title="tema === 'dark' ? t.nav.tipThemeDark : t.nav.tipThemeLight">
        {{ tema === 'dark' ? '☀️' : '🌙' }}
      </button>
    </div>

    <div class="auth-card fade-up">
      <!-- Logo / branding -->
      <div class="auth-brand">
        <span class="auth-brand-icon">🌤️</span>
        <span class="auth-brand-name">Aurora</span>
      </div>
      <div class="auth-welcome">
        <div class="auth-welcome-title">{{ t.auth.welcomeTitle }}</div>
        <div class="auth-welcome-sub">{{ t.auth.welcomeSubtitle }}</div>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ active: modo === 'login' }"
          @click="trocarModo('login')"
        >{{ t.auth.tabLogin }}</button>
        <button
          class="auth-tab"
          :class="{ active: modo === 'signup' }"
          @click="trocarModo('signup')"
        >{{ t.auth.tabSignup }}</button>
      </div>

      <!-- Formulário -->
      <form class="auth-form" @submit.prevent="onSubmit" autocomplete="off">

        <label class="auth-field">
          <span class="auth-label">{{ t.auth.usernameLabel }}</span>
          <input
            class="auth-input"
            type="text"
            v-model="username"
            :placeholder="t.auth.usernamePlace"
            autocomplete="off"
            spellcheck="false"
            required
            maxlength="20"
          />
        </label>

        <label class="auth-field">
          <span class="auth-label">{{ t.auth.passwordLabel }}</span>
          <input
            class="auth-input"
            type="password"
            v-model="password"
            :placeholder="t.auth.passwordPlace"
            autocomplete="off"
            required
            minlength="6"
          />
        </label>

        <div class="auth-err" v-if="erro">⚠️ {{ erro }}</div>

        <button class="auth-submit" type="submit" :disabled="loading">
          <span class="spinner-sm" v-if="loading"></span>
          {{ loading ? labelLoading : labelSubmit }}
        </button>

        <button class="auth-switch" type="button" @click="trocarModo(modo === 'login' ? 'signup' : 'login')">
          {{ modo === 'login' ? t.auth.switchToSignup : t.auth.switchToLogin }}
        </button>
      </form>
    </div>

    <div class="auth-footer">
      Aurora · FATEC Itatiba · DSM
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { signIn, signUp } from '../api/auth.js'
import { t, idioma, setIdioma } from '../locales/i18n.js'

defineProps({ tema: String })
const emit = defineEmits(['authenticated', 'toggleTema'])

const modo     = ref('login')           // 'login' | 'signup'
const username = ref('')
const password = ref('')
const loading  = ref(false)
const erro     = ref('')

const labelSubmit  = computed(() => modo.value === 'login' ? t.value.auth.btnLogin : t.value.auth.btnSignup)
const labelLoading = computed(() => modo.value === 'login' ? t.value.auth.loadingLogin : t.value.auth.loadingSignup)

function trocarModo(novo) {
  modo.value = novo
  erro.value  = ''
}

function toggleIdioma() {
  setIdioma(idioma.value === 'pt-BR' ? 'en' : 'pt-BR')
}

async function onSubmit() {
  erro.value = ''
  loading.value = true
  try {
    if (modo.value === 'login') {
      await signIn(username.value, password.value)
    } else {
      await signUp(username.value, password.value)
    }
    emit('authenticated')                  // App.vue reage carregando a UI principal
  } catch (e) {
    erro.value = e.message || t.value.auth.errors.generic
  } finally {
    loading.value = false
  }
}
</script>
