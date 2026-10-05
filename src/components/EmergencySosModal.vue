<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import alertsService from '../services/alerts.service';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  alertData: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['update:visible', 'resolved', 'cancelled']);

const countdown = ref(15);
let timer = null;
const isProcessing = ref(false);
const cancellationReason = ref('');

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    countdown.value = 15;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      }
    }, 1000);
  } else {
    if (timer) clearInterval(timer);
  }
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

async function handleCancelAlert() {
  isProcessing.value = true;
  try {
    const alertId = props.alertData?.id || 'alt_curr';
    await alertsService.cancelAlert(alertId, cancellationReason.value || 'Falsa alarma / Activación por prueba');
    emit('cancelled', alertId);
    isVisible.value = false;
  } catch (err) {
    console.error('Error al cancelar alerta:', err);
  } finally {
    isProcessing.value = false;
  }
}

async function handleResolveAlert() {
  isProcessing.value = true;
  try {
    const alertId = props.alertData?.id || 'alt_curr';
    await alertsService.resolveAlert(alertId, 'Auxilio completado satisfactoriamente.');
    emit('resolved', alertId);
    isVisible.value = false;
  } catch (err) {
    console.error('Error al resolver alerta:', err);
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="false"
    header="🚨 ALERTA DE EMERGENCIA SOS EN CURSO"
    :style="{ width: '520px', maxWidth: '95vw' }"
    class="sos-dialog"
  >
    <div class="text-center p-3">
      <!-- Icono pulsante -->
      <div class="siren-pulse-container mb-3">
        <i class="pi pi-bell text-6xl text-white"></i>
      </div>

      <h2 class="text-red-600 m-0 mb-1 font-bold">EMERGENCIA TRANSMITIÉNDOSE</h2>
      <p class="text-600 text-sm mb-3">
        Tus coordenadas GPS y audio ambiental están siendo compartidos en vivo con tu red de contactos y serenazgo municipal.
      </p>

      <!-- Contador de despacho automático -->
      <div class="surface-100 p-3 border-round mb-3 text-left">
        <div class="flex justify-content-between align-items-center mb-2">
          <span class="text-xs font-semibold text-700">Despacho de patrulla policial en:</span>
          <span class="text-sm font-bold text-red-600">{{ countdown }}s</span>
        </div>
        <ProgressBar :value="((15 - countdown) / 15) * 100" :showValue="false" style="height: 6px;" />
      </div>

      <!-- Datos de la Alerta -->
      <div class="surface-50 border-1 surface-border border-round p-3 text-left text-xs mb-4">
        <div class="grid">
          <div class="col-6">
            <span class="text-500 font-medium">Latitud / Longitud:</span>
            <div class="font-bold text-700">{{ alertData?.latitude || '-12.0864' }}, {{ alertData?.longitude || '-77.0321' }}</div>
          </div>
          <div class="col-6">
            <span class="text-500 font-medium">Ubicación referencial:</span>
            <div class="font-bold text-700">Av. Salaverry / San Isidro</div>
          </div>
          <div class="col-6 mt-2">
            <span class="text-500 font-medium">Contactos Notificados:</span>
            <div class="font-bold text-green-600">3 contactos (SMS + Push)</div>
          </div>
          <div class="col-6 mt-2">
            <span class="text-500 font-medium">Central Municipal:</span>
            <div class="font-bold text-blue-600">Notificada (Canal 105)</div>
          </div>
        </div>
      </div>

      <!-- Acciones de Resolución -->
      <div class="flex flex-column gap-2">
        <Button
          label="MARCAR COMO RESUELTA / ESTOY A SALVO"
          icon="pi pi-check-circle"
          severity="success"
          class="w-full font-bold p-button-lg"
          :loading="isProcessing"
          @click="handleResolveAlert"
        />
        <Button
          label="Cancelar Alerta (Falsa Alarma)"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="w-full font-semibold"
          :loading="isProcessing"
          @click="handleCancelAlert"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.siren-pulse-container {
  width: 90px;
  height: 90px;
  margin: 0 auto;
  background-color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-ring 1.2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
