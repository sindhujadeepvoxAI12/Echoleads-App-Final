import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from '../app/services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Get stored token and user data
      const storedToken = await tokenManager.getAccessToken();
      const storedUser = await tokenManager.getUserData();
      
      if (storedToken && !tokenManager.isTokenExpired(storedToken)) {
        // Valid token exists, user is authenticated
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
        console.log('🔐 Auth: User automatically authenticated with stored token');
      } else if (storedToken && tokenManager.isTokenExpired(storedToken)) {
        // Token expired, try to refresh
        console.log('🔐 Auth: Token expired, attempting refresh...');
        const newToken = await tokenManager.refreshToken();
        
        if (newToken) {
          const refreshedUser = await tokenManager.getUserData();
          setToken(newToken);
          setUser(refreshedUser);
          setIsAuthenticated(true);
          console.log('🔐 Auth: Token refreshed successfully');
        } else {
          // Refresh failed, clear tokens and require login
          await tokenManager.clearTokens();
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
          console.log('🔐 Auth: Token refresh failed, user must login');
        }
      } else {
        // No token, user must login
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        console.log('🔐 Auth: No stored token, user must login');
      }
    } catch (error) {
      console.error('🔐 Auth: Error checking authentication status:', error);
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userCredentials, authResponse) => {
    try {
      setIsLoading(true);
      
      // Extract tokens and user data from response
      const accessToken = authResponse.access_token || authResponse.token;
      const userData = authResponse.user || authResponse.data?.user;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }
      
      // Tokens are already stored by authAPI.login, just update state
      setToken(accessToken);
      setUser(userData || userCredentials);
      setIsAuthenticated(true);
      
      console.log('🔐 Auth: User logged in successfully');
      return { success: true };
    } catch (error) {
      console.error('🔐 Auth: Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored tokens
      await tokenManager.clearTokens();
      
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('🔐 Auth: User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('🔐 Auth: Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      await checkAuthStatus();
    } catch (error) {
      console.error('🔐 Auth: Refresh auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
