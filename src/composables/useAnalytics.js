import { ref } from 'vue';
import apiClient from '../services/api';
import { flags, getOrCreateClientId } from './useFeature';

const CONSENT_KEY = 'securanet_analytics_consent';

const EXPERIMENTS = {
  'EXP-01': 'exp01_configurable_countdown',
  'EXP-02': 'exp02_safe_route_nav',
  'EXP-03': 'exp03_trust_onboarding',
  'EXP-04': 'exp04_risk_zone_nudge',
  'EXP-05': 'exp05_staged_signup',
};

const consentStatus = ref(localStorage.getItem(CONSENT_KEY) || 'pending'); // 'pending' | 'granted' | 'denied'
const exposedExperiments = new Set();

export function hasAnalyticsConsent() {
  return consentStatus.value === 'granted';
}

export function getExperimentVariant(experimentId) {
  const flagName = EXPERIMENTS[experimentId];
  if (!flagName) return undefined;
  return flags.value[flagName] === true ? 'B' : 'A';
}

/**
 * Actualiza el consentimiento de analítica (US26) en localStorage, GA4 y backend.
 */
export async function setAnalyticsConsent(granted, isAuthenticated = false) {
  const state = granted ? 'granted' : 'denied';
  consentStatus.value = state;
  localStorage.setItem(CONSENT_KEY, state);

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }

  if (isAuthenticated) {
    try {
      await apiClient.patch('/users/me/preferences', {
        analyticsConsentGranted: granted,
      });
    } catch (err) {
      console.warn('[PrivacyConsent] No se pudo sincronizar preferencia en el servidor:', err?.message || err);
    }
  }
}

/**
 * Registra un evento de analítica solo si el usuario aceptó participar (TS03 / US26).
 */
export function track(name, params = {}, experimentId = undefined) {
  if (!hasAnalyticsConsent()) return;

  const variant = experimentId ? getExperimentVariant(experimentId) : undefined;
  const payloadParams = {
    ...params,
    ...(experimentId && { experiment_id: experimentId, variant }),
    platform: 'web',
    app_version: '1.0.0',
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payloadParams);
  }

  apiClient
    .post(
      '/experiments/events',
      {
        name,
        experimentId: experimentId || null,
        variant: variant || null,
        platform: 'web',
        appVersion: '1.0.0',
        clientId: getOrCreateClientId(),
        params,
      },
      { headers: { 'X-Client-Id': getOrCreateClientId() } }
    )
    .catch(() => {
      // Silencioso para no degradar la experiencia del usuario
    });
}

/**
 * Registra una exposición única por sesión/experimento (tracking plan 8.2.8).
 */
export function trackExposure(experimentId) {
  if (!hasAnalyticsConsent() || exposedExperiments.has(experimentId)) return;
  exposedExperiments.add(experimentId);
  track('exp_exposure', {}, experimentId);
}

export { consentStatus };
