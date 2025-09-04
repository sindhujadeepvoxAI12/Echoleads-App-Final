import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function AuthWrapper({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Prevent multiple navigation calls
    if (!isLoading && !hasNavigated.current) {
      hasNavigated.current = true;
      
      if (isAuthenticated) {
        // User is authenticated, navigate to main app
        console.log('🔐 AuthWrapper: Navigating to Dashboard');
        router.replace('/(tabs)/Dashboard');
      } else {
        // User is not authenticated, navigate to login
        console.log('🔐 AuthWrapper: Navigating to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666'
        }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  // Don't render children until authentication is determined
  return null;
}
