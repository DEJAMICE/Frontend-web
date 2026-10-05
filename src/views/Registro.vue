<template>
  <div class="register-container">
    <div class="register-card">
      <div class="brand-badge-center">
        <div class="brand-shield-icon">
          <i class="pi pi-shield"></i>
        </div>
        <h2 class="brand-title">SecuraNet</h2>
        <span class="brand-subtitle">Smart Urban Safety</span>
      </div>

      <h3 class="register-header">Crear Cuenta Ciudadana</h3>
      <p class="register-desc">Regístrate para vincular tu red de confianza y acceder a rutas protegidas.</p>

      <form @submit.prevent="handleRegister" class="p-fluid">
        <div class="field">
          <label for="fullName">Nombre Completo</label>
          <InputText
              id="fullName"
              v-model="registerForm.fullName"
              type="text"
              required
              placeholder="Ej. Mathias Cárdenas"
          />
        </div>

        <div class="field">
          <label for="email">Correo electrónico</label>
          <InputText
              id="email"
              v-model="registerForm.email"
              type="email"
              required
              placeholder="ejemplo@correo.com"
          />
        </div>

        <div class="field">
          <label for="phoneNumber">Teléfono Celular</label>
          <InputText
              id="phoneNumber"
              v-model="registerForm.phoneNumber"
              type="tel"
              required
              placeholder="+51987654321"
          />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
              id="password"
              v-model="registerForm.password"
              toggleMask
              required
              promptLabel="Ingresa una contraseña"
              weakLabel="Débil"
              mediumLabel="Media"
              strongLabel="Fuerte"
              placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div class="field">
          <label for="profileType">¿Cuál es tu rutina principal?</label>
          <Dropdown
              id="profileType"
              v-model="registerForm.profileType"
              :options="profileOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un perfil"
          />
        </div>

        <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>

        <Button
            type="submit"
            label="Crear Cuenta y Proteger mi Ruta"
            :loading="isLoading"
            class="mt-3 submit-btn"
        />
      </form>

      <div class="login-link mt-4 text-center">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
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

const profileOptions = ref([
  { label: 'Estándar', value: 'Standard' },
  { label: 'Estudiante Universitario', value: 'Student' },
  { label: 'Trabajador Nocturno', value: 'NightWorker' }
]);

const registerForm = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  profileType: 'Standard'
});

const isLoading = ref(false);
const errorMessage = ref('');

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
  background-color: var(--bg, #F4F8F8);
  padding: 2rem 1.5rem;
}

.register-card {
  background: white;
  padding: 2.2rem;
  border-radius: 12px;
  border: 1.5px solid var(--border, #D7E4E6);
  box-shadow: 0 4px 20px rgba(14, 68, 78, 0.06);
  width: 100%;
  max-width: 480px;
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

.register-header {
  font-size: 1.15rem;
  color: var(--ink, #1B2B2E);
  margin: 0 0 4px 0;
  font-weight: 600;
}

.register-desc {
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

.login-link {
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
