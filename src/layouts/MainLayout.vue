<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const navItems = [
  {
    id: 'dashboard',
    label: 'Panel Principal',
    icon: 'pi pi-th-large',
    path: '/app/dashboard'
  },
  {
    id: 'rutas',
    label: 'Mapa & Rutas Seguras',
    icon: 'pi pi-map',
    path: '/app/rutas'
  },
  {
    id: 'sos',
    label: 'Botón de Pánico SOS',
    icon: 'pi pi-bell',
    path: '/app/sos'
  },
  {
    id: 'historial',
    label: 'Historial de Incidentes',
    icon: 'pi pi-history',
    path: '/app/historial'
  },
  {
    id: 'contactos',
    label: 'Red de Confianza',
    icon: 'pi pi-users',
    path: '/app/contactos'
  },
  {
    id: 'dispositivos',
    label: 'Dispositivos IoT',
    icon: 'pi pi-compass',
    path: '/app/dispositivos'
  },
  {
    id: 'perfil',
    label: 'Mi Perfil & Ajustes',
    icon: 'pi pi-cog',
    path: '/app/perfil'
  }
];

const currentTitle = computed(() => {
  const current = navItems.find(item => route.path.startsWith(item.path));
  return current ? current.label : 'Plataforma de Seguridad';
});

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <div class="prototype-layout">
    <!-- Sidebar Deep Teal (#0E444E) idéntico a Fuentes/Prototype Code.txt -->
    <aside class="prototype-sidebar">
      <!-- Logo Header -->
      <div class="sidebar-header" @click="router.push('/app/dashboard')">
        <div class="brand-icon-box">
          <i class="pi pi-shield"></i>
        </div>
        <div class="brand-text">
          <span class="brand-title">SecuraNet</span>
          <span class="brand-subtitle">Smart Safety</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section-title">MENÚ PRINCIPAL</div>
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id">
            <button
              class="nav-button"
              :class="{ active: isActive(item.path) }"
              @click="router.push(item.path)"
            >
              <i :class="[item.icon, 'nav-icon']"></i>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="item.id === 'sos'" class="sos-indicator-dot"></span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- User Card Footer -->
      <div class="sidebar-footer">
        <div class="user-pill" @click="router.push('/app/perfil')">
          <div class="user-avatar">
            {{ (authStore.user?.fullName || 'U')[0] }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.fullName || 'Mathias Cárdenas' }}</span>
            <span class="user-role">{{ authStore.user?.subscriptionPlan || 'Plan Premium' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- TopBar minimalista de la maqueta -->
      <header class="prototype-topbar">
        <div class="topbar-left">
          <span class="breadcrumb-app">SecuraNet Web</span>
          <i class="pi pi-angle-right breadcrumb-separator"></i>
          <h2 class="breadcrumb-current">{{ currentTitle }}</h2>
        </div>

        <div class="topbar-right">
          <div class="status-badge-active">
            <span class="status-ping"></span>
            <span>Red Segura Activa</span>
          </div>

          <a
            href="https://dejamice.github.io/Landing-Page/"
            target="_blank"
            class="topbar-action-link"
            title="Ver Landing Page pública"
          >
            <i class="pi pi-external-link mr-1"></i>
            Landing Page
          </a>
        </div>
      </header>

      <!-- View Content -->
      <main class="content-viewport">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.prototype-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg, #F4F8F8);
}

/* Sidebar Deep Teal */
.prototype-sidebar {
  width: 250px;
  flex-shrink: 0;
  background-color: var(--brand, #0E444E);
  border-right: 1px solid var(--brand, #0E444E);
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--on-brand, #FFFFFF);
  user-select: none;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid var(--brand-border, rgba(255,255,255,0.14));
  cursor: pointer;
  transition: background-color 0.15s;
}

.sidebar-header:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.brand-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.10);
  border: 1.5px solid var(--brand-border, rgba(255,255,255,0.14));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent, #00A896);
  font-size: 1.1rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.brand-subtitle {
  font-size: 0.68rem;
  color: var(--on-brand-sub, rgba(255,255,255,0.74));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--on-brand-faint, rgba(255,255,255,0.52));
  padding: 8px 12px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--on-brand-sub, rgba(255,255,255,0.74));
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
}

.nav-button.active {
  background-color: var(--brand-hover, #155A66);
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: inset 3px 0 0 0 var(--accent, #00A896);
}

.nav-icon {
  font-size: 1.05rem;
  opacity: 0.9;
}

.nav-button.active .nav-icon {
  color: var(--accent, #00A896);
  opacity: 1;
}

.nav-label {
  flex: 1;
}

.sos-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--danger, #D32F2F);
  box-shadow: 0 0 6px rgba(211, 47, 47, 0.8);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid var(--brand-border, rgba(255,255,255,0.14));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.12);
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.15s;
}

.user-pill:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent, #00A896);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.70rem;
  color: var(--on-brand-sub, rgba(255,255,255,0.74));
}

.logout-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--brand-border, rgba(255,255,255,0.14));
  color: var(--on-brand-sub, rgba(255,255,255,0.74));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.logout-btn:hover {
  background-color: rgba(211, 47, 47, 0.2);
  border-color: var(--danger, #D32F2F);
  color: #ff8a80;
}

/* Main Area */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
}

.prototype-topbar {
  height: 60px;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--border, #D7E4E6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-app {
  font-size: 0.85rem;
  color: var(--muted, #7A8A8C);
  font-weight: 500;
}

.breadcrumb-separator {
  font-size: 0.75rem;
  color: var(--faint, #A3B2B4);
}

.breadcrumb-current {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink, #1B2B2E);
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge-active {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--accent-soft, #E1F4F1);
  color: var(--accent-ink, #00695C);
  border: 1px solid var(--accent-border, #9FD9D0);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-ping {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--accent, #00A896);
}

.topbar-action-link {
  font-size: 0.82rem;
  color: var(--sub, #5A6B6E);
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, #D7E4E6);
  background-color: #FFFFFF;
  transition: all 0.15s;
}

.topbar-action-link:hover {
  background-color: var(--panel, #EAF4F4);
  color: var(--accent-ink, #00695C);
  border-color: var(--accent-border, #9FD9D0);
  text-decoration: none;
}

.content-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background-color: var(--bg, #F4F8F8);
}
</style>
