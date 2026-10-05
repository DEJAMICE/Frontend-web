<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';
import Button from 'primevue/button';

const props = defineProps({
  height: {
    type: String,
    default: '480px'
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

const mapContainer = ref(null);
let map = null;

// Control de capas
const showRiskZones = ref(true);
const showIncidents = ref(true);
const showSafeRoute = ref(true);
const selectedRoutePreset = ref('upc_salaverry');

// Grupos de capas
let riskLayersGroup = null;
let incidentLayersGroup = null;
let routeLayersGroup = null;

// Fijar iconos por defecto en Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Datos de Zonas de Riesgo en Lima
const riskZonesData = [
  {
    name: 'Zona Crítica: Av. Brasil / Jr. Bolognesi',
    type: 'HIGH_RISK',
    lat: -12.0915,
    lng: -77.0435,
    radius: 360,
    color: '#ef4444',
    fillColor: '#f87171',
    description: 'Alta incidencia de robos al paso y arranches nocturnos (20:00 - 05:00 hrs).',
    reportedEvents: 14
  },
  {
    name: 'Zona de Alerta: Cruce Javier Prado / Pershing',
    type: 'MEDIUM_RISK',
    lat: -12.0880,
    lng: -77.0510,
    radius: 300,
    color: '#f59e0b',
    fillColor: '#fbbf24',
    description: 'Congestión vehicular prolongada, reportes frecuentes de arrebato a transeúntes.',
    reportedEvents: 8
  },
  {
    name: 'Zona Oscura: Pasaje San Andrés (Magdalena)',
    type: 'LOW_LIGHT',
    lat: -12.0965,
    lng: -77.0390,
    radius: 220,
    color: '#f97316',
    fillColor: '#fb923c',
    description: 'Luminarias públicas averiadas. Escasa visibilidad reportada por la comunidad.',
    reportedEvents: 5
  }
];

// Datos de Incidentes Urbanos
const incidentsData = [
  {
    title: 'Arrebato de celular',
    lat: -12.0905,
    lng: -77.0420,
    time: 'Hace 18 min',
    severity: 'Alta',
    verified: true
  },
  {
    title: 'Sujeto sospechoso merodeando',
    lat: -12.0872,
    lng: -77.0485,
    time: 'Hace 45 min',
    severity: 'Media',
    verified: true
  },
  {
    title: 'Cámara vecinal de videovigilancia activa',
    lat: -12.0845,
    lng: -77.0350,
    time: 'Punto seguro permanente',
    severity: 'Seguro',
    verified: true,
    isSafePoint: true
  }
];

// Coordenadas de Rutas Predefinidas
const routes = {
  upc_salaverry: {
    name: 'UPC San Isidro ➔ Av. Salaverry',
    distance: '2.1 km',
    duration: '24 min',
    safetyScore: '98% Seguro',
    origin: { lat: -12.0864, lng: -77.0321, name: 'Origen: UPC Campus San Isidro' },
    destination: { lat: -12.0945, lng: -77.0480, name: 'Destino: Residencial Salaverry' },
    // Ruta directa insegura (atraviesa zona roja)
    unsafePath: [
      [-12.0864, -77.0321],
      [-12.0885, -77.0380],
      [-12.0915, -77.0435], // Pasa por el centro del peligro
      [-12.0945, -77.0480]
    ],
    // Ruta segura calculada por IA SecuraNet (bordea las zonas rojas por corredores iluminados y vigilados)
    safePath: [
      [-12.0864, -77.0321],
      [-12.0840, -77.0345],
      [-12.0835, -77.0395],
      [-12.0850, -77.0450],
      [-12.0880, -77.0485],
      [-12.0920, -77.0495],
      [-12.0945, -77.0480]
    ]
  },
  magdalena_centro: {
    name: 'Av. Brasil ➔ San Isidro Financiero',
    distance: '3.4 km',
    duration: '38 min',
    safetyScore: '96% Seguro',
    origin: { lat: -12.0980, lng: -77.0460, name: 'Origen: Av. Brasil cdra. 35' },
    destination: { lat: -12.0930, lng: -77.0280, name: 'Destino: Centro Empresarial Real' },
    unsafePath: [
      [-12.0980, -77.0460],
      [-12.0950, -77.0410],
      [-12.0915, -77.0350],
      [-12.0930, -77.0280]
    ],
    safePath: [
      [-12.0980, -77.0460],
      [-12.0995, -77.0420],
      [-12.0970, -77.0360],
      [-12.0940, -77.0310],
      [-12.0930, -77.0280]
    ]
  }
};

const currentRoute = ref(routes[selectedRoutePreset.value]);

function renderRiskZones() {
  riskLayersGroup.clearLayers();
  if (!showRiskZones.value) return;

  riskZonesData.forEach(zone => {
    const circle = L.circle([zone.lat, zone.lng], {
      color: zone.color,
      fillColor: zone.fillColor,
      fillOpacity: 0.35,
      weight: 2,
      radius: zone.radius
    });

    circle.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px;">
        <h4 style="margin: 0 0 6px 0; color: ${zone.color}; font-size: 14px;">⚠️ ${zone.name}</h4>
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569;">${zone.description}</p>
        <span style="font-size: 11px; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
          ${zone.reportedEvents} incidentes en los últimos 30 días
        </span>
      </div>
    `);

    riskLayersGroup.addLayer(circle);
  });
}

function renderIncidents() {
  incidentLayersGroup.clearLayers();
  if (!showIncidents.value) return;

  incidentsData.forEach(inc => {
    const iconHtml = inc.isSafePoint
      ? `<div style="background:#10b981; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:bold; font-size:16px;">🛡️</div>`
      : `<div style="background:#ef4444; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:bold; font-size:14px;">🚨</div>`;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-incident-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });
    marker.bindPopup(`
      <div style="font-family: sans-serif;">
        <b style="font-size: 13px; color: ${inc.isSafePoint ? '#059669' : '#dc2626'};">${inc.title}</b><br>
        <span style="font-size: 11px; color: #64748b;">Reportado: ${inc.time}</span><br>
        <span style="font-size: 11px; color: #334155; font-weight: 600;">Estado: Verificado por Serenazgo</span>
      </div>
    `);

    incidentLayersGroup.addLayer(marker);
  });
}

function renderRoutes() {
  routeLayersGroup.clearLayers();
  if (!showSafeRoute.value) return;

  const r = routes[selectedRoutePreset.value];
  currentRoute.value = r;

  // Marcador Origen
  const originMarker = L.marker([r.origin.lat, r.origin.lng]).bindPopup(`<b>🟢 ${r.origin.name}</b>`);
  routeLayersGroup.addLayer(originMarker);

  // Marcador Destino
  const destMarker = L.marker([r.destination.lat, r.destination.lng]).bindPopup(`<b>🏁 ${r.destination.name}</b>`);
  routeLayersGroup.addLayer(destMarker);

  // Ruta Insegura (Directa, pasa por zonas de peligro - punteada en gris/rojo)
  const unsafeLine = L.polyline(r.unsafePath, {
    color: '#94a3b8',
    dashArray: '8, 8',
    weight: 4,
    opacity: 0.7
  }).bindPopup('<b>Ruta Directa Convencional:</b> No recomendada por proximidad a 2 zonas de asalto.');
  routeLayersGroup.addLayer(unsafeLine);

  // Ruta Segura SecuraNet (Calculada por IA, bordea zonas de peligro - verde sólida brillante)
  const safeLine = L.polyline(r.safePath, {
    color: '#10b981',
    weight: 6,
    opacity: 0.95
  }).bindPopup(`<b>✅ Ruta Segura IA SecuraNet:</b> Optimizada por vías principales iluminadas y con patrullaje.`);
  routeLayersGroup.addLayer(safeLine);

  // Ajustar mapa a la ruta
  map.fitBounds(safeLine.getBounds(), { padding: [40, 40] });
}

function updateMapLayers() {
  renderRiskZones();
  renderIncidents();
  renderRoutes();
}

function changePreset(presetKey) {
  selectedRoutePreset.value = presetKey;
  renderRoutes();
}

watch([showRiskZones, showIncidents, showSafeRoute], () => {
  updateMapLayers();
});

onMounted(() => {
  if (!mapContainer.value) return;

  // Inicializar Leaflet centrado en San Isidro / Lima
  map = L.map(mapContainer.value, {
    center: [-12.0885, -77.0410],
    zoom: 14,
    zoomControl: true
  });

  // Capa base de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · SecuraNet Urban Safety'
  }).addTo(map);

  // Inicializar grupos de capas
  riskLayersGroup = L.layerGroup().addTo(map);
  incidentLayersGroup = L.layerGroup().addTo(map);
  routeLayersGroup = L.layerGroup().addTo(map);

  // Render inicial
  updateMapLayers();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="map-wrapper">
    <!-- Barra superior de controles del mapa -->
    <div v-if="showControls" class="map-toolbar p-3 surface-0 border-round mb-2 shadow-1 flex flex-wrap justify-content-between align-items-center gap-2">
      <div class="flex align-items-center gap-2 flex-wrap">
        <span class="text-sm font-bold text-700 mr-1">Capas activas:</span>
        <Button 
          :label="showRiskZones ? 'Zonas de Riesgo' : 'Ocultar Riesgos'" 
          :icon="showRiskZones ? 'pi pi-exclamation-triangle' : 'pi pi-eye-slash'"
          :severity="showRiskZones ? 'danger' : 'secondary'"
          size="small"
          outlined
          @click="showRiskZones = !showRiskZones"
        />
        <Button 
          :label="showIncidents ? 'Incidentes' : 'Ocultar Incidentes'" 
          :icon="showIncidents ? 'pi pi-bell' : 'pi pi-eye-slash'"
          :severity="showIncidents ? 'warn' : 'secondary'"
          size="small"
          outlined
          @click="showIncidents = !showIncidents"
        />
        <Button 
          :label="showSafeRoute ? 'Ruta Segura IA' : 'Ocultar Ruta'" 
          :icon="showSafeRoute ? 'pi pi-compass' : 'pi pi-eye-slash'"
          :severity="showSafeRoute ? 'success' : 'secondary'"
          size="small"
          outlined
          @click="showSafeRoute = !showSafeRoute"
        />
      </div>

      <!-- Selector de Trayecto -->
      <div class="flex align-items-center gap-2">
        <span class="text-xs text-500 font-semibold">Trayecto sugerido:</span>
        <Button 
          label="UPC ➔ Salaverry" 
          size="small" 
          :severity="selectedRoutePreset === 'upc_salaverry' ? 'primary' : 'secondary'"
          :text="selectedRoutePreset !== 'upc_salaverry'"
          @click="changePreset('upc_salaverry')"
        />
        <Button 
          label="Av. Brasil ➔ San Isidro" 
          size="small" 
          :severity="selectedRoutePreset === 'magdalena_centro' ? 'primary' : 'secondary'"
          :text="selectedRoutePreset !== 'magdalena_centro'"
          @click="changePreset('magdalena_centro')"
        />
      </div>
    </div>

    <!-- Indicador de Ruta Segura Seleccionada -->
    <div v-if="showSafeRoute && currentRoute" class="route-badge-bar surface-100 p-2 border-round text-xs flex justify-content-between align-items-center mb-2">
      <div class="flex align-items-center gap-2">
        <span class="font-bold text-primary">{{ currentRoute.name }}</span>
        <span class="text-500">|</span>
        <span><b>Distancia:</b> {{ currentRoute.distance }}</span>
        <span class="text-500">|</span>
        <span><b>Tiempo est.:</b> {{ currentRoute.duration }}</span>
      </div>
      <div class="flex align-items-center gap-1 font-bold text-green-600">
        <i class="pi pi-shield"></i>
        <span>{{ currentRoute.safetyScore }}</span>
      </div>
    </div>

    <!-- Contenedor del Mapa Leaflet -->
    <div ref="mapContainer" class="map-element border-round shadow-2" :style="{ height: height }"></div>

    <!-- Leyenda explicativa inferior -->
    <div class="map-legend mt-2 flex flex-wrap gap-4 text-xs text-600 justify-content-center">
      <span class="flex align-items-center gap-1">
        <span class="legend-color-box bg-red-500"></span> Zona crítica (Alta tasa de asaltos)
      </span>
      <span class="flex align-items-center gap-1">
        <span class="legend-color-box bg-yellow-500"></span> Zona de alerta (Baja visibilidad / Iluminación)
      </span>
      <span class="flex align-items-center gap-1">
        <span class="legend-line-box safe-line"></span> Ruta Segura SecuraNet (Evita peligro)
      </span>
      <span class="flex align-items-center gap-1">
        <span class="legend-line-box unsafe-line"></span> Ruta directa peligrosa
      </span>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
}

.map-element {
  width: 100%;
  z-index: 1;
}

.legend-color-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.legend-line-box {
  width: 20px;
  height: 4px;
  display: inline-block;
  border-radius: 2px;
}

.safe-line {
  background-color: #10b981;
}

.unsafe-line {
  background-color: #94a3b8;
  border: 1px dashed #64748b;
}
</style>
