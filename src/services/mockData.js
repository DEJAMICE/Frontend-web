/**
 * SafeSignal - Mock Data Fallback
 * Datos simulados para desarrollo y pruebas del frontend cuando el backend no está activo.
 */

export const mockCurrentUser = {
  id: 'usr_001',
  fullName: 'Mathias Andree Cárdenas Huamán',
  email: 'u202316353@upc.edu.pe',
  phone: '+51 987 654 321',
  role: 'CITIZEN',
  subscriptionPlan: 'PRO',
  defaultEmergencyZone: 'San Isidro / Magdalena',
  contactsCount: 3,
  devicesCount: 2,
};

export const mockAlerts = [
  {
    id: 'alt_901',
    userId: 'usr_001',
    userName: 'Mathias Cárdenas',
    latitude: -12.0864,
    longitude: -77.0321,
    locationAddress: 'Av. Salaverry cdra. 24, San Isidro',
    type: 'PANIC_BUTTON',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    deviceId: 'dev_iot_01',
    deviceName: 'Pulsera SOS SafeSignal BLE',
    batteryLevel: 88,
    contactsNotified: 3,
    policeNotified: true,
  },
  {
    id: 'alt_902',
    userId: 'usr_002',
    userName: 'Valeria Mendoza',
    latitude: -12.1215,
    longitude: -77.0298,
    locationAddress: 'Calle Las Begonias, San Isidro',
    type: 'SILENT_ALERT',
    status: 'ACTIVE',
    severity: 'HIGH',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    deviceId: 'dev_iot_02',
    deviceName: 'Llavero Físico SOS',
    batteryLevel: 94,
    contactsNotified: 2,
    policeNotified: true,
  },
  {
    id: 'alt_900',
    userId: 'usr_001',
    userName: 'Mathias Cárdenas',
    latitude: -12.0912,
    longitude: -77.0425,
    locationAddress: 'Av. Brasil con Av. Ejército, Magdalena',
    type: 'PANIC_BUTTON',
    status: 'RESOLVED',
    severity: 'MEDIUM',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 23.5 * 3600000).toISOString(),
    resolutionNotes: 'Asistencia de Serenazgo completada. Usuario fuera de peligro.',
  },
];

export const mockTrackingRoute = {
  routeId: 'rt_5501',
  userId: 'usr_001',
  originAddress: 'UPC Campus San Isidro',
  destinationAddress: 'Paradero Av. Salaverry',
  status: 'IN_PROGRESS',
  startedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  lastCoordinates: { latitude: -12.0864, longitude: -77.0321 },
  isDeviationDetected: false,
  points: [
    { latitude: -12.0890, longitude: -77.0350, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), speed: 4.5 },
    { latitude: -12.0875, longitude: -77.0335, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), speed: 4.8 },
    { latitude: -12.0864, longitude: -77.0321, timestamp: new Date(Date.now() - 1 * 60000).toISOString(), speed: 5.0 },
  ],
};

export const mockContacts = [
  { id: 'cnt_101', name: 'Mamá (Patricia)', phone: '+51 991 223 344', relationship: 'Madre', isPriority: true },
  { id: 'cnt_102', name: 'Carlos Ramos', phone: '+51 988 776 655', relationship: 'Amigo / Compañero UPC', isPriority: true },
  { id: 'cnt_103', name: 'Central Serenazgo San Isidro', phone: '(01) 319-0450', relationship: 'Autoridad Local', isPriority: false },
];

export const mockDevices = [
  { id: 'dev_iot_01', name: 'Pulsera SafeSignal BLE', type: 'SMART_BAND', macAddress: 'C4:4E:AC:12:34:56', status: 'CONNECTED', battery: 88, lastSync: 'Hace 2 min' },
  { id: 'dev_iot_02', name: 'Botón Pánico Llavero', type: 'PHYSICAL_BUTTON', macAddress: 'A8:12:FF:99:88:77', status: 'CONNECTED', battery: 94, lastSync: 'Hace 5 min' },
];
