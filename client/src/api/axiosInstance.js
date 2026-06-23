import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

const authRoutesWithoutRefreshRetry = ['/auth/login', '/auth/register', '/auth/refresh'];

const isAuthRouteWithoutRefreshRetry = (url = '') => (
  authRoutesWithoutRefreshRetry.some((route) => url.endsWith(route))
);

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldTryRefresh = (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRouteWithoutRefreshRetry(originalRequest.url)
    );

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const data = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;
