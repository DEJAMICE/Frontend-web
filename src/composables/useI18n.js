import { ref, computed } from 'vue';

const LOCALE_KEY = 'securanet_locale';
const locale = ref(localStorage.getItem(LOCALE_KEY) || 'es_419');

const messages = {
  es_419: {
    nav: {
      dashboard: 'Panel de Inicio',
      contacts: 'Red de Confianza',
      history: 'Historial de Alertas',
      devices: 'Dispositivos IoT',
      safeRoute: 'Ruta segura',
      routes: 'Mapa de Rutas',
      reports: 'Reportes',
      settings: 'Configuración',
    },
    topbar: {
      searchPlaceholder: 'Buscar contactos, rutas, alertas...',
      connected: 'Conectado ✓',
      logout: 'Cerrar Sesión',
      notifications: 'Notificaciones',
      markRead: 'Marcar leídas',
      noNotifications: 'No tienes notificaciones pendientes.',
      switchLangLabel: 'Cambiar idioma a inglés',
    },
  },
  en_US: {
    nav: {
      dashboard: 'Dashboard',
      contacts: 'Trust Network',
      history: 'Alert History',
      devices: 'IoT Devices',
      safeRoute: 'Safe Route',
      routes: 'Route Map',
      reports: 'Reports',
      settings: 'Settings',
    },
    topbar: {
      searchPlaceholder: 'Search contacts, routes, alerts...',
      connected: 'Connected ✓',
      logout: 'Log Out',
      notifications: 'Notifications',
      markRead: 'Mark all read',
      noNotifications: 'No pending notifications.',
      switchLangLabel: 'Switch language to Spanish',
    },
  },
};

export function toggleLocale() {
  locale.value = locale.value === 'es_419' ? 'en_US' : 'es_419';
  localStorage.setItem(LOCALE_KEY, locale.value);
}

export function setLocale(nextLocale) {
  if (messages[nextLocale]) {
    locale.value = nextLocale;
    localStorage.setItem(LOCALE_KEY, nextLocale);
  }
}

export function useI18n() {
  const t = computed(() => messages[locale.value] || messages.es_419);
  const shortCode = computed(() => (locale.value === 'en_US' ? 'EN' : 'ES'));
  return { locale, t, shortCode, toggleLocale, setLocale };
}
