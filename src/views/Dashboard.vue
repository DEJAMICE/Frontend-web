<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import SafeRouteMap from '../components/SafeRouteMap.vue';
import EmergencySosModal from '../components/EmergencySosModal.vue';
import alertsService from '../services/alerts.service';

const authStore = useAuthStore();
const toast = useToast();

const isSosModalVisible = ref(false);
const currentActiveAlert = ref(null);
const isEmittingSos = ref(false);
const alertHistory = ref([]);
const isLoadingHistory = ref(false);
const contactsCount = ref(3);
const devicesCount = ref(2);

const activeAlertsCount = computed(() => {
  return alertHistory.value.filter(a => (a.status || '').toUpperCase() === 'ACTIVE').length;
});

async function loadHistory() {
  isLoadingHistory.value = true;
  try {
    const res = await alertsService.getAlertHistory();
    alertHistory.value = res.data || [];
  } catch (err) {
    console.error('Error al cargar historial de alertas:', err);
  } finally {
    isLoadingHistory.value = false;
  }
}

async function triggerSos() {
  isEmittingSos.value = true;
  try {
    const payload = {
      latitude: -12.0864,
      longitude: -77.0321,
      type: 'WEB_PANIC_BUTTON',
      severity: 'CRITICAL',
      locationAddress: 'Av. Salaverry / Campus San Isidro',
      userId: authStore.user?.id || 'usr_001',
      userName: authStore.user?.fullName || 'Jesús Godoy'
    };

    const res = await alertsService.emitAlert(payload);
    currentActiveAlert.value = res.data;
    isSosModalVisible.value = true;

    toast.add({
      severity: 'error',
      summary: 'Alerta SOS Activada',
      detail: 'Se ha emitido la señal de emergencia a tus contactos.',
      life: 5000
    });

    await loadHistory();
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Error al emitir SOS',
      detail: err.message || 'No se pudo conectar con el servicio.',
      life: 4000
    });
  } finally {
    isEmittingSos.value = false;
  }
}

async function onAlertResolved(alertId) {
  toast.add({
    severity: 'success',
    summary: 'Emergencia Resuelta',
    detail: 'Has confirmado que te encuentras a salvo.',
    life: 4000
  });
  await loadHistory();
}

async function onAlertCancelled(alertId) {
  toast.add({
    severity: 'info',
    summary: 'Alerta Cancelada',
    detail: 'Se registró como falsa alarma o prueba preventiva.',
    life: 4000
  });
  await loadHistory();
}

function getSeverityBadge(severity) {
  switch (severity) {
    case 'CRITICAL': return 'danger';
    case 'HIGH': return 'warn';
    case 'MEDIUM': return 'info';
    default: return 'secondary';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'ACTIVE': return 'danger';
    case 'RESOLVED': return 'success';
    case 'CANCELLED': return 'secondary';
    default: return 'info';
  }
}

