import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to decode JWT without requiring jwt-decode library
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(paddedPayload));
    return decoded;
  } catch (error) {
    console.log('JWT decode failed:', error);
    return null;
  }
};

// API Configuration
const API_BASE_URL = 'https://agents.echoleads.ai/api';

// Create axios instance with enhanced configuration
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token Manager with comprehensive error handling
export const tokenManager = {
  // Storage keys
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_DATA_KEY: 'userData',

  // Get stored access token
  getAccessToken: async () => {
    try {
      const token = await AsyncStorage.getItem(tokenManager.ACCESS_TOKEN_KEY);
      if (token) {
        console.log('🔑 Retrieved access token from storage (length:', token.length, ')');
        return token;
      }
      console.log('🔑 No access token found in storage');
      return null;
    } catch (error) {
      console.error('🔑 Error retrieving access token:', error);
      return null;
    }
  },

  // Get stored refresh token
  getRefreshToken: async () => {
    try {
      const token = await AsyncStorage.getItem(tokenManager.REFRESH_TOKEN_KEY);
      if (token) {
        console.log('🔄 Retrieved refresh token from storage (length:', token.length, ')');
        return token;
      }
      console.log('🔄 No refresh token found in storage');
      return null;
    } catch (error) {
      console.error('🔄 Error retrieving refresh token:', error);
      return null;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(tokenManager.USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log('👤 Retrieved user data from storage:', parsed.email || parsed.name);
        return parsed;
      }
      console.log('👤 No user data found in storage');
      return null;
    } catch (error) {
      console.error('👤 Error retrieving user data:', error);
      return null;
    }
  },

  // Store tokens and user data
  storeTokens: async (accessToken, refreshToken = null, userData = null) => {
    try {
      const operations = [
        AsyncStorage.setItem(tokenManager.ACCESS_TOKEN_KEY, accessToken)
      ];

      if (refreshToken) {
        operations.push(AsyncStorage.setItem(tokenManager.REFRESH_TOKEN_KEY, refreshToken));
      }

      if (userData) {
        operations.push(AsyncStorage.setItem(tokenManager.USER_DATA_KEY, JSON.stringify(userData)));
      }

      await Promise.all(operations);
      
      console.log('🔑 Tokens stored successfully:', {
        accessToken: 'Stored',
        refreshToken: refreshToken ? 'Stored' : 'Not provided',
        userData: userData ? 'Stored' : 'Not provided'
      });
    } catch (error) {
      console.error('🔑 Error storing tokens:', error);
      throw error;
    }
  },

  // Clear all stored data
  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        tokenManager.ACCESS_TOKEN_KEY,
        tokenManager.REFRESH_TOKEN_KEY,
        tokenManager.USER_DATA_KEY
      ]);
      console.log('🔑 All authentication data cleared successfully');
    } catch (error) {
      console.error('🔑 Error clearing tokens:', error);
    }
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    try {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) {
        console.log('🔑 Token missing expiration field, assuming expired');
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 60; // 60 seconds buffer before actual expiration
      const isExpired = decoded.exp < (currentTime + bufferTime);
      
      if (isExpired) {
        console.log('🔑 Token is expired or will expire soon');
      } else {
        const remainingTime = decoded.exp - currentTime;
        console.log(`🔑 Token valid for ${remainingTime} more seconds`);
      }
      
      return isExpired;
    } catch (error) {
      console.log('🔑 Token validation failed, assuming expired:', error.message);
      return true;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      console.log('🔄 Attempting to refresh access token...');
      const refreshToken = await tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        console.log('🔄 No refresh token available');
        throw new Error('No refresh token available');
      }

      console.log('🔄 Calling refresh endpoint...');
      const response = await authApi.post('/auth/refresh', {
        refresh_token: refreshToken
      }, {
        timeout: 15000 // Shorter timeout for refresh
      });

      // Extract new tokens from various possible response formats
      const newAccessToken = response.data.access_token || 
                            response.data.token || 
                            response.data.data?.access_token || 
                            response.data.data?.token;
      
      const newRefreshToken = response.data.refresh_token || 
                             response.data.data?.refresh_token || 
                             refreshToken; // Keep old refresh token if no new one provided

      if (!newAccessToken) {
        console.error('🔄 No access token received from refresh response');
        console.error('🔄 Response structure:', response.data);
        throw new Error('No access token received from refresh');
      }

      // Store new tokens
      await tokenManager.storeTokens(newAccessToken, newRefreshToken);
      console.log('🔄 Token refreshed successfully');
      
      return newAccessToken;
    } catch (error) {
      console.error('🔄 Token refresh failed:', error.response?.status, error.message);
      
      // If refresh fails due to invalid refresh token, clear all tokens
      if (error.response?.status === 401 || error.response?.status === 422) {
        console.log('🔄 Refresh token invalid, clearing all tokens');
        await tokenManager.clearTokens();
      }
      
      throw error;
    }
  },

  // Get valid token (refresh if needed)
  getValidToken: async () => {
    try {
      let accessToken = await tokenManager.getAccessToken();
      
      if (!accessToken) {
        console.log('🔑 No access token available');
        return null;
      }

      // Check if token is expired and needs refresh
      if (tokenManager.isTokenExpired(accessToken)) {
        console.log('🔑 Access token is expired, attempting refresh...');
        try {
          accessToken = await tokenManager.refreshToken();
          console.log('🔑 Token successfully refreshed');
        } catch (refreshError) {
          console.log('🔑 Token refresh failed, user needs to re-authenticate');
          await tokenManager.clearTokens();
          return null;
        }
      }

      console.log('🔑 Valid access token available');
      return accessToken;
    } catch (error) {
      console.error('🔑 Error getting valid token:', error);
      return null;
    }
  }
};

