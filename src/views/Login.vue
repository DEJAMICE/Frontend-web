<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar Sesión en SecuraNet</h2>

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
            class="mt-3"
        />
      </form>

      <div class="register-link mt-3 text-center">
        ¿No tienes cuenta? <router-link to="/registro">Regístrate aquí</router-link>
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
      router.push('/dashboard');
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
  height: 100vh;
  background-color: #F4F7FA;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
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