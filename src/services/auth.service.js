/**
 * SafeSignal - Authentication & User Profile Service
 * Organización: DEJAMICE
 *
 * Módulo de cliente HTTP para inicio de sesión, registro y gestión de perfil de usuario.
 * Consume los endpoints en /api/v1/auth y /api/v1/users contra el Backend ASP.NET Core en Render.
 */

import apiClient from './api';

export const authService = {
  /**
   * Inicia sesión con credenciales de usuario (email y contraseña).
   * Valida estrictamente contra la API y persiste el token JWT real.
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email?.trim(),
      password: credentials.password
    });

    const token = response.data?.accessToken || response.data?.token;
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
   * Registra un nuevo ciudadano en la plataforma SafeSignal mediante el Backend.
   */
  async register(registrationData) {
    const payload = {
      fullName: registrationData.fullName?.trim(),
      email: registrationData.email?.trim().toLowerCase(),
      phoneNumber: registrationData.phoneNumber?.trim(),
      password: registrationData.password,
      profileType: registrationData.profileType || 'Standard'
    };

    const response = await apiClient.post('/auth/register', payload);
    const token = response.data?.accessToken || response.data?.token;
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
   * Obtiene el perfil del usuario autenticado actual desde /users/me.
   */
  async getProfile() {
    const response = await apiClient.get('/users/me');
    if (response.data) {
      localStorage.setItem('safesignal_user', JSON.stringify(response.data));
      localStorage.setItem('user_profile', JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Actualiza los datos personales y preferencias de seguridad del perfil.
   */
  async updateProfile(profileData) {
    const response = await apiClient.put('/users/me', profileData);
    if (response.data) {
      localStorage.setItem('safesignal_user', JSON.stringify(response.data));
      localStorage.setItem('user_profile', JSON.stringify(response.data));
    }
    return response.data;
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
