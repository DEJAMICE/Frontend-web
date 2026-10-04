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
      const user = {
        ...mockCurrentUser,
        email: credentials.email || mockCurrentUser.email,
        fullName: credentials.email?.includes('godoy') || credentials.email?.includes('u20251c350') ? 'Jesús Andres Godoy Santillan' : mockCurrentUser.fullName
      };
      localStorage.setItem('safesignal_token', mockToken);
      localStorage.setItem('jwt_token', mockToken);
      localStorage.setItem('safesignal_user', JSON.stringify(user));
      localStorage.setItem('user_profile', JSON.stringify(user));
      return { success: true, token: mockToken, accessToken: mockToken, user };
    }

    try {
      const response = await apiClient.post('/auth/login', credentials);
      const token = response.data?.token || response.data?.accessToken;
      const user = response.data?.user || {};
      if (token) {
        localStorage.setItem('safesignal_token', token);
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('safesignal_user', JSON.stringify(user));
        localStorage.setItem('user_profile', JSON.stringify(user));
      }
      return { ...response.data, token, user };
    } catch (err) {
      console.warn('[Auth Service]: Backend offline o credenciales mock, iniciando en modo demostración local:', err);
      const mockToken = 'mock_jwt_token_safesignal_2026';
      const user = {
        ...mockCurrentUser,
        email: credentials.email || mockCurrentUser.email
      };
      localStorage.setItem('safesignal_token', mockToken);
      localStorage.setItem('jwt_token', mockToken);
      localStorage.setItem('safesignal_user', JSON.stringify(user));
      localStorage.setItem('user_profile', JSON.stringify(user));
      return { success: true, token: mockToken, accessToken: mockToken, user };
    }
  },

  /**
   * Registra un nuevo ciudadano en la plataforma SafeSignal.
   */
  async register(registrationData) {
    if (USE_MOCK) {
      const mockToken = 'mock_jwt_token_safesignal_2026';
      const user = { ...mockCurrentUser, ...registrationData };
      localStorage.setItem('safesignal_token', mockToken);
      localStorage.setItem('jwt_token', mockToken);
      localStorage.setItem('safesignal_user', JSON.stringify(user));
      localStorage.setItem('user_profile', JSON.stringify(user));
      return { success: true, token: mockToken, accessToken: mockToken, user };
    }

    const response = await apiClient.post('/auth/register', registrationData);
    const token = response.data?.token || response.data?.accessToken;
    const user = response.data?.user || {};
    if (token) {
      localStorage.setItem('safesignal_token', token);
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('safesignal_user', JSON.stringify(user));
      localStorage.setItem('user_profile', JSON.stringify(user));
    }
    return { ...response.data, token, user };
  },

  /**
   * Obtiene el perfil del usuario autenticado actual.
   */
  async getProfile() {
    if (USE_MOCK) {
      return { success: true, data: mockCurrentUser };
    }

    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch {
      const fallback = await apiClient.get('/users/profile');
      return fallback.data;
    }
  },

  /**
   * Actualiza los datos personales y preferencias de seguridad del perfil.
   */
  async updateProfile(profileData) {
    if (USE_MOCK) {
      Object.assign(mockCurrentUser, profileData);
      localStorage.setItem('safesignal_user', JSON.stringify(mockCurrentUser));
      localStorage.setItem('user_profile', JSON.stringify(mockCurrentUser));
      return { success: true, data: mockCurrentUser, message: 'Perfil actualizado con éxito' };
    }

    try {
      const response = await apiClient.put('/users/me', profileData);
      return response.data;
    } catch {
      const fallback = await apiClient.put('/users/profile', profileData);
      return fallback.data;
    }
  },

  /**
   * Cierra la sesión activa y elimina las credenciales locales.
   */
  logout() {
    localStorage.removeItem('safesignal_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('safesignal_user');
    localStorage.removeItem('user_profile');
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
