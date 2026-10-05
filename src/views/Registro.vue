<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Centered Brand Header -->
      <div class="brand-header text-center">
        <div class="brand-shield-badge">
          <i class="pi pi-shield"></i>
        </div>
        <div class="brand-badge-label">SECURANET</div>
        <h2 class="brand-title">Crear Cuenta Ciudadana</h2>
        <p class="brand-subtitle">Regístrate para vincular tu red de confianza y acceder a rutas protegidas.</p>
      </div>

      <!-- Registration Form with full-width inputs -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group mb-3">
          <label for="fullName" class="form-label">Nombre Completo</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-user input-icon"></i>
            <input
              id="fullName"
              v-model="registerForm.fullName"
              type="text"
              class="form-input"
              placeholder="Ej. Mathias Cárdenas"
              required
            />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="email" class="form-label">Correo electrónico</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-envelope input-icon"></i>
            <input
              id="email"
              v-model="registerForm.email"
              type="email"
              class="form-input"
              placeholder="nombre@empresa.com"
              required
            />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="phoneNumber" class="form-label">Teléfono Celular</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-phone input-icon"></i>
            <input
              id="phoneNumber"
              v-model="registerForm.phoneNumber"
              type="tel"
              class="form-input"
              placeholder="+51 987 654 321"
              required
            />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-icon-wrapper">
            <i class="pi pi-lock input-icon"></i>
            <input
              id="password"
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Mínimo 8 caracteres"
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

        <div class="form-group mb-3">
          <label for="profileType" class="form-label">¿Cuál es tu rutina principal?</label>
          <div class="select-wrapper">
            <select
              id="profileType"
              v-model="registerForm.profileType"
              class="form-select"
            >
              <option value="Standard">Estándar (Uso cotidiano en ciudad)</option>
              <option value="Student">Estudiante Universitario / Escolar</option>
              <option value="NightWorker">Trabajador Nocturno (Salidas de madrugada)</option>
            </select>
          </div>
        </div>

        <!-- Error message -->
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
          <span>{{ isLoading ? 'CREANDO CUENTA...' : 'CREAR CUENTA Y PROTEGER MI RUTA' }}</span>
        </button>
      </form>

      <!-- Centered Login Footer -->
      <div class="login-footer text-center mt-3">
        <span>¿Ya tienes una cuenta? </span>
        <router-link to="/login" class="login-link font-semibold">Inicia sesión</router-link>
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

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const registerForm = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  profileType: 'Standard'
});

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await authService.register(registerForm.value);

    if (result.token) {
      authStore.setAuth(result.token, result.user);
      router.push('/app/dashboard');
    }
  } catch (error) {
    if (error.status === 409) {
      errorMessage.value = 'El correo electrónico ya está registrado.';
    } else {
      errorMessage.value = error.message || 'Ocurrió un error al crear la cuenta.';
    }
    console.error('Error en registro:', error.raw || error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F8FAFC;
  background-image: radial-gradient(#CBD5E1 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 2rem 1.5rem;
}

.register-card {
  background: #FFFFFF;
  padding: 2.5rem 2.2rem;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 30px rgba(14, 68, 78, 0.08);
  width: 100%;
  max-width: 480px;
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
  line-height: 1.4;
}

.register-form {
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

.select-wrapper {
  width: 100%;
}

.form-select {
  width: 100%;
  height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #1E293B;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-select:focus {
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
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #155A66;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  font-size: 0.84rem;
  color: #64748B;
}

.login-link {
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
