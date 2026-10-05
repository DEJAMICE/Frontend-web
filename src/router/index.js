import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const Login = () => import('../views/Login.vue');
const Registro = () => import('../views/Registro.vue');
const MainLayout = () => import('../layouts/MainLayout.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Perfil = () => import('../views/Perfil.vue');
const Rutas = () => import('../views/Rutas.vue');
const SosView = () => import('../views/SosView.vue');
const Contactos = () => import('../views/Contactos.vue');
const Dispositivos = () => import('../views/Dispositivos.vue');
const Historial = () => import('../views/Historial.vue');
const Reportes = () => import('../views/Reportes.vue');

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login, meta: { requiresGuest: true } },
    { path: '/registro', name: 'Registro', component: Registro, meta: { requiresGuest: true } },
    
    // Redirecciones directas
    { path: '/dashboard', redirect: '/app/dashboard' },
    { path: '/perfil', redirect: '/app/perfil' },
    { path: '/profile', redirect: '/app/perfil' },
    { path: '/configuracion', redirect: '/app/perfil' },
    { path: '/rutas', redirect: '/app/rutas' },
    { path: '/sos', redirect: '/app/sos' },
    { path: '/historial', redirect: '/app/historial' },
    { path: '/history', redirect: '/app/historial' },
    { path: '/contactos', redirect: '/app/contactos' },
    { path: '/contacts', redirect: '/app/contactos' },
    { path: '/dispositivos', redirect: '/app/dispositivos' },
    { path: '/devices', redirect: '/app/dispositivos' },
    { path: '/reportes', redirect: '/app/reportes' },

    // Área Autenticada con MainLayout
    {
        path: '/app',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/app/dashboard' },
            { path: 'dashboard', name: 'Dashboard', component: Dashboard },
            { path: 'rutas', name: 'Rutas', component: Rutas },
            { path: 'sos', name: 'Sos', component: SosView },
            { path: 'historial', name: 'Historial', component: Historial },
            { path: 'contactos', name: 'Contactos', component: Contactos },
            { path: 'dispositivos', name: 'Dispositivos', component: Dispositivos },
            { path: 'reportes', name: 'Reportes', component: Reportes },
            { path: 'perfil', name: 'Perfil', component: Perfil },
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/app/dashboard');
    } else {
        next();
    }
});

export default router;