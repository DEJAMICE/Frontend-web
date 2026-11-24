import { ref, computed } from 'vue';
import apiClient from '../services/api';

const CLIENT_ID_KEY = 'securanet_client_id';
const flags = ref({});
const isLoaded = ref(false);

/**
 * Devuelve un identificador de visitante estable para asignación A/B pre-login (EXP-05).
 */
export function getOrCreateClientId() {
  let cid = localStorage.getItem(CLIENT_ID_KEY);
  if (!cid) {
    cid = 'web_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, cid);
  }
  return cid;
}

/**
 * Carga los feature flags evaluados desde GET /api/v1/features (TS01).
 */
export async function loadFeatures() {
  try {
    const clientId = getOrCreateClientId();
    const { data } = await apiClient.get('/features', {
      headers: { 'X-Client-Id': clientId },
    });
    if (data && typeof data === 'object') {
      flags.value = data;
    }
  } catch (err) {
    console.warn('[FeatureFlags] Usando valores por defecto (control):', err?.message || err);
  } finally {
    isLoaded.value = true;
  }
  return flags.value;
}

/**
 * Retorna una referencia reactiva booleana para el flag indicado.
 */
export function useFeature(name) {
  return computed(() => flags.value[name] === true);
}

export { flags, isLoaded };
