<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import contactsService from '../services/contacts.service';

const toast = useToast();
const contactsList = ref([]);
const isLoading = ref(false);
const isAddDialogVisible = ref(false);
const isSaving = ref(false);

const newContact = ref({
  name: '',
  phone: '',
  relationship: 'Familiar',
  isPriority: true
});

async function fetchContacts() {
  isLoading.value = true;
  try {
    const res = await contactsService.getContacts();
    contactsList.value = res.data || [];
  } catch (err) {
    console.error('Error al cargar contactos:', err);
  } finally {
    isLoading.value = false;
  }
}

async function handleAddContact() {
  if (!newContact.value.name || !newContact.value.phone) {
    toast.add({
      severity: 'warn',
      summary: 'Campos requeridos',
      detail: 'Por favor ingresa nombre y número telefónico.',
      life: 3000
    });
    return;
  }

  isSaving.value = true;
  try {
    await contactsService.addContact(newContact.value);
    toast.add({
      severity: 'success',
      summary: 'Contacto Agregado',
      detail: `${newContact.value.name} ha sido incorporado a tu Red de Confianza.`,
      life: 3000
    });
    isAddDialogVisible.value = false;
    newContact.value = { name: '', phone: '', relationship: 'Familiar', isPriority: true };
    await fetchContacts();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar el contacto.',
      life: 3000
    });
  } finally {
    isSaving.value = false;
  }
}

async function handleDeleteContact(id, name) {
  try {
    await contactsService.deleteContact(id);
    toast.add({
      severity: 'info',
      summary: 'Contacto Eliminado',
      detail: `${name} fue retirado de la red de alerta.`,
      life: 3000
    });
    await fetchContacts();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.', life: 3000 });
  }
}

onMounted(() => {
  fetchContacts();
});
</script>

<template>
  <div class="contacts-container">
    <Toast />

    <div class="flex flex-wrap justify-content-between align-items-center mb-3">
      <div>
        <h1 class="page-title m-0">Red de Contactos de Confianza</h1>
        <p class="subtitle m-0">Administra a tus familiares y amigos que recibirán alertas SOS y seguimiento de ruta.</p>
      </div>
      <Button
        label="Añadir Contacto"
        icon="pi pi-user-plus"
        severity="primary"
        class="mt-2 md:mt-0 font-bold"
        @click="isAddDialogVisible = true"
      />
    </div>

    <!-- Tarjeta Principal con DataTable -->
    <Card class="shadow-1 border-round-lg">
      <template #title>
        <div class="flex justify-content-between align-items-center text-base font-bold text-700">
          <span class="flex align-items-center gap-2">
            <i class="pi pi-users text-primary"></i> Contactos Vinculados ({{ contactsList.length }})
          </span>
          <span class="text-xs text-500 font-normal">Protocolo de Notificación SMS y Push Activo</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="contactsList"
          :loading="isLoading"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          emptyMessage="No tienes contactos registrados en tu red de auxilio."
        >
          <Column field="name" header="Nombre / Contacto">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <div class="avatar-circle">
                  <i class="pi pi-user text-primary"></i>
                </div>
                <div>
                  <div class="font-bold text-700 text-sm">{{ data.name }}</div>
                  <div class="text-xs text-500">{{ data.relationship }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="phone" header="Teléfono de Emergencia">
            <template #body="{ data }">
              <span class="text-sm font-mono text-700">{{ data.phone }}</span>
            </template>
          </Column>

          <Column field="isPriority" header="Prioridad SOS">
            <template #body="{ data }">
              <Tag
                :value="data.isPriority ? 'PRIORITARIO' : 'REGULAR'"
                :severity="data.isPriority ? 'danger' : 'secondary'"
                class="text-xs"
              />
            </template>
          </Column>

          <Column header="Acciones" style="width: 100px; text-align: right;">
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                aria-label="Eliminar"
                @click="handleDeleteContact(data.id, data.name)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Diálogo Modal para Añadir Contacto -->
    <Dialog
      v-model:visible="isAddDialogVisible"
      modal
      header="Añadir Contacto a la Red de Confianza"
      :style="{ width: '450px', maxWidth: '95vw' }"
    >
      <div class="p-fluid flex flex-column gap-3 mt-2">
        <div class="field">
          <label for="c-name" class="font-bold text-sm text-700">Nombre Completo</label>
          <InputText id="c-name" v-model="newContact.name" placeholder="Ej. Patricia Santillan" />
        </div>

        <div class="field">
          <label for="c-phone" class="font-bold text-sm text-700">Número de Celular</label>
          <InputText id="c-phone" v-model="newContact.phone" placeholder="Ej. +51 987 654 321" />
        </div>

        <div class="field">
          <label for="c-relation" class="font-bold text-sm text-700">Parentesco / Relación</label>
          <InputText id="c-relation" v-model="newContact.relationship" placeholder="Ej. Madre, Hermano, Amigo" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="isAddDialogVisible = false" />
        <Button label="Guardar Contacto" icon="pi pi-check" :loading="isSaving" @click="handleAddContact" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.contacts-container {
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

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
