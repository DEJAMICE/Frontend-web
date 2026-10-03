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
      router.push('/dashboard');
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
  background-color: #F4F7FA;
  padding: 2rem 0;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
}

.field {
  margin-bottom: 1.5rem;
}

.p-error {
  color: #D32F2F;
  display: block;
  margin-bottom: 1rem;
}
</style>
<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Crear Cuenta en SecuraNet</h2>

      <form @submit.prevent="handleRegister" class="p-fluid">
        <div class="field">
          <label for="fullName">Nombre Completo</label>
          <InputText
              id="fullName"
              v-model="registerForm.fullName"
              type="text"
              required
              placeholder="Ej. Diego Campoblanco"
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
            label="Crear Cuenta"
            :loading="isLoading"
            class="mt-3"
        />
      </form>

      <div class="login-link mt-3 text-center">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>
