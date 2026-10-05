<script setup>
import { ref, computed, onMounted } from 'vue';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import contactsService from '../services/contacts.service';

const toast = useToast();

const contactsList = ref([
  {
    id: 'c-1',
    name: 'María Fernández',
    phone: '+51 987 654 321',
    relationship: 'Familiar',
    isPriority: true,
    status: 'Activo'
  },
  {
    id: 'c-2',
    name: 'Jorge Ramírez',
    phone: '+51 954 112 908',
    relationship: 'Amigo',
    isPriority: true,
    status: 'Activo'
  },
  {
    id: 'c-3',
    name: 'Lucía Castro',
    phone: '+51 921 447 560',
    relationship: 'Familiar',
    isPriority: false,
    status: 'Pendiente'
  },
  {
    id: 'c-4',
    name: 'Diego Paredes',
    phone: '+51 999 308 214',
    relationship: 'Amigo',
    isPriority: false,
    status: 'Inactivo'
  }
]);

const searchQuery = ref('');
const selectedRelation = ref('all');
const isLoading = ref(false);
const isAddDialogVisible = ref(false);
const isSaving = ref(false);
const editingContactId = ref(null);

const contactForm = ref({
  fullName: '',
  phone: '',
  email: '',
  relationship: 'Familiar',
  isPriority: true
});

const relationsOptions = [
  { label: 'Todas las relaciones', value: 'all' },
  { label: 'Familiar', value: 'Familiar' },
  { label: 'Amigo', value: 'Amigo' },
  { label: 'Compañero de Trabajo', value: 'Trabajo' },
  { label: 'Vecino', value: 'Vecino' }
];

const filteredContacts = computed(() => {
  return contactsList.value.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          c.phone.includes(searchQuery.value);
    const matchesRel = selectedRelation.value === 'all' || c.relationship === selectedRelation.value;
    return matchesSearch && matchesRel;
  });
});

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

async function fetchContacts() {
  isLoading.value = true;
  try {
    const res = await contactsService.getContacts();
    if (res.data && res.data.length > 0) {
      contactsList.value = res.data.map(item => ({
        id: item.id || `c-${Math.random()}`,
        name: item.fullName || item.name,
        phone: item.phoneNumber || item.phone,
        relationship: item.relationship || 'Familiar',
        isPriority: item.accessLevel === 'FullAccess' || item.isPriority === true,
        status: item.status || 'Activo'
      }));
    }
  } catch (err) {
    console.warn('Usando contactos locales de la maqueta:', err);
  } finally {
    isLoading.value = false;
  }
}

function openAddModal() {
  editingContactId.value = null;
  contactForm.value = {
    fullName: '',
    phone: '',
    email: '',
    relationship: 'Familiar',
    isPriority: true
  };
  isAddDialogVisible.value = true;
}

function openEditModal(contact) {
  editingContactId.value = contact.id;
  contactForm.value = {
    fullName: contact.name,
    phone: contact.phone.replace('+51 ', '').replace('+51', ''),
    email: contact.email || '',
    relationship: contact.relationship,
    isPriority: contact.isPriority
  };
  isAddDialogVisible.value = true;
}

