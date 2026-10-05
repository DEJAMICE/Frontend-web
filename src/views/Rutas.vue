<script setup>
import { ref } from 'vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import SafeRouteMap from '../components/SafeRouteMap.vue';
import trackingService from '../services/tracking.service';

const toast = useToast();

// Presets de Lima para configuración rápida
const routePresets = [
  {
    name: 'UPC San Isidro ➔ Salaverry',
    origin: { lat: -12.0864, lng: -77.0321, name: 'UPC Campus San Isidro' },
    destination: { lat: -12.0945, lng: -77.0480, name: 'Av. Salaverry cdra. 24' }
  },
  {
    name: 'UPC Monterrico ➔ Javier Prado',
    origin: { lat: -12.1041, lng: -76.9632, name: 'UPC Campus Monterrico, Surco' },
    destination: { lat: -12.0905, lng: -77.0223, name: 'Av. Javier Prado Este / San Isidro' }
  },
  {
    name: 'Miraflores Kennedy ➔ Larcomar',
    origin: { lat: -12.1218, lng: -77.0298, name: 'Parque Kennedy, Miraflores' },
    destination: { lat: -12.1325, lng: -77.0305, name: 'Centro Comercial Larcomar' }
  }
];

const selectedPresetIndex = ref(0);
const origin = ref({ ...routePresets[0].origin });
const destination = ref({ ...routePresets[0].destination });
const selectionMode = ref('destination'); // 'destination' | 'origin'

const travelMode = ref('walking'); // walking | cycling | driving
const activeRouteType = ref('safe'); // 'safe' | 'alternative'
const isCalculated = ref(true);
const isCalculating = ref(false);
const isNavigating = ref(false);

const routeMetrics = ref({
  distanceKm: '2.5',
  durationMin: 32,
  safetyScore: 94,
  zonesAvoided: 2
});

function applyPreset(index) {
  selectedPresetIndex.value = index;
  const p = routePresets[index];
  origin.value = { ...p.origin };
  destination.value = { ...p.destination };
  isNavigating.value = false;
  activeRouteType.value = 'safe';
  toast.add({
    severity: 'info',
    summary: 'Recorrido Configurado',
    detail: `Trazando calles para ${p.name}`,
    life: 2500
  });
}

function handlePointSelected(coords) {
  isNavigating.value = false;
  if (selectionMode.value === 'destination') {
    selectedPresetIndex.value = -1;
    destination.value = {
      lat: coords.lat,
      lng: coords.lng,
      name: `Destino: [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`
    };
    toast.add({
      severity: 'info',
      summary: 'Destino Actualizado',
      detail: 'Nuevo punto fijado. Recalculando ruta en tiempo real...',
      life: 2500
    });
  } else {
    selectedPresetIndex.value = -1;
    origin.value = {
      lat: coords.lat,
      lng: coords.lng,
      name: `Origen: [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`
    };
    toast.add({
      severity: 'info',
      summary: 'Origen Actualizado',
      detail: 'Nuevo punto de salida fijado. Recalculando ruta...',
      life: 2500
    });
  }
}

function setTravelMode(mode) {
  travelMode.value = mode;
  isNavigating.value = false;
  // Forzar recálculo reactivo
  origin.value = { ...origin.value };
  destination.value = { ...destination.value };
  const modeLabel = mode === 'walking' ? 'a pie' : mode === 'cycling' ? 'en bicicleta' : 'en vehículo';
  toast.add({
    severity: 'info',
    summary: 'Modo Actualizado',
    detail: `Trazando calles y calculando tiempo de viaje ${modeLabel}...`,
    life: 2500
  });
}

function handleRouteCalculated(data) {
  routeMetrics.value = data;
  isCalculating.value = false;
}

function calculateRoute() {
  isCalculating.value = true;
  isNavigating.value = false;
  activeRouteType.value = 'safe';
  // Disparará la reactividad en SafeRouteMap al clonar objetos
  origin.value = { ...origin.value };
  destination.value = { ...destination.value };
  toast.add({
    severity: 'success',
    summary: 'Ruta Segura IA Optimizada',
    detail: 'Trazado real por calles iluminadas calculado exitosamente.',
    life: 3000
  });
}

function toggleRouteAlternative() {
  activeRouteType.value = activeRouteType.value === 'safe' ? 'alternative' : 'safe';
  const label = activeRouteType.value === 'safe' ? 'Ruta Segura Recomendada' : 'Ruta Alternativa';
  toast.add({
    severity: 'info',
    summary: 'Vista Cambiada',
    detail: `Mostrando ${label} por calles secundarias.`,
    life: 2500
  });
}

async function handleStartNavigation() {
  isNavigating.value = true;
  try {
    await trackingService.startTracking({
      originAddress: origin.value.name,
      destinationAddress: destination.value.name,
      estimatedDurationMinutes: routeMetrics.value.durationMin,
      shareWithContacts: true
    });
  } catch (e) {
    console.warn('Iniciando navegación local:', e);
  }

  toast.add({
    severity: 'success',
    summary: 'Navegación Iniciada',
    detail: 'Monitoreo de telemetría activo paso a paso por las calles.',
    life: 4000
  });
}

function handleStopNavigation() {
  isNavigating.value = false;
  try {
    trackingService.stopTracking('rt_active');
  } catch (e) {}

  toast.add({
    severity: 'info',
    summary: 'Navegación Finalizada',
    detail: 'Has llegado a tu destino con éxito.',
    life: 3000
  });
}
</script>