function formatDate(isoDate) {
  if (!isoDate) return 'Reciente';
  const d = new Date(isoDate);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

onMounted(async () => {
  loadHistory();
  try {
    const { contactsService, devicesService } = await import('../services');
    const [c, d] = await Promise.all([
      contactsService.getContacts().catch(() => null),
      devicesService.getDevices().catch(() => null)
    ]);
    if (Array.isArray(c)) contactsCount.value = c.length;
    else if (c?.data && Array.isArray(c.data)) contactsCount.value = c.data.length;

    if (Array.isArray(d)) devicesCount.value = d.length;
    else if (d?.data && Array.isArray(d.data)) devicesCount.value = d.data.length;
  } catch (e) {
    console.warn('Dashboard stats fallback:', e);
  }
});
</script>

<template>
  <div class="dashboard-container">
    <Toast />

    <div class="flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h1 class="page-title m-0">Panel de Control y Monitoreo</h1>
        <p class="subtitle m-0">Bienvenido, {{ authStore.user?.fullName || 'Usuario Protegido' }} · SecuraNet Urban Safety Hub</p>
      </div>
      <div class="flex align-items-center gap-2 mt-2 md:mt-0">
        <span class="status-pill-system font-bold flex align-items-center gap-1">
          <i class="pi pi-check-circle"></i> Sistema Conectado a Central de Seguridad
        </span>
      </div>
    </div>

    <!-- 3 KPI Cards oficiales de Fuentes/Prototype Code.txt -->
    <div class="kpi-grid mb-4">
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Alertas Activas</span>
          <div class="kpi-icon-box danger-box">
            <i class="pi pi-shield"></i>
          </div>
        </div>
        <div class="kpi-number" :class="{ 'text-danger': activeAlertsCount > 0 }">{{ activeAlertsCount }}</div>
        <div class="kpi-subtext">{{ activeAlertsCount === 0 ? 'Sin incidentes activos' : `${activeAlertsCount} en seguimiento activo` }}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Contactos de Confianza</span>
          <div class="kpi-icon-box accent-box">
            <i class="pi pi-users"></i>
          </div>
        </div>
        <div class="kpi-number">{{ contactsCount }}</div>
        <div class="kpi-subtext">En tu red de protección</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Dispositivos IoT</span>
          <div class="kpi-icon-box brand-box">
            <i class="pi pi-compass"></i>
          </div>
        </div>
        <div class="kpi-number">{{ devicesCount }}</div>
        <div class="kpi-subtext">Sincronizados vía Bluetooth BLE</div>
      </div>
    </div>

    <div class="grid">
      <!-- ÁREA IZQUIERDA: MAPA INTERACTIVO Y RUTAS SEGURAS (Módulo C) -->
      <div class="col-12 xl:col-8">
        <Card class="dashboard-card shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="flex align-items-center gap-2 text-lg">
                <i class="pi pi-map text-primary"></i>
                Mapa Interactivo de Zonas de Riesgo y Enrutamiento Seguro
              </span>
              <span class="text-xs text-500 font-normal">Motor Geoespacial Leaflet</span>
            </div>
          </template>
          <template #content>
            <SafeRouteMap height="460px" :showControls="true" />
          </template>
        </Card>
      </div>

      <!-- ÁREA DERECHA: BOTÓN DE PÁNICO SOS & RESUMEN DE EMERGENCIAS (Módulo D) -->
      <div class="col-12 xl:col-4 flex flex-column gap-3">
        <!-- Tarjeta del Botón de Pánico Web -->
        <Card class="dashboard-card sos-card shadow-2 text-center">
          <template #content>
            <div class="sos-action-box p-3">
              <div class="sos-pulse-ring mb-3">
                <i class="pi pi-bell text-5xl text-white"></i>
              </div>
              <h2 class="text-red-700 m-0 mb-1 font-bold">Botón de Pánico Web</h2>
              <p class="text-xs text-600 mb-3">
                Pulsa para emitir señal de emergencia inmediata a tu Red de Confianza y Central de Serenazgo.
              </p>
              <Button
                label="EMITIR ALERTA SOS"
                icon="pi pi-exclamation-triangle"
                severity="danger"
                rounded
                size="large"
                class="w-full font-bold shadow-3 sos-button-trigger"
                :loading="isEmittingSos"
                @click="triggerSos"
              />
            </div>
          </template>
        </Card>

        <!-- Tarjeta de Estado del Sistema -->
        <Card class="dashboard-card shadow-1">
          <template #title>
            <span class="text-sm font-bold text-700 flex align-items-center gap-2">
              <i class="pi pi-shield text-green-600"></i> Red de Protección Activa
            </span>
          </template>
          <template #content>
            <div class="flex justify-content-between text-xs py-1 border-bottom-1 surface-border">
              <span class="text-600">Contactos Prioritarios:</span>
              <span class="font-bold text-primary">3 Enlazados</span>
            </div>
            <div class="flex justify-content-between text-xs py-1 border-bottom-1 surface-border mt-1">
              <span class="text-600">Dispositivo Físico BLE:</span>
              <span class="font-bold text-green-600">SN-001 Conectado (88%)</span>
            </div>
            <div class="flex justify-content-between text-xs py-1 mt-1">
              <span class="text-600">Algoritmo de Ruta:</span>
              <span class="font-bold text-indigo-600">IA Activa (Evita 3 zonas)</span>
            </div>
          </template>
        </Card>
      </div>

      <!-- ÁREA INFERIOR: HISTORIAL DE ALERTAS CON DATATABLE (Módulo D) -->
      <div class="col-12">
        <Card class="dashboard-card shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="flex align-items-center gap-2 text-lg">
                <i class="pi pi-history text-primary"></i>
                Historial de Alertas de Emergencia y Registro de Eventos
              </span>
              <Button
                icon="pi pi-refresh"
                size="small"
                text
                rounded
                aria-label="Actualizar"
                :loading="isLoadingHistory"
                @click="loadHistory"
              />
            </div>
          </template>
          <template #content>
            <DataTable
              :value="alertHistory"
              :loading="isLoadingHistory"
              paginator
              :rows="5"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              emptyMessage="No se registran alertas en el historial."
            >
              <Column field="id" header="Código" style="width: 110px">
                <template #body="{ data }">
                  <span class="font-mono text-xs font-bold text-700">{{ data.id }}</span>
                </template>
              </Column>
              <Column field="createdAt" header="Fecha / Hora" style="width: 140px">
                <template #body="{ data }">
                  <span class="text-xs">{{ formatDate(data.createdAt) }}</span>
                </template>
              </Column>
              <Column field="type" header="Canal de Alerta">
                <template #body="{ data }">
                  <span class="text-xs font-semibold">
                    <i :class="data.type === 'PANIC_BUTTON' || data.type === 'WEB_PANIC_BUTTON' ? 'pi pi-bell text-red-500 mr-1' : 'pi pi-compass text-blue-500 mr-1'"></i>
                    {{ data.type === 'WEB_PANIC_BUTTON' ? 'Botón Web SOS' : (data.type === 'PANIC_BUTTON' ? 'Hardware IoT SN-001' : 'Alerta Silenciosa') }}
                  </span>
                </template>
              </Column>
              <Column field="locationAddress" header="Ubicación Detectada">
                <template #body="{ data }">
                  <span class="text-xs text-700">{{ data.locationAddress || 'San Isidro / Lima' }}</span>
                </template>
              </Column>
              <Column field="severity" header="Severidad" style="width: 110px">
                <template #body="{ data }">
                  <Tag :value="data.severity" :severity="getSeverityBadge(data.severity)" class="text-xs" />
                </template>
              </Column>
              <Column field="status" header="Estado" style="width: 110px">
                <template #body="{ data }">
                  <Tag :value="data.status" :severity="getStatusBadge(data.status)" class="text-xs font-bold" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>

    <!-- Modal Emergencia SOS Activa -->
    <EmergencySosModal
      v-model:visible="isSosModalVisible"
      :alertData="currentActiveAlert"
      @resolved="onAlertResolved"
      @cancelled="onAlertCancelled"
    />
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  color: var(--ink, #1B2B2E);
  font-size: 1.55rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--sub, #5A6B6E);
  font-size: 0.88rem;
}

.status-pill-system {
  font-size: 0.78rem;
  background-color: var(--accent-soft, #E1F4F1);
  color: var(--accent-ink, #00695C);
  border: 1px solid var(--accent-border, #9FD9D0);
  padding: 5px 12px;
  border-radius: 999px;
}

/* KPI Cards exactas de Dashboard.tsx en Fuentes/Prototype Code.txt */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.kpi-card {
  background-color: #FFFFFF;
  border: 1.5px solid var(--border, #D7E4E6);
  border-radius: 12px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s, box-shadow 0.15s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 68, 78, 0.06);
}

.kpi-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sub, #5A6B6E);
}

.kpi-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.kpi-icon-box.danger-box {
  background-color: var(--danger-soft, #FDECEA);
  color: var(--danger, #D32F2F);
  border: 1px solid #ffcdd2;
}

.kpi-icon-box.accent-box {
  background-color: var(--accent-soft, #E1F4F1);
  color: var(--accent, #00A896);
  border: 1px solid var(--accent-border, #9FD9D0);
}

.kpi-icon-box.brand-box {
  background-color: var(--panel, #EAF4F4);
  color: var(--brand, #0E444E);
  border: 1px solid var(--border, #D7E4E6);
}

.kpi-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--ink, #1B2B2E);
  margin-top: 8px;
  line-height: 1.1;
}

.kpi-number.text-danger {
  color: var(--danger, #D32F2F);
}

.kpi-subtext {
  font-size: 0.78rem;
  color: var(--muted, #7A8A8C);
  margin-top: 8px;
}

.dashboard-card {
  border-radius: 12px;
  background-color: #FFFFFF;
  border: 1.5px solid var(--border, #D7E4E6);
}

.sos-card {
  border-left: 4px solid var(--danger, #D32F2F);
  background: linear-gradient(180deg, #fffafa 0%, #ffffff 100%);
}

.sos-pulse-ring {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  background-color: var(--danger, #D32F2F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(211, 47, 47, 0.4);
}

.sos-button-trigger {
  padding: 0.9rem 1.2rem;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  background-color: var(--danger, #D32F2F) !important;
  border-color: var(--danger, #D32F2F) !important;
  transition: transform 0.15s ease-in-out;
}

.sos-button-trigger:hover {
  transform: scale(1.02);
  background-color: var(--danger-hover, #B71C1C) !important;
}
</style>