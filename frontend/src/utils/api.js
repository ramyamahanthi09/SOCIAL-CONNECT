import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Flask default port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/refresh-token', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        localStorage.setItem('access_token', res.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed, string clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
  }
  return Promise.reject(error);
});

export default api;
