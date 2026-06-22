// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// In-memory token store — NOT localStorage (Phase 4's XSS reasoning applies here too)
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// ─── REQUEST interceptor — attach the token to every outgoing call ───────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── RESPONSE interceptor — handle expired tokens transparently ──────────────
let isRefreshing = false;
let refreshQueue = []; // requests that arrived WHILE a refresh was already in flight

api.interceptors.response.use(
  (response) => response, // happy path — pass through untouched
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only ONCE per request (avoid infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request already triggered a refresh — queue this one
        // instead of firing a second simultaneous refresh call
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        setAccessToken(data.accessToken);

        // Retry all queued requests with the new token
        refreshQueue.forEach(({ resolve, originalRequest: req }) => {
          req.headers.Authorization = `Bearer ${data.accessToken}`;
          resolve(api(req));
        });
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest); // retry the ORIGINAL failed request
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        setAccessToken(null);
        window.location.href = '/login'; // refresh token itself expired — full re-login needed
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;