<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import EmergencySosModal from '../components/EmergencySosModal.vue';
import alertsService from '../services/alerts.service';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const toast = useToast();

const isSosModalVisible = ref(false);
const currentAlert = ref(null);
const isEmitting = ref(false);

async function handleEmitSos() {
  isEmitting.value = true;
  try {
    const payload = {
      latitude: -12.0864,
      longitude: -77.0321,
      type: 'PanicButton',
      severity: 'Critical',
      locationAddress: 'Av. Salaverry / Campus San Isidro',
      userId: authStore.user?.id || 'usr_001',
      userName: authStore.user?.fullName || 'Usuario Demo SafeSignal'
    };

    const res = await alertsService.emitAlert(payload);
    currentAlert.value = res.data || res;
    isSosModalVisible.value = true;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al transmitir la señal SOS.', life: 3000 });
  } finally {
    isEmitting.value = false;
  }
}
</script>

<template>
  <div class="sos-view-container text-center">
    <Toast />

    <div class="max-w-30rem mx-auto">
      <h1 class="page-title m-0">Centro de Emergencia Rápida SOS</h1>
      <p class="subtitle mb-4">Pulsa el botón de pánico en caso de asalto, persecución o riesgo inminente.</p>

      <Card class="sos-main-card shadow-3 border-round-xl p-4 mb-4">
        <template #content>
          <div class="giant-sos-button-wrapper my-4">
            <button
              class="giant-sos-btn"
              :disabled="isEmitting"
              @click="handleEmitSos"
            >
              <i class="pi pi-bell text-6xl text-white mb-2"></i>
              <span class="text-2xl font-bold text-white tracking-wide">ACTIVAR SOS</span>
              <span class="text-xs text-white opacity-80 mt-1">Presiona para auxilio inmediato</span>
            </button>
          </div>

          <div class="surface-100 p-3 border-round text-xs text-600 line-height-2">
            <i class="pi pi-lock text-primary mr-1"></i>
            Al activarse, se enviará tu ubicación en tiempo real mediante SMS a tus 3 contactos prioritarios y se emitirá la señal a la central de monitoreo distrital.
          </div>
        </template>
      </Card>

      <!-- Números Rápidos de Auxilio en Perú -->
      <div class="surface-0 border-round p-3 shadow-1 text-left">
        <h4 class="m-0 mb-3 text-sm font-bold text-700 flex align-items-center gap-2">
          <i class="pi pi-phone text-red-600"></i> Centrales Telefónicas de Emergencia (Perú)
        </h4>

        <div class="flex flex-column gap-2 text-xs">
          <div class="flex justify-content-between align-items-center p-2 surface-50 border-round">
            <span><b>105</b> — Policía Nacional del Perú (PNP)</span>
            <span class="font-bold text-green-600">24 horas</span>
          </div>
          <div class="flex justify-content-between align-items-center p-2 surface-50 border-round">
            <span><b>116</b> — Compañía General de Bomberos</span>
            <span class="font-bold text-green-600">24 horas</span>
          </div>
          <div class="flex justify-content-between align-items-center p-2 surface-50 border-round">
            <span><b>(01) 319-0450</b> — Serenazgo San Isidro</span>
            <span class="font-bold text-blue-600">Municipal</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Emergencia SOS -->
    <EmergencySosModal
      v-model:visible="isSosModalVisible"
      :alertData="currentAlert"
    />
  </div>
</template>

<style scoped>
.sos-view-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  color: #1A2B4C;
  font-size: 1.6rem;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.giant-sos-button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.giant-sos-btn {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, #ef4444 0%, #b91c1c 100%);
  border: 8px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 35px rgba(239, 68, 68, 0.6);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  outline: none;
}

.giant-sos-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 45px rgba(239, 68, 68, 0.8);
}

.giant-sos-btn:active {
  transform: scale(0.96);
}
</style>
