/**
 * SafeSignal - Notifications Service
 * Organización: DEJAMICE
 *
 * Cliente HTTP para gestión de notificaciones y alertas ciudadanas personales.
 * Consume /api/v1/notifications en el Backend.
 */

import apiClient from './api';

export const notificationsService = {
  /**
   * Obtiene todas las notificaciones del usuario autenticado.
   */
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas.
   */
  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data?.unreadCount || 0;
  },

  /**
   * Marca una notificación como leída.
   */
  async markAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Marca todas las notificaciones como leídas.
   */
  async markAllAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Crea una notificación (ej. al activar una alerta o programar una ruta).
   */
  async createNotification(data) {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },

  /**
   * Elimina una notificación.
   */
  async deleteNotification(id) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationsService;
