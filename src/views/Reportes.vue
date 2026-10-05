<script setup>
import { ref } from 'vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const activeTab = ref('comunitarios'); // 'comunitarios' | 'mis_reportes'
const isReportModalOpen = ref(false);

const reportsList = ref([
  {
    id: 1,
    category: 'Robo',
    time: 'Hoy · 20:32',
    address: 'Av. Túpac Amaru 1450, Comas',
    description: 'Reportan arrebato de celular a peatón cerca del paradero. Precaución al caminar solo.',
    confirmedCount: 15,
    validated: false
  },
  {
    id: 2,
    category: 'Zona Oscura',
    time: 'Hoy · 19:05',
    address: 'Jr. Las Gardenias 220, Los Olivos',
    description: 'Alumbrado público apagado en toda la cuadra desde hace tres días.',
    confirmedCount: 8,
    validated: false
  },
  {
    id: 3,
    category: 'Robo',
    secondaryCategory: 'Zona Oscura',
    time: 'Ayer · 22:47',
    address: 'Av. Universitaria 3800, SMP',
    description: 'Varios vecinos reportan asaltos recurrentes en el cruce mal iluminado.',
    confirmedCount: 23,
    validated: false
  },
  {
    id: 4,
    category: 'Acoso',
    time: 'Ayer · 18:20',
    address: 'Parque Zonal Sinchi Roca, Comas',
    description: 'Persona sospechosa merodeando la zona de juegos infantiles por la tarde.',
    confirmedCount: 6,
    validated: false
  }
]);

const newReport = ref({
  type: 'Robo',
  address: '',
  description: ''
});

function handleValidate(report) {
  if (!report.validated) {
    report.confirmedCount++;
    report.validated = true;
    toast.add({ severity: 'success', summary: 'Reporte Validado', detail: 'Tu confirmación ayuda a alertar a la comunidad.', life: 2500 });
  } else {
    report.confirmedCount--;
    report.validated = false;
  }
}

function handleRefute(report) {
  toast.add({ severity: 'warn', summary: 'Voto Registrado', detail: 'Has marcado este reporte como dudoso.', life: 2500 });
}

function handleSaveReport() {
  if (!newReport.value.address || !newReport.value.description) {
    toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Ingresa la ubicación y descripción del incidente.', life: 3000 });
    return;
  }

  reportsList.value.unshift({
    id: Date.now(),
    category: newReport.value.type,
    time: 'Hace un momento',
    address: newReport.value.address,
    description: newReport.value.description,
    confirmedCount: 1,
    validated: true
  });

  isReportModalOpen.value = false;
  newReport.value = { type: 'Robo', address: '', description: '' };
  toast.add({ severity: 'success', summary: 'Incidente Reportado', detail: 'Tu alerta ha sido publicada para la red de vecinos.', life: 3500 });
}
</script>

