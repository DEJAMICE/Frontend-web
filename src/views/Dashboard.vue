
<script setup>
import { useAuthStore } from '../stores/authStore';

import Card from 'primevue/card';
import Button from 'primevue/button';

const authStore = useAuthStore();
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #1A2B4C;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 1rem;
}

.dashboard-card {
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-radius: 8px;
  height: 100%;
}

/* Cajas de borde punteado para indicar dónde va el código de Persona 5 */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  padding: 3rem 1rem;
  min-height: 400px;
}

.small-placeholder {
  min-height: 150px;
  padding: 1.5rem;
}

.sos-container {
  min-height: 230px;
  border-color: #fbc02d;
  background-color: #fffde7;
}
</style>
<template>
  <div class="dashboard-container">
    <h1 class="page-title">Bienvenido, {{ authStore.user?.fullName?.split(' ')[0] || 'Usuario' }}</h1>
    <p class="subtitle">Panel de control de seguridad urbana. Aquí tienes un resumen de tu actividad.</p>

    <div class="grid mt-4">

      <!-- ÁREA IZQUIERDA PARA JESÚS (Persona 5): MAPA Y RUTAS -->
      <div class="col-12 md:col-8">
        <Card class="dashboard-card h-full">
          <template #title>Mapa de Zonas de Riesgo y Rutas Seguras</template>
          <template #content>
            <div class="placeholder-content">
              <i class="pi pi-map text-6xl text-300 mb-3"></i>
              <p class="text-500 text-center">
                [Espacio reservado para integración de Leaflet / Google Maps API] <br>
                <small>Módulo C: Jesús implementará aquí el cálculo de rutas seguras y las capas de riesgo.</small>
              </p>
            </div>
          </template>
        </Card>
      </div>

      <!-- ÁREA DERECHA PARA JESÚS (Persona 5): EMERGENCIAS E HISTORIAL -->
      <div class="col-12 md:col-4 flex flex-column gap-3">

        <!-- Tarjeta del Botón SOS -->
        <Card class="dashboard-card text-center">
          <template #content>
            <div class="placeholder-content p-4 sos-container">
              <i class="pi pi-bell text-6xl text-red-500 mb-3"></i>
              <h2 class="text-red-500 m-0 mb-2">Botón de Pánico Web</h2>
              <p class="text-500 mb-4">
                <small>Módulo D: Jesús conectará este botón con los endpoints de Mathias (/api/v1/alerts).</small>
              </p>
              <!-- Botón visualmente desactivado para que Jesús le agregue la lógica -->
              <Button
                  label="EMITIR SOS"
                  severity="danger"
                  rounded
                  size="large"
                  class="w-full font-bold"
                  disabled
              />
            </div>
          </template>
        </Card>

        <!-- Tarjeta del Historial -->
        <Card class="dashboard-card">
          <template #title>Historial Reciente</template>
          <template #content>
            <div class="placeholder-content small-placeholder">
              <p class="text-500 text-center m-0">
                <i class="pi pi-list text-3xl mb-2"></i><br>
                [Datatable de PrimeVue con historial de alertas]
              </p>
            </div>
          </template>
        </Card>

      </div>

    </div>
  </div>
</template>