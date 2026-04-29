import axios from 'axios';

const api = axios.create({
    /* Gagamit tayo ng localhost para hindi ka na laging nagpapalit ng IP 
       kapag nagbabago ang Wi-Fi connection mo.
    */
    baseURL: 'http://localhost:5000/api' 
    
    /* Gagamitin mo lang ang code sa ibaba kung itetest mo na ang app 
       gamit ang physical phone mo (Mobile Testing):
       baseURL: 'http://192.168.137.160:5000/api' 
    */
});

// Interceptor para sa Request: Isasama ang token sa headers
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

// Interceptor para sa Response: Logout kapag expired na ang session
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Session expired or unauthorized. Logging out...");
            localStorage.removeItem('token');
            
            // Mas maganda kung i-force redirect sa login para hindi "stuck" ang user
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;