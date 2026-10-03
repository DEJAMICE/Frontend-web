import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('jwt_token') || null,
        user: JSON.parse(localStorage.getItem('user_profile')) || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        setAuth(token, user) {
            this.token = token;
            this.user = user;
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('user_profile', JSON.stringify(user));
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('jwt_token');
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