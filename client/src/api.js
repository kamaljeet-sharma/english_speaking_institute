import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired or invalid token on a protected call: clear it so the UI asks to log in again
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong. Please try again.';

export default api;
