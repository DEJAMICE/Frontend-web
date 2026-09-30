/**
 * SafeSignal - Route Tracking & Telemetry Service
 * Organización: DEJAMICE
 * Responsable: Persona 3 - Mathias Andree Cárdenas Huamán
 *
 * Módulo de cliente HTTP para el seguimiento de recorridos asistidos en vivo,
 * detección de desvíos anómalos y telemetría de coordenadas.
 * Consume los endpoints correspondientes en /api/v1/tracking.
 */

import apiClient, { USE_MOCK } from './api';
import { mockTrackingRoute } from './mockData';

export const trackingService = {
  /**
   * Inicia una sesión de seguimiento de ruta segura para un recorrido nocturno o trayecto.
   * @param {Object} trackingStartPayload - Origen, destino y contactos a notificar
   */
  async startTracking(trackingStartPayload) {
    if (USE_MOCK) {
      const newRoute = {
        routeId: `rt_${Date.now()}`,
        userId: 'usr_001',
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        points: [],
        ...trackingStartPayload,
      };
      return { success: true, data: newRoute, message: 'Seguimiento de ruta iniciado con éxito' };
    }

    const response = await apiClient.post('/tracking/start', trackingStartPayload);
    return response.data;
  },

  /**
   * Envía un punto geolocalizado (waypoint) del recorrido en vivo para actualizar la telemetría.
   * @param {Object} pointPayload - routeId, latitude, longitude, speed, timestamp
   */
  async sendTrackingPoint(pointPayload) {
    if (USE_MOCK) {
      if (mockTrackingRoute.points) {
        mockTrackingRoute.points.push({
          latitude: pointPayload.latitude,
          longitude: pointPayload.longitude,
          speed: pointPayload.speed || 0,
          timestamp: new Date().toISOString(),
        });
      }
      return { success: true, isDeviationDetected: false };
    }

    const response = await apiClient.post('/tracking/points', pointPayload);
    return response.data;
  },

  /**
   * Consulta el estado en tiempo real de una ruta en curso (usado por la red de apoyo para ver el mapa).
   * @param {string|number} routeId - ID de la ruta activa
   */
  async getLiveRoute(routeId) {
    if (USE_MOCK) {
      return { success: true, data: mockTrackingRoute };
    }

    const response = await apiClient.get(`/tracking/${routeId}/live`);
    return response.data;
  },

  /**
   * Finaliza el seguimiento del recorrido al llegar de manera segura a destino.
   * @param {string|number} routeId - ID de la ruta
   */
  async stopTracking(routeId) {
    if (USE_MOCK) {
      mockTrackingRoute.status = 'COMPLETED';
      mockTrackingRoute.completedAt = new Date().toISOString();
      return { success: true, message: 'Recorrido finalizado exitosamente. Tus contactos han sido notificados.' };
    }

    const response = await apiClient.post(`/tracking/${routeId}/stop`);
    return response.data;
  },

  /**
   * Obtiene el historial de rutas y trayectos completados por el usuario.
   */
  async getRouteHistory() {
    if (USE_MOCK) {
      return { success: true, data: [mockTrackingRoute] };
    }

    const response = await apiClient.get('/tracking/history');
    return response.data;
  },
};

export default trackingService;
