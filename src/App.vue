<template>
  <router-view />
</template>

<script setup>
// SafeSignal Root Component
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