async function handleSaveContact() {
  if (!contactForm.value.fullName || !contactForm.value.phone) {
    toast.add({
      severity: 'warn',
      summary: 'Campos requeridos',
      detail: 'Ingresa el nombre completo y teléfono del contacto.',
      life: 3000
    });
    return;
  }

  isSaving.value = true;
  const formattedPhone = contactForm.value.phone.startsWith('+51')
    ? contactForm.value.phone
    : `+51 ${contactForm.value.phone.trim()}`;

  try {
    const payload = {
      fullName: contactForm.value.fullName,
      phoneNumber: formattedPhone,
      email: contactForm.value.email || null,
      relationship: contactForm.value.relationship,
      accessLevel: contactForm.value.isPriority ? 'FullAccess' : 'Standard',
      isPriority: contactForm.value.isPriority
    };

    if (editingContactId.value) {
      const idx = contactsList.value.findIndex(c => c.id === editingContactId.value);
      if (idx !== -1) {
        contactsList.value[idx] = {
          ...contactsList.value[idx],
          name: contactForm.value.fullName,
          phone: formattedPhone,
          email: contactForm.value.email,
          relationship: contactForm.value.relationship,
          isPriority: contactForm.value.isPriority
        };
      }
      toast.add({ severity: 'success', summary: 'Contacto Actualizado', detail: 'Datos guardados correctamente.', life: 3000 });
    } else {
      const newEntry = {
        id: `c-${Date.now()}`,
        name: contactForm.value.fullName,
        phone: formattedPhone,
        email: contactForm.value.email,
        relationship: contactForm.value.relationship,
        isPriority: contactForm.value.isPriority,
        status: 'Activo'
      };
      contactsList.value.unshift(newEntry);
      try {
        await contactsService.addContact(payload);
      } catch (e) {
        console.warn('Guardado en memoria de sesión:', e);
      }
      toast.add({
        severity: 'success',
        summary: 'Contacto Agregado',
        detail: `${contactForm.value.fullName} se añadió como ${contactForm.value.isPriority ? 'Prioritario' : 'Estándar'}.`,
        life: 3000
      });
    }

    isAddDialogVisible.value = false;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el contacto.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
}

async function handleDeleteContact(contact) {
  if (confirm(`¿Estás seguro de eliminar a ${contact.name} de tu Red de Confianza?`)) {
    contactsList.value = contactsList.value.filter(c => c.id !== contact.id);
    try {
      await contactsService.deleteContact(contact.id);
    } catch {}
    toast.add({
      severity: 'info',
      summary: 'Contacto Eliminado',
      detail: `${contact.name} fue retirado de la red de alerta.`,
      life: 3000
    });
  }
}

onMounted(() => {
  fetchContacts();
});
</script>

<template>
  <div class="network-container">
    <Toast />

    <!-- Page Header matching Red_de_Confianza.png -->
    <div class="network-header mb-4">
      <h1 class="network-title">Red de Confianza</h1>
      <p class="network-subtitle">Gestiona los contactos que recibirán tus alertas SOS</p>
    </div>

    <!-- Filter & Action Bar -->
    <div class="filter-action-bar mb-3">
      <div class="filter-left">
        <div class="search-input-box">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar contacto..."
            class="clean-search-input"
          />
        </div>

        <div class="relation-select-box">
          <select v-model="selectedRelation" class="clean-select">
            <option v-for="opt in relationsOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <button class="add-contact-btn" @click="openAddModal">
        <i class="pi pi-plus mr-1"></i>
        <span>Agregar Contacto</span>
      </button>
    </div>

    <!-- Table Container matching Red_de_Confianza.png -->
    <div class="table-card">
      <table class="network-table">
        <thead>
          <tr>
            <th class="th-name">NOMBRE COMPLETO</th>
            <th class="th-phone">TELÉFONO</th>
            <th class="th-rel">RELACIÓN</th>
            <th class="th-priority">ROL / PRIORIDAD</th>
            <th class="th-status">ESTADO</th>
            <th class="th-actions text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in filteredContacts" :key="contact.id" class="table-row">
            <!-- Nombre Completo con Avatar Circular -->
            <td class="td-name">
              <div class="avatar-cell">
                <div class="avatar-circle">
                  {{ getInitials(contact.name) }}
                </div>
                <span class="contact-name font-bold">{{ contact.name }}</span>
              </div>
            </td>

            <!-- Teléfono -->
            <td class="td-phone font-mono text-slate-600">
              {{ contact.phone }}
            </td>

            <!-- Relación -->
            <td class="td-rel">
              <span class="relation-pill">{{ contact.relationship }}</span>
            </td>

            <!-- Rol / Prioridad -->
            <td class="td-priority">
              <span v-if="contact.isPriority" class="priority-badge">
                <i class="pi pi-star-fill text-yellow-500 mr-1"></i>
                Prioritario
              </span>
              <span v-else class="standard-text">
                Estándar
              </span>
            </td>

            <!-- Estado con Punto de Color -->
            <td class="td-status">
              <span class="status-indicator">
                <span class="status-dot" :class="contact.status === 'Activo' ? 'dot-active' : 'dot-inactive'"></span>
                <span class="status-label">{{ contact.status }}</span>
              </span>
            </td>

            <!-- Acciones (Editar y Eliminar) -->
            <td class="td-actions text-right">
              <div class="action-buttons-group">
                <button class="action-btn" title="Editar contacto" @click="openEditModal(contact)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="action-btn" title="Eliminar contacto" @click="handleDeleteContact(contact)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredContacts.length === 0">
            <td colspan="6" class="text-center py-5 text-slate-400">
              No se encontraron contactos en la red con los criterios de búsqueda.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Table Footer with Pagination matching mockup -->
      <div class="table-footer">
        <span class="counter-text">Mostrando {{ filteredContacts.length }} de {{ contactsList.length }} contactos</span>
        <div class="pagination-buttons">
          <button class="page-nav-btn"><i class="pi pi-angle-left"></i></button>
          <button class="page-num-btn active">1</button>
          <button class="page-num-btn">2</button>
          <button class="page-num-btn">3</button>
          <button class="page-nav-btn"><i class="pi pi-angle-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Modal "Agregar Contacto de Confianza" matching Red_de_Confianza2(CuadroDeAgregar).png -->
    <div v-if="isAddDialogVisible" class="modal-backdrop" @click.self="isAddDialogVisible = false">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ editingContactId ? 'Editar Contacto de Confianza' : 'Agregar Contacto de Confianza' }}</h3>
          <button class="close-btn" @click="isAddDialogVisible = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Body Form -->
        <form @submit.prevent="handleSaveContact" class="modal-body">
          <div class="form-group mb-3">
            <label class="modal-label">Nombre completo</label>
            <input
              v-model="contactForm.fullName"
              type="text"
              class="modal-input"
              placeholder="Ej. María López"
              required
            />
          </div>

          <div class="form-group mb-3">
            <label class="modal-label">Teléfono</label>
            <div class="phone-input-group">
              <span class="prefix-badge">+51</span>
              <input
                v-model="contactForm.phone"
                type="tel"
                class="modal-input phone-field"
                placeholder="987 654 321"
                required
              />
            </div>
          </div>

          <div class="form-group mb-3">
            <label class="modal-label">Correo electrónico</label>
            <input
              v-model="contactForm.email"
              type="email"
              class="modal-input"
              placeholder="nombre@correo.com"
            />
          </div>

          <div class="form-group mb-3">
            <label class="modal-label">Relación</label>
            <select v-model="contactForm.relationship" class="modal-input modal-select">
              <option value="Familiar">Familiar</option>
              <option value="Amigo">Amigo</option>
              <option value="Compañero de Trabajo">Compañero de Trabajo</option>
              <option value="Vecino">Vecino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <!-- BOTÓN / TARJETA ASIGNAR COMO CONTACTO PRIORITARIO (Item 1 del usuario) -->
          <div
            class="priority-card-toggle"
            :class="{ active: contactForm.isPriority }"
            @click="contactForm.isPriority = !contactForm.isPriority"
          >
            <div class="custom-checkbox-box">
              <i v-if="contactForm.isPriority" class="pi pi-check"></i>
            </div>
            <div class="priority-texts">
              <span class="priority-heading">Asignar como Contacto Prioritario</span>
              <span class="priority-caption">Recibirá alertas SOS inmediatas con mayor urgencia.</span>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="modal-footer mt-4">
            <button
              type="button"
              class="btn-cancel"
              @click="isAddDialogVisible = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-save"
              :disabled="isSaving"
            >
              <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
              <span>{{ isSaving ? 'Guardando...' : 'Guardar Contacto' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.network-container {
  max-width: 1200px;
  margin: 0 auto;
}

.network-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.network-subtitle {
  font-size: 0.88rem;
  color: #64748B;
  margin: 0;
}

/* Filter Bar */
.filter-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 550px;
}

.search-input-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  font-size: 0.9rem;
}

.clean-search-input {
  width: 100%;
  height: 40px;
  padding: 0.4rem 1rem 0.4rem 2.4rem;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.88rem;
  background-color: #FFFFFF;
  color: #1E293B;
  outline: none;
  box-sizing: border-box;
}

.clean-search-input:focus {
  border-color: #00A896;
}

.relation-select-box {
  min-width: 180px;
}

.clean-select {
  width: 100%;
  height: 40px;
  padding: 0.4rem 0.8rem;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.88rem;
  background-color: #FFFFFF;
  color: #1E293B;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
}

.add-contact-btn {
  height: 40px;
  background-color: #0E444E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s;
}

.add-contact-btn:hover {
  background-color: #155A66;
}

/* Table Card matching Red_de_Confianza.png */
.table-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(14, 68, 78, 0.04);
}

.network-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.network-table thead tr {
  background-color: #0E444E;
  color: #FFFFFF;
}

.network-table th {
  padding: 14px 18px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.network-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 0.88rem;
}

.avatar-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #E2E8F0;
  color: #475569;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-name {
  color: #1E293B;
  font-size: 0.90rem;
}

.relation-pill {
  background-color: #F1F5F9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

.priority-badge {
  background-color: #E6F7F5;
  color: #007A6C;
  border: 1px solid #A7E3DC;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.standard-text {
  color: #64748B;
  font-size: 0.82rem;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #334155;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-active {
  background-color: #10B981;
}

.dot-inactive {
  background-color: #94A3B8;
}

.action-buttons-group {
  display: inline-flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background-color: #F8FAFC;
  border-color: #CBD5E1;
  color: #0E444E;
}

/* Pagination Footer */
.table-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FFFFFF;
  font-size: 0.82rem;
  color: #64748B;
}

.pagination-buttons {
  display: flex;
  gap: 4px;
}

.page-nav-btn, .page-num-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num-btn.active {
  background-color: #0E444E;
  color: #FFFFFF;
  border-color: #0E444E;
}

/* Modal Backdrop & Card matching Red_de_Confianza2(CuadroDeAgregar).png */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(14, 68, 78, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(14, 68, 78, 0.16);
  border: 1px solid #E2E8F0;
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
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
  padding: 4px;
}

.close-btn:hover {
  color: #0E444E;
}

.modal-body {
  padding: 1.5rem;
}

.modal-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.modal-input {
  width: 100%;
  height: 44px;
  padding: 0.5rem 0.85rem;
  border: 1px solid #D7E4E6;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #1E293B;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #00A896;
}

.phone-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.prefix-badge {
  height: 44px;
  padding: 0 14px;
  background-color: #F1F5F9;
  border: 1px solid #D7E4E6;
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-field {
  border-radius: 0 8px 8px 0 !important;
}

.modal-select {
  cursor: pointer;
}

/* Priority Card Toggle matching Red_de_Confianza2(CuadroDeAgregar).png */
.priority-card-toggle {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  background-color: #FAFCFC;
  transition: all 0.15s ease;
  user-select: none;
  margin-top: 1rem;
}

.priority-card-toggle:hover {
  border-color: #00A896;
  background-color: #F4FBFB;
}

.priority-card-toggle.active {
  border-color: #00A896;
  background-color: #EBF8F6;
}

.custom-checkbox-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1.5px solid #CBD5E1;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00A896;
  font-size: 0.75rem;
  font-weight: bold;
  margin-top: 2px;
  flex-shrink: 0;
}

.priority-card-toggle.active .custom-checkbox-box {
  border-color: #00A896;
  background-color: #00A896;
  color: #FFFFFF;
}

.priority-texts {
  display: flex;
  flex-direction: column;
}

.priority-heading {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 2px;
}

.priority-caption {
  font-size: 0.76rem;
  color: #64748B;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  height: 40px;
  padding: 0 16px;
  background-color: #FFFFFF;
  border: 1px solid #D7E4E6;
  color: #475569;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-cancel:hover {
  background-color: #F8FAFC;
}

.btn-save {
  height: 40px;
  padding: 0 18px;
  background-color: #0E444E;
  border: none;
  color: #FFFFFF;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.15s;
}

.btn-save:hover:not(:disabled) {
  background-color: #155A66;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
