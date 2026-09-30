/**
 * SafeSignal - IoT Devices Service
 * Organización: DEJAMICE
 *
 * Módulo de cliente HTTP para emparejamiento y monitoreo de dispositivos IoT (pulseras BLE, botones SOS físicos).
 * Consume los endpoints en /api/v1/devices.
 */

import apiClient, { USE_MOCK } from './api';
import { mockDevices } from './mockData';

export const devicesService = {
  /**
   * Obtiene todos los dispositivos IoT vinculados al usuario.
   */
  async getDevices() {
    if (USE_MOCK) {
      return { success: true, data: mockDevices };
    }

    const response = await apiClient.get('/devices');
    return response.data;
  },

  /**
   * Vincula un nuevo dispositivo físico (botón de pánico o pulsera inteligente).
   */
  async pairDevice(devicePayload) {
    if (USE_MOCK) {
      const newDev = {
        id: `dev_${Date.now()}`,
        status: 'CONNECTED',
        battery: 100,
        lastSync: 'Ahora',
        ...devicePayload,
      };
      mockDevices.push(newDev);
      return { success: true, data: newDev, message: 'Dispositivo IoT vinculado exitosamente' };
    }

    const response = await apiClient.post('/devices', devicePayload);
    return response.data;
  },

  /**
   * Actualiza el estado o telemetría de batería del dispositivo IoT.
   */
  async updateDeviceStatus(deviceId, statusData) {
    if (USE_MOCK) {
      const dev = mockDevices.find(d => d.id === deviceId);
      if (dev) Object.assign(dev, statusData);
      return { success: true, data: dev };
    }

    const response = await apiClient.patch(`/devices/${deviceId}/status`, statusData);
    return response.data;
  },

  /**
   * Desvincula un dispositivo IoT de la cuenta del usuario.
   */
  async unpairDevice(deviceId) {
    if (USE_MOCK) {
      const idx = mockDevices.findIndex(d => d.id === deviceId);
      if (idx !== -1) mockDevices.splice(idx, 1);
      return { success: true, message: 'Dispositivo desvinculado' };
    }

    const response = await apiClient.delete(`/devices/${deviceId}`);
    return response.data;
  },
};

export default devicesService;