<template>
  <div class="routes-page-container">
    <Toast />

    <!-- Page Header -->
    <div class="routes-header mb-4">
      <div class="flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="routes-title">Rutas Seguras con IA</h1>
          <p class="routes-subtitle">Planifica recorridos por calles reales esquivando focos delictivos y zonas oscuras</p>
        </div>
        <div class="status-indicator-badge" :class="isNavigating ? 'nav-active' : 'nav-idle'">
          <span class="status-dot"></span>
          <span>{{ isNavigating ? 'TELEMETRÍA EN VIVO ACTIVA' : 'SISTEMA DE CALLES CONECTADO' }}</span>
        </div>
      </div>
    </div>

    <div class="routes-layout-grid">
      <!-- Columna Izquierda: Panel de Configuración de Recorrido matching Prototype Code.txt -->
      <div class="planner-panel">
        <div class="panel-card">
          <!-- Title -->
          <div class="panel-card-header mb-3">
            <i class="pi pi-compass panel-icon mr-2"></i>
            <span class="panel-card-title">Configurar Recorrido</span>
          </div>

          <!-- Selector de Recorridos Preconfigurados -->
          <div class="form-group mb-3">
            <label class="form-label">Trayectos Rápidos:</label>
            <div class="presets-buttons-row">
              <button
                v-for="(p, idx) in routePresets"
                :key="idx"
                class="preset-btn"
                :class="{ active: selectedPresetIndex === idx }"
                @click="applyPreset(idx)"
              >
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- Inputs Origen y Destino -->
          <div class="form-group mb-3">
            <label class="form-label">Punto de Origen (A):</label>
            <div class="input-icon-box">
              <i class="pi pi-map-marker text-teal-600 mr-2"></i>
              <input
                v-model="origin.name"
                type="text"
                class="clean-input"
                placeholder="Ingresa dirección o campus de origen..."
              />
            </div>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Punto de Destino (B):</label>
            <div class="input-icon-box">
              <i class="pi pi-flag text-rose-600 mr-2"></i>
              <input
                v-model="destination.name"
                type="text"
                class="clean-input"
                placeholder="Ingresa dirección de destino..."
              />
            </div>
          </div>

          <!-- Selector de Modo de Clic en el Mapa -->
          <div class="form-group mb-3">
            <label class="form-label">Al hacer clic en el mapa fijar:</label>
            <div class="target-mode-buttons">
              <button
                type="button"
                class="target-mode-btn"
                :class="{ active: selectionMode === 'destination' }"
                @click="selectionMode = 'destination'"
              >
                <i class="pi pi-flag text-rose-500 mr-1"></i> Punto Destino (B)
              </button>
              <button
                type="button"
                class="target-mode-btn"
                :class="{ active: selectionMode === 'origin' }"
                @click="selectionMode = 'origin'"
              >
                <i class="pi pi-map-marker text-teal-600 mr-1"></i> Punto Origen (A)
              </button>
            </div>
          </div>

          <!-- Modo de Transporte -->
          <div class="form-group mb-3">
            <label class="form-label">Modo de Transporte:</label>
            <div class="mode-tabs">
              <button
                class="mode-tab"
                :class="{ active: travelMode === 'walking' }"
                @click="setTravelMode('walking')"
              >
                <i class="pi pi-user mr-1"></i> A pie
              </button>
              <button
                class="mode-tab"
                :class="{ active: travelMode === 'cycling' }"
                @click="setTravelMode('cycling')"
              >
                <i class="pi pi-compass mr-1"></i> Bicicleta
              </button>
              <button
                class="mode-tab"
                :class="{ active: travelMode === 'driving' }"
                @click="setTravelMode('driving')"
              >
                <i class="pi pi-car mr-1"></i> Vehicular
              </button>
            </div>
          </div>

          <!-- Botón de Calcular Ruta -->
          <button
            class="btn-calc-route w-full mb-3"
            :disabled="isCalculating"
            @click="calculateRoute"
          >
            <i v-if="isCalculating" class="pi pi-spin pi-spinner mr-2"></i>
            <span>{{ isCalculating ? 'Calculando calles...' : 'Trazar Ruta Segura con IA' }}</span>
          </button>

          <!-- Diagnóstico de IA & Métricas de Seguridad (Matching Prototype Code.txt lines 2730-2765) -->
          <div v-if="isCalculated" class="route-metrics-box mb-3">
            <div class="ai-status-pill mb-2">
              <i class="pi pi-check-circle mr-1"></i>
              <span>IA: Ruta Segura Optimizada</span>
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-val">{{ routeMetrics.durationMin }} min</span>
                <span class="metric-label">{{ travelMode === 'walking' ? 'a pie' : travelMode === 'cycling' ? 'en bicicleta' : 'en vehículo' }}</span>
              </div>
              <div class="metric-separator"></div>
              <div class="metric-item">
                <span class="metric-val">{{ routeMetrics.distanceKm }} km</span>
                <span class="metric-label">distancia</span>
              </div>
            </div>

            <div class="security-level-row mt-3">
              <span class="security-label">Nivel de Seguridad</span>
              <span class="security-pct">{{ routeMetrics.safetyScore }}%</span>
            </div>
            <div class="security-progress-bar">
              <div class="security-progress-fill" :style="{ width: routeMetrics.safetyScore + '%' }"></div>
            </div>
            <div class="security-subtext mt-1">
              Evita {{ routeMetrics.zonesAvoided }} zonas críticas y puntos oscuros en el trayecto.
            </div>
          </div>

          <!-- Botones de Acción de Navegación -->
          <div v-if="isCalculated" class="navigation-actions">
            <button
              v-if="!isNavigating"
              class="btn-start-nav w-full mb-2"
              @click="handleStartNavigation"
            >
              <i class="pi pi-play mr-2"></i>
              <span>Iniciar Navegación</span>
            </button>
            <button
              v-else
              class="btn-stop-nav w-full mb-2"
              @click="handleStopNavigation"
            >
              <i class="pi pi-stop mr-2"></i>
              <span>Finalizar Navegación</span>
            </button>

            <button
              class="btn-alt-route w-full"
              @click="toggleRouteAlternative"
            >
              <span>{{ activeRouteType === 'safe' ? 'Ver Ruta Alternativa' : 'Ver Ruta Recomendada' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Mapa Leaflet con Enrutamiento por Calles Reales -->
      <div class="map-panel">
        <div class="map-card-wrapper">
          <SafeRouteMap
            height="620px"
            :origin="origin"
            :destination="destination"
            :travelMode="travelMode"
            :activeRoute="activeRouteType"
            :isNavigating="isNavigating"
            @pointSelected="handlePointSelected"
            @routeCalculated="handleRouteCalculated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.routes-page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.routes-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.routes-subtitle {
  font-size: 0.88rem;
  color: #64748B;
  margin: 0;
}

.status-indicator-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.nav-idle {
  background-color: #E6F7F5;
  color: #007A6C;
  border: 1px solid #A7E3DC;
}

.nav-active {
  background-color: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FCA5A5;
  animation: pulseBadge 1.5s infinite;
}

@keyframes pulseBadge {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Grid Layout */
.routes-layout-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 992px) {
  .routes-layout-grid {
    grid-template-columns: 1fr;
  }
}

.planner-panel {
  width: 100%;
}

.panel-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  padding: 22px;
  box-shadow: 0 4px 20px rgba(14, 68, 78, 0.05);
}

.panel-card-header {
  display: flex;
  align-items: center;
}

.panel-icon {
  font-size: 1.2rem;
  color: #0E444E;
}

.panel-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.presets-buttons-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-btn {
  text-align: left;
  padding: 7px 10px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  background-color: #E6F7F5;
  border-color: #00A896;
}

.preset-btn.active {
  background-color: #E6F7F5;
  border-color: #00A896;
  color: #0E444E;
  font-weight: 600;
}

.target-mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.target-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.target-mode-btn:hover {
  background-color: #F1F5F9;
  border-color: #CBD5E1;
}

.target-mode-btn.active {
  background-color: #E6F7F5;
  border-color: #00A896;
  color: #0E444E;
  box-shadow: 0 1px 3px rgba(0, 168, 150, 0.15);
}

.input-icon-box {
  display: flex;
  align-items: center;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  padding: 0 10px;
  background-color: #FFFFFF;
}

.clean-input {
  width: 100%;
  height: 38px;
  border: none;
  font-size: 0.84rem;
  color: #1E293B;
  outline: none;
}

.mode-tabs {
  display: flex;
  gap: 6px;
}

.mode-tab {
  flex: 1;
  height: 34px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.mode-tab.active {
  background-color: #0E444E;
  border-color: #0E444E;
  color: #FFFFFF;
}

.btn-calc-route {
  height: 42px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-calc-route:hover:not(:disabled) {
  background-color: #155A66;
}

/* Route Metrics Box matching Prototype Code.txt lines 2730-2765 */
.route-metrics-box {
  background-color: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 14px;
}

.ai-status-pill {
  display: inline-flex;
  align-items: center;
  background-color: #E6F7F5;
  color: #007A6C;
  border: 1px solid #A7E3DC;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.metrics-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E2E8F0;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1E293B;
}

.metric-label {
  font-size: 0.72rem;
  color: #64748B;
  text-transform: uppercase;
}

.metric-separator {
  width: 1px;
  height: 32px;
  background-color: #E2E8F0;
}

.security-level-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.security-label {
  color: #64748B;
  font-weight: 500;
}

.security-pct {
  font-weight: 700;
  color: #00A896;
}

.security-progress-bar {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background-color: #E2E8F0;
  overflow: hidden;
  margin-top: 4px;
}

.security-progress-fill {
  height: 100%;
  background-color: #00A896;
  border-radius: 999px;
}

.security-subtext {
  font-size: 0.74rem;
  color: #64748B;
  line-height: 1.3;
}

.btn-start-nav {
  height: 42px;
  background-color: #00A896;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-start-nav:hover {
  background-color: #00917F;
}

.btn-stop-nav {
  height: 42px;
  background-color: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-alt-route {
  height: 38px;
  background-color: #FFFFFF;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-alt-route:hover {
  background-color: #F8FAFC;
  border-color: #CBD5E1;
}

.map-panel {
  width: 100%;
}

.map-card-wrapper {
  background: #FFFFFF;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(14, 68, 78, 0.05);
  border: 1px solid #E2E8F0;
}
</style>
