<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import SafeRouteMap from '../components/SafeRouteMap.vue';
import trackingService from '../services/tracking.service';

const toast = useToast();

const originInput = ref('UPC Campus San Isidro');
const destinationInput = ref('Av. Salaverry cdra. 24');
const travelMode = ref('WALKING'); // WALKING / BICYCLE / VEHICLE
const isTrackingStarted = ref(false);
const isCalculating = ref(false);

async function handleStartRouteTracking() {
  isCalculating.value = true;
  try {
    const payload = {
      originAddress: originInput.value,
      destinationAddress: destinationInput.value,
      mode: travelMode.value
    };
    await trackingService.startTracking(payload);
    isTrackingStarted.value = true;
    toast.add({
      severity: 'success',
      summary: 'Seguimiento Iniciado',
      detail: 'Tu recorrido está siendo monitoreado por la IA de SecuraNet.',
      life: 4000
    });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo iniciar el tracking.', life: 3000 });
  } finally {
    isCalculating.value = false;
  }
}

async function handleStopTracking() {
  try {
    await trackingService.stopTracking('rt_curr');
    isTrackingStarted.value = false;
    toast.add({
      severity: 'info',
      summary: 'Recorrido Finalizado',
      detail: 'Has llegado a tu destino. Notificación de arribo seguro enviada a tus contactos.',
      life: 4000
    });
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="routes-container">
    <Toast />

    <div class="flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h1 class="page-title m-0">Cálculo de Rutas Seguras con IA</h1>
        <p class="subtitle m-0">Planifica tus trayectos nocturnos esquivando focos delictivos y zonas oscuras.</p>
      </div>
      <Tag
        :value="isTrackingStarted ? 'TELEMETRÍA EN VIVO ACTIVA' : 'SISTEMA DE ENRUTAMIENTO LISTO'"
        :severity="isTrackingStarted ? 'danger' : 'success'"
        class="font-bold text-xs"
      />
    </div>

    <div class="grid">
      <!-- Columna Izquierda: Formulario de Planificación -->
      <div class="col-12 lg:col-4 flex flex-column gap-3">
        <Card class="shadow-1">
          <template #title>
            <span class="text-base font-bold text-700 flex align-items-center gap-2">
              <i class="pi pi-directions text-primary"></i> Configurar Recorrido
            </span>
          </template>
          <template #content>
            <div class="p-fluid flex flex-column gap-3">
              <div class="field m-0">
                <label class="text-xs font-bold text-600">Punto de Origen</label>
                <div class="p-input-icon-left">
                  <i class="pi pi-map-marker text-green-600"></i>
                  <InputText v-model="originInput" class="w-full text-sm" />
                </div>
              </div>

              <div class="field m-0">
                <label class="text-xs font-bold text-600">Punto de Destino</label>
                <div class="p-input-icon-left">
                  <i class="pi pi-flag text-red-600"></i>
                  <InputText v-model="destinationInput" class="w-full text-sm" />
                </div>
              </div>

              <div class="field m-0">
                <label class="text-xs font-bold text-600">Modo de Transporte</label>
                <div class="flex gap-2">
                  <Button
                    label="A pie"
                    icon="pi pi-user"
                    size="small"
                    :severity="travelMode === 'WALKING' ? 'primary' : 'secondary'"
                    :outlined="travelMode !== 'WALKING'"
                    @click="travelMode = 'WALKING'"
                  />
                  <Button
                    label="Bicicleta"
                    icon="pi pi-compass"
                    size="small"
                    :severity="travelMode === 'BICYCLE' ? 'primary' : 'secondary'"
                    :outlined="travelMode !== 'BICYCLE'"
                    @click="travelMode = 'BICYCLE'"
                  />
                </div>
              </div>

              <div v-if="!isTrackingStarted" class="mt-2">
                <Button
                  label="INICIAR RUTA SEGURA"
                  icon="pi pi-play"
                  severity="success"
                  class="w-full font-bold"
                  :loading="isCalculating"
                  @click="handleStartRouteTracking"
                />
              </div>

              <div v-else class="mt-2">
                <Button
                  label="FINALIZAR RECORRIDO"
                  icon="pi pi-stop-circle"
                  severity="danger"
                  class="w-full font-bold"
                  @click="handleStopTracking"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Tarjeta de Diagnóstico de Seguridad -->
        <Card class="shadow-1">
          <template #title>
            <span class="text-sm font-bold text-700 flex align-items-center gap-1">
              <i class="pi pi-shield text-indigo-600"></i> Análisis Predictivo de la Ruta
            </span>
          </template>
          <template #content>
            <div class="text-xs flex flex-column gap-2">
              <div class="flex justify-content-between p-2 surface-50 border-round">
                <span class="text-600">Índice de Protección:</span>
                <span class="font-bold text-green-600">98% Seguridad Alta</span>
              </div>
              <div class="flex justify-content-between p-2 surface-50 border-round">
                <span class="text-600">Postes y Luz LED:</span>
                <span class="font-bold text-700">100% Tramo Iluminado</span>
              </div>
              <div class="flex justify-content-between p-2 surface-50 border-round">
                <span class="text-600">Zonas Evitadas:</span>
                <span class="font-bold text-red-600">2 Puntos Críticos</span>
              </div>
              <div class="p-2 border-1 border-dashed border-round text-500 line-height-2 mt-1">
                <i class="pi pi-info-circle text-primary mr-1"></i>
                La ruta bordea la Av. Brasil por la Calle Choquehuanca evitando zonas con reportes de arrebatos nocturnos.
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Columna Derecha: Mapa Leaflet Extendido -->
      <div class="col-12 lg:col-8">
        <Card class="shadow-1">
          <template #content>
            <SafeRouteMap height="580px" :showControls="true" />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.routes-container {
  max-width: 1400px;
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
</style>
