import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.33:5000/api' 
});

// Ito ang magkakabit ng token sa bawat request na gagawin mo
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

// Optional: I-logout ang user kapag ang server ay nag-respond ng 401 (expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Session expired or unauthorized. Logging out...");
            localStorage.removeItem('token');
            // Pwedeng i-redirect dito sa login page kung kailangan
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;