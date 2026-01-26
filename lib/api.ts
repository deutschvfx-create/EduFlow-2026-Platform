
import axios from 'axios';

import { getStoredToken } from './auth-helpers';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
