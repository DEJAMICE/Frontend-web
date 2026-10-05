<script setup>
import { ref, onMounted } from 'vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const devicesList = ref([
  {
    id: 'dev-1',
    name: 'Botón de Pánico Físico',
    model: 'SN-001',
    connected: true,
    connectionType: 'Bluetooth',
    battery: 78,
    lastSync: 'Hace instantes'
  },
  {
    id: 'dev-2',
    name: 'Sensor Inteligente de Caídas',
    model: 'SN-014',
    connected: false,
    connectionType: 'Bluetooth',
    battery: 42,
    lastSync: 'hace 3 horas',
    lastSyncFull: '26 sep 2026 · 08:03'
  }
]);

// Modal Simular Alerta SOS
const isSimulationVisible = ref(false);
const simulationCountdown = ref(3);
let simulationTimer = null;
const simulationFinished = ref(false);

function startSosSimulation(device) {
  isSimulationVisible.value = true;
  simulationCountdown.value = 3;
  simulationFinished.value = false;

  if (simulationTimer) clearInterval(simulationTimer);
  simulationTimer = setInterval(() => {
    if (simulationCountdown.value > 1) {
      simulationCountdown.value--;
    } else {
      clearInterval(simulationTimer);
      simulationFinished.value = true;
      toast.add({
        severity: 'info',
        summary: 'Simulación Completada',
        detail: `Señal de prueba enviada exitosamente desde ${device.model}.`,
        life: 4000
      });
    }
  }, 1000);
}

function cancelSosSimulation() {
  if (simulationTimer) clearInterval(simulationTimer);
  isSimulationVisible.value = false;
  toast.add({ severity: 'secondary', summary: 'Simulación Detenida', detail: 'Prueba de hardware cancelada.', life: 2500 });
}

// Modal Vincular Dispositivo (Wizard 3 Pasos)
const isPairWizardVisible = ref(false);
const pairStep = ref(1); // 1 = Buscar, 2 = Conectar, 3 = Listo

function openPairWizard() {
  pairStep.value = 1;
  isPairWizardVisible.value = true;
}

function nextPairStep() {
  if (pairStep.value === 1) {
    pairStep.value = 2;
  } else if (pairStep.value === 2) {
    pairStep.value = 3;
  } else if (pairStep.value === 3) {
    // Finalizar y agregar a la lista
    devicesList.value.push({
      id: `dev-${Date.now()}`,
      name: 'SecuraNet Panic Button',
      model: 'SN-002',
      connected: true,
      connectionType: 'Bluetooth',
      battery: 100,
      lastSync: 'Hace instantes'
    });
    isPairWizardVisible.value = false;
    toast.add({
      severity: 'success',
      summary: 'Dispositivo Vinculado',
      detail: 'SecuraNet Panic Button SN-002 está activo y listo.',
      life: 4000
    });
  }
}

function handleUnpair(device) {
  if (confirm(`¿Deseas desvincular ${device.name} (${device.model})?`)) {
    devicesList.value = devicesList.value.filter(d => d.id !== device.id);
    toast.add({ severity: 'info', summary: 'Desvinculado', detail: `${device.name} ha sido retirado.`, life: 3000 });
  }
}

function handleSync(device) {
  toast.add({ severity: 'info', summary: 'Sincronizando...', detail: `Buscando señal de ${device.model}...`, life: 2000 });
  setTimeout(() => {
    device.connected = true;
    device.battery = 85;
    device.lastSync = 'Hace instantes';
    toast.add({ severity: 'success', summary: 'Sincronizado', detail: `${device.name} reconectado con éxito.`, life: 3000 });
  }, 1200);
}
</script>

