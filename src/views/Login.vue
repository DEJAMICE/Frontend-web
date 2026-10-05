<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand-badge-center">
        <div class="brand-shield-icon">
          <i class="pi pi-shield"></i>
        </div>
        <h2 class="brand-title">SecuraNet</h2>
        <span class="brand-subtitle">Smart Urban Safety</span>
      </div>

      <h3 class="login-header">Iniciar Sesión</h3>
      <p class="login-desc">Ingresa a tu cuenta para acceder al centro de monitoreo y alertas.</p>

      <form @submit.prevent="handleLogin" class="p-fluid">
        <div class="field">
          <label for="email">Correo electrónico</label>
          <InputText
              id="email"
              v-model="loginForm.email"
              type="email"
              required
              placeholder="ejemplo@correo.com"
          />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
              id="password"
              v-model="loginForm.password"
              :feedback="false"
              toggleMask
              required
              placeholder="Ingresa tu contraseña"
          />
        </div>

        <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>

        <Button
            type="submit"
            label="Iniciar Sesión"
            :loading="isLoading"
            class="mt-3 submit-btn"
        />
      </form>

      <div class="register-link mt-4 text-center">
        ¿No tienes cuenta? <router-link to="/registro">Regístrate aquí</router-link>
      </div>

      <div class="landing-back-link mt-3 text-center">
        <a href="https://dejamice.github.io/Landing-Page/">
          <i class="pi pi-arrow-left mr-1"></i> Volver a la Landing Page
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({
  email: '',
  password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await authService.login(loginForm.value);

    if (result.token) {
      authStore.setAuth(result.token, result.user);
      router.push('/app/dashboard');
    }
  } catch (error) {
    errorMessage.value = error.message || 'Credenciales incorrectas.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg, #F4F8F8);
  padding: 1.5rem;
}

.login-card {
  background: white;
  padding: 2.2rem;
  border-radius: 12px;
  border: 1.5px solid var(--border, #D7E4E6);
  box-shadow: 0 4px 20px rgba(14, 68, 78, 0.06);
  width: 100%;
  max-width: 420px;
}

.brand-badge-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.brand-shield-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--brand, #0E444E);
  color: var(--accent, #00A896);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 8px;
  box-shadow: 0 4px 10px rgba(14, 68, 78, 0.2);
}

.brand-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--brand, #0E444E);
}

.brand-subtitle {
  font-size: 0.72rem;
  color: var(--muted, #7A8A8C);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.login-header {
  font-size: 1.15rem;
  color: var(--ink, #1B2B2E);
  margin: 0 0 4px 0;
  font-weight: 600;
}

.login-desc {
  font-size: 0.82rem;
  color: var(--sub, #5A6B6E);
  margin: 0 0 1.5rem 0;
}

.field {
  margin-bottom: 1.2rem;
}

.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sub, #5A6B6E);
  margin-bottom: 6px;
}

.p-error {
  color: var(--danger, #D32F2F);
  display: block;
  margin-bottom: 1rem;
  font-size: 0.82rem;
}

.submit-btn {
  background-color: var(--brand, #0E444E) !important;
  border-color: var(--brand, #0E444E) !important;
  color: #FFFFFF !important;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.submit-btn:hover {
  background-color: var(--brand-hover, #155A66) !important;
  border-color: var(--brand-hover, #155A66) !important;
}

.register-link {
  font-size: 0.85rem;
  color: var(--sub, #5A6B6E);
}

.landing-back-link a {
  font-size: 0.80rem;
  color: var(--muted, #7A8A8C);
}

.landing-back-link a:hover {
  color: var(--accent-ink, #00695C);
}
</style>