<template>
  <router-view />
  <PrivacyConsentBanner />
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useAuthStore } from './stores/authStore';
import { loadFeatures } from './composables/useFeature';
import PrivacyConsentBanner from './components/PrivacyConsentBanner.vue';

const authStore = useAuthStore();

onMounted(() => {
  loadFeatures();
});

watch(
  () => authStore.token,
  () => {
    loadFeatures();
  }
);
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
  background-color: #F4F7FA;
  color: #333333;
}

#app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}
</style>
