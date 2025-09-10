import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  // Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
// Safe area is handled globally in app/_layout.js
import { Eye, EyeOff, Mail, Lock, ChevronRight, Zap, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './services/authService';
import { registerForPushNotificationsAsync } from './utils/notifications';
// Production Google Sign-In implementation with Expo Go fallback
let GoogleSignin = null;

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.warn('Google Sign-In not available in Expo Go:', error.message);
  // GoogleSignin will remain null for Expo Go
}

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
          webClientId: '334297696005-or01n201vocu6rpnpchvstruijoq7aut.apps.googleusercontent.com',
          offlineAccess: true,
          hostedDomain: '',
          forceCodeForRefreshToken: true,
          scopes: ['profile', 'email'],
        });
        console.log('✅ Google Sign-In configured successfully');
        console.log('🔍 Configuration details:', {
          webClientId: '334297696005-or01n201vocu6rpnpchvstruijoq7aut.apps.googleusercontent.com',
          offlineAccess: true,
          scopes: ['profile', 'email']
        });
      } catch (error) {
        console.error('❌ Google Sign-In configuration failed:', error);
      }
    } else {
      console.warn('⚠️ GoogleSignin is not available - this might indicate a configuration issue');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/LiveChat');
    }
  }, [isAuthenticated, isLoading, router]);

  // Animation refs
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideUpAnim = useRef(new Animated.Value(50)).current;
  // const slideLeftAnim = useRef(new Animated.Value(30)).current;
  // const scaleAnim = useRef(new Animated.Value(0.9)).current;
  // const buttonScale = useRef(new Animated.Value(1)).current;
  // const pulseAnim = useRef(new Animated.Value(1)).current;

  // useEffect(() => {
  //   // Staggered animations
  //   Animated.stagger(200, [
  //     Animated.parallel([
  //       Animated.timing(fadeAnim, {
  //         toValue: 1,
  //         duration: 800,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(slideUpAnim, {
  //         toValue: 0,
  //         duration: 600,
  //         useNativeDriver: true,
  //       }),
  //     ]),
  //     Animated.timing(slideLeftAnim, {
  //       toValue: 0,
  //       duration: 600,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(scaleAnim, {
  //       toValue: 1,
  //       tension: 20,
  //       friction: 8,
  //       useNativeDriver: true,
  //     }),
  //   ])
  // ).start();

  //   // Continuous pulse animation for accent elements
  //   const pulse = Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(pulseAnim, {
  //         toValue: 1.1,
  //         duration: 2000,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(pulseAnim, {
  //         toValue: 1,
  //         duration: 2000,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );
  //   pulse.start();
  // }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
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
      
      const loginData = {
        email: emailOrUsername.trim(),
        password: password,
        device_token: deviceToken, // Send the Expo push token as device_token (null if not available)
      };
      
  
      const res = await authAPI.login(loginData);

      const token =
        res.token ||
        res.accessToken ||
        res.data?.token ||
        res.access_token ||
        res.data?.access_token;

      const name = res.user?.name || res.user?.username || emailOrUsername.trim();

      // Use AuthContext to handle login
      const loginResult = await login(loginData, res);
      
      if (loginResult.success) {
        setUsername(name);
        setShowWelcome(true);

        setTimeout(() => {
          setShowWelcome(false);
          // Navigate to livechat after successful login
          router.replace('/(tabs)/LiveChat');
        }, 2000);
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      // Check if Google Sign-In is available
      if (!GoogleSignin) {
        Alert.alert(
          'Google Sign-In Not Available',
          'Google Sign-In requires a development build to work properly. Please build the app using EAS Build to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Check if Google Play Services are available
      console.log('🔐 Checking Google Play Services...');
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services available');
      
      // Additional debugging for configuration
      console.log('🔍 Google Sign-In configuration check:');
      console.log('🔍 Package name from app.json:', 'com.echoleads.EchoLeads');
      console.log('🔍 Web client ID:', '334297696005-or01n201vocu6rpnpchvstruijoq7aut.apps.googleusercontent.com');
      
      // Get device token for push notifications
      console.log('🔐 Getting device token...');
      const deviceToken = await registerForPushNotificationsAsync();
      console.log('✅ Device token received:', deviceToken ? 'Yes' : 'No');
      
      // Sign in with Google
      console.log('🔐 Initiating Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful, user info received');
      console.log('🔍 User info details:', {
        hasIdToken: !!userInfo.idToken,
        hasAccessToken: !!userInfo.accessToken,
        hasUser: !!userInfo.user,
        userEmail: userInfo.user?.email,
        userName: userInfo.user?.name
      });
      
      // Get the ID token
      let googleToken = userInfo.idToken;
      
      // Fallback: try to get token from different properties
      if (!googleToken) {
        console.warn('⚠️ idToken not found, trying alternative properties...');
        googleToken = userInfo.data?.idToken || userInfo.token || userInfo.accessToken;
        console.log('🔍 Alternative token found:', !!googleToken);
      }
      
      if (!googleToken) {
        console.error('❌ No Google ID token received');
        console.error('❌ Full userInfo object:', JSON.stringify(userInfo, null, 2));
        console.error('❌ Available properties:', Object.keys(userInfo));
        throw new Error('No Google ID token received');
      }
      console.log('✅ Google ID token received, length:', googleToken.length);
      
      // Call the Google login API
      const res = await authAPI.googleLogin(googleToken, deviceToken);
      
      const name = res.user?.name || res.user?.username || userInfo.user.name || 'User';
      
      // Use AuthContext to handle login
      const loginResult = await login({ googleToken, deviceToken }, res);
      
      if (loginResult.success) {
        setUsername(name);
        setShowWelcome(true);
  
        setTimeout(() => {
          setShowWelcome(false);
          router.replace('/(tabs)/LiveChat');
        }, 2000);
      } else {
        throw new Error(loginResult.error || 'Google login failed');
      }
    } catch (error) {
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Google sign-in was cancelled.';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Google sign-in is already in progress.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available.';
      } else if (error.code === 'DEVELOPER_ERROR') {
        errorMessage = 'Configuration error. This usually means the app needs to be rebuilt after configuration changes.';
        console.error('❌ DEVELOPER_ERROR details:', {
          code: error.code,
          message: error.message,
          suggestion: 'Try rebuilding the app with: npx eas build --profile development --platform android'
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Google Sign-In Error Details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };



  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 16
          }}>
            Checking authentication...
          </Text>
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
          <View 
            style={[
              styles.headerSection,
              {
                opacity: 1,
                transform: [{ translateY: 0 }]
              }
            ]}
          >
            <View style={styles.headerBackground}>
              <View 
                style={[
                  styles.accentCircle1,
                  {
                    transform: [{ scale: 1 }]
                  }
                ]}
              />
              <View 
                style={[
                  styles.accentCircle2,
                  {
                    transform: [{ scale: 1.1 }]
                  }
                ]}
              />
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
          <View 
            style={[
              styles.formSection,
              {
                opacity: 1,
                transform: [
                  { translateX: 0 },
                  { scale: 1 }
                ]
              }
            ]}
          >
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
                      onChangeText={setEmailOrUsername}
                      keyboardType="email-address"
                      autoCapitalize="none"
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
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
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
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.forgotLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <View style={{ transform: [{ scale: 1 }] }}>
                  <TouchableOpacity
                    style={[styles.signInButton, loading && styles.signInButtonLoading]}
                    onPress={handleSignIn}
                    disabled={loading}
                  >
                    <View style={styles.buttonContent}>
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <View 
                            style={[
                              styles.loadingSpinner,
                              {
                                transform: [{
                                  rotate: '0deg'
                                }]
                              }
                            ]}
                          />
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
                </View>

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
          <View 
            style={[
              styles.footer,
              {
                opacity: 0.8
              }
            ]}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up here</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Welcome Message Overlay */}
      {showWelcome && (
        <View 
          style={[
            styles.welcomeOverlay,
            {
              opacity: 1,
              transform: [{ scale: 1 }]
            }
          ]}
        >
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
  brandIcon: {
    marginRight: 12,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1a1a1a',
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
  socialButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
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
  disabledText: {
    color: '#999999',
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
  welcomeIcon: {
    marginBottom: 16,
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