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
    label: 'Panel Principal',
    icon: 'pi pi-th-large',
    command: () => router.push('/app/dashboard')
  },
  {
    label: 'Mapa & Rutas Seguras',
    icon: 'pi pi-map',
    command: () => router.push('/app/rutas')
  },
  {
    label: 'Botón de Pánico SOS',
    icon: 'pi pi-bell',
    command: () => router.push('/app/sos')
  },
  {
    label: 'Historial de Alertas',
    icon: 'pi pi-history',
    command: () => router.push('/app/historial')
  },
  {
    label: 'Red de Confianza',
    icon: 'pi pi-users',
    command: () => router.push('/app/contactos')
  },
  {
    label: 'Dispositivos IoT',
    icon: 'pi pi-compass',
    command: () => router.push('/app/dispositivos')
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

<template>
  <div class="layout-wrapper">
    <header class="topbar">
      <div class="logo cursor-pointer" @click="router.push('/app/dashboard')">
        <i class="pi pi-shield text-xl text-yellow-400"></i>
        <span>SecuraNet</span>
      </div>
      <div class="user-menu">
        <span class="welcome-text text-sm">
          <i class="pi pi-user mr-1 text-xs"></i>
          {{ authStore.user?.fullName || 'Jesús Godoy' }}
        </span>
        <Button
          icon="pi pi-sign-out"
          class="p-button-rounded p-button-text p-button-danger p-button-sm"
          @click="handleLogout"
          aria-label="Cerrar sesión"
        />
      </div>
    </header>

    <div class="layout-container">
      <aside class="sidebar shadow-1">
        <Menu :model="menuItems" class="w-full border-none" />
      </aside>

      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F8FAFC;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 56px;
  background-color: #1A2B4C;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
}

.logo {
  font-size: 1.35rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.5px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.layout-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
