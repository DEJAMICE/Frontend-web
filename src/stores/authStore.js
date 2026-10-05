import { defineStore } from 'pinia';
import api from '../services/api';

function getInitialUser() {
    try {
        const raw = localStorage.getItem('safesignal_user') || localStorage.getItem('user_profile');
        if (!raw || raw === 'undefined' || raw === 'null') return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('safesignal_token') || localStorage.getItem('jwt_token') || null,
        user: getInitialUser(),
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        setAuth(token, user) {
            this.token = token;
            this.user = user;
            localStorage.setItem('safesignal_token', token);
            localStorage.setItem('jwt_token', token);
            if (user) {
                localStorage.setItem('safesignal_user', JSON.stringify(user));
                localStorage.setItem('user_profile', JSON.stringify(user));
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('safesignal_token');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('safesignal_user');
            localStorage.removeItem('user_profile');
        },
        async fetchUserProfile() {
            try {
                const response = await api.get('/users/me');
                this.user = response.data;
                localStorage.setItem('user_profile', JSON.stringify(this.user));
            } catch (error) {
                console.error('Error obteniendo el perfil:', error);
                if (error.response?.status === 401) {
                    this.logout();
                }
            }
        }
    }
});