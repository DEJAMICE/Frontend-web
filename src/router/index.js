import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const Login = () => import('../views/Login.vue');
const Registro = () => import('../views/Registro.vue');
const MainLayout = () => import('../layouts/MainLayout.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Perfil = () => import('../views/Perfil.vue');

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login, meta: { requiresGuest: true } },
    { path: '/registro', name: 'Registro', component: Registro, meta: { requiresGuest: true } },
    {
        path: '/app',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            { path: 'dashboard', name: 'Dashboard', component: Dashboard },
            { path: 'perfil', name: 'Perfil', component: Perfil },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
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