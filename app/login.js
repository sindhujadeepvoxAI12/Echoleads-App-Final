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
  Platform
} from 'react-native';
// Safe area is handled globally in app/_layout.js
import { Eye, EyeOff, Mail, Lock, ChevronRight, Zap, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './services/authService';
import { registerForPushNotificationsAsync } from './utils/notifications';

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

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('🔐 Login: User already authenticated, redirecting to livechat');
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
      console.log('🔐 Login: Attempting to get device token...');
      const deviceToken = await registerForPushNotificationsAsync();
      console.log('🔐 Login: Device token received:', deviceToken);
      console.log('🔐 Login: Device token type:', typeof deviceToken);
      console.log('🔐 Login: Device token length:', deviceToken ? deviceToken.length : 0);
      console.log('🔐 Login: Device token preview:', deviceToken ? `${deviceToken.substring(0, 50)}...` : 'null');
      
      const loginData = {
        email: emailOrUsername.trim(),
        password: password,
        device_token: deviceToken, // Send the Expo push token as device_token (null if not available)
      };
      
      console.log('🔐 Login: Sending login data:', {
        email: loginData.email,
        password: loginData.password ? '***' : 'undefined',
        device_token: loginData.device_token ? `${loginData.device_token.substring(0, 20)}...` : 'empty'
      });
  
      const res = await authAPI.login(loginData);
      console.log('Login response:', JSON.stringify(res));

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
                {/* <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Continue with Apple</Text>
                  </TouchableOpacity>
                </View> */}
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
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
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