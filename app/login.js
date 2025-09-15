import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Eye, EyeOff, Mail, Lock, ChevronRight, Zap, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './services/authService';
import { registerForPushNotificationsAsync } from './utils/notifications';
import Constants from 'expo-constants';

// Google Sign-In implementation with proper error handling
let GoogleSignin = null;

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  console.log('✅ Google Sign-In module loaded successfully');
} catch (error) {
  console.warn('⚠️ Google Sign-In not available:', error.message);
}

// Google OAuth client IDs - Only use webClientId
const WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleSignIn?.webClientId || 
                      '334297696005-or01n201vocu6rpnpchvstruijoq7aut.apps.googleusercontent.com';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // Configure Google Sign-In
  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID, // Only webClientId is needed
          offlineAccess: true,
          forceCodeForRefreshToken: true,
          scopes: ['profile', 'email', 'openid'], // openid is required for idToken
        });
        
        console.log('✅ Google Sign-In configured successfully');
        console.log('Configuration details:', {
          webClientId: WEB_CLIENT_ID ? 'Present' : 'Missing',
          offlineAccess: true,
          scopes: ['profile', 'email', 'openid']
        });
      } catch (error) {
        console.error('❌ Google Sign-In configuration failed:', error);
      }
    } else {
      console.warn('⚠️ Google Sign-In not available - requires native build (EAS Build)');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/LiveChat');
    }
  }, [isAuthenticated, isLoading, router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email is required';
    } else if (!emailOrUsername.includes('@')) {
      newErrors.emailOrUsername = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      // Get device token for push notifications
      const deviceToken = await registerForPushNotificationsAsync();
      console.log('Device token for login:', deviceToken ? 'Present' : 'None');
      
      const loginData = {
        email: emailOrUsername.trim(),
        password: password,
        device_token: deviceToken,
      };
      
      console.log('Attempting regular login for:', loginData.email);
      const res = await authAPI.login(loginData);

      const name = res.user?.name || res.user?.username || emailOrUsername.trim();

      // Use AuthContext to handle login - pass the response directly
      const loginResult = await login(loginData, res);
      
      if (loginResult.success) {
        setUsername(name);
        setShowWelcome(true);

        setTimeout(() => {
          setShowWelcome(false);
          router.replace('/(tabs)/LiveChat');
        }, 2000);
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }
    } catch (err) {
      console.error('Regular login error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please check your credentials and try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle Google Sign-In with correct parameter names
  const handleGoogleSignIn = async () => {
    console.log('🚀 ===== GOOGLE SIGN-IN STARTED =====');
    setGoogleLoading(true);
    
    try {
      // Step 1: Check if Google Sign-In is available
      console.log('Step 1: Checking Google Sign-In availability...');
      if (!GoogleSignin) {
        throw new Error('Google Sign-In requires a development build. Please build the app using EAS Build to use this feature.');
      }
      console.log('✅ Google Sign-In module available');

      // Step 2: Check Google Play Services
      console.log('Step 2: Checking Google Play Services...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('✅ Google Play Services available');

      // Step 3: Sign out any previous session for clean state
      console.log('Step 3: Clearing previous Google session...');
      try {
        await GoogleSignin.signOut();
        console.log('✅ Previous session cleared');
      } catch (signOutError) {
        console.log('ℹ️ No previous session to clear');
      }

      // Step 4: Get device token for push notifications
      console.log('Step 4: Getting device token...');
      let deviceToken = null;
      try {
        deviceToken = await registerForPushNotificationsAsync();
        console.log('✅ Device token obtained:', deviceToken ? 'Yes' : 'No');
      } catch (tokenError) {
        console.warn('⚠️ Failed to get device token:', tokenError.message);
      }

      // Step 5: Sign in with Google - Handle new response format
      console.log('Step 5: Initiating Google Sign-In...');
      const result = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful');
      
      // Handle the response structure
      console.log('Raw Google Sign-In result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      
      // Extract user info from the correct location
      let userInfo = result;
      if (result.data) {
        console.log('Found data property, extracting userInfo from result.data');
        userInfo = result.data;
      }
      
      console.log('Extracted userInfo:', userInfo);
      console.log('UserInfo keys:', Object.keys(userInfo || {}));

      // Step 6: Extract ID token - CRITICAL: Backend expects 'token', not 'id_token'
      console.log('Step 6: Extracting Google ID token...');
      let idToken = null;
      
      // Try multiple possible locations for the idToken
      if (userInfo.idToken) {
        idToken = userInfo.idToken;
        console.log('Found idToken in userInfo.idToken');
      } else if (userInfo.data?.idToken) {
        idToken = userInfo.data.idToken;
        console.log('Found idToken in userInfo.data.idToken');
      } else if (result.idToken) {
        idToken = result.idToken;
        console.log('Found idToken in result.idToken');
      } else if (result.data?.idToken) {
        idToken = result.data.idToken;
        console.log('Found idToken in result.data.idToken');
      }

      // Also get access token if idToken is not available
      if (!idToken && userInfo.accessToken) {
        console.warn('No idToken found, but accessToken is available - this might work');
        idToken = userInfo.accessToken;
      }
      
      if (!idToken) {
        console.error('❌ No Google ID token received');
        console.error('Full result structure:', JSON.stringify(result, null, 2));
        console.error('UserInfo structure:', JSON.stringify(userInfo, null, 2));
        console.error('Available properties in result:', Object.keys(result));
        console.error('Available properties in userInfo:', Object.keys(userInfo || {}));
        
        throw new Error('No Google ID token received. The Google Sign-In response format has changed or webClientId is not configured correctly.');
      }

      // Step 7: Validate token format
      console.log('Step 7: Validating token format...');
      console.log('Token length:', idToken.length);
      console.log('Token preview:', idToken.substring(0, 50) + '...');
      
      // Basic token validation
      const tokenParts = idToken.split('.');
      console.log('Token parts count:', tokenParts.length);
      
      if (tokenParts.length === 3) {
        try {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('✅ Valid JWT token structure');
          console.log('Token payload preview:', {
            iss: payload.iss,
            aud: payload.aud,
            email: payload.email,
            name: payload.name
          });
        } catch (decodeError) {
          console.warn('Token decode failed, but continuing anyway:', decodeError.message);
        }
      }

      // Step 8: FIXED - Prepare login data with correct parameter names for backend
      console.log('Step 8: Preparing backend request...');
      const googleLoginData = {
        token: idToken,          // CRITICAL: Backend expects 'token', not 'id_token'
        device_token: deviceToken
      };

      console.log('Sending to backend:', {
        token: 'Present (length: ' + idToken.length + ')',
        device_token: deviceToken ? 'Present' : 'null'
      });

      // Step 9: Call backend Google login API
      console.log('Step 9: Calling backend API...');
      const res = await authAPI.googleLogin(googleLoginData);
      console.log('✅ Backend responded successfully');

      // Step 10: Extract user information
      console.log('Step 10: Processing login result...');
      const name = res.user?.name || res.user?.username || userInfo.user?.name || userInfo.name || 'User';

      // Step 11: Use AuthContext to handle login
      console.log('Step 11: Using AuthContext to handle login...');
      const loginResult = await login(googleLoginData, res);
      
      if (loginResult.success) {
        console.log('✅ Login successful, showing welcome screen');
        setUsername(name);
        setShowWelcome(true);

        setTimeout(() => {
          setShowWelcome(false);
          router.replace('/(tabs)/LiveChat');
        }, 2000);
      } else {
        console.error('❌ AuthContext login failed:', loginResult.error);
        throw new Error(loginResult.error || 'Google login failed');
      }

    } catch (error) {
      console.log('❌ ===== GOOGLE SIGN-IN ERROR =====');
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      // Handle specific error codes with helpful messages
      switch (error.code) {
        case 'SIGN_IN_CANCELLED':
          errorMessage = 'Google sign-in was cancelled.';
          break;
        case 'IN_PROGRESS':
          errorMessage = 'Google sign-in is already in progress. Please wait.';
          break;
        case 'PLAY_SERVICES_NOT_AVAILABLE':
          errorMessage = 'Google Play Services is not available or needs to be updated.';
          break;
        case 'DEVELOPER_ERROR':
          errorMessage = 'Google Sign-In configuration error. Please check SHA1 fingerprint and rebuild the app.';
          console.error('DEVELOPER_ERROR - Possible causes:');
          console.error('1. SHA1 fingerprint mismatch in Google Console');
          console.error('2. Package name mismatch');
          console.error('3. Client ID configuration incorrect');
          break;
        default:
          if (error.response?.status === 422) {
            const backendError = error.response.data;
            if (backendError.errors?.token) {
              errorMessage = `Token validation failed: ${backendError.errors.token[0]}`;
            } else if (backendError.errors?.id_token) {
              errorMessage = `Token validation failed: ${backendError.errors.id_token[0]}`;
            } else {
              errorMessage = backendError.message || 'Invalid token sent to server.';
            }
          } else if (error.response?.status === 401) {
            errorMessage = 'Google authentication failed. Please try again.';
          } else if (error.message.includes('configuration')) {
            errorMessage = 'Google Sign-In is not properly configured. Please contact support.';
          } else if (error.message.includes('development build')) {
            errorMessage = error.message; // Use the specific message about EAS Build
          } else if (error.message.includes('webClientId')) {
            errorMessage = 'Google Sign-In configuration issue. The webClientId may not be set correctly.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          break;
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      console.log('🔚 ===== GOOGLE SIGN-IN FINISHED =====');
      setGoogleLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerBackground}>
              <View style={styles.accentCircle1} />
              <View style={styles.accentCircle2} />
            </View>
            
            <View style={styles.headerContent}>
              <View style={styles.brandContainer}>
                <Text style={styles.brandTitle}>
                  Echo<Text style={styles.brandAccent}>leads</Text>
                </Text>
              </View>
              
              <Text style={styles.headerSubtitle}>
                AI-Powered Lead Generation Platform
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>Sign in to your account</Text>
              </View>

              <View style={styles.formBody}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <User size={20} color="#FF9500" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#999999"
                      value={emailOrUsername}
                      onChangeText={(text) => {
                        setEmailOrUsername(text);
                        if (errors.emailOrUsername) {
                          setErrors(prev => ({ ...prev, emailOrUsername: null }));
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                    />
                  </View>
                  <View style={[styles.inputUnderline, errors.emailOrUsername && styles.inputUnderlineError]} />
                  {errors.emailOrUsername && <Text style={styles.errorText}>{errors.emailOrUsername}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#FF9500" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#999999"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: null }));
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#999999" />
                      ) : (
                        <Eye size={20} color="#999999" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.inputUnderline, errors.password && styles.inputUnderlineError]} />
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    accessibilityLabel="Remember me"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity accessibilityLabel="Forgot password">
                    <Text style={styles.forgotLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, loading && styles.signInButtonLoading]}
                  onPress={handleSignIn}
                  disabled={loading}
                  accessibilityLabel="Sign in"
                  accessibilityRole="button"
                >
                  <View style={styles.buttonContent}>
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinner} />
                        <Text style={styles.buttonText}>Signing in...</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Sign In</Text>
                        <ChevronRight size={20} color="#1a1a1a" />
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.socialButton, 
                      googleLoading && styles.socialButtonLoading
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={googleLoading}
                    accessibilityLabel="Continue with Google"
                    accessibilityRole="button"
                  >
                    <View style={styles.socialButtonContent}>
                      {googleLoading ? (
                        <View style={styles.loadingContainer}>
                          <View style={styles.loadingSpinner} />
                          <Text style={styles.socialButtonText}>Signing in...</Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.googleIcon}>G</Text>
                          <Text style={styles.socialButtonText}>
                            Continue with Google
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <TouchableOpacity accessibilityLabel="Sign up">
                <Text style={styles.footerLink}>Sign up here</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Welcome Message Overlay */}
      {showWelcome && (
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeMessage}>
              Hello, <Text style={styles.usernameText}>{username}</Text>! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              You've successfully signed in to your account.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  headerSection: {
    height: screenHeight * 0.4,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
  accentCircle1: {
    position: 'absolute',
    top: 60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  accentCircle2: {
    position: 'absolute',
    bottom: 20,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.15)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandAccent: {
    color: '#FF9500',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '500',
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -40,
    zIndex: 3,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  formBody: {
    gap: 24,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  inputUnderline: {
    height: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 1,
  },
  inputUnderlineError: {
    backgroundColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#FF9500',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signInButtonLoading: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: 10,
    marginRight: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonLoading: {
    opacity: 0.7,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  footerLink: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '700',
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
    maxWidth: screenWidth * 0.85,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  usernameText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
});