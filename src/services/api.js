/**
 * SafeSignal - Central HTTP API Client (Axios)
 * Organización: DEJAMICE
 * Responsable: Persona 3 - Mathias Andree Cárdenas Huamán
 *
 * Configuración centralizada de Axios para la comunicación con el Backend en C# ASP.NET Core.
 * Incluye interceptores de autenticación (JWT Bearer Token), manejo unificado de errores y soporte
 * para modo Mock de desarrollo para facilitar el trabajo de las Personas 4 y 5.
 */

import axios from 'axios';

// Base URL configurable por variables de entorno de Vite (.env) o autodetección
const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? 'https://backend-api-21zu.onrender.com/api/v1'
  : 'http://localhost:5000/api/v1';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || defaultBaseUrl;
export const USE_MOCK = import.meta.env?.VITE_USE_MOCK === 'true';

// Instancia principal de Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor de Solicitud (Request):
 * Inyecta automáticamente el token JWT almacenado en localStorage si el usuario está autenticado.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safesignal_token') || sessionStorage.getItem('safesignal_token') || localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuesta (Response):
 * Manejo centralizado de códigos de estado HTTP y unificación de errores.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn('[API Auth]: Sesión expirada o token inválido. Redirigiendo a inicio de sesión.');
      localStorage.removeItem('safesignal_token');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('safesignal_user');
      localStorage.removeItem('user_profile');
      // Disparar evento para que Vue Router o Pinia manejen la redirección
      window.dispatchEvent(new CustomEvent('safesignal:unauthorized'));
    } else if (status === 403) {
      console.error('[API Auth]: Acceso denegado. Permisos insuficientes.');
    } else if (status === 500) {
      console.error('[API Server Error]: Error interno en el servidor backend.');
    } else if (error.code === 'ERR_NETWORK') {
      console.warn('[API Network]: No se pudo conectar con el servidor backend. Verifique que la API esté encendida.');
    }

    const normalizedError = {
      status,
      message: error.response?.data?.message || error.message || 'Error de conexión con el servicio SafeSignal',
      details: error.response?.data?.errors || null,
      raw: error,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
