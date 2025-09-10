import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_BASE_URL = 'https://agents.echoleads.ai/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  // Check if token is expired or about to expire (within 1 minute)
  isTokenExpired: (expiresAt) => {
    if (!expiresAt) return true;
    
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    const oneMinuteInMs = 1 * 60 * 1000; // 1 minute buffer
    
    return currentTime >= (expirationTime - oneMinuteInMs);
  },

  // Get stored token info
  getStoredTokenInfo: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
      const userCredentials = await AsyncStorage.getItem('userCredentials');
      
      return {
        token,
        expiresAt,
        userCredentials: userCredentials ? JSON.parse(userCredentials) : null
      };
    } catch (error) {
      console.error('🔐 tokenManager: Error getting stored token info:', error);
      return { token: null, expiresAt: null, userCredentials: null };
    }
  },

  // Store token and expiration
  storeToken: async (token, expiresAt, userCredentials = null) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      if (expiresAt) {
        await AsyncStorage.setItem('tokenExpiresAt', expiresAt);
      }
      if (userCredentials) {
        await AsyncStorage.setItem('userCredentials', JSON.stringify(userCredentials));
      }
      console.log('🔐 tokenManager: Token stored successfully');
    } catch (error) {
      console.error('🔐 tokenManager: Error storing token:', error);
    }
  },

  // Clear stored tokens
  clearTokens: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('tokenExpiresAt');
      await AsyncStorage.removeItem('userCredentials');
      console.log('🔐 tokenManager: Tokens cleared');
    } catch (error) {
      console.error('🔐 tokenManager: Error clearing tokens:', error);
    }
  },

  // Refresh token by re-authenticating
  refreshToken: async () => {
    try {
      const { userCredentials } = await tokenManager.getStoredTokenInfo();
      
      if (!userCredentials) {
        console.log('🔐 tokenManager: No stored credentials for token refresh');
        return null;
      }

      console.log('🔐 tokenManager: Attempting token refresh with stored credentials');
      
      const response = await authAPI.login(userCredentials);
      const newToken = response.access_token || response.token;
      const newExpiresAt = response.expires_at;
      
      if (newToken) {
        await tokenManager.storeToken(newToken, newExpiresAt, userCredentials);
        console.log('🔐 tokenManager: Token refreshed successfully');
        return newToken;
      } else {
        console.log('🔐 tokenManager: Token refresh failed - no new token received');
        return null;
      }
    } catch (error) {
      console.error('🔐 tokenManager: Token refresh failed:', error);
      return null;
    }
  }
};

// Auth API functions
export const authAPI = {
  // Login function - using form-data as per API requirements
  login: async (credentials) => {
    try {
      
      // Create FormData for login request
      const formData = new FormData();
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);
      
      // Add device_token if provided
      if (credentials.device_token && credentials.device_token.trim() !== '') {
        formData.append('device_token', credentials.device_token);
      }
      
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      });
      

      // Store credentials for future token refresh
      if (response.data.access_token) {
        await tokenManager.storeToken(
          response.data.access_token,
          response.data.expires_at,
          credentials
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('🔐 authService: Login failed:', error.message);
      throw error;
    }
  },
  
  // Logout function
  logout: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔐 authService: Logout attempt with token:', token ? `${token.substring(0, 20)}...` : 'none');
      
      if (token) {
        const response = await api.get(
          '/auth/logout',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('🔐 authService: Logout response:', response.data);
      }
      
      // Clear stored tokens regardless of API response
      await tokenManager.clearTokens();
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('🔐 authService: Logout failed:', error.message);
      // Clear stored tokens even if API call fails
      await tokenManager.clearTokens();
      return { message: 'Logged out successfully' };
    }
  },

  // Check if user is authenticated and token is valid
  isAuthenticated: async () => {
    try {
      const { token, expiresAt } = await tokenManager.getStoredTokenInfo();
      
      if (!token) {
        console.log('🔐 authService: No token found');
        return false;
      }

      if (tokenManager.isTokenExpired(expiresAt)) {
        console.log('🔐 authService: Token is expired');
        return false;
      }

      console.log('🔐 authService: User is authenticated with valid token');
      return true;
    } catch (error) {
      console.error('🔐 authService: Error checking authentication:', error);
      return false;
    }
  },

  // Get current valid token (refresh if needed)
  getValidToken: async () => {
    try {
      const { token, expiresAt } = await tokenManager.getStoredTokenInfo();
      
      if (!token) {
        console.log('🔐 authService: No token available');
        return null;
      }

      // Check if token is expired or about to expire
      if (tokenManager.isTokenExpired(expiresAt)) {
        console.log('🔐 authService: Token expired, attempting refresh');
        const newToken = await tokenManager.refreshToken();
        return newToken;
      }

      console.log('🔐 authService: Returning valid token');
      return token;
    } catch (error) {
      console.error('🔐 authService: Error getting valid token:', error);
      return null;
    }
  },

  // Google login function
  googleLogin: async (googleToken, deviceToken) => {
    try {
      console.log('🔐 authService: Google login attempt');
      
      // Create FormData for Google login request
      const formData = new FormData();
      formData.append('token', googleToken);
      
      // Add device_token if provided
      if (deviceToken && deviceToken.trim() !== '') {
        formData.append('device_token', deviceToken);
      }
      
      const response = await api.post('/auth/googlelogin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      });
      
      console.log('🔐 authService: Google login successful');

      // Store credentials for future token refresh
      if (response.data.access_token) {
        await tokenManager.storeToken(
          response.data.access_token,
          response.data.expires_at,
          { googleToken, deviceToken } // Store Google-specific credentials
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('🔐 authService: Google login failed:', error.message);
      throw error;
    }
  }
};

export default api;
