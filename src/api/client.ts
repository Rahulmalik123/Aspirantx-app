import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

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
    
    if (error.response?.status === 401) {
      console.log('🚪 [API] 401 Unauthorized - removing token');
      // Token expired, logout user
      await AsyncStorage.removeItem('authToken');
      // Navigate to login (will be handled by navigation)
    }
    
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      'Something went wrong';
    
    console.error('❌ [API] Final error message:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