<template>
  <div class="reports-page-container">
    <Toast />

    <!-- Header matching Reportes.png -->
    <div class="page-header mb-4">
      <h1 class="page-title">Reportes de la Comunidad</h1>
      <p class="page-subtitle">Incidentes reportados y validados por vecinos de tu zona</p>
    </div>

    <!-- Navigation Tabs & Top Button -->
    <div class="tabs-action-bar mb-4">
      <div class="tabs-list">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'comunitarios' }"
          @click="activeTab = 'comunitarios'"
        >
          Reportes Comunitarios
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'mis_reportes' }"
          @click="activeTab = 'mis_reportes'"
        >
          Mis Reportes
        </button>
      </div>

      <button class="btn-create-report" @click="isReportModalOpen = true">
        <i class="pi pi-plus mr-1"></i>
        <span>Reportar Incidente en la Calle</span>
      </button>
    </div>

    <!-- Grid of Reports Cards matching Reportes.png -->
    <div class="reports-grid">
      <div v-for="rep in reportsList" :key="rep.id" class="report-card">
        <!-- Badges & Time -->
        <div class="card-top-tags mb-2">
          <div class="tags-left">
            <span class="tag-pill category-tag">{{ rep.category }}</span>
            <span v-if="rep.secondaryCategory" class="tag-pill category-secondary-tag">{{ rep.secondaryCategory }}</span>
          </div>
          <span class="report-time">{{ rep.time }}</span>
        </div>

        <!-- Address with map icon -->
        <div class="report-address-row mb-2">
          <i class="pi pi-map-marker text-teal-600 mr-2"></i>
          <span class="report-address-text font-bold">{{ rep.address }}</span>
        </div>

        <!-- Description -->
        <p class="report-desc mb-3">
          {{ rep.description }}
        </p>

        <!-- Social Confirmation Bar -->
        <div class="social-confirm-bar mb-3">
          <div class="avatar-stack">
            <div class="stack-dot"></div>
            <div class="stack-dot"></div>
            <div class="stack-dot"></div>
          </div>
          <span class="confirm-text">
            <strong>{{ rep.confirmedCount }} personas</strong> lo confirmaron
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="card-actions-row">
          <button
            class="action-btn-validate"
            :class="{ active: rep.validated }"
            @click="handleValidate(rep)"
          >
            <span>Validar ✓</span>
          </button>
          <button class="action-btn-refute" @click="handleRefute(rep)">
            <span>Refutar X</span>
          </button>
          <button class="action-btn-map">
            <span>Ver en mapa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reportar Incidente -->
    <div v-if="isReportModalOpen" class="modal-backdrop" @click.self="isReportModalOpen = false">
      <div class="modal-report-card">
        <div class="modal-header">
          <h3 class="modal-title">Reportar Incidente Comunitario</h3>
          <button class="close-btn" @click="isReportModalOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSaveReport" class="modal-body">
          <div class="form-group mb-3">
            <label class="form-label">Tipo de Peligro / Incidente</label>
            <select v-model="newReport.type" class="form-select">
              <option value="Robo">Robo / Arrebato</option>
              <option value="Zona Oscura">Zona Oscura / Sin Alumbrado</option>
              <option value="Acoso">Acoso Callejero</option>
              <option value="Sospechoso">Persona o Vehículo Sospechoso</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Ubicación Referencial</label>
            <input
              v-model="newReport.address"
              type="text"
              class="form-input"
              placeholder="Ej. Av. Túpac Amaru 1450, Comas"
              required
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Descripción del Suceso</label>
            <textarea
              v-model="newReport.description"
              rows="3"
              class="form-textarea"
              placeholder="Detalla lo ocurrido para prevenir a otros transeúntes..."
              required
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="isReportModalOpen = false">Cancelar</button>
            <button type="submit" class="btn-save">Publicar Alerta</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-page-container {
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

.tabs-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1.5px solid #E2E8F0;
  padding-bottom: 8px;
}

.tabs-list {
  display: flex;
  gap: 16px;
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 0.92rem;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  padding: 6px 4px;
  position: relative;
}

.tab-btn.active {
  color: #0E444E;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #0E444E;
  border-radius: 2px;
}

.btn-create-report {
  height: 40px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.15s;
}

.btn-create-report:hover {
  background-color: #155A66;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.report-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(14, 68, 78, 0.04);
  display: flex;
  flex-direction: column;
}

.card-top-tags {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-left {
  display: flex;
  gap: 6px;
}

.tag-pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
}

.category-tag {
  background-color: #E6F7F5;
  color: #007A6C;
}

.category-secondary-tag {
  background-color: #FEF3C7;
  color: #B45309;
}

.report-time {
  font-size: 0.74rem;
  color: #94A3B8;
}

.report-address-row {
  display: flex;
  align-items: center;
  font-size: 0.90rem;
  color: #1E293B;
}

.report-desc {
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.4;
  margin: 0;
}

.social-confirm-bar {
  background-color: #F8FAFC;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-stack {
  display: flex;
}

.stack-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #CBD5E1;
  border: 2px solid #FFFFFF;
  margin-right: -6px;
}

.confirm-text {
  font-size: 0.76rem;
  color: #475569;
}

.card-actions-row {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.action-btn-validate, .action-btn-refute, .action-btn-map {
  flex: 1;
  height: 34px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  background-color: #FFFFFF;
  border: 1px solid #D7E4E6;
  color: #475569;
  transition: all 0.15s;
}

.action-btn-validate:hover, .action-btn-validate.active {
  background-color: #E6F7F5;
  border-color: #00A896;
  color: #007A6C;
}

.action-btn-refute:hover {
  background-color: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626;
}

.action-btn-map:hover {
  background-color: #F8FAFC;
  color: #0E444E;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(14, 68, 78, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-report-card {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(14, 68, 78, 0.16);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F1F5F9;
}

.modal-title {
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

.modal-body {
  padding: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.88rem;
  padding: 0.5rem 0.85rem;
  color: #1E293B;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.5rem;
}

.btn-cancel {
  height: 40px;
  padding: 0 16px;
  background-color: #FFFFFF;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  height: 40px;
  padding: 0 18px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
