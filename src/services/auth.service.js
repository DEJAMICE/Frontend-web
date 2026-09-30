/**
 * SafeSignal - Authentication & User Profile Service
 * Organización: DEJAMICE
 * Responsable: Integración HTTP para Persona 4
 *
 * Módulo de cliente HTTP para inicio de sesión, registro y gestión de perfil de usuario.
 * Consume los endpoints en /api/v1/auth y /api/v1/users.
 */

import apiClient, { USE_MOCK } from './api';
import { mockCurrentUser } from './mockData';

export const authService = {
  /**
   * Inicia sesión con credenciales de usuario (email y contraseña).
   * Almacena el token JWT retornado en localStorage.
   */
  async login(credentials) {
    if (USE_MOCK) {
      const mockToken = 'mock_jwt_token_safesignal_2026';
      localStorage.setItem('safesignal_token', mockToken);
      localStorage.setItem('safesignal_user', JSON.stringify(mockCurrentUser));
      return { success: true, token: mockToken, user: mockCurrentUser };
    }

    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('safesignal_token', response.data.token);
      localStorage.setItem('safesignal_user', JSON.stringify(response.data.user || {}));
    }
    return response.data;
  },

  /**
   * Registra un nuevo ciudadano en la plataforma SafeSignal.
   */
  async register(registrationData) {
    if (USE_MOCK) {
      const mockToken = 'mock_jwt_token_safesignal_2026';
      localStorage.setItem('safesignal_token', mockToken);
      return { success: true, token: mockToken, user: { ...mockCurrentUser, ...registrationData } };
    }

    const response = await apiClient.post('/auth/register', registrationData);
    if (response.data?.token) {
      localStorage.setItem('safesignal_token', response.data.token);
      localStorage.setItem('safesignal_user', JSON.stringify(response.data.user || {}));
    }
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario autenticado actual.
   */
  async getProfile() {
    if (USE_MOCK) {
      return { success: true, data: mockCurrentUser };
    }

    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  /**
   * Actualiza los datos personales y preferencias de seguridad del perfil.
   */
  async updateProfile(profileData) {
    if (USE_MOCK) {
      Object.assign(mockCurrentUser, profileData);
      localStorage.setItem('safesignal_user', JSON.stringify(mockCurrentUser));
      return { success: true, data: mockCurrentUser, message: 'Perfil actualizado con éxito' };
    }

    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  /**
   * Cierra la sesión activa y elimina las credenciales locales.
   */
  logout() {
    localStorage.removeItem('safesignal_token');
    localStorage.removeItem('safesignal_user');
    sessionStorage.removeItem('safesignal_token');
  },

  /**
   * Verifica si existe una sesión activa localmente.
   */
  isAuthenticated() {
    return !!localStorage.getItem('safesignal_token');
  },
};

export default authService;
