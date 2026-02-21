import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import { ENDPOINTS } from './endpoints';

// Refresh token queue — concurrent 401s ko handle karta hai
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

// Redux logout callback — App.tsx mein set hota hai
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🌐 [API] Request:', config.method?.toUpperCase(), config.url);
    console.log('🌐 [API] Request data:', config.data);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        console.log('🔑 [API] Auth Token:', token);
        console.log('🔑 [API] Adding auth token to request');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('⚠️ [API] No auth token found');
      }
    } catch (error) {
      console.error('❌ [API] Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response:', response.config.url, response.status);
    console.log('✅ [API] Response data:', response.data);
    return response.data as any;
  },
  async (error: AxiosError) => {
    console.error('❌ [API] Response error:', error.config?.url);
    console.error('❌ [API] Error status:', error.response?.status);
    console.error('❌ [API] Error data:', error.response?.data);

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Refresh token request khud 401 de toh infinite loop se bachao
      if (originalRequest.url?.includes(ENDPOINTS.REFRESH_TOKEN)) {
        console.log('🚪 [API] Refresh token bhi expire — logout kar rahe hain');
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        logoutCallback?.();
        return Promise.reject(new Error('Session expire ho gayi. Dobara login karein.'));
      }

      // Agar refresh already chal rahi hai toh queue mein daal do
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token nahi mila');
        }

        console.log('🔄 [API] Token refresh ho raha hai...');
        const response = await axios.post(
          `${APP_CONFIG.API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`,
          { refreshToken }
        );

        const data = (response.data as any)?.data || response.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh response mein access token nahi mila');
        }

        console.log('✅ [API] Token successfully refresh hua');
        await AsyncStorage.setItem('authToken', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.log('🚪 [API] Token refresh fail — logout kar rahe hain');
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        logoutCallback?.();
        return Promise.reject(new Error('Session expire ho gayi. Dobara login karein.'));
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      'Something went wrong';

    console.error('❌ [API] Final error message:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Type-safe wrapper — response interceptor `response.data` return karta hai,
// isliye AxiosResponse ki jagah direct T milta hai
export const api = {
  get: <T = any>(url: string, config?: object): Promise<T> =>
    apiClient.get(url, config) as unknown as Promise<T>,
  post: <T = any>(url: string, data?: any, config?: object): Promise<T> =>
    apiClient.post(url, data, config) as unknown as Promise<T>,
  put: <T = any>(url: string, data?: any, config?: object): Promise<T> =>
    apiClient.put(url, data, config) as unknown as Promise<T>,
  patch: <T = any>(url: string, data?: any, config?: object): Promise<T> =>
    apiClient.patch(url, data, config) as unknown as Promise<T>,
  delete: <T = any>(url: string, config?: object): Promise<T> =>
    apiClient.delete(url, config) as unknown as Promise<T>,
};

export default apiClient;
