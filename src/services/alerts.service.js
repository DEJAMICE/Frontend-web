/**
 * SafeSignal - Alerts & SOS Service
 * Organización: DEJAMICE
 * Responsable: Persona 3 - Mathias Andree Cárdenas Huamán
 *
 * Módulo de cliente HTTP para la gestión de Alertas SOS, Alertas Silenciosas y Protocolos de Emergencia.
 * Consume los endpoints correspondientes en /api/v1/alerts contra el Backend ASP.NET Core en Render.
 */

import apiClient, { USE_MOCK } from './api';
import { mockAlerts } from './mockData';

// Mapeos para serialización segura compatible con C# System.Text.Json Enum converters
const ALERT_TYPE_MAP = {
  'WEB_PANIC_BUTTON': 'PanicButton',
  'PANIC_BUTTON': 'PanicButton',
  'PanicButton': 'PanicButton',
  'SILENT_ALERT': 'SilentAlert',
  'SilentAlert': 'SilentAlert',
  'MEDICAL_EMERGENCY': 'MedicalEmergency',
  'MedicalEmergency': 'MedicalEmergency',
  'HARASSMENT': 'Harassment',
  'Harassment': 'Harassment',
  'ROUTE_DEVIATION': 'RouteDeviation',
  'RouteDeviation': 'RouteDeviation'
};

const ALERT_SEVERITY_MAP = {
  'CRITICAL': 'Critical',
  'Critical': 'Critical',
  'HIGH': 'High',
  'High': 'High',
  'MEDIUM': 'Medium',
  'Medium': 'Medium',
  'LOW': 'Low',
  'Low': 'Low'
};

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
        userName: 'Usuario Demo SafeSignal',
        status: 'Active',
        severity: alertPayload.severity || 'Critical',
        createdAt: new Date().toISOString(),
        contactsNotifiedCount: 3,
        policeNotified: true,
        ...alertPayload,
      };
      mockAlerts.unshift(newAlert);
      return { success: true, data: newAlert, ...newAlert };
    }

    const payload = {
      latitude: alertPayload.latitude ?? -12.0864,
      longitude: alertPayload.longitude ?? -77.0321,
      locationAddress: alertPayload.locationAddress || 'Av. Salaverry / Campus San Isidro',
      type: ALERT_TYPE_MAP[alertPayload.type] || 'PanicButton',
      severity: ALERT_SEVERITY_MAP[alertPayload.severity] || 'Critical',
      deviceId: alertPayload.deviceId || null,
      deviceName: alertPayload.deviceName || 'Botón de Pánico Web',
      batteryLevel: alertPayload.batteryLevel ?? 100,
      notes: alertPayload.notes || 'Activación manual de botón de pánico desde aplicación web'
    };

    const response = await apiClient.post('/alerts', payload);
    const alertData = response.data;
    return { success: true, data: alertData, ...alertData };
  },

  /**
   * Obtiene la lista de alertas activas en tiempo real para visualización en mapa y monitoreo.
   */
  async getActiveAlerts() {
    if (USE_MOCK) {
      const active = mockAlerts.filter(a => (a.status || '').toUpperCase() === 'ACTIVE');
      return { success: true, data: active };
    }

    const response = await apiClient.get('/alerts/active');
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { success: true, data: list };
  },

  /**
   * Obtiene el detalle de una alerta específica por su ID.
   * @param {string} alertId - GUID de la alerta
   */
  async getAlertById(alertId) {
    if (USE_MOCK) {
      const found = mockAlerts.find(a => a.id === alertId);
      if (!found) throw new Error('Alerta no encontrada');
      return { success: true, data: found, ...found };
    }

    const response = await apiClient.get(`/alerts/${alertId}`);
    const alertData = response.data;
    return { success: true, data: alertData, ...alertData };
  },

  /**
   * Obtiene el historial de alertas emitidas por el usuario o su red.
   */
  async getAlertHistory(params = {}) {
    if (USE_MOCK) {
      return { success: true, data: mockAlerts };
    }

    const response = await apiClient.get('/alerts/history', { params });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { success: true, data: list };
  },

  /**
   * Resuelve y finaliza una alerta activa indicando notas de asistencia.
   * @param {string} alertId - GUID de la alerta
   * @param {string} resolutionNotes - Explicación de la resolución
   */
  async resolveAlert(alertId, resolutionNotes = 'Auxilio completado satisfactoriamente.') {
    if (USE_MOCK) {
      const item = mockAlerts.find(a => a.id === alertId);
      if (item) {
        item.status = 'Resolved';
        item.resolvedAt = new Date().toISOString();
        item.resolutionNotes = resolutionNotes;
      }
      return { success: true, data: item, ...item };
    }

    const response = await apiClient.put(`/alerts/${alertId}/resolve`, {
      resolutionNotes: resolutionNotes || 'Auxilio completado satisfactoriamente.'
    });
    const resolvedData = response.data;
    return { success: true, data: resolvedData, ...resolvedData };
  },

  /**
   * Cancela una alerta activada por error o prueba antes de que se despache serenazgo.
   * @param {string} alertId - GUID de la alerta
   * @param {string} reason - Motivo de la cancelación
   */
  async cancelAlert(alertId, reason = 'Falsa alarma / Activación accidental') {
    if (USE_MOCK) {
      const item = mockAlerts.find(a => a.id === alertId);
      if (item) {
        item.status = 'Cancelled';
        item.cancelledAt = new Date().toISOString();
        item.cancellationReason = reason;
      }
      return { success: true, data: item, ...item };
    }

    const response = await apiClient.put(`/alerts/${alertId}/cancel`, {
      reason: reason || 'Falsa alarma / Activación accidental'
    });
    const cancelledData = response.data;
    return { success: true, data: cancelledData, ...cancelledData };
  },
};

export default alertsService;
