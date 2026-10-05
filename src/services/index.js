/**
 * SafeSignal - Services Layer Barrel Export
 * Organización: DEJAMICE
 * Responsable: Persona 3 - Mathias Andree Cárdenas Huamán
 *
 * Exportación centralizada de todos los servicios HTTP del frontend.
 * Permite a las Personas 4 y 5 importar cualquier servicio de forma limpia:
 *   import { alertsService, authService, trackingService } from '@/services';
 */

export { default as apiClient, USE_MOCK } from './api';
export { alertsService } from './alerts.service';
export { trackingService } from './tracking.service';
export { authService } from './auth.service';
export { contactsService } from './contacts.service';
export { devicesService } from './devices.service';
export { notificationsService } from './notifications.service';
export { reportsService } from './reports.service';
export * from './mockData';
