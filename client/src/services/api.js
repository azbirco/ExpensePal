import axios from 'axios';

/**
 * Sa Vite (na gamit mo sa ExpensePal), hindi 'process.env' ang ginagamit.
 * Ginagamit natin ang 'import.meta.env' para makuha ang variables mula sa .env file.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para sa Request: Isasama ang JWT token sa bawat request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para sa Response: Auto-logout kapag expired na ang token (401 error)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error("Session expired or unauthorized. Logging out...");
                localStorage.removeItem('token');
                window.location.href = '/login'; 
            }
        } else if (error.request) {
            // Error ito kapag hindi ma-reach ang backend server
            console.error("The server is unreachable. Please check your internet or backend status.");
        }
        return Promise.reject(error);
    }
);

export default api;