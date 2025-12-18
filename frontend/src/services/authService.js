import api from './api';

const authService = {
    register: async (username, email, password, favoriteGenres, favoriteAuthors) => {
        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password,
                favoriteGenres,
                favoriteAuthors,
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Erreur lors de l\'inscription';
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Erreur de connexion';
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;