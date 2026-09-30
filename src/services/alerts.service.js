/**
 * SafeSignal - Alerts & SOS Service
 * Organización: DEJAMICE
 * Responsable: Persona 3 - Mathias Andree Cárdenas Huamán
 *
 * Módulo de cliente HTTP para la gestión de Alertas SOS, Alertas Silenciosas y Protocolos de Emergencia.
 * Consume los endpoints correspondientes en /api/v1/alerts.
 */

import apiClient, { USE_MOCK } from './api';
import { mockAlerts } from './mockData';

export const alertsService = {
  /**
   * Emite una nueva alerta de emergencia SOS o alerta silenciosa.
   * @param {Object} alertPayload - Datos de la alerta (lat, lon, type, deviceId, etc.)
   */
  async emitAlert(alertPayload) {
    if (USE_MOCK) {
      const newAlert = {
        id: `alt_${Date.now()}`,
        userId: 'usr_001',
        userName: 'Mathias Cárdenas',
        status: 'ACTIVE',
        severity: alertPayload.severity || 'CRITICAL',
        createdAt: new Date().toISOString(),
        contactsNotified: 3,
        policeNotified: true,
        ...alertPayload,
      };
      mockAlerts.unshift(newAlert);
      return { success: true, data: newAlert, message: 'Alerta SOS emitida y transmitida exitosamente' };
    }

    const response = await apiClient.post('/alerts', alertPayload);
    return response.data;
  },

  /**
   * Obtiene la lista de alertas activas en tiempo real para visualización en mapa y monitoreo.
   */
  async getActiveAlerts() {
    if (USE_MOCK) {
      const active = mockAlerts.filter(a => a.status === 'ACTIVE');
      return { success: true, data: active };
    }

    const response = await apiClient.get('/alerts/active');
    return response.data;
  },

  /**
   * Obtiene el detalle de una alerta específica por su ID.
   * @param {string|number} alertId - Identificador de la alerta
   */
  async getAlertById(alertId) {
    if (USE_MOCK) {
      const found = mockAlerts.find(a => a.id === alertId);
      if (!found) throw new Error('Alerta no encontrada');
      return { success: true, data: found };
    }

    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  },

  /**
   * Obtiene el historial de alertas emitidas por el usuario o su red.
   */
  async getAlertHistory(params = {}) {
    if (USE_MOCK) {
      return { success: true, data: mockAlerts };
    }

    const response = await apiClient.get('/alerts/history', { params });
    return response.data;
  },

  /**
   * Resuelve y finaliza una alerta activa indicando notas de asistencia.
   * @param {string|number} alertId - Identificador de la alerta
   * @param {string} resolutionNotes - Explicación de la resolución
   */
  async resolveAlert(alertId, resolutionNotes = '') {
    if (USE_MOCK) {
      const item = mockAlerts.find(a => a.id === alertId);
      if (item) {
        item.status = 'RESOLVED';
        item.resolvedAt = new Date().toISOString();
        item.resolutionNotes = resolutionNotes;
      }
      return { success: true, data: item, message: 'Alerta resuelta con éxito' };
    }

    const response = await apiClient.put(`/alerts/${alertId}/resolve`, { resolutionNotes });
    return response.data;
  },

  /**
   * Cancela una alerta activada por error o prueba antes de que se despache serenazgo.
   * @param {string|number} alertId - Identificador de la alerta
   * @param {string} reason - Motivo de la cancelación
   */
  async cancelAlert(alertId, reason = 'Falsa alarma / Activación accidental') {
    if (USE_MOCK) {
      const item = mockAlerts.find(a => a.id === alertId);
      if (item) {
        item.status = 'CANCELLED';
        item.cancelledAt = new Date().toISOString();
        item.cancellationReason = reason;
      }
      return { success: true, data: item, message: 'Alerta cancelada' };
    }

    const response = await apiClient.put(`/alerts/${alertId}/cancel`, { reason });
    return response.data;
  },
};

export default alertsService;