<template>
  <div class="devices-page-container">
    <Toast />

    <!-- Page Header matching Dispositivos IoT.png -->
    <div class="page-header mb-4">
      <h1 class="page-title">Dispositivos IoT Vinculados</h1>
      <p class="page-subtitle">Administra el hardware conectado a tu cuenta de seguridad</p>
    </div>

    <!-- Cards Grid (3 cards matching mockup) -->
    <div class="devices-grid mb-4">
      <!-- Card 1 & Card 2 (Dynamic loop or individual cards) -->
      <div v-for="dev in devicesList" :key="dev.id" class="device-card">
        <!-- Top row: Icon + Names + Status Dot -->
        <div class="card-top-row">
          <div class="hardware-icon-box">
            <i class="pi pi-microchip"></i>
          </div>
          <div class="device-meta">
            <h3 class="device-name">{{ dev.name }}</h3>
            <span class="device-model">{{ dev.model }}</span>
          </div>
          <div class="status-dot-wrapper">
            <span class="online-indicator-dot" :class="dev.connected ? 'is-online' : 'is-offline'"></span>
          </div>
        </div>

        <!-- Middle row: Connected State & Battery or Sync Info -->
        <div class="card-mid-body">
          <div v-if="dev.connected" class="connected-info">
            <div class="connection-pill">
              <i class="pi pi-bolt mr-1"></i>
              <span>Conectado por {{ dev.connectionType }}</span>
            </div>

            <div class="battery-section mt-3">
              <div class="battery-label-row">
                <span class="battery-title">Batería</span>
                <span class="battery-pct font-bold">{{ dev.battery }}%</span>
              </div>
              <div class="battery-track">
                <div class="battery-fill" :style="{ width: dev.battery + '%' }"></div>
              </div>
            </div>
          </div>

          <div v-else class="disconnected-info">
            <div class="badge-disconnected mb-3">
              <span>Desconectado</span>
            </div>

            <div class="last-sync-callout">
              <div class="sync-title">Última sincronización: {{ dev.lastSync }}</div>
              <div class="sync-date">{{ dev.lastSyncFull || '26 sep 2026 · 08:03' }}</div>
            </div>
          </div>
        </div>

        <!-- Bottom row: Actions -->
        <div class="card-bottom-actions mt-auto">
          <template v-if="dev.connected">
            <button class="btn-simulate-alert" @click="startSosSimulation(dev)">
              Simular Alerta
            </button>
            <button class="btn-unpair" @click="handleUnpair(dev)">
              Desvincular
            </button>
          </template>
          <template v-else>
            <button class="btn-sync-full" @click="handleSync(dev)">
              Sincronizar
            </button>
          </template>
        </div>
      </div>

      <!-- Card 3: Vincular nuevo dispositivo IoT (Dashed Card) -->
      <div class="add-device-dashed-card" @click="openPairWizard">
        <div class="add-icon-circle">
          <i class="pi pi-plus"></i>
        </div>
        <span class="add-card-label">Vincular nuevo dispositivo IoT</span>
      </div>
    </div>

    <!-- Bottom Card: Cómo vincular un dispositivo (3 Steps matching mockup) -->
    <div class="how-to-card">
      <div class="how-to-header mb-3">
        <h3 class="how-to-title">Cómo vincular un dispositivo</h3>
        <p class="how-to-subtitle">Sigue estos 3 pasos para emparejar tu hardware SecuraNet</p>
      </div>

      <div class="steps-row">
        <!-- Paso 1 -->
        <div class="step-item">
          <div class="step-num-badge">1</div>
          <div class="step-content">
            <h4 class="step-heading">Activa el Bluetooth</h4>
            <p class="step-text">Enciende el Bluetooth de tu teléfono y del dispositivo IoT.</p>
          </div>
          <i class="pi pi-angle-right step-arrow"></i>
        </div>

        <!-- Paso 2 -->
        <div class="step-item">
          <div class="step-num-badge">2</div>
          <div class="step-content">
            <h4 class="step-heading">Mantén presionado</h4>
            <p class="step-text">Presiona el botón físico 5 segundos hasta ver el LED parpadear.</p>
          </div>
          <i class="pi pi-angle-right step-arrow"></i>
        </div>

        <!-- Paso 3 -->
        <div class="step-item no-arrow">
          <div class="step-num-badge">3</div>
          <div class="step-content">
            <h4 class="step-heading">Confirma el enlace</h4>
            <p class="step-text">Selecciona el dispositivo en la lista y confirma el emparejamiento.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: Simulando Alerta SOS matching Dispositivos IoT2(Simulando Alerta SOS).png -->
    <div v-if="isSimulationVisible" class="modal-backdrop" @click.self="cancelSosSimulation">
      <div class="modal-sim-card text-center">
        <div class="sim-mode-tag">MODO DE PRUEBA</div>
        <h2 class="sim-title">Simulando Alerta SOS</h2>

        <div class="sim-circle-timer-wrapper my-4">
          <div class="sim-circle-ring" :class="{ finished: simulationFinished }">
            <span v-if="!simulationFinished" class="countdown-num">{{ simulationCountdown }}</span>
            <i v-else class="pi pi-check text-green-600 text-3xl"></i>
          </div>
        </div>

        <p class="sim-desc">
          Probando conexión con el hardware SN-001. No se notificará a la Policía ni a tus contactos reales.
        </p>

        <button class="btn-cancel-sim mt-3" @click="cancelSosSimulation">
          Cancelar Simulación / Detener Prueba
        </button>
      </div>
    </div>

    <!-- MODAL 2: Vincular dispositivo IoT (Wizard 3 Pasos) matching Dispositivos IoT3 -->
    <div v-if="isPairWizardVisible" class="modal-backdrop" @click.self="isPairWizardVisible = false">
      <div class="modal-wizard-card">
        <!-- Wizard Header -->
        <div class="wizard-header">
          <h3 class="wizard-title">Vincular dispositivo IoT</h3>
          <button class="close-btn" @click="isPairWizardVisible = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Stepper Indicators -->
        <div class="stepper-row">
          <div class="stepper-step" :class="{ active: pairStep >= 1, done: pairStep > 1 }">
            <span class="step-bullet">
              <i v-if="pairStep > 1" class="pi pi-check"></i>
              <span v-else>1</span>
            </span>
            <span class="step-label">Buscar</span>
          </div>
          <div class="stepper-line" :class="{ filled: pairStep > 1 }"></div>

          <div class="stepper-step" :class="{ active: pairStep >= 2, done: pairStep > 2 }">
            <span class="step-bullet">
              <i v-if="pairStep > 2" class="pi pi-check"></i>
              <span v-else>2</span>
            </span>
            <span class="step-label">Conectar</span>
          </div>
          <div class="stepper-line" :class="{ filled: pairStep > 2 }"></div>

          <div class="stepper-step" :class="{ active: pairStep >= 3 }">
            <span class="step-bullet">3</span>
            <span class="step-label">Listo</span>
          </div>
        </div>

        <!-- Wizard Step 1: Buscar Dispositivos (Radar Animation) -->
        <div v-if="pairStep === 1" class="wizard-body text-center">
          <div class="radar-box my-4">
            <div class="radar-wave wave1"></div>
            <div class="radar-wave wave2"></div>
            <div class="radar-center-icon">
              <i class="pi pi-bullseye"></i>
            </div>
          </div>
          <p class="text-sm text-slate-500 mb-4">Buscando dispositivos Bluetooth cercanos...</p>

          <!-- Found Device Card matching pt 1 -->
          <div class="found-device-card">
            <div class="found-icon">
              <i class="pi pi-microchip"></i>
            </div>
            <div class="found-meta text-left">
              <div class="found-name font-bold">SecuraNet Panic Button SN-002</div>
              <div class="found-sub text-xs text-slate-500">Señal fuerte · Bluetooth</div>
            </div>
            <button class="btn-pair-action ml-auto" @click="nextPairStep">
              Vincular
            </button>
          </div>
        </div>

        <!-- Wizard Step 2: Conectar (Bluetooth spinner matching pt 2) -->
        <div v-if="pairStep === 2" class="wizard-body text-center">
          <div class="connecting-circle-box my-4">
            <div class="spinner-ring"></div>
            <i class="pi pi-bluetooth bluetooth-icon"></i>
          </div>

          <h3 class="connect-title font-bold text-slate-800">Conectando con SN-002...</h3>
          <p class="connect-sub text-xs text-slate-500 mb-4">Confirma el emparejamiento en tu dispositivo.</p>

          <button class="btn-wizard-next w-full" @click="nextPairStep">
            Continuar
          </button>
        </div>

        <!-- Wizard Step 3: Listo (Checkmark matching pt 3) -->
        <div v-if="pairStep === 3" class="wizard-body text-center">
          <div class="success-check-box my-4">
            <i class="pi pi-check"></i>
          </div>

          <div class="success-banner py-2 px-3 mb-2 font-semibold">
            ¡Dispositivo vinculado exitosamente!
          </div>
          <p class="text-xs text-slate-500 mb-4">
            SecuraNet Panic Button SN-002 ya está listo para enviar alertas.
          </p>

          <button class="btn-wizard-next w-full" @click="nextPairStep">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.devices-page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 0.88rem;
  color: #64748B;
  margin: 0;
}

/* Devices Grid (3 columns matching mockup) */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.device-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(14, 68, 78, 0.04);
  display: flex;
  flex-direction: column;
  min-height: 250px;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.hardware-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: #E6F7F5;
  color: #0E444E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.device-meta {
  flex: 1;
}

.device-name {
  margin: 0 0 2px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1E293B;
}

.device-model {
  font-size: 0.76rem;
  color: #64748B;
  font-weight: 500;
}

.status-dot-wrapper {
  margin-left: auto;
}

.online-indicator-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.is-online {
  background-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.is-offline {
  background-color: #CBD5E1;
}

.connection-pill {
  font-size: 0.80rem;
  color: #475569;
  display: flex;
  align-items: center;
}

.battery-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #475569;
  margin-bottom: 6px;
}

.battery-track {
  width: 100%;
  height: 6px;
  background-color: #E2E8F0;
  border-radius: 999px;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  background-color: #00A896;
  border-radius: 999px;
}

.badge-disconnected {
  display: inline-block;
  background-color: #F1F5F9;
  color: #64748B;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.last-sync-callout {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 12px;
}

.sync-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
}

.sync-date {
  font-size: 0.72rem;
  color: #64748B;
  margin-top: 2px;
}

.card-bottom-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-simulate-alert {
  flex: 1;
  height: 38px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-simulate-alert:hover {
  background-color: #155A66;
}

.btn-unpair {
  height: 38px;
  padding: 0 16px;
  background-color: #FFFFFF;
  color: #475569;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-unpair:hover {
  background-color: #F8FAFC;
  border-color: #CBD5E1;
}

.btn-sync-full {
  width: 100%;
  height: 38px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-sync-full:hover {
  background-color: #155A66;
}

/* Add Device Dashed Card matching mockup */
.add-device-dashed-card {
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  cursor: pointer;
  background-color: transparent;
  transition: all 0.2s;
  padding: 20px;
}

.add-device-dashed-card:hover {
  border-color: #00A896;
  background-color: #F4FBFB;
}

.add-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.add-device-dashed-card:hover .add-icon-circle {
  border-color: #00A896;
  color: #00A896;
}

.add-card-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
}

/* How-to Card matching mockup bottom */
.how-to-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(14, 68, 78, 0.04);
}