// Add request interceptor for automatic token attachment
authApi.interceptors.request.use(
  async (config) => {
    // Skip token attachment for auth endpoints
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/google', '/auth/googlelogin', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];
    const skipAuth = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (skipAuth) {
      console.log('🔧 Skipping auth token for endpoint:', config.url);
      return config;
    }

    try {
      const token = await tokenManager.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔧 Request interceptor: Token attached to request');
      } else {
        console.log('🔧 Request interceptor: No valid token available');
      }
    } catch (error) {
      console.error('🔧 Request interceptor: Error attaching token:', error);
    }

    return config;
  },
  (error) => {
    console.error('🔧 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for automatic token refresh on 401
authApi.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error responses for debugging
    console.log(`❌ API ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status || 'Network Error'}`);
    
    // Handle 401 Unauthorized with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔐 Received 401, attempting token refresh...');
      
      try {
        const newToken = await tokenManager.refreshToken();
        
        if (newToken) {
          // Update the original request with new token and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔐 Retrying request with new token');
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('🔐 Token refresh failed in interceptor:', refreshError.message);
        await tokenManager.clearTokens();
      }
    }

    // Handle network errors with basic retry logic
    if (!originalRequest._networkRetry && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED')) {
      originalRequest._networkRetry = true;
      console.log('🔄 Network error, retrying request...');
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return authApi(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Regular email/password login
  login: async (credentials) => {
    try {
      console.log('🔐 Regular login attempt for:', credentials.email);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const requestPayload = {
        email: credentials.email.trim(),
        password: credentials.password,
        device_token: credentials.device_token || null
      };

      console.log('🔐 Sending login request:', {
        email: requestPayload.email,
        hasPassword: !!requestPayload.password,
        hasDeviceToken: !!requestPayload.device_token
      });

      const response = await authApi.post('/auth/login', requestPayload);
      console.log('🔐 Login successful:', response.status);
      
      // Extract tokens and user data from response
      const accessToken = response.data.access_token || response.data.token;
      const refreshToken = response.data.refresh_token;
      const userData = response.data.user || response.data.data?.user;

      if (accessToken) {
        await tokenManager.storeTokens(accessToken, refreshToken, userData);
        console.log('🔐 Login tokens stored successfully');
      } else {
        console.warn('🔐 No access token received from login');
      }

      return response.data;
    } catch (error) {
      console.error('🔐 Regular login failed:', error.response?.status, error.message);
      
      // Enhanced error handling
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          throw new Error(firstError[0] || 'Validation failed');
        }
      }
      
      throw error;
    }
  },

  // FIXED: Google OAuth login - using correct endpoint and parameters
  googleLogin: async (googleData) => {
    try {
      console.log('🔐 Google login attempt starting...');
      console.log('🔐 Google data validation:', {
        hasToken: !!googleData.token,
        tokenLength: googleData.token ? googleData.token.length : 0,
        hasDeviceToken: !!googleData.device_token,
        deviceTokenLength: googleData.device_token ? googleData.device_token.length : 0
      });

      // Validate required parameters
      if (!googleData.token) {
        throw new Error('Google token is required');
      }

      // Validate token format (should be JWT)
      const tokenParts = googleData.token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid Google token format');
      }

      // FIXED: Prepare request payload exactly as backend expects
      const requestPayload = {
        token: googleData.token,           // Backend expects 'token', not 'id_token'
        device_token: googleData.device_token || null
      };

      console.log('🔐 Sending to backend /auth/googlelogin...');
      console.log('🔐 Request payload structure:', {
        token: `Present (${googleData.token.length} chars)`,
        device_token: googleData.device_token ? 'Present' : 'null'
      });

      // FIXED: Use correct endpoint as shown in Postman
      const response = await authApi.post('/auth/googlelogin', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 30000 // 30 seconds for Google login
      });

      console.log('🔐 Google login response received:', response.status);
      console.log('🔐 Response structure validation:', {
        hasData: !!response.data,
        hasAccessToken: !!(response.data.access_token || response.data.token),
        hasUser: !!response.data.user,
        hasRefreshToken: !!response.data.refresh_token,
        status: response.data.status || response.data.success
      });

      // Extract tokens from response with multiple fallback paths
      const accessToken = response.data.access_token || 
                          response.data.token || 
                          response.data.data?.access_token || 
                          response.data.data?.token;
      
      const refreshToken = response.data.refresh_token || 
                          response.data.data?.refresh_token;
      
      const userData = response.data.user || 
                      response.data.data?.user;

      // Validate we received an access token
      if (!accessToken) {
        console.error('🔐 No access token received from Google login');
        console.error('🔐 Full response data:', JSON.stringify(response.data, null, 2));
        throw new Error('No access token received from server. Please try again.');
      }

      // Store tokens and user data
      await tokenManager.storeTokens(accessToken, refreshToken, userData);
      console.log('🔐 Google login tokens stored successfully');

      return response.data;
    } catch (error) {
      console.error('🔐 Google login failed:', error.response?.status, error.message);
      
      // Detailed error logging for debugging
      if (error.response) {
        console.error('🔐 Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('🔐 Error response headers:', error.response.headers);
        
        // Handle specific error responses with helpful messages
        if (error.response.status === 422) {
          const errorData = error.response.data;
          if (errorData.errors?.token) {
            throw new Error(`Token validation failed: ${errorData.errors.token[0]}`);
          }
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          throw new Error('The Google token is invalid or expired. Please try signing in again.');
        }
        
        if (error.response.status === 401) {
          throw new Error('Google authentication failed. Invalid credentials.');
        }
        
        if (error.response.status >= 500) {
          throw new Error('Server error occurred. Please try again later.');
        }
      }

      // Handle network-related errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }

      // Re-throw with original message if no specific handling
      throw error;
    }
  },

  // Register new account
  register: async (userData) => {
    try {
      console.log('🔐 Registration attempt for:', userData.email);
      
      // Validate required fields
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }

      const response = await authApi.post('/auth/register', userData);
      console.log('🔐 Registration successful:', response.status);
      
      // Extract tokens if provided after registration
      const accessToken = response.data.access_token || response.data.token;
      const refreshToken = response.data.refresh_token;
      const userResponseData = response.data.user || response.data.data?.user;

      if (accessToken) {
        await tokenManager.storeTokens(accessToken, refreshToken, userResponseData);
        console.log('🔐 Registration tokens stored successfully');
      }

      return response.data;
    } catch (error) {
      console.error('🔐 Registration failed:', error.response?.status, error.message);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const firstErrorKey = Object.keys(errorData.errors)[0];
          const firstError = errorData.errors[firstErrorKey][0];
          throw new Error(firstError);
        }
      }
      
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      console.log('🔐 Logout attempt...');
      
      // Try to call logout endpoint if token is available
      try {
        const token = await tokenManager.getAccessToken();
        if (token) {
          await authApi.post('/auth/logout', {}, {
            timeout: 5000 // Short timeout for logout
          });
          console.log('🔐 Server logout successful');
        }
      } catch (logoutError) {
        console.log('🔐 Server logout failed (continuing with local logout):', logoutError.message);
        // Continue with local logout even if server logout fails
      }

      // Always clear local tokens
      await tokenManager.clearTokens();
      console.log('🔐 Local logout completed');
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('🔐 Logout error:', error.message);
      // Still clear tokens even if there's an error
      await tokenManager.clearTokens();
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('👤 Getting current user...');
      
      // Try to get user from storage first
      const cachedUser = await tokenManager.getUserData();
      if (cachedUser) {
        console.log('👤 Returning cached user data');
        return { user: cachedUser, cached: true };
      }
      
      // If not in storage, fetch from server
      const response = await authApi.get('/auth/user');
      console.log('👤 Current user retrieved from server');
      
      // Cache the user data
      if (response.data.user || response.data) {
        const userData = response.data.user || response.data;
        await AsyncStorage.setItem(tokenManager.USER_DATA_KEY, JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('👤 Get current user failed:', error.response?.status, error.message);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await tokenManager.getValidToken();
      const isAuth = !!token;
      console.log('🔐 Authentication status:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('🔐 Authentication check failed:', error);
      return false;
    }
  },

  // Get valid token (expose tokenManager method)
  getValidToken: async () => {
    return await tokenManager.getValidToken();
  },

  // Password reset request
  forgotPassword: async (email) => {
    try {
      console.log('🔐 Password reset request for:', email);
      
      if (!email) {
        throw new Error('Email is required');
      }

      const response = await authApi.post('/auth/forgot-password', { 
        email: email.trim() 
      });
      
      console.log('🔐 Password reset email sent successfully');
      return response.data;
    } catch (error) {
      console.error('🔐 Password reset failed:', error.response?.status, error.message);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, password, passwordConfirmation) => {
    try {
      console.log('🔐 Password reset attempt...');
      
      if (!token || !password || !passwordConfirmation) {
        throw new Error('All fields are required');
      }

      if (password !== passwordConfirmation) {
        throw new Error('Passwords do not match');
      }

      const response = await authApi.post('/auth/reset-password', {
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      
      console.log('🔐 Password reset successful');
      return response.data;
    } catch (error) {
      console.error('🔐 Password reset failed:', error.response?.status, error.message);
      throw error;
    }
  },

  // Update device token for push notifications
  updateDeviceToken: async (deviceToken) => {
    try {
      console.log('📱 Device token update attempt...');
      
      if (!deviceToken) {
        console.log('📱 No device token provided, skipping update');
        return { success: true, message: 'No device token to update' };
      }

      const response = await authApi.post('/auth/device-token', {
        device_token: deviceToken
      });
      
      console.log('📱 Device token updated successfully');
      return response.data;
    } catch (error) {
      console.error('📱 Device token update failed:', error.response?.status, error.message);
      // Don't throw error for device token update failures
      return { success: false, message: error.message };
    }
  }
};

// Export default auth API instance
export default authApi;