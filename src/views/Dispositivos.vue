<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import devicesService from '../services/devices.service';

const toast = useToast();
const devicesList = ref([]);
const isLoading = ref(false);
const isPairDialogVisible = ref(false);
const isPairing = ref(false);

const newDevice = ref({
  name: '',
  type: 'PHYSICAL_BUTTON',
  macAddress: ''
});

async function fetchDevices() {
  isLoading.value = true;
  try {
    const res = await devicesService.getDevices();
    devicesList.value = res.data || [];
  } catch (err) {
    console.error('Error al cargar dispositivos IoT:', err);
  } finally {
    isLoading.value = false;
  }
}

async function handlePairDevice() {
  if (!newDevice.value.name) {
    toast.add({ severity: 'warn', summary: 'Campo requerido', detail: 'Ingresa un nombre para el dispositivo.', life: 3000 });
    return;
  }

  isPairing.value = true;
  try {
    const payload = {
      name: newDevice.value.name,
      type: newDevice.value.type,
      macAddress: newDevice.value.macAddress || `C4:B2:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:AA:FF`
    };
    await devicesService.pairDevice(payload);
    toast.add({
      severity: 'success',
      summary: 'Dispositivo Sincronizado',
      detail: `${newDevice.value.name} vinculado por Bluetooth Low Energy (BLE).`,
      life: 3000
    });
    isPairDialogVisible.value = false;
    newDevice.value = { name: '', type: 'PHYSICAL_BUTTON', macAddress: '' };
    await fetchDevices();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al emparejar el dispositivo.', life: 3000 });
  } finally {
    isPairing.value = false;
  }
}

async function handleUnpair(id, name) {
  try {
    await devicesService.unpairDevice(id);
    toast.add({ severity: 'info', summary: 'Desvinculado', detail: `${name} fue desvinculado con éxito.`, life: 3000 });
    await fetchDevices();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo desvincular.', life: 3000 });
  }
}

function getBatterySeverity(battery) {
  if (battery > 50) return 'success';
  if (battery > 20) return 'warn';
  return 'danger';
}

onMounted(() => {
  fetchDevices();
});
</script>

<template>
  <div class="devices-container">
    <Toast />

    <div class="flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h1 class="page-title m-0">Dispositivos IoT y Hardware Vinculado</h1>
        <p class="subtitle m-0">Monitorea el estado, batería y conectividad BLE de tus botones de pánico y pulseras.</p>
      </div>
      <Button
        label="Vincular Dispositivo BLE"
        icon="pi pi-plus"
        severity="primary"
        class="mt-2 md:mt-0 font-bold"
        @click="isPairDialogVisible = true"
      />
    </div>

    <!-- Lista de Dispositivos -->
    <div class="grid">
      <div v-for="dev in devicesList" :key="dev.id" class="col-12 md:col-6 lg:col-4">
        <Card class="device-card shadow-1 h-full">
          <template #title>
            <div class="flex justify-content-between align-items-start">
              <div>
                <span class="text-base font-bold text-800">{{ dev.name }}</span>
                <div class="text-xs text-500 font-mono mt-1">{{ dev.macAddress }}</div>
              </div>
              <Tag
                :value="dev.status === 'CONNECTED' ? 'EN LÍNEA' : 'DESCONECTADO'"
                :severity="dev.status === 'CONNECTED' ? 'success' : 'secondary'"
                class="text-xs"
              />
            </div>
          </template>

          <template #content>
            <div class="my-3">
              <div class="flex justify-content-between align-items-center text-xs mb-1">
                <span class="text-600 font-semibold flex align-items-center gap-1">
                  <i class="pi pi-bolt text-yellow-500"></i> Nivel de Batería:
                </span>
                <span class="font-bold text-700">{{ dev.battery }}%</span>
              </div>
              <ProgressBar :value="dev.battery" :showValue="false" style="height: 8px;" />
            </div>

            <div class="surface-50 p-2 border-round text-xs text-600 mb-3">
              <div class="flex justify-content-between py-1">
                <span>Tipo:</span>
                <b class="text-700">{{ dev.type === 'SMART_BAND' ? 'Pulsera SOS' : 'Botón Llavero SN-001' }}</b>
              </div>
              <div class="flex justify-content-between py-1">
                <span>Última señal:</span>
                <b class="text-700">{{ dev.lastSync || 'Hace instantes' }}</b>
              </div>
            </div>

            <div class="flex justify-content-end gap-2 mt-2">
              <Button
                label="Desvincular"
                icon="pi pi-trash"
                severity="danger"
                text
                size="small"
                @click="handleUnpair(dev.id, dev.name)"
              />
            </div>
          </template>
        </Card>
      </div>

      <div v-if="devicesList.length === 0 && !isLoading" class="col-12 text-center p-5 surface-0 border-round">
        <i class="pi pi-compass text-5xl text-300 mb-2"></i>
        <p class="text-500">No tienes dispositivos IoT enlazados. Vincula tu botón de pánico SecuraNet SN-001.</p>
      </div>
    </div>

    <!-- Modal de Vinculación -->
    <Dialog
      v-model:visible="isPairDialogVisible"
      modal
      header="Vincular Dispositivo de Emergencia IoT"
      :style="{ width: '450px', maxWidth: '95vw' }"
    >
      <div class="p-fluid flex flex-column gap-3 mt-2">
        <div class="field">
          <label for="dev-name" class="font-bold text-sm text-700">Nombre del Dispositivo</label>
          <InputText id="dev-name" v-model="newDevice.name" placeholder="Ej. Llavero SOS SecuraNet" />
        </div>

        <div class="field">
          <label for="dev-mac" class="font-bold text-sm text-700">Dirección MAC (Opcional)</label>
          <InputText id="dev-mac" v-model="newDevice.macAddress" placeholder="C4:4E:AC:XX:XX:XX" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="isPairDialogVisible = false" />
        <Button label="Emparejar Hardware" icon="pi pi-link" :loading="isPairing" @click="handlePairDevice" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.devices-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #1A2B4C;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.device-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>
