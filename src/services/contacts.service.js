/**
 * SafeSignal - Emergency Contacts Service
 * Organización: DEJAMICE
 *
 * Módulo de cliente HTTP para la gestión de la red de contactos de auxilio.
 * Consume los endpoints en /api/v1/contacts.
 */

import apiClient, { USE_MOCK } from './api';
import { mockContacts } from './mockData';

export const contactsService = {
  /**
   * Obtiene la lista de contactos de emergencia configurados por el usuario.
   */
  async getContacts() {
    if (USE_MOCK) {
      return { success: true, data: mockContacts };
    }

    const response = await apiClient.get('/contacts');
    return response.data;
  },

  /**
   * Agrega un nuevo contacto de confianza a la red de apoyo.
   * @param {Object} contactPayload - name, phone, relationship, isPriority
   */
  async addContact(contactPayload) {
    if (USE_MOCK) {
      const newContact = {
        id: `cnt_${Date.now()}`,
        ...contactPayload,
      };
      mockContacts.push(newContact);
      return { success: true, data: newContact, message: 'Contacto agregado con éxito' };
    }

    const response = await apiClient.post('/contacts', contactPayload);
    return response.data;
  },

  /**
   * Actualiza los datos de un contacto existente.
   */
  async updateContact(contactId, contactPayload) {
    if (USE_MOCK) {
      const index = mockContacts.findIndex(c => c.id === contactId);
      if (index !== -1) {
        mockContacts[index] = { ...mockContacts[index], ...contactPayload };
        return { success: true, data: mockContacts[index], message: 'Contacto actualizado' };
      }
    }

    const response = await apiClient.put(`/contacts/${contactId}`, contactPayload);
    return response.data;
  },

  /**
   * Elimina un contacto de la red de auxilio.
   */
  async deleteContact(contactId) {
    if (USE_MOCK) {
      const idx = mockContacts.findIndex(c => c.id === contactId);
      if (idx !== -1) mockContacts.splice(idx, 1);
      return { success: true, message: 'Contacto eliminado' };
    }

    const response = await apiClient.delete(`/contacts/${contactId}`);
    return response.data;
  },
};

export default contactsService;
