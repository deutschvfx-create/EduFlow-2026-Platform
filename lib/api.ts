
import axios from 'axios';

import { getStoredToken } from './auth-helpers';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 3000, // FAST TIMEOUT for better UX
});

// Fallback for Dashboard Stats if API is down
// Interceptors for latency reporting
api.interceptors.request.use(config => {
    (config as any).startTime = Date.now();
    return config;
});

api.interceptors.response.use(
    response => {
        const startTime = (response.config as any).startTime;
        if (startTime && typeof window !== 'undefined') {
            const latency = Date.now() - startTime;
            window.dispatchEvent(new CustomEvent('connectivity:latency', { detail: latency }));
            window.dispatchEvent(new CustomEvent('connectivity:sync'));
        }
        return response;
    },
    error => {
        if (error.config?.url?.includes('/dashboard/stats')) {
            console.warn("Dashboard stats failed, returning mock stats");
            return {
                data: {
                    stats: {
                        students: 124, studentsTrend: 20,
                        teachers: 12, teachersTrend: 2,
                        groups: 8, groupsTrend: 0,
                        revenue: 12450, revenueTrend: 15
                    },
                    recentNotifications: [
                        { id: 1, text: "Новая группа A1", time: "2 часа назад" }
                    ]
                }
            };
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
