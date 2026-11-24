<template>
  <div v-if="consentStatus === 'pending'" class="consent-banner" role="region" aria-label="Consentimiento de analítica">
    <div class="consent-text">
      <strong>Privacidad y mejora continua (Ley N.º 29733):</strong>
      ¿Autorizas el registro anónimo de uso para evaluar mejoras de SafeSignal? No guardamos ubicación exacta ni datos personales.
    </div>
    <div class="consent-actions">
      <button type="button" class="consent-btn consent-btn--ghost" @click="decide(false)">
        No, gracias
      </button>
      <button type="button" class="consent-btn consent-btn--primary" @click="decide(true)">
        Participar en mejoras
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';
import { consentStatus, setAnalyticsConsent } from '../composables/useAnalytics';

const authStore = useAuthStore();

async function decide(granted) {
  await setAnalyticsConsent(granted, authStore.isAuthenticated);
}
</script>

<style scoped>
.consent-banner {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  max-width: 700px;
  margin: 0 auto;
  z-index: 2000;
  background-color: #0E444E;
  color: #FFFFFF;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(14, 68, 78, 0.28);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.84rem;
}

.consent-text {
  flex: 1;
  min-width: 240px;
  line-height: 1.45;
}

.consent-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.consent-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.consent-btn--ghost {
  background: transparent;
  color: #E2E8F0;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.consent-btn--primary {
  background-color: #00A896;
  color: #FFFFFF;
  border: none;
}

.consent-btn:hover {
  opacity: 0.9;
}
</style>