.how-to-title {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
}

.how-to-subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: #64748B;
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.step-num-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #0E444E;
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-heading {
  margin: 0 0 4px 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1E293B;
}

.step-text {
  margin: 0;
  font-size: 0.78rem;
  color: #64748B;
  line-height: 1.4;
}

.step-arrow {
  color: #CBD5E1;
  font-size: 0.9rem;
  margin-top: 6px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(14, 68, 78, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-sim-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 2.2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(14, 68, 78, 0.16);
}

.sim-mode-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748B;
  text-transform: uppercase;
}

.sim-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 4px 0 0 0;
}

.sim-circle-timer-wrapper {
  display: flex;
  justify-content: center;
}

.sim-circle-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 4px solid #E2E8F0;
  border-top-color: #DC2626;
  border-right-color: #DC2626;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spinRing 2s linear infinite;
}

.sim-circle-ring.finished {
  border-color: #10B981;
  animation: none;
}

@keyframes spinRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.countdown-num {
  font-size: 2rem;
  font-weight: 800;
  color: #DC2626;
  transform: rotate(0deg);
}

.sim-desc {
  font-size: 0.82rem;
  color: #64748B;
  line-height: 1.5;
}

.btn-cancel-sim {
  width: 100%;
  height: 42px;
  background-color: #FFFFFF;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

/* Wizard Modal */
.modal-wizard-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1.8rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(14, 68, 78, 0.16);
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.wizard-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 1.1rem;
  cursor: pointer;
}

.stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.stepper-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-bullet {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #E2E8F0;
  color: #64748B;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-step.active .step-bullet {
  background-color: #0E444E;
  color: #FFFFFF;
}

.stepper-step.done .step-bullet {
  background-color: #00A896;
  color: #FFFFFF;
}

.step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748B;
}

.stepper-step.active .step-label {
  color: #111827;
}

.stepper-line {
  flex: 1;
  height: 2px;
  background-color: #E2E8F0;
  margin: 0 10px;
}

.stepper-line.filled {
  background-color: #0E444E;
}

/* Radar */
.radar-box {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #F1F5F9;
  position: relative;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-center-icon {
  font-size: 1.6rem;
  color: #0E444E;
  z-index: 2;
}

.radar-wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #00A896;
  opacity: 0;
  animation: radarPulse 2s infinite ease-out;
}

.wave2 {
  animation-delay: 1s;
}

@keyframes radarPulse {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

.found-device-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 14px;
}

.found-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #E6F7F5;
  color: #0E444E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.btn-pair-action {
  height: 36px;
  padding: 0 16px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.connecting-circle-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #E2E8F0;
  border-top-color: #00A896;
  animation: spinRing 1s linear infinite;
}

.bluetooth-icon {
  font-size: 1.8rem;
  color: #0E444E;
}

.success-check-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #00A896;
  color: #FFFFFF;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-banner {
  background-color: #E6F7F5;
  color: #007A6C;
  border-radius: 8px;
  font-size: 0.90rem;
}

.btn-wizard-next {
  height: 44px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-wizard-next:hover {
  background-color: #155A66;
}
</style>
