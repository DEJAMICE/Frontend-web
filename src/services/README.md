# Capa de Servicios HTTP — SafeSignal Frontend Web

Este directorio contiene la arquitectura centralizada de comunicación HTTP cliente-servidor para la aplicación web SafeSignal (Vue 3 + PrimeVue).

**Responsable de Arquitectura:** Persona 3 (Mathias Andree Cárdenas Huamán)

---

## 📁 Estructura del Módulo

* `api.js`: Instancia principal de **Axios** con:
  * Inyección automática del token JWT (`Authorization: Bearer <token>`).
  * Interceptores para manejo unificado de errores (401, 403, 500, problemas de red).
  * URL base configurable mediante `VITE_API_BASE_URL`.
* `alerts.service.js`: Endpoints del módulo de **Alertas SOS y Emergencias** (`/api/v1/alerts`).
* `tracking.service.js`: Endpoints de **Seguimiento de Rutas y Telemetría** (`/api/v1/tracking`).
* `auth.service.js`: Endpoints de **Autenticación y Perfil** (`/api/v1/auth`, `/api/v1/users`).
* `contacts.service.js`: Endpoints CRUD de **Contactos de Confianza** (`/api/v1/contacts`).
* `devices.service.js`: Endpoints para emparejamiento de **Dispositivos IoT** (`/api/v1/devices`).
* `mockData.js`: Datos simulados realistas para desarrollo offline o pruebas unitarias del frontend.
* `index.js`: Barrel export para importaciones limpias en componentes Vue.

---

## 🚀 Guía de Uso en Componentes Vue 3

### 1. Disparar una Alerta SOS (Módulo Persona 5)
```vue
<script setup>
import { ref } from 'vue';
import { alertsService } from '@/services';

const isSubmitting = ref(false);

async function handleEmergencySOS() {
  try {
    isSubmitting.value = true;
    const alertData = {
      latitude: -12.0864,
      longitude: -77.0321,
      type: 'PANIC_BUTTON',
      severity: 'CRITICAL',
      deviceId: 'dev_iot_01'
    };
    
    const response = await alertsService.emitAlert(alertData);
    console.log('Alerta SOS transmitida:', response);
  } catch (err) {
    console.error('Error al emitir alerta:', err.message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
```

### 2. Iniciar Sesión (Módulo Persona 4)
```vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services';

const router = useRouter();
const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    const result = await authService.login({ email: email.value, password: password.value });
    if (result.token) {
      router.push('/dashboard');
    }
  } catch (err) {
    alert(err.message);
  }
}
</script>
```

---

## 🛠️ Modo Mock para Desarrollo Offline

Si el servidor backend aún no está encendido o se desea probar la interfaz de forma independiente, edita el archivo `.env`:

```env
VITE_USE_MOCK=true
```

Al activar `VITE_USE_MOCK=true`, todos los métodos devolverán respuestas simuladas instantáneas con datos de prueba realistas sin requerir una conexión de red activa.
