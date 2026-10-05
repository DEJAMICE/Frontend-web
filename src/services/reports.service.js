/**
 * SafeSignal - Incident Reports Service
 * Organización: DEJAMICE
 *
 * Cliente HTTP para gestión de reportes comunitarios de incidentes urbanos.
 * Consume /api/v1/reports en el Backend.
 */

import apiClient from './api';

export const reportsService = {
  /**
   * Obtiene todos los reportes comunitarios registrados en la base de datos.
   */
  async getReports() {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  /**
   * Obtiene los reportes creados por el usuario autenticado actual.
   */
  async getMyReports() {
    const response = await apiClient.get('/reports/my');
    return response.data;
  },

  /**
   * Crea y persiste un nuevo reporte en la base de datos del backend.
   */
  async createReport(reportData) {
    const response = await apiClient.post('/reports', reportData);
    return response.data;
  },

  /**
   * Valida (confirma) un reporte comunitario por parte de un vecino.
   */
  async validateReport(id) {
    const response = await apiClient.post(`/reports/${id}/validate`);
    return response.data;
  },

  /**
   * Refuta (marca como dudoso) un reporte comunitario.
   */
  async refuteReport(id) {
    const response = await apiClient.post(`/reports/${id}/refute`);
    return response.data;
  },

  /**
   * Elimina un reporte comunitario propio.
   */
  async deleteReport(id) {
    const response = await apiClient.delete(`/reports/${id}`);
    return response.data;
  }
};

export default reportsService;
