<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { notificationsService } from '../services';

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
    label: 'Dashboard',
    icon: 'pi pi-th-large',
    path: '/app/dashboard'
  },
  {
    id: 'contactos',
    label: 'Red de Confianza',
    icon: 'pi pi-users',
    path: '/app/contactos'
  },
  {
    id: 'historial',
    label: 'Historial de Alertas',
    icon: 'pi pi-history',
    path: '/app/historial'
  },
  {
    id: 'dispositivos',
    label: 'Dispositivos IoT',
    icon: 'pi pi-microchip',
    path: '/app/dispositivos'
  },
  {
    id: 'rutas',
    label: 'Mapa de Rutas',
    icon: 'pi pi-map',
    path: '/app/rutas'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'pi pi-file-edit',
    path: '/app/reportes'
  },
  {
    id: 'configuracion',
    label: 'Configuración',
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

// Notificaciones reales conectadas al Backend
const isNotifOpen = ref(false);
const notificationsList = ref([]);
const unreadCount = ref(0);
const isLoadingNotifs = ref(false);

async function loadNotifications() {
  try {
    isLoadingNotifs.value = true;
    const [list, count] = await Promise.all([
      notificationsService.getNotifications(),
      notificationsService.getUnreadCount()
    ]);
    notificationsList.value = Array.isArray(list) ? list : [];
    unreadCount.value = typeof count === 'number' ? count : (list.filter(n => !n.isRead).length);
  } catch (err) {
    console.warn('Error cargando notificaciones del backend:', err);
  } finally {
    isLoadingNotifs.value = false;
  }
}

function toggleNotifications() {
  isNotifOpen.value = !isNotifOpen.value;
  if (isNotifOpen.value) {
    loadNotifications();
  }
}

async function handleMarkAsRead(notif) {
  if (notif.isRead) return;
  try {
    await notificationsService.markAsRead(notif.id);
    notif.isRead = true;
    if (unreadCount.value > 0) unreadCount.value--;
  } catch (err) {
    console.error('Error al marcar notificación:', err);
  }
}

async function handleMarkAllAsRead() {
  try {
    await notificationsService.markAllAsRead();
    notificationsList.value.forEach(n => n.isRead = true);
    unreadCount.value = 0;
  } catch (err) {
    console.error('Error al marcar todas las notificaciones:', err);
  }
}

function getUserInitials(name) {
  if (!name) return 'SS';
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatNotifTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now - d) / 60000);
  if (diffMinutes < 1) return 'Hace un momento';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return d.toLocaleDateString();
}

onMounted(() => {
  // Sincronizar perfil real del usuario autenticado desde /users/me
  authStore.fetchUserProfile();
  loadNotifications();
});
</script>

<template>
  <div class="prototype-layout">
    <!-- Sidebar Deep Teal (#0E444E) idéntico a las maquetas -->
    <aside class="prototype-sidebar">
      <!-- Logo Header -->
      <div class="sidebar-header" @click="router.push('/app/dashboard')">
        <div class="brand-icon-box">
          <i class="pi pi-shield"></i>
        </div>
        <div class="brand-text">
          <span class="brand-title">SecuraNet</span>
        </div>
      </div>

      <!-- Navigation Menu matching Mockups -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id">
            <button
              class="nav-button"
              :class="{ active: isActive(item.path) }"
              @click="router.push(item.path)"
            >
              <i :class="[item.icon, 'nav-icon']"></i>
              <span class="nav-label">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer matching Cerrar Sesión en Mockups -->
      <div class="sidebar-footer">
        <button class="logout-full-btn" @click="handleLogout">
          <i class="pi pi-sign-out mr-2"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- TopBar matching Dashboard.png and all mockups -->
      <header class="prototype-topbar">
        <!-- Search bar matching mockup -->
        <div class="topbar-search-box">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            placeholder="Buscar contactos, rutas, alertas..."
            class="topbar-search-input"
          />
        </div>

        <div class="topbar-right">
          <!-- Conectado Pill matching mockup -->
          <div class="status-connected-pill">
            <i class="pi pi-bolt mr-1"></i>
            <span>Conectado ✓</span>
          </div>

          <!-- Notification Bell con contador y popover interactivo -->
          <div class="notification-wrapper">
            <button
              class="notification-bell-btn"
              :class="{ 'has-unread': unreadCount > 0 }"
              @click="toggleNotifications"
              title="Ver notificaciones"
            >
              <i class="pi pi-bell"></i>
              <span v-if="unreadCount > 0" class="notification-badge-count">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              <span v-else class="notification-badge-dot"></span>
            </button>

            <!-- Dropdown de Notificaciones conectadas al Backend -->
            <div v-if="isNotifOpen" class="notifications-dropdown-menu">
              <div class="notif-header">
                <div class="notif-title">
                  <i class="pi pi-bell mr-1"></i> Notificaciones
                </div>
                <button
                  v-if="unreadCount > 0"
                  class="btn-mark-all-read"
                  @click="handleMarkAllAsRead"
                >
                  Marcar leídas
                </button>
              </div>

              <div v-if="isLoadingNotifs" class="notif-loading">
                <i class="pi pi-spin pi-spinner mr-2"></i> Cargando...
              </div>

              <div v-else-if="notificationsList.length === 0" class="notif-empty">
                <i class="pi pi-check-circle notif-empty-icon mb-1"></i>
                <p class="m-0 text-sm">No tienes notificaciones pendientes.</p>
              </div>

              <div v-else class="notif-items-list">
                <div
                  v-for="notif in notificationsList"
                  :key="notif.id"
                  class="notif-item"
                  :class="{ 'unread': !notif.isRead }"
                  @click="handleMarkAsRead(notif)"
                >
                  <div class="notif-icon-col">
                    <span class="notif-type-dot" :class="'type-' + notif.type?.toLowerCase()"></span>
                  </div>
                  <div class="notif-content-col">
                    <div class="notif-item-title">{{ notif.title }}</div>
                    <div class="notif-item-msg">{{ notif.message }}</div>
                    <div class="notif-item-time">{{ formatNotifTime(notif.createdAt) }}</div>
                  </div>
                  <div v-if="!notif.isRead" class="unread-glow-dot"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Info matching mockup con datos reales del Backend -->
          <div class="user-profile-widget" @click="router.push('/app/perfil')" title="Ver mi perfil">
            <div class="user-avatar-initials">
              {{ getUserInitials(authStore.user?.fullName) }}
            </div>
            <div class="user-names-col">
              <span class="widget-name font-bold">{{ authStore.user?.fullName || 'Usuario Protegido' }}</span>
              <span class="widget-role text-xs text-slate-400">
                {{ authStore.user?.profileType === 'Student' ? 'Estudiante Universitario' : authStore.user?.profileType === 'NightWorker' ? 'Trabajador Nocturno' : 'Usuario Protegido' }}
              </span>
            </div>
          </div>

          <!-- Quick link to landing page -->
          <a
            href="https://dejamice.github.io/Landing-Page/"
            target="_blank"
            class="landing-pill-btn"
            title="Ver Landing Page pública"
          >
            <i class="pi pi-external-link"></i>
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

.logout-full-btn {
  width: 100%;
  height: 40px;
  background: transparent;
  border: 1px solid var(--brand-border, rgba(255,255,255,0.14));
  border-radius: 8px;
  color: var(--on-brand-sub, rgba(255,255,255,0.74));
  font-size: 0.88rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.logout-full-btn:hover {
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
  background-color: #0E444E;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbar-search-box {
  position: relative;
  width: 320px;
}

.topbar-search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.topbar-search-input {
  width: 100%;
  height: 36px;
  padding: 0.3rem 0.8rem 0.3rem 2.2rem;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 0.82rem;
  outline: none;
  box-sizing: border-box;
}

.topbar-search-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.topbar-search-input:focus {
  background-color: rgba(255, 255, 255, 0.14);
  border-color: #00A896;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-connected-pill {
  display: flex;
  align-items: center;
  background-color: rgba(0, 168, 150, 0.15);
  border: 1px solid #00A896;
  color: #00E5CC;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.notification-wrapper {
  position: relative;
}

.notification-bell-btn {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.notification-bell-btn:hover {
  background-color: rgba(255, 255, 255, 0.16);
}

.notification-badge-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #EF4444;
}

.notification-badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #EF4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 5px;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.notifications-dropdown-menu {
  position: absolute;
  top: 44px;
  right: 0;
  width: 340px;
  max-height: 420px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1E293B;
  animation: fadeInDown 0.15s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.notif-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0E444E;
  display: flex;
  align-items: center;
}

.btn-mark-all-read {
  background: none;
  border: none;
  color: #00A896;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-mark-all-read:hover {
  background: #E6F7F5;
  text-decoration: underline;
}

.notif-loading, .notif-empty {
  padding: 24px 16px;
  text-align: center;
  color: #64748B;
  font-size: 0.85rem;
}

.notif-empty-icon {
  font-size: 1.8rem;
  color: #10B981;
  display: block;
}

.notif-items-list {
  overflow-y: auto;
  max-height: 340px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.notif-item:hover {
  background: #F8FAFC;
}

.notif-item.unread {
  background: #F0FDF4;
}

.notif-type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  background-color: #64748B;
}

.notif-type-dot.type-alerta { background-color: #EF4444; }
.notif-type-dot.type-dispositivo { background-color: #00A896; }
.notif-type-dot.type-sistema { background-color: #3B82F6; }
.notif-type-dot.type-ruta { background-color: #F59E0B; }

.notif-content-col {
  flex: 1;
  min-width: 0;
}

.notif-item-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0E444E;
  margin-bottom: 2px;
}

.notif-item-msg {
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.35;
  margin-bottom: 4px;
}

.notif-item-time {
  font-size: 0.7rem;
  color: #94A3B8;
}

.unread-glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  margin-top: 6px;
}

.user-profile-widget {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.user-profile-widget:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.user-avatar-initials {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-names-col {
  display: flex;
  flex-direction: column;
}

.widget-name {
  font-size: 0.82rem;
  color: #FFFFFF;
  line-height: 1.2;
}

.widget-role {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.6);
}

.landing-pill-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.landing-pill-btn:hover {
  background-color: rgba(255, 255, 255, 0.18);
  color: #00E5CC;
}

.content-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background-color: #F8FAFC;
}
</style>
