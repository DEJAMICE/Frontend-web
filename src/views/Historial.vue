<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import alertsService from '../services/alerts.service';

const alertsList = ref([]);
const isLoading = ref(false);

async function fetchHistory() {
  isLoading.value = true;
  try {
    const res = await alertsService.getAlertHistory();
    alertsList.value = Array.isArray(res) ? res : (res.data || []);
  } catch (err) {
    console.error('Error al cargar historial:', err);
  } finally {
    isLoading.value = false;
  }
}

function getSeverityBadge(severity) {
  switch ((severity || '').toUpperCase()) {
    case 'CRITICAL': return 'danger';
    case 'HIGH': return 'warn';
    case 'MEDIUM': return 'info';
    default: return 'secondary';
  }
}

function getStatusBadge(status) {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE': return 'danger';
    case 'RESOLVED': return 'success';
    case 'CANCELLED': return 'secondary';
    default: return 'info';
  }
}

function formatDate(isoDate) {
  if (!isoDate) return 'Reciente';
  const d = new Date(isoDate);
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  fetchHistory();
});
</script>

<template>
  <div class="history-container">
    <div class="flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h1 class="page-title m-0">Historial y Auditoría de Alertas SOS</h1>
        <p class="subtitle m-0">Registro cronológico de incidencias emitidas por hardware BLE y botón web.</p>
      </div>
      <Button
        label="Actualizar Registro"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        size="small"
        :loading="isLoading"
        @click="fetchHistory"
      />
    </div>

    <Card class="shadow-1 border-round-lg">
      <template #content>
        <DataTable
          :value="alertsList"
          :loading="isLoading"
          paginator
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          emptyMessage="No se encuentran registros históricos."
        >
          <Column field="id" header="ID Alerta" style="width: 120px">
            <template #body="{ data }">
              <span class="font-mono text-xs font-bold text-700">{{ data.id }}</span>
            </template>
          </Column>

          <Column field="createdAt" header="Fecha y Hora">
            <template #body="{ data }">
              <span class="text-xs">{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>

          <Column field="type" header="Canal de Transmisión">
            <template #body="{ data }">
              <div class="text-xs font-semibold">
                <i :class="data.type === 'PANIC_BUTTON' || data.type === 'WEB_PANIC_BUTTON' ? 'pi pi-bell text-red-500 mr-1' : 'pi pi-shield text-blue-500 mr-1'"></i>
                {{ data.type === 'WEB_PANIC_BUTTON' ? 'Botón Pánico Web' : (data.type === 'PANIC_BUTTON' ? 'Hardware IoT SN-001' : 'Alerta Silenciosa') }}
              </div>
              <small class="text-500">{{ data.deviceName || 'Módulo Navegador' }}</small>
            </template>
          </Column>

          <Column field="locationAddress" header="Coordenadas / Ubicación">
            <template #body="{ data }">
              <span class="text-xs text-700">{{ data.locationAddress || 'San Isidro / Lima (-12.0864, -77.0321)' }}</span>
            </template>
          </Column>

          <Column field="severity" header="Severidad" style="width: 110px">
            <template #body="{ data }">
              <Tag :value="data.severity" :severity="getSeverityBadge(data.severity)" class="text-xs" />
            </template>
          </Column>

          <Column field="status" header="Estado" style="width: 120px">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusBadge(data.status)" class="text-xs font-bold" />
            </template>
          </Column>

          <Column field="resolutionNotes" header="Resolución / Notas">
            <template #body="{ data }">
              <span class="text-xs text-600 font-italic">{{ data.resolutionNotes || (data.status === 'ACTIVE' ? 'En atención por Serenazgo...' : 'Cierre de protocolo estándar') }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.history-container {
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
