<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { authService, apiClient } from '@/services';

const authStore = useAuthStore();

const profileOptions = ref([
  { label: 'Estándar', value: 'Standard' },
  { label: 'Estudiante Universitario', value: 'Student' },
  { label: 'Trabajador Nocturno', value: 'NightWorker' }
]);

const profileForm = ref({
  fullName: '',
  phoneNumber: '',
  profileType: 'Standard'
});

const loadingProfile = ref(false);
const profileMessage = ref('');
const profileError = ref(false);

onMounted(() => {
  if (authStore.user) {
    profileForm.value.fullName = authStore.user.fullName;
    profileForm.value.phoneNumber = authStore.user.phoneNumber;
    profileForm.value.profileType = authStore.user.profileType;
  }
});

const updateProfile = async () => {
  loadingProfile.value = true;
  profileMessage.value = '';
  try {
    const result = await authService.updateProfile(profileForm.value);
    authStore.setAuth(authStore.token, result.data || result);
    profileError.value = false;
    profileMessage.value = result.message || 'Perfil actualizado correctamente.';
  } catch (error) {
    profileError.value = true;
    profileMessage.value = error.message || 'Error al actualizar el perfil.';
  } finally {
    loadingProfile.value = false;
  }
};

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
});

const loadingPassword = ref(false);
const passwordMessage = ref('');
const passwordError = ref(false);

const changePassword = async () => {
  loadingPassword.value = true;
  passwordMessage.value = '';
  try {
    await apiClient.put('/users/me/password', passwordForm.value);
    passwordError.value = false;
    passwordMessage.value = 'Contraseña actualizada correctamente.';
    passwordForm.value.currentPassword = '';
    passwordForm.value.newPassword = '';
  } catch (error) {
    passwordError.value = true;
    if (error.status === 400) {
      passwordMessage.value = 'La contraseña actual es incorrecta.';
    } else {
      passwordMessage.value = error.message || 'Error al cambiar la contraseña.';
    }
  } finally {
    loadingPassword.value = false;
  }
};

const planOptions = ref([
  { label: 'Plan Gratuito (Free)', value: 'Free' },
  { label: 'Plan Premium', value: 'Premium' }
]);

const subscriptionForm = ref({
  plan: authStore.user?.subscriptionPlan || 'Free'
});

const loadingSub = ref(false);
const subMessage = ref('');
const subError = ref(false);

const updateSubscription = async () => {
  loadingSub.value = true;
  subMessage.value = '';
  try {
    const response = await apiClient.put('/users/me/subscription', subscriptionForm.value);
    authStore.setAuth(authStore.token, response.data);
    subError.value = false;
    subMessage.value = 'Suscripción actualizada con éxito.';
  } catch (error) {
    subError.value = true;
    subMessage.value = error.message || 'Error al actualizar la suscripción.';
  } finally {
    loadingSub.value = false;
  }
};
</script>

<style scoped>
.perfil-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #1A2B4C;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: start;
}

.profile-card {
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-radius: 8px;
}

.field {
  margin-bottom: 1.5rem;
}

.p-error {
  color: #D32F2F;
  display: block;
}

.p-success {
  color: #28a745;
  display: block;
}

.subscription-info {
  background-color: #F4F7FA;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
}
</style>
<template>
  <div class="perfil-container">
    <h1 class="page-title">Perfil y Configuración de Cuenta</h1>
    <p class="subtitle">Administra tus datos, preferencias de seguridad y suscripción.</p>

    <div class="cards-grid">

      <Card class="profile-card">
        <template #title>Datos Personales</template>
        <template #content>
          <form @submit.prevent="updateProfile" class="p-fluid">
            <div class="field">
              <label for="fullName">Nombre Completo</label>
              <InputText id="fullName" v-model="profileForm.fullName" required />
            </div>

            <div class="field">
              <label for="phoneNumber">Teléfono Celular</label>
              <InputText id="phoneNumber" v-model="profileForm.phoneNumber" required />
            </div>

            <div class="field">
              <label for="profileType">Perfil de Uso</label>
              <Dropdown
                  id="profileType"
                  v-model="profileForm.profileType"
                  :options="profileOptions"
                  optionLabel="label"
                  optionValue="value"
              />
            </div>

            <small v-if="profileMessage" :class="profileError ? 'p-error' : 'p-success'">
              {{ profileMessage }}
            </small>

            <Button type="submit" label="Guardar Cambios" :loading="loadingProfile" class="mt-3" />
          </form>
        </template>
      </Card>

      <Card class="profile-card">
        <template #title>Seguridad</template>
        <template #content>
          <form @submit.prevent="changePassword" class="p-fluid">
            <div class="field">
              <label for="currentPassword">Contraseña Actual</label>
              <Password
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  :feedback="false"
                  toggleMask
                  required
              />
            </div>

            <div class="field">
              <label for="newPassword">Nueva Contraseña</label>
              <Password
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  toggleMask
                  required
                  promptLabel="Ingresa una nueva contraseña"
                  weakLabel="Débil"
                  mediumLabel="Media"
                  strongLabel="Fuerte"
              />
            </div>

            <small v-if="passwordMessage" :class="passwordError ? 'p-error' : 'p-success'">
              {{ passwordMessage }}
            </small>

            <Button type="submit" label="Actualizar Contraseña" severity="secondary" :loading="loadingPassword" class="mt-3" />
          </form>
        </template>
      </Card>

      <Card class="profile-card">
        <template #title>Plan de Suscripción</template>
        <template #content>
          <div class="subscription-info">
            <p>Plan actual: <strong>{{ authStore.user?.subscriptionPlan || 'Free' }}</strong></p>
          </div>

          <form @submit.prevent="updateSubscription" class="p-fluid">
            <div class="field">
              <label for="plan">Cambiar Plan</label>
              <Dropdown
                  id="plan"
                  v-model="subscriptionForm.plan"
                  :options="planOptions"
                  optionLabel="label"
                  optionValue="value"
              />
            </div>

            <small v-if="subMessage" :class="subError ? 'p-error' : 'p-success'">
              {{ subMessage }}
            </small>

            <Button type="submit" label="Actualizar Plan" severity="success" :loading="loadingSub" class="mt-3" />
          </form>
        </template>
      </Card>

    </div>
  </div>
</template>