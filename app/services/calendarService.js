import axios from 'axios';
import { authAPI, tokenManager } from './authService';

const API_BASE_URL = 'https://beta.echoleads.ai/api';

const calendarApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

calendarApi.interceptors.request.use(async (config) => {
  try {
    const token = await authAPI.getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

calendarApi.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      const newToken = await tokenManager.refreshToken();
      if (newToken && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return calendarApi(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const calendarAPI = {
  getBookData: async () => {
    try {
      const response = await calendarApi.get('/calendar/bookdata');
      // Normalize to array of records
      const records = response.data?.data || response.data || [];
      return { 
        status: true, 
        data: Array.isArray(records) ? records : [] 
      };
    } catch (error) {
      return {
        status: false,
        message: 'Failed to load calendar bookdata',
        data: [],
        error: error.message,
      };
    }
  },
};

export default calendarApi;


