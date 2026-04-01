import axios from 'axios';

const client = axios.create({
    baseURL: '/'
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('slh_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

client.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('slh_token');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default client;
