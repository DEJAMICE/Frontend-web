<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Centered Brand Header matching InicioSesión.png mockup -->
      <div class="brand-header text-center">
        <div class="brand-shield-badge">
          <i class="pi pi-shield"></i>
        </div>
        <div class="brand-badge-label">SECURANET</div>
        <h2 class="brand-title">Iniciar Sesión</h2>
        <p class="brand-subtitle">Plataforma de Seguridad Urbana</p>
      </div>

      <!-- Login Form with full-width centered inputs -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group mb-3">
          <label for="email" class="form-label">Correo electrónico</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-envelope input-icon"></i>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              class="form-input"
              placeholder="nombre@empresa.com"
              required
            />
          </div>
        </div>

        <div class="form-group mb-2">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-lock input-icon"></i>
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="showPassword = !showPassword"
              title="Mostrar/ocultar contraseña"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Forgot password link aligned to right -->
        <div class="forgot-wrapper text-right mb-3">
          <a href="#" @click.prevent="showForgotInfo" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Error feedback -->
        <div v-if="errorMessage" class="error-alert mb-3">
          <i class="pi pi-exclamation-circle mr-1"></i> {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
        >
          <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
          <span>{{ isLoading ? 'INGRESANDO...' : 'INICIAR SESIÓN' }}</span>
        </button>

        <!-- Divider matching mockup -->
        <div class="divider-row my-3">
          <span class="divider-line"></span>
          <span class="divider-text">o continuar con</span>
          <span class="divider-line"></span>
        </div>

        <!-- Google OAuth Button matching mockup -->
        <button
          type="button"
          class="google-button"
          @click="handleGoogleDemo"
        >
          <svg class="google-icon mr-2" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>
      </form>

      <!-- Centered Register footer -->
      <div class="register-footer text-center mt-3">
        <span>¿No tienes una cuenta? </span>
        <router-link to="/registro" class="register-link font-semibold">Regístrate aquí</router-link>
      </div>

      <div class="landing-link text-center mt-2">
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

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!loginForm.value.email?.trim() || !loginForm.value.password) {
    errorMessage.value = 'Por favor ingresa tu correo y contraseña.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await authService.login(loginForm.value);

    if (result.token) {
      authStore.setAuth(result.token, result.user);
      router.push('/app/dashboard');
    } else {
      errorMessage.value = 'No se pudo obtener el token de sesión.';
    }
  } catch (error) {
    errorMessage.value = error.message || 'Correo o contraseña incorrectos.';
  } finally {
    isLoading.value = false;
  }
};

const showForgotInfo = () => {
  alert('Se ha enviado un enlace de recuperación al correo indicado si se encuentra registrado.');
};

const handleGoogleDemo = async () => {
  // Rellena e inicia sesión con el usuario semilla oficial del Backend
  loginForm.value.email = 'demo@safesignal.pe';
  loginForm.value.password = 'Demo1234!';
  await handleLogin();
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F8FAFC;
  background-image: radial-gradient(#CBD5E1 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 1.5rem;
}

.login-card {
  background: #FFFFFF;
  padding: 2.5rem 2.2rem;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 30px rgba(14, 68, 78, 0.08);
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.brand-header {
  margin-bottom: 1.8rem;
}

.brand-shield-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #E6F7F5;
  color: #0E444E;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 10px;
}

.brand-badge-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 4px;
}

.brand-title {
  margin: 0 0 4px 0;
  font-size: 1.55rem;
  font-weight: 700;
  color: #0E444E;
}

.brand-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748B;
}

.login-form {
  width: 100%;
}

.form-group {
  width: 100%;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 6px;
  text-align: left;
}

.input-icon-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94A3B8;
  font-size: 0.95rem;
  pointer-events: none;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0.5rem 2.4rem 0.5rem 2.4rem;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1E293B;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #00A896;
  box-shadow: 0 0 0 3px rgba(0, 168, 150, 0.15);
}

.password-toggle-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: #94A3B8;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

.password-toggle-btn:hover {
  color: #0E444E;
}

.forgot-wrapper {
  text-align: right;
}

.forgot-link {
  font-size: 0.80rem;
  color: #64748B;
  text-decoration: none;
}

.forgot-link:hover {
  color: #00A896;
  text-decoration: underline;
}

.error-alert {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
}

.submit-button {
  width: 100%;
  height: 46px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #155A66;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider-row {
  display: flex;
  align-items: center;
  margin: 1.2rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #E2E8F0;
}

.divider-text {
  padding: 0 10px;
  font-size: 0.75rem;
  color: #94A3B8;
}

.google-button {
  width: 100%;
  height: 44px;
  background-color: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.google-button:hover {
  background-color: #F8FAFC;
}

.register-footer {
  font-size: 0.84rem;
  color: #64748B;
}

.register-link {
  color: #0E444E;
  text-decoration: underline;
}

.landing-link a {
  font-size: 0.78rem;
  color: #94A3B8;
  text-decoration: none;
}

.landing-link a:hover {
  color: #00A896;
}
</style>