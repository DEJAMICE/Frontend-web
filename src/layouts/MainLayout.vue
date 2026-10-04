<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Menu from 'primevue/menu';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const menuItems = ref([
  {
    label: 'Inicio / Mapa',
    icon: 'pi pi-map',
    command: () => router.push('/app/dashboard')
  },
  {
    label: 'Red de Confianza',
    icon: 'pi pi-users',
  },
  {
    label: 'Dispositivos IoT',
    icon: 'pi pi-compass',
  },
  {
    separator: true
  },
  {
    label: 'Mi Perfil',
    icon: 'pi pi-user',
    command: () => router.push('/app/perfil')
  }
]);
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F4F7FA;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
  background-color: #1A2B4C;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  padding: 1rem 0;
}

.layout-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
<template>
  <div class="layout-wrapper">
    <header class="topbar">
      <div class="logo">
        <i class="pi pi-shield"></i>
        <span>SecuraNet</span>
      </div>
      <div class="user-menu">
        <span class="welcome-text">Hola, {{ authStore.user?.fullName }}</span>
        <Button icon="pi pi-sign-out" class="p-button-rounded p-button-text p-button-danger" @click="handleLogout" aria-label="Cerrar sesión" />
      </div>
    </header>

    <div class="layout-container">
      <aside class="sidebar">
        <Menu :model="menuItems" class="w-full" />
      </aside>

      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
