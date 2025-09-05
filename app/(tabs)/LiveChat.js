// app/(tabs)/LiveChat.js - WhatsApp-like Chat Interface with AI Agent
// Professional chat UI with AI agent functionality and role-based access

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList,
  Switch,
  LinearGradient,
  Alert,
  ActivityIndicator,
  Keyboard,
  RefreshControl
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons
} from '@expo/vector-icons';
import {
  Send,
  Mic,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  ArrowLeft,
  Bot,
  User,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  MessageCircle,
  Users,
  Zap,
  Cpu,
  Brain,
  Smartphone,
  MessageSquare,
  AlertCircle,
  X,
  Trash2,
  Eraser
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { chatAPI } from '../services/chatService';
import { authAPI } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
// Removed WhatsAppMessagingManager UI import to run 24h logic in background only
import io, { Socket } from "socket.io-client";
import { registerForPushNotificationsAsync, sendNewMessageNotification } from '../utils/notifications';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to get relative time
const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}w ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format date like "Thursday 24th April 2025"
const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const day = date.getDate();
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Add ordinal suffix to day
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName} ${year}`;
};

// No mock data - using only API data

// Helper to format timestamps consistently
const formatTimestamp = (input) => {
  try {
    const date = input instanceof Date ? input : new Date(input);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
};

// Chat List Item Component
const ChatListItem = ({ chat, isSelected, onPress, isAdmin, index }) => {





  //   // Card glow animation
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(cardGlowAnim, {
  //         toValue: 1,
  //         duration: 2000,
  //         useNativeDriver: true,
  //       }),
  //         Animated.timing(cardGlowAnim, {
  //           toValue: 0,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();

  //   // Subtle rotation animation
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(rotateAnim, {
  //         toValue: 1,
  //         duration: 3000,
  //         useNativeDriver: true,
  //       }),
  //         Animated.timing(rotateAnim, {
  //           toValue: 0,
  //           duration: 3000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();

  //   // Enhanced shadow animation for 3D effect
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(depthAnim, {
  //         toValue: 1,
  //         duration: 2000,
  //         useNativeDriver: true,
  //       }),
  //         Animated.timing(depthAnim, {
  //           toValue: 0,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  // }, []);

  return (
    <View
      style={[
        styles.chatListItemContainer,
        {
          opacity: 1,
          transform: [
            { scale: 1 },
            { translateY: 0 },
            {
              rotate: '0deg'
            }
          ]
        }
      ]}
    >
      <View
        style={[
          styles.chatCardGlow,
          {
            opacity: 0,
            transform: [{ scale: 1 }],
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }
        ]}
      />
      <TouchableOpacity
        style={[styles.chatListItem, isSelected && styles.selectedChatItem]}
        onPress={() => onPress(chat)}
        activeOpacity={0.7}
      >
        <ExpoLinearGradient
          colors={['#FF9500', '#FF6B35', '#FF4500']}
          style={styles.chatAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{chat.avatar}</Text>
        </ExpoLinearGradient>

        <View style={styles.chatInfo}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">{chat.name}</Text>
          </View>
          <View style={styles.cardSecondRow}>
            <Text style={styles.cardPhone} numberOfLines={1} ellipsizeMode="tail">
              {chat.phone}
            </Text>
            <Text style={styles.cardTimestamp} numberOfLines={1} ellipsizeMode="tail">{formatDate(chat.lastMessageTime)}</Text>
          </View>
          <Text style={styles.cardLastMessage} numberOfLines={1} ellipsizeMode="tail">{chat.lastMessage}</Text>
        </View>

        {chat.unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { transform: [{ scale: 1 }] }
            ]}
          >
            <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Chat Header Component
const ChatHeader = ({ chat, isAdmin, globalAgentEnabled, onToggleGlobalAgent, onBack, onClearChat }) => {
  const [showMenu, setShowMenu] = useState(false);

  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 400,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(scaleAnim, {
  //       toValue: 1,
  //       tension: 100,
  //       friction: 8,
  //       useNativeDriver: true,
  //       }),
  //   ]).start();

  //   // Gradient animation
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(gradientAnim, {
  //         toValue: 1,
  //         duration: 3000,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(gradientAnim, {
  //         toValue: 0,
  //         duration: 3000,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   ).start();

  //   // Glow animation for AI toggle
  //   if (globalAgentEnabled) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(glowAnim, {
  //           toValue: 1,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(glowAnim, {
  //           toValue: 0,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  //   }
  // }, [globalAgentEnabled]);





  return (
    <View
      style={[
        styles.chatHeader,
        {
          opacity: 1,
          transform: [
            { translateX: 0 },
            { scale: 1 }
          ]
        }
      ]}
    >
      <ExpoLinearGradient
        colors={['#FF9500', '#FF6B35', '#FF4500', '#FF2D00']}
        style={styles.headerGradientFull}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <ExpoLinearGradient
            colors={['#FF9500', '#FF6B35', '#FF4500']}
            style={styles.headerAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerAvatarText}>{chat?.avatar}</Text>
          </ExpoLinearGradient>

          <View style={styles.headerText}>
            <Text style={styles.headerName}>{chat?.name}</Text>
            <Text style={styles.headerPhone} numberOfLines={1} ellipsizeMode="tail">
              {chat?.phone}
            </Text>

          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Removed refresh button per request */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Menu Dropdown */}
        {showMenu && (
          <>
            <TouchableOpacity
              style={styles.menuOverlay}
              onPress={() => setShowMenu(false)}
              activeOpacity={0}
            />
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); onClearChat && onClearChat(); }}
              >
                <Eraser size={16} color="#FF3B30" />
                <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Clear Chat History</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ExpoLinearGradient>
    </View>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isUser, index }) => {
  // console.log('🔍 MessageBubble: Rendering message:', {
  //   index,
  //   id: message.id,
  //   text: message.text?.substring(0, 30),
  //   sender: message.sender,
  //   isUser,
  //   status: message.status,
  //   isAI: message.isAI
  // });

  // Determine message positioning based on sender
  const isUserMessage = message.sender === 'user'; // RIGHT side (system/bot messages)
  const isReceivedMessage = message.sender === 'received'; // LEFT side (user/customer messages)



  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.spring(scaleAnim, {
  //       toValue: 1,
  //       tension: 100,
  //       friction: 8,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(opacityAnim, {
  //       toValue: 1,
  //       duration: 300 + (index * 50),
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 400 + (index * 50),
  //       useNativeDriver: true,
  //     }),
  //   ]).start();

  //   // Bounce animation
  //   Animated.sequence([
  //     Animated.timing(bounceAnim, {
  //       toValue: 1,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(bounceAnim, {
  //       toValue: 0,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();

  //   // Card glow animation
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(cardGlowAnim, {
  //         toValue: 1,
  //         duration: 3000,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(cardGlowAnim, {
  //         toValue: 0,
  //       duration: 3000,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   ).start();

  //   // Glow animation for AI messages
  //   if (message.isAI) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(glowAnim, {
  //           toValue: 1,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //       Animated.timing(glowAnim, {
  //         toValue: 0,
  //         duration: 2000,
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   ).start();
  //   }
  // }, []);

  const renderStatusIcon = () => {
    if (message.status === 'sending') {
      return <ActivityIndicator size={12} color="#8E8E93" />;
    } else if (message.status === 'sent') {
      return <Check size={12} color="#8E8E93" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck size={12} color="#8E8E93" />;
    } else if (message.status === 'read') {
      return <CheckCheck size={12} color="#34C759" />;
    } else {
      return <Clock size={12} color="#8E8E93" />;
    }
  };

  // console.log('🔍 MessageBubble: Final positioning decision:', {
  //   index,
  //   text: message.text?.substring(0, 30),
  //   sender: message.sender,
  //   isUserMessage,
  //   isReceivedMessage,
  //   willShowOnRight: isUserMessage,
  //   willShowOnLeft: isReceivedMessage
  // });

  return (
    <View
      style={[
        styles.messageContainer,
        {
          opacity: 1,
          transform: [
            { scale: 1 },
            { translateX: 0 },
            {
              translateY: 0
            }
          ]
        }
      ]}
    >
      <View
        style={[
          styles.messageCardGlow,
          {
            opacity: 0,
            transform: [{ scale: 1 }]
          }
        ]}
      />
      <View style={[
        styles.messageBubble,
        isUserMessage ? styles.userMessage : styles.agentMessage
      ]}>
        {/* {console.log('🔍 MessageBubble: Applied styles:', {
          baseStyle: 'messageBubble',
          conditionalStyle: isUserMessage ? 'userMessage' : 'agentMessage',
          finalStyles: [styles.messageBubble, isUserMessage ? styles.userMessage : styles.agentMessage]
        })} */}
        {/* AI Icon Logic: Only show for system/agent messages that were sent when AI agent was enabled */}
        {message.isAI === true && message.aiStatusAtSend === true && isUserMessage && (
          <View
            style={[
              styles.aiIndicator,
              {
                shadowOpacity: 0.5,
                shadowRadius: 4,
              }
            ]}
          >
            <ExpoLinearGradient
              colors={['#FF9500', '#FF6B35', '#FF4500']}
              style={styles.aiIndicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Bot size={12} color="#fff" />
            </ExpoLinearGradient>
          </View>
        )}

        <Text style={[
          styles.messageText,
          isUserMessage ? styles.userMessageText : styles.agentMessageText
        ]}>
          {message.text}
        </Text>

        {/* File Attachments Display */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentItem}>
                <Text style={styles.attachmentTypeLabel}>
                  {attachment.type === 'image' ? 'IMG' :
                    attachment.type === 'folder' ? 'FOLDER' : 'FILE'}
                </Text>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1} ellipsizeMode="tail">
                    {attachment.name}
                  </Text>
                  <Text style={styles.attachmentSize}>
                    {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isUserMessage ? styles.userTimestamp : styles.agentTimestamp
          ]}>
            {message.timestamp}
          </Text>
          {isUserMessage && (
            <View style={styles.statusContainer}>
              {renderStatusIcon()}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Agent Notification Component
const AgentNotification = ({ visible, message, onClose }) => {

  // useEffect(() => {
  //   if (visible) {
  //     Animated.parallel([
  //       Animated.spring(slideAnim, {
  //         toValue: 0,
  //         tension: 100,
  //         friction: 8,
  //         useNativeDriver: true,
  //       }),
  //       Animated.spring(scaleAnim, {
  //         toValue: 1,
  //         tension: 100,
  //         friction: 8,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(opacityAnim, {
  //         toValue: 1,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   } else {
  //     Animated.parallel([
  //       Animated.timing(slideAnim, {
  //         toValue: -100,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(scaleAnim, {
  //         toValue: 0.8,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(opacityAnim, {
  //         toValue: 0,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   }
  // }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.agentNotification,
        {
          opacity: 1,
          transform: [
            { translateY: 0 },
            { scale: 1 }
          ]
        }
      ]}
    >
      <ExpoLinearGradient
        colors={['#FF9500', '#FF6B35', '#FF4500']}
        style={styles.notificationGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AlertCircle size={20} color="#fff" style={styles.notificationIcon} />
        <Text style={styles.notificationText}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.notificationClose}>
          <X size={16} color="#fff" />
        </TouchableOpacity>
      </ExpoLinearGradient>
    </View>
  );
};

// Chat Input State - These will be moved inside the LiveChatScreen component

// File attachment functions and other functions will be moved inside the LiveChatScreen component

// Main LiveChat Screen
const LiveChatScreen = () => {
  const [chats, setChats] = useState([]);
  console.log(chats, "chats>>")
  const [selectedChat, setSelectedChat] = useState(null);
  console.log(selectedChat, "selectedChat>>")
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' or 'mine'
  const [isAdmin, setIsAdmin] = useState(true); // Change this to false for regular users
  const [searchQuery, setSearchQuery] = useState('');
  const [showAgentNotification, setShowAgentNotification] = useState(false);
  const [agentNotificationMessage, setAgentNotificationMessage] = useState('');
  const [globalAgentEnabled, setGlobalAgentEnabled] = useState(false); // Will be loaded from AsyncStorage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Add new state for AI agent status
  const [aiAgentStatus, setAiAgentStatus] = useState('inactive'); // Will be loaded from AsyncStorage
  const [updatingAgent, setUpdatingAgent] = useState(false);

  // Add missing state variables
  // Removed newMessageCount state per request
  // Removed lastRefreshTime state per request

  // Add app state tracking
  const [appState, setAppState] = useState(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  // Add mounted state to prevent unnecessary redirects
  const [isMounted, setIsMounted] = useState(false);

  // Add state to track if data has been loaded successfully
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // WhatsApp Messaging Manager state removed (background-only behavior)


  const lastMessageCountRef = useRef(0); // Track last message count for smart refresh
  const notificationTimerRef = useRef(null); // For showing notifications

  // Chat Input State
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [messageType, setMessageType] = useState('text'); // 'text', 'image', 'file', 'folder'
  const inputRef = useRef(null);



  // Handle app state changes (background/foreground)
  const handleAppStateChange = async (nextAppState) => {
    console.log('📱 App state changed:', {
      from: appStateRef.current,
      to: nextAppState,
      currentSelectedChat: selectedChat ? 'Yes' : 'No'
    });


    if (nextAppState.match(/inactive|background/)) {
      console.log('📱 App going to background');

      try {
        // Save current AI agent status when going to background
        await AsyncStorage.setItem('liveChatState', JSON.stringify({
          wasInChat: !!selectedChat,
          timestamp: Date.now(),
          aiAgentStatus: aiAgentStatus,
          globalAgentEnabled: globalAgentEnabled
        }));
        
        // Note: Removed automatic AI agent enabling when app goes to background
        // The AI agent status should only be changed by user interaction via toggle
      } catch (error) {
        console.log('📱 Error saving app state:', error);
      }
    }

    // If app is coming back to foreground, check token and refresh if needed
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App returned to foreground');

      // Note: Removed automatic AI agent enabling when app comes to foreground
      // The AI agent status should only be changed by user interaction via toggle

      // Only check authentication if component is mounted
      if (!isMounted) {
        console.log('📱 App returned to foreground - component not mounted yet, skipping auth check');
        return;
      }

      // If we've already loaded data successfully, don't check auth again
      if (hasLoadedData) {
        console.log('📱 App returned to foreground - data already loaded, skipping auth check');
        return;
      }

      try {
        console.log('📱 App returned to foreground - checking authentication...');

        // Check if we have any stored token at all
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!storedToken) {
          console.log('📱 App returned to foreground - no stored token, redirecting to login');
          router.replace('/login');
          return;
        }

        // Try to get a valid token (this will attempt refresh if needed)
        const token = await authAPI.getValidToken();
        if (token) {
          console.log('📱 App returned to foreground - token is valid');
          // Update unread counts when app comes to foreground
          await updateUnreadCounts();
        } else {
          console.log('📱 App returned to foreground - could not get valid token, but will try to proceed');
          // Don't immediately redirect, try to update unread counts anyway
          try {
            await updateUnreadCounts();
          } catch (updateError) {
            console.log('📱 App returned to foreground - update failed, but not redirecting yet');
            // Only redirect if there's a clear authentication error
            if (updateError.requiresAuth) {
              router.replace('/login');
            }
          }
        }

        const savedState = await AsyncStorage.getItem('liveChatState');
        if (savedState) {
          const state = JSON.parse(savedState);
          console.log('📱 Restored app state:', state);

          // Removed stale chat refresh logic per request
        }
      } catch (error) {
        console.log('📱 Error handling foreground return:', error);
        // Don't immediately redirect on error, just log it
        console.log('📱 App returned to foreground - error occurred but continuing');
      }
    }

    appStateRef.current = nextAppState;
    setAppState(nextAppState);
  };





  // Enhanced notification display function
  const displayAgentNotification = (message, duration = 3000) => {
    setAgentNotificationMessage(message);
    setShowAgentNotification(true);
    setTimeout(() => setShowAgentNotification(false), duration);
  };

  // Function to enable AI agent in background without UI updates
  const enableAIAgentInBackground = async () => {
    try {
      console.log('🤖 enableAIAgentInBackground: Enabling AI agent in background...');
      
      // Call the API to enable AI agent
      const response = await chatAPI.updateAIAgentStatus('active');
      
      if (response && (
        response.status === true ||
        response.status === 'success' ||
        response.message ||
        response.data ||
        response.disable_ai_agent !== undefined ||
        response.fallback === true
      )) {
        // Update local state silently
        setGlobalAgentEnabled(true);
        setAiAgentStatus('active');
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('aiAgentStatus', 'active');
        
        // Update UI state
        updateChatsAgentStatus(true);
        
        console.log('🤖 enableAIAgentInBackground: AI agent enabled successfully in background');
      }
    } catch (error) {
      console.error('❌ enableAIAgentInBackground: Error enabling AI agent in background:', error);
    }
  };

  // Function to ensure AI agent is enabled (for app startup and foreground)
  const ensureAIAgentEnabled = async () => {
    try {
      console.log('🤖 ensureAIAgentEnabled: Ensuring AI agent is enabled...');
      
      // Check current status
      if (globalAgentEnabled && aiAgentStatus === 'active') {
        console.log('🤖 ensureAIAgentEnabled: AI agent already enabled, skipping');
        return;
      }
      
      // Enable AI agent
      await enableAIAgentInBackground();
      
      console.log('🤖 ensureAIAgentEnabled: AI agent status ensured');
    } catch (error) {
      console.error('❌ ensureAIAgentEnabled: Error ensuring AI agent enabled:', error);
    }
  };



  // Manual refresh function with authentication check
  const handleManualRefresh = async () => {
    try {
      console.log('🔄 LiveChat: Manual refresh triggered');
      setLoading(true);
      setError(null);

      // Check if we have any stored token at all
      const storedToken = await AsyncStorage.getItem('authToken');
      if (!storedToken) {
        console.error('❌ LiveChat: No stored token for manual refresh');
        Alert.alert(
          'Authentication Required',
          'Please log in to continue.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/login');
              }
            }
          ]
        );
        return;
      }

      // Try to refresh chat list and AI agent status
      try {
        await fetchChatList();
        await fetchAIAgentStatus();

        console.log('✅ LiveChat: Manual refresh completed successfully');
        // displayAgentNotification('Chat list refreshed successfully', 2000);
      } catch (fetchError) {
        // Handle authentication errors specifically
        if (fetchError.requiresAuth) {
          Alert.alert(
            'Authentication Required',
            'Your session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  AsyncStorage.removeItem('authToken');
                  AsyncStorage.removeItem('tokenExpiresAt');
                  AsyncStorage.removeItem('userCredentials');
                  router.replace('/login');
                }
              }
            ]
          );
        } else {
          console.error('❌ LiveChat: Manual refresh failed:', fetchError);
          setError('Refresh failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ LiveChat: Manual refresh failed:', error);
      setError('Refresh failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Smart background refresh function
  const smartBackgroundRefresh = async (isBackground = false) => {
    try {
      if (isBackground) {
        setBackgroundLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Smart refresh: Starting background refresh...');
      const response = await chatAPI.getChatList();
      console.log('🔄 Smart refresh: Raw API response:', response);

      // Check for authentication errors
      if (response && response.requiresAuth) {
        console.error('❌ Smart refresh: Authentication required, redirecting to login');
        if (!isBackground) {
          Alert.alert(
            'Authentication Required',
            'Your session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Clear any stored credentials
                  AsyncStorage.removeItem('authToken');
                  AsyncStorage.removeItem('tokenExpiresAt');
                  AsyncStorage.removeItem('userCredentials');
                  // Redirect to login
                  router.replace('/login');
                }
              }
            ]
          );
        }
        return;
      }

      // Transform API response to match your existing chat structure
      const transformedChats = response.data || response.chats || response || [];
      console.log('🔄 Smart refresh: Transformed chats:', transformedChats);

      // Ensure we have an array and filter out invalid items
      const validChats = Array.isArray(transformedChats) ? transformedChats.filter(chat => {
        const hasValidId = chat && (chat.id || chat.chat_id || chat.uid);
        return hasValidId;
      }) : [];

      console.log('🔄 Smart refresh: Valid chats count:', validChats.length);

      // Map API data to your chat structure
      const mappedChats = validChats.map((chat, index) => {
        // Preserve the original UID for API calls
        const originalUid = chat.uid || chat.chat_id || chat.id;

        const mappedChat = {
          id: originalUid, // Use UID as the primary ID
          uid: originalUid, // Keep UID separate for clarity
          chat_id: chat.chat_id || chat.id, // Keep original chat_id if different
          name: chat.first_name && chat.last_name ? `${chat.first_name} ${chat.last_name}`.trim() :
            chat.name || chat.customer_name || chat.contact_name || 'Unknown',
          phone: chat.phone || chat.phone_number || chat.contact_number || 'N/A',
          avatar: (chat.first_name && chat.last_name ? `${chat.first_name} ${chat.last_name}`.trim() :
            chat.name || chat.customer_name || chat.contact_name || 'U').substring(0, 2).toUpperCase(),
          lastMessage: chat.last_message?.message || chat.recent_message || 'No messages yet',
          lastMessageTime: chat.last_message?.created_at ? new Date(chat.last_message.created_at) :
            chat.last_message_time ? new Date(chat.last_message_time) : new Date(),
          unreadCount: chat.unread_count || chat.unread_messages || 0,
          isMine: chat.is_mine || chat.assigned_to_me || false,
          agentEnabled: chat.agent_enabled || chat.ai_enabled || true,
          messages: chat.messages || []
        };

        return mappedChat;
      });

      console.log('🔄 Smart refresh: Final mapped chats:', mappedChats);

      // Only update state if we have chats or if this is not a background refresh
      if (mappedChats.length > 0 || !isBackground) {
        setChats(mappedChats);
        console.log('✅ Smart refresh: Successfully set', mappedChats.length, 'chats');
      } else {
        console.log('🔄 Smart refresh: No new chats in background refresh, keeping existing data');
      }

      // Mark that data has been loaded successfully
      setHasLoadedData(true);
      setLastRefreshTime(Date.now());

    } catch (error) {
      console.error('❌ Smart refresh: Error:', error);
      if (!isBackground) {
        setError('Failed to load chats. Please try again.');
        setChats([]);
      }
    } finally {
      if (isBackground) {
        setBackgroundLoading(false);
      } else {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  // Fetch chat list from API (wrapper for backward compatibility)
  const fetchChatList = async () => {
    return smartBackgroundRefresh(false);
  };



  // Load initial AI agent status from AsyncStorage
  const loadInitialAIAgentStatus = async () => {
    try {
      const storedStatus = await AsyncStorage.getItem('aiAgentStatus');
      if (storedStatus) {
        console.log('🔧 loadInitialAIAgentStatus: Loading stored status:', storedStatus);
        setAiAgentStatus(storedStatus);
        setGlobalAgentEnabled(storedStatus === 'active');
      } else {
        console.log('🔧 loadInitialAIAgentStatus: No stored status, setting AI agent to inactive by default');
        // Set AI agent to inactive by default - user can enable it manually via toggle
        setAiAgentStatus('inactive');
        setGlobalAgentEnabled(false);
        await AsyncStorage.setItem('aiAgentStatus', 'inactive');
      }
    } catch (error) {
      console.error('❌ Error loading initial AI agent status:', error);
      // On error, set AI agent to inactive by default - user can enable it manually
      setAiAgentStatus('inactive');
      setGlobalAgentEnabled(false);
      try {
        await AsyncStorage.setItem('aiAgentStatus', 'inactive');
      } catch (storageError) {
        console.error('❌ Error storing default AI agent status:', storageError);
      }
    }
  };

  // Add this function after your existing functions
  const fetchAIAgentStatus = async () => {
    try {
      console.log('🔧 fetchAIAgentStatus: Checking AI agent status...');

      // First check if we already have a valid status and don't need to fetch
      if (aiAgentStatus === 'active' || aiAgentStatus === 'inactive') {
        console.log('🔧 fetchAIAgentStatus: Current status is valid, skipping API call to preserve user setting');
        setIsInitialized(true);
        return;
      }

      // Check if we have a stored status first
      const storedStatus = await AsyncStorage.getItem('aiAgentStatus');
      if (storedStatus) {
        console.log('🔧 fetchAIAgentStatus: Using stored status, skipping API call:', storedStatus);
        setAiAgentStatus(storedStatus);
        setGlobalAgentEnabled(storedStatus === 'active');
        setIsInitialized(true);
        return;
      }

      // If no stored status, set AI agent to inactive by default
      console.log('🔧 fetchAIAgentStatus: No stored status, setting AI agent to inactive by default');
      setAiAgentStatus('inactive');
      setGlobalAgentEnabled(false);
      await AsyncStorage.setItem('aiAgentStatus', 'inactive');
      setIsInitialized(true);
      return;

      // First try to get status from API
      try {
        const response = await chatAPI.getAIAgentStatus();
        console.log('🔧 fetchAIAgentStatus: API response:', response);

        if (response && response.status) {
          const newStatus = response.status;
          console.log('🔧 fetchAIAgentStatus: Setting status from API:', newStatus);

          // Check if this is a fallback response
          if (response.rawData && response.rawData.fallback) {
            console.log('🔧 fetchAIAgentStatus: Using fallback status from API');
          }

          // Update local state
          setAiAgentStatus(newStatus);
          setGlobalAgentEnabled(newStatus === 'active');

          // Update UI state
          updateChatsAgentStatus(newStatus === 'active');

          // Store in AsyncStorage for offline use
          await AsyncStorage.setItem('aiAgentStatus', newStatus);

          console.log('🔧 fetchAIAgentStatus: Status updated successfully');
          return;
        }
      } catch (apiError) {
        console.log('🔧 fetchAIAgentStatus: API call failed, falling back to stored status:', apiError.message);
      }

      // Fallback to stored status if API fails
      const fallbackStatus = await AsyncStorage.getItem('aiAgentStatus');
      if (fallbackStatus) {
        console.log('🔧 fetchAIAgentStatus: Using stored status:', fallbackStatus);
        setAiAgentStatus(fallbackStatus);
        setGlobalAgentEnabled(fallbackStatus === 'active');
      } else {
        // Default to inactive if no stored status (first time loading)
        console.log('🔧 fetchAIAgentStatus: No stored status, defaulting to inactive');
        setAiAgentStatus('inactive');
        setGlobalAgentEnabled(false);
        await AsyncStorage.setItem('aiAgentStatus', 'inactive');
      }
    } catch (error) {
      console.error('❌ Error fetching AI agent status:', error);
      // Set default values on error - use inactive as safer default
      setAiAgentStatus('inactive');
      setGlobalAgentEnabled(false);
    } finally {
      // Mark as initialized to allow reclassification
      setIsInitialized(true);
    }
  };

  // Fetch chat list on component mount
  useEffect(() => {
    console.log('🚀 LiveChat: Component mounted, chatAPI available:', !!chatAPI);
    console.log('🚀 LiveChat: chatAPI methods:', Object.keys(chatAPI || {}));

    // Load initial AI agent status from AsyncStorage first
    loadInitialAIAgentStatus();

    // Check authentication status first - be less aggressive
    const checkAuthAndFetch = async () => {
      try {
        console.log('🚀 LiveChat: Checking authentication status...');

        // If we've already loaded data successfully, don't check auth again
        if (hasLoadedData) {
          console.log('🚀 LiveChat: Data already loaded successfully, skipping auth check');
          return;
        }

        // First check if we have any stored token at all
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!storedToken) {
          console.log('🚀 LiveChat: No stored token found, redirecting to login...');
          router.replace('/login');
          return;
        }

        // If we have a token, try to fetch data first without checking validity
        // This prevents unnecessary redirects when the token is actually still valid
        try {
          console.log('🚀 LiveChat: Attempting to fetch data with stored token...');
          await fetchChatList();
          await fetchAIAgentStatus();
          console.log('🚀 LiveChat: Data fetched successfully with stored token');
          return; // Success, no need to check token validity
        } catch (fetchError) {
          console.log('🚀 LiveChat: Initial fetch failed, checking token validity...');

          // Only check token validity if the fetch actually failed
          if (fetchError.requiresAuth) {
            console.log('🚀 LiveChat: Authentication error confirmed, redirecting to login...');
            router.replace('/login');
            return;
          }

          // If it's not an auth error, try to get a valid token
          const token = await authAPI.getValidToken();
          if (token) {
            console.log('🚀 LiveChat: Got valid token, retrying fetch...');
            try {
              await fetchChatList();
              await fetchAIAgentStatus();
            } catch (retryError) {
              if (retryError.requiresAuth) {
                router.replace('/login');
              }
            }
          }
        }
      } catch (error) {
        console.error('🚀 LiveChat: Error checking authentication:', error);
        // Don't immediately redirect on error, just log it
        console.log('🚀 LiveChat: Continuing despite error...');
      }
    };

    checkAuthAndFetch();

    // Mark component as mounted
    setIsMounted(true);


    // Set up periodic token refresh (every 10 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        // Only check tokens if component is mounted and data has been loaded
        if (!isMounted || !hasLoadedData) {
          console.log('🔄 LiveChat: Skipping periodic token check - component not ready');
          return;
        }

        console.log('🔄 LiveChat: Periodic token refresh check...');
        const token = await authAPI.getValidToken();
        if (token) {
          console.log('✅ LiveChat: Token is valid, no refresh needed');
        } else {
          console.log('⚠️ LiveChat: No valid token found during periodic check');
        }
      } catch (error) {
        console.error('❌ LiveChat: Error during periodic token check:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Check if we need to reset based on saved app state
    const checkAppStateOnMount = async () => {
      try {
        const savedState = await AsyncStorage.getItem('liveChatState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          const timeSinceBackground = Date.now() - parsedState.timestamp;

          // If app was in background for more than 30 seconds, reset to chat list
          if (timeSinceBackground > 30000) {
            console.log('📱 App was in background for', Math.round(timeSinceBackground / 1000), 'seconds on mount - ensuring chat list view');
            setSelectedChat(null);
            setSearchQuery('');
            setActiveCategory('all');
            setError(null);
          }

          // Clear saved state
          await AsyncStorage.removeItem('liveChatState');
        }
      } catch (error) {
        console.log('📱 Error checking app state on mount:', error);
      }
    };

    checkAppStateOnMount();

    // Add app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function to reset state when component unmounts
    return () => {
      setSelectedChat(null);
      setChats([]);
      setError(null);
      // Remove app state listener
      subscription?.remove();
      // Clear token refresh interval
      clearInterval(tokenRefreshInterval);
      // Clear smart refresh interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);





  // const upsertAndBumpChatFromIncoming = (incoming) => {
  //   console.log(incoming, "incoming>>>")
  //   const incomingUid =
  //     incoming?.uid ||
  //     incoming?.chat_uid ||
  //     selectedChat?.uid ||
  //     uid;

  //   setChats(prev => {
  //     if (!Array.isArray(prev) || prev.length === 0) return prev;

  //     // If chat doesn't exist, do NOT insert — just reorder list to keep current top logic.
  //     const existingIdx = prev.findIndex(c => c?.uid === incomingUid);
  //     if (existingIdx === -1) {
  //       // still optionally lift the uid to top if you want only reordering by uid:
  //       return prioritizeUidTop(prev, incomingUid);
  //     }

  //     // Update last message + time for the existing chat
  //     const lastMessageTime =
  //       incoming?.created_at ||
  //       incoming?.timestamp ||
  //       new Date().toISOString();

  //     const lastMessageText =
  //       incoming?.message || incoming?.text || prev[existingIdx].lastMessage || '';

  //     const next = prev.map((c, i) =>
  //       i !== existingIdx
  //         ? c
  //         : {
  //           ...c,
  //           lastMessage: lastMessageText,
  //           lastMessageTime: new Date(lastMessageTime),
  //           messages: Array.isArray(c.messages)
  //             ? [...c.messages, transformMessage(incoming)]
  //             : [transformMessage(incoming)],
  //         }
  //     );

  //     // Move that uid’s chat to top (no insertion)
  //     return prioritizeUidTop(next, incomingUid);
  //   });
  // };


  const filteredChats = chats.filter(chat => {
    if (!chat || !chat.name) return false;

    const matchesCategory = activeCategory === 'all' ||
      (activeCategory === 'mine' && chat.isMine);
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.phone && chat.phone.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Function to classify and convert messages to UI format
  const classifyMessages = (messages, isAgentEnabled) => {
    console.log('🔍 classifyMessages: Processing', messages.length, 'messages, AI enabled:', isAgentEnabled);

    return messages.map((msg, index) => {
      // Extract basic fields
      const text = msg.text || msg.message || msg.body || msg.content || '';
      // Use created_at as primary timestamp, fallback to updated_at, then other fields
      const timestamp = msg.created_at || msg.updated_at || msg.time || msg.timestamp || new Date();

      // Log the raw message for debugging
      console.log(`🔍 Message ${index}:`, {
        text: String(text).substring(0, 50),
        allKeys: Object.keys(msg),
        sender: msg.sender,
        from: msg.from,
        role: msg.role,
        direction: msg.direction,
        type: msg.type,
        is_from_agent: msg.is_from_agent,
        is_ai: msg.is_ai,
        from_phone: msg.from_phone,
        to_phone: msg.to_phone,
        from_number: msg.from_number,
        to_number: msg.to_number,
        whatsapp_from: msg.whatsapp_from,
        whatsapp_to: msg.whatsapp_to,
        msisdn: msg.msisdn,
        // Additional fields that might help
        user_id: msg.user_id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        contact_id: msg.contact_id,
        agent_id: msg.agent_id,
        bot_id: msg.bot_id,
        // Message content hints
        is_question: msg.is_question,
        is_response: msg.is_response,
        is_automated: msg.is_automated,
        is_bot_message: msg.is_bot_message,
        is_system_message: msg.is_system_message,
        // Additional fields that might exist
        message_type: msg.message_type,
        flow: msg.flow,
        step: msg.step,
        intent: msg.intent,
        category: msg.category,
        source: msg.source,
        channel: msg.channel,
        platform: msg.platform,
        // Phone number variations
        phone: msg.phone,
        number: msg.number,
        contact_phone: msg.contact_phone,
        user_phone: msg.user_phone,
        agent_phone: msg.agent_phone
      });

      // SIMPLIFIED LOGIC: Use ONLY the is_incoming_message field as per the rules
      // is_incoming_message === 1 -> LEFT side (user messages)
      // is_incoming_message === 0 -> RIGHT side (system/bot messages)

      // Initialize messageSender variable
      let messageSender = 'user'; // Default to right side

      if (msg.is_incoming_message === 1) {
        messageSender = 'received'; // LEFT side - user/customer messages
        console.log(`✅ Message ${index}: is_incoming_message === 1 -> LEFT side (user message)`);
      } else if (msg.is_incoming_message === 0) {
        messageSender = 'user'; // RIGHT side - system/bot messages
        console.log(`✅ Message ${index}: is_incoming_message === 0 -> RIGHT side (system/bot message)`);
      } else {
        // Fallback: if is_incoming_message is undefined/null, use content hints
        if (text && (
          text.toLowerCase().includes('hi') ||
          text.toLowerCase().includes('hello') ||
          text.toLowerCase().includes('fine') ||
          text.toLowerCase().includes('good') ||
          text.toLowerCase().includes('okay') ||
          text.toLowerCase().includes('yes') ||
          text.toLowerCase().includes('no') ||
          text.toLowerCase().includes('vina patel') ||
          text.toLowerCase().includes('19 august 2025 3 pm') ||
          text.toLowerCase().includes('i want to book an appointment')
        )) {
          // These look like user responses - LEFT side
          messageSender = 'received';
          console.log(`✅ Message ${index}: Content suggests user response -> LEFT side`);
        } else {
          // Default to right side for unclear messages (likely system/bot)
          messageSender = 'user';
          console.log(`⚠️ Message ${index}: No clear indicators, defaulting to RIGHT side (system/bot)`);
        }
      }

      // Determine if this is a system/agent message
      const isSystemOrAgent = messageSender === 'user';
      const isUserMessage = messageSender === 'received';
      const isCustomerMessage = messageSender === 'received';

      // CRITICAL: Ensure user messages NEVER show AI icon, even when AI agent is enabled
      const shouldShowAI = isAgentEnabled && isSystemOrAgent && messageSender === 'user';

      // ADDITIONAL SAFETY: If message is on left side (received), NEVER show AI icon
      const finalShouldShowAI = messageSender === 'received' ? false : shouldShowAI;

      console.log(`🔍 Message ${index} AI icon logic:`, {
        isAgentEnabled,
        isSystemOrAgent,
        messageSender,
        shouldShowAI,
        finalShouldShowAI,
        willShowAI: finalShouldShowAI
      });

      console.log(`🔍 Message ${index} AI status tracking:`, {
        aiStatusAtSend: isAgentEnabled,
        messageType: messageSender === 'user' ? 'system/agent' : 'user',
        willShowAI: finalShouldShowAI
      });

      console.log(`🔍 Message ${index} final classification:`, {
        text: String(text).substring(0, 50),
        isSystemOrAgent,
        isUserMessage,
        isCustomerMessage,
        final: messageSender,
        willShowOnRight: messageSender === 'user',
        willShowAI: finalShouldShowAI
      });

      return {
        id: msg.id || msg.message_id || msg.uuid || `msg-${index}-${Date.now()}`,
        text: String(text),
        sender: messageSender,
        timestamp: formatTimestamp(timestamp),
        createdAt: new Date(timestamp),
        // Preserve both timestamp fields from API
        created_at: msg.created_at || timestamp,
        updated_at: msg.updated_at || msg.created_at || timestamp,
        isAI: finalShouldShowAI, // Only show AI badge on confirmed system/agent messages
        aiStatusAtSend: isAgentEnabled, // Store AI agent status when message was classified
        status: msg.status || 'read'
      };
    });
  };

  // Chat input functions
  const handleSend = () => {
    console.log('🔍 ChatInput: handleSend called');
    console.log('🔍 ChatInput: Current state:', {
      message: message,
      messageTrimmed: message.trim(),
      messageLength: message.length,
      selectedFiles: selectedFiles.length,
      aiAgentEnabled: globalAgentEnabled,
      aiAgentStatus: aiAgentStatus,
      canSend: (message.trim() || selectedFiles.length > 0),
      inputDisabled: globalAgentEnabled,
      sendButtonDisabled: globalAgentEnabled || (!message.trim() && selectedFiles.length === 0)
    });

    // FIXED: Allow sending messages regardless of AI agent status
    // When AI agent is enabled: system can send messages, bot will respond automatically
    // When AI agent is disabled: system can send messages, bot won't respond
    if (message.trim() || selectedFiles.length > 0) {
      console.log('🔍 ChatInput: Proceeding to send message');

      // Debug: Log what's being sent
      console.log('🔍 ChatInput: Sending message with:', {
        message: message,
        messageType: messageType,
        fileCount: selectedFiles.length,
        files: selectedFiles.map(f => ({
          name: f.name,
          uri: f.uri,
          mimeType: f.mimeType,
          path: f.path,
          size: f.size
        }))
      });

      console.log('🔍 ChatInput: Calling handleSendMessage function with:', {
        message,
        selectedFiles: selectedFiles.length,
        messageType
      });

      // Send message with files and message type
      handleSendMessage(message, selectedFiles, messageType);

      console.log('🔍 ChatInput: handleSendMessage called, resetting state');
      setMessage('');
      setSelectedFiles([]);
      setMessageType('text'); // Reset to text type
    } else {
      console.log('🔍 ChatInput: Cannot send - no message or files');
      console.log('🔍 ChatInput: Send conditions not met');
    }
  };

  const handleTextChange = (text) => {
    console.log('🔍 ChatInput: Text changed to:', text);
    console.log('🔍 ChatInput: Current disabled state:', globalAgentEnabled);
    setMessage(text);
  };

  const handleInputFocus = () => {
    console.log('🔍 ChatInput: Input focused, disabled:', globalAgentEnabled);
  };

  const handleInputBlur = () => {
    console.log('🔍 ChatInput: Input blurred');
  };

  // File attachment functions
  const pickImages = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const imageFiles = result.assets.map(asset => {
          // Auto-detect MIME type from file extension if not provided
          let detectedMimeType = asset.mimeType;
          if (!detectedMimeType && asset.name) {
            const extension = asset.name.split('.').pop()?.toLowerCase();
            switch (extension) {
              case 'jpg':
              case 'jpeg':
                detectedMimeType = 'image/jpeg';
                break;
              case 'png':
                detectedMimeType = 'image/png';
                break;
              case 'gif':
                detectedMimeType = 'image/gif';
                break;
              case 'webp':
                detectedMimeType = 'image/webp';
                break;
              case 'bmp':
                detectedMimeType = 'image/bmp';
                break;
              default:
                detectedMimeType = 'image/*';
            }
          }

          return {
            ...asset,
            mimeType: detectedMimeType || 'image/jpeg',
            path: asset.name, // Use filename as path
            uri: asset.uri || asset.fileUri, // Ensure URI is available
            name: asset.name || asset.fileName, // Ensure name is available
            type: 'image' // Explicitly set type for better handling
          };
        });

        setSelectedFiles(prev => [...prev, ...imageFiles]);
        setMessageType('image');
        setShowAttachmentMenu(false);
        console.log('📸 Images selected:', imageFiles);
        console.log('📸 Image file structure:', imageFiles.map(f => ({
          name: f.name,
          uri: f.uri,
          mimeType: f.mimeType,
          path: f.path,
          size: f.size,
          type: f.type
        })));
        console.log('📸 Message type set to:', 'image');
        console.log('📸 Selected files count:', selectedFiles.length + imageFiles.length);
      }
    } catch (error) {
      console.error('❌ Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const docFiles = result.assets.map(asset => {
          // Auto-detect MIME type and document type from file extension
          let detectedMimeType = asset.mimeType;
          let detectedType = 'file';

          if (!detectedMimeType && asset.name) {
            const extension = asset.name.split('.').pop()?.toLowerCase();
            switch (extension) {
              case 'pdf':
                detectedMimeType = 'application/pdf';
                detectedType = 'document';
                break;
              case 'doc':
              case 'docx':
                detectedMimeType = 'application/msword';
                detectedType = 'document';
                break;
              case 'xls':
              case 'xlsx':
                detectedMimeType = 'application/vnd.ms-excel';
                detectedType = 'spreadsheet';
                break;
              case 'ppt':
              case 'pptx':
                detectedMimeType = 'application/vnd.ms-powerpoint';
                detectedType = 'presentation';
                break;
              case 'txt':
                detectedMimeType = 'text/plain';
                detectedType = 'text';
                break;
              case 'rtf':
                detectedMimeType = 'application/rtf';
                detectedType = 'document';
                break;
              default:
                detectedMimeType = 'application/octet-stream';
                detectedType = 'file';
            }
          }

          return {
            ...asset,
            mimeType: detectedMimeType || 'application/octet-stream',
            path: asset.name, // Use filename as path
            uri: asset.uri || asset.fileUri, // Ensure URI is available
            name: asset.name || asset.fileName, // Ensure name is available
            type: detectedType // Use detected type for better handling
          };
        });

        setSelectedFiles(prev => [...prev, ...docFiles]);
        setMessageType('file');
        setShowAttachmentMenu(false);
        console.log('📄 Documents selected:', docFiles);
        console.log('📄 Document types detected:', docFiles.map(f => ({
          name: f.name,
          mimeType: f.mimeType,
          type: f.type
        })));
      }
    } catch (error) {
      console.error('❌ Error picking documents:', error);
      Alert.alert('Error', 'Failed to pick documents. Please try again.');
    }
  };

  const pickFolder = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const folderFiles = result.assets.map(asset => {
          // Auto-detect MIME type and type from file extension
          let detectedMimeType = asset.mimeType;
          let detectedType = 'file';

          if (!detectedMimeType && asset.name) {
            const extension = asset.name.split('.').pop()?.toLowerCase();
            // Use the same detection logic as pickDocument
            switch (extension) {
              case 'pdf':
                detectedMimeType = 'application/pdf';
                detectedType = 'document';
                break;
              case 'doc':
              case 'docx':
                detectedMimeType = 'application/msword';
                detectedType = 'document';
                break;
              case 'xls':
              case 'xlsx':
                detectedMimeType = 'application/vnd.ms-excel';
                detectedType = 'spreadsheet';
                break;
              case 'ppt':
              case 'pptx':
                detectedMimeType = 'application/vnd.ms-powerpoint';
                detectedType = 'presentation';
                break;
              case 'txt':
                detectedMimeType = 'text/plain';
                detectedType = 'text';
                break;
              case 'jpg':
              case 'jpeg':
              case 'png':
              case 'gif':
                detectedMimeType = 'image/*';
                detectedType = 'image';
                break;
              default:
                detectedMimeType = 'application/octet-stream';
                detectedType = 'file';
            }
          }

          return {
            ...asset,
            mimeType: detectedMimeType || 'application/octet-stream',
            path: asset.name, // Use filename as path
            uri: asset.uri || asset.fileUri, // Ensure URI is available
            name: asset.name || asset.fileName, // Ensure name is available
            type: detectedType // Use detected type for better handling
          };
        });

        setSelectedFiles(prev => [...prev, ...folderFiles]);
        setMessageType('folder');
        setShowAttachmentMenu(false);
        console.log('📁 Folder contents selected:', folderFiles);
        console.log('📁 Folder file types detected:', folderFiles.map(f => ({
          name: f.name,
          mimeType: f.mimeType,
          type: f.type
        })));
      }
    } catch (error) {
      console.error('❌ Error picking folder contents:', error);
      Alert.alert('Error', 'Failed to pick folder contents. Please try again.');
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('🗑️ File removed, remaining files:', newFiles.length);

      // Reset message type if no files left
      if (newFiles.length === 0) {
        setMessageType('text');
        console.log('🔄 Message type reset to text');
      }

      return newFiles;
    });
  };

  const getMessageTypeIcon = () => {
    // Auto-detect file type from selected files if available
    if (selectedFiles.length > 0) {
      const primaryFile = selectedFiles[0];
      const mimeType = primaryFile.mimeType || primaryFile.type || '';

      if (mimeType.startsWith('image/')) return '🖼️';
      if (mimeType.startsWith('video/')) return '🎥';
      if (mimeType.startsWith('audio/')) return '🎵';
      if (mimeType.includes('pdf')) return '📕';
      if (mimeType.includes('document') || mimeType.includes('word')) return '📘';
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
      if (mimeType.includes('text')) return '📝';
    }

    // Fallback to messageType parameter
    switch (messageType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📘';
      case 'file': return '📄';
      case 'folder': return '📁';
      default: return '💬';
    }
  };

  const getMessageTypeLabel = () => {
    // Auto-detect file type from selected files if available
    if (selectedFiles.length > 0) {
      const primaryFile = selectedFiles[0];
      const mimeType = primaryFile.mimeType || primaryFile.type || '';

      if (mimeType.startsWith('image/')) return 'Image';
      if (mimeType.includes('pdf')) return 'PDF';
      if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
      if (mimeType.includes('text')) return 'Text File';
    }

    // Fallback to messageType parameter
    switch (messageType) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'document': return 'Document';
      case 'file': return 'File';
      case 'folder': return 'Folder';
      default: return 'Text';
    }
  };

  // Input glow animation
  // useEffect(() => {
  //   if (message.trim() || selectedFiles.length > 0) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(inputGlowAnim, {
  //           toValue: 1,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(inputGlowAnim, {
  //           toValue: 0,
  //           duration: 2000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  //   } else {
  //     inputGlowAnim.setValue(0);
  //   }
  // }, [message, selectedFiles]);

  // Glow animation for active send button
  // useEffect(() => {
  //   if ((message.trim() || selectedFiles.length > 0) && !globalAgentEnabled) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(glowAnim, {
  //           toValue: 1,
  //           duration: 1500,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(glowAnim, {
  //           toValue: 0,
  //           duration: 1500,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  //   } else {
  //     glowAnim.setValue(0);
  //   }
  // }, [message, selectedFiles, globalAgentEnabled]);

  const SERVER_URL = "https://websocket.echoleads.ai"; // 👈 For Android emulator; change to your server IP

  const whatsappbot_id = "214e139e-245c-5bda0f0eeac8-WB"; // replace with real values
  // const uid = "8788226091_68ak449230e299";
  // const uid = "1756971867_68b9435bf05a1'";

  // const [whatsappbot_id, setwhatsappbot_id] = useState("");
  const [uid, setuid] = useState("");

  const [socket, setSocket] = useState(null);
  const [messagess, setMessagess] = useState([]);
  console.log(messagess, "messagess>>")


  const transformMessage = (msg) => ({
    id: msg.id,
    text: msg.message || '',
    sender: msg.is_incoming_message === 1 ? 'received' : 'user',
    from: 'contact',
    timestamp: msg.created_at || new Date().toISOString(),
    created_at: msg.created_at,
    updated_at: msg.updated_at || msg.created_at,
    is_incoming_message: msg.is_incoming_message ?? 0,
    message_type: msg.message_type || 'text',
    status: msg.status || 'sent',
    whatsappbot_id: msg.whatsappbot_id,
    contacts_id: msg.contacts_id,
    user_id: msg.user_id,
  });


  const appendIfHasMessages = (newApiMsg) => {
    const newMsg = transformMessage(newApiMsg);

    setSelectedChat((prev) => {
      if (!prev || !Array.isArray(prev.messages) || prev.messages.length === 0) {
        return prev;
      }

      const isDuplicate = prev.messages.some(
        (msg) => msg.id === newMsg.id && msg.timestamp === newMsg.timestamp
      );

      if (isDuplicate) {
        console.log("⚠️ Duplicate message ignored:", newMsg.id);
        return prev;
      }

      return {
        ...prev,
        messages: [...prev.messages, newMsg],
      };
    });
  };





  // useEffect(() => {
  //   const newSocket = io(SERVER_URL, {
  //     transports: ["websocket"],
  //     reconnection: true,
  //     reconnectionAttempts: 5,
  //     reconnectionDelay: 2000,
  //   });

  //   setSocket(newSocket);

  //   newSocket.on("connect", () => {
  //     console.log("✅ Connected:", newSocket.id);
  //     newSocket.emit("join", { whatsappbot_id, uid });
  //   });

  //   newSocket.on("joined", (data) => {
  //     console.log("🎉 Joined room:", data);
  //   });

  //   newSocket.on("disconnect", (reason) => {
  //     console.log("❌ Disconnected:", reason);
  //   });

  //   newSocket.on("connect_error", (err) => {
  //     console.log("⚠️ Connect error:", err.message);
  //   });

  //      socket.on('lastmsg', (payload) => {
  //     console.log('📩 lastmsg payload:', payload);
  //   });



  //   newSocket.on("chat:new", (payload) => {
  //     console.log("📩 chat:new:", payload);
  //     setMessagess(payload)
  //     appendIfHasMessages(payload)
  //     upsertAndBumpChatFromIncoming(payload);


  //   });

  //   newSocket.on("typing", (data) => {
  //     console.log("✍️ Typing:", data);
  //   });

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, [SERVER_URL, whatsappbot_id, uid]);


  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected:', newSocket.id);

      // Only join when both values exist
      if (whatsappbot_id && uid) {
        newSocket.emit('join', { whatsappbot_id, uid });
      } else {
        console.warn('⚠️ Not joining: missing whatsappbot_id or uid', { whatsappbot_id, uid });
      }
    });

    newSocket.on('joined', (data) => {
      console.log('🎉 Joined room:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.log('⚠️ Connect error:', err.message);
    });

    // ✅ Listen on the SAME instance we created
    newSocket.on('lastmsg', (payload) => {
      // payload can be either:
      // 1) { uid, last_message }
      // 2) { room, whatsappbot_id, uid, event, payload: { uid, last_message } } (admin envelope)
      const direct = payload?.last_message;
      const envelope = payload?.payload?.last_message;

      if (direct) {
        console.log('📩 lastmsg (direct):', payload);
        
        // Check if AI agent is enabled and trigger response for incoming user messages
        if (globalAgentEnabled && direct.is_incoming_message === 1) {
          console.log('🤖 AI Agent enabled - new user message received via lastmsg, triggering response...');
          
          // Find the chat to respond to
          const targetChat = chats.find(c => c.uid === payload.uid);
          if (targetChat) {
            // Trigger AI response after a short delay
            setTimeout(async () => {
              try {
                console.log('🤖 Triggering AI response for new user message via lastmsg...');
                await checkAndRespondToMissedMessages(targetChat);
              } catch (error) {
                console.error('❌ Error triggering AI response for new message via lastmsg:', error);
              }
            }, 1000); // Wait 1 second for the message to be processed
          }
        }
      } else if (envelope) {
        console.log('📩 lastmsg (envelope):', payload);
        
        // Check if AI agent is enabled and trigger response for incoming user messages
        if (globalAgentEnabled && envelope.is_incoming_message === 1) {
          console.log('🤖 AI Agent enabled - new user message received via lastmsg envelope, triggering response...');
          
          // Find the chat to respond to
          const targetChat = chats.find(c => c.uid === payload.uid);
          if (targetChat) {
            // Trigger AI response after a short delay
            setTimeout(async () => {
              try {
                console.log('🤖 Triggering AI response for new user message via lastmsg envelope...');
                await checkAndRespondToMissedMessages(targetChat);
              } catch (error) {
                console.error('❌ Error triggering AI response for new message via lastmsg envelope:', error);
              }
            }, 1000); // Wait 1 second for the message to be processed
          }
        }
      } else {
        console.log('ℹ️ lastmsg (unknown shape):', payload);
      }
    });

    newSocket.on('chat:new', (payload) => {
      console.log('📩 chat:new:', payload);
      setMessagess(payload);
      appendIfHasMessages(payload);
      // upsertAndBumpChatFromIncoming(payload);

      // Check if AI agent is enabled and trigger response for incoming user messages
      if (globalAgentEnabled && payload.is_incoming_message === 1) {
        console.log('🤖 AI Agent enabled - new user message received, triggering response...');
        
        // Find the chat to respond to
        const targetChat = chats.find(c => c.uid === payload.uid);
        if (targetChat) {
          // Trigger AI response after a short delay
          setTimeout(async () => {
            try {
              console.log('🤖 Triggering AI response for new user message...');
              await checkAndRespondToMissedMessages(targetChat);
            } catch (error) {
              console.error('❌ Error triggering AI response for new message:', error);
            }
          }, 1000); // Wait 1 second for the message to be processed
        }
      }
    });

    newSocket.on('typing', (data) => {
      console.log('✍️ Typing:', data);
    });

    return () => {
      // Clean up all listeners and close the socket
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [SERVER_URL, whatsappbot_id, uid]);


  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('✅ Connected:', socket.id);
      // join the admin room
      socket.emit('join:adminChatList');
      console.log('➡️ join:adminChatList {}');
    });

    socket.on('joined', (data) => {
      // Will print { room: 'adminChatList' } after joining
      console.log('🎉 joined:', data);
    });

    // Listen for the event you emit from /adminchatlist/emit
    socket.on("lastmsg", (payload) => {
      console.log(`📩 [lastmsg] payload:`, payload);
      setLastPayload(payload);
      handleLastMsgAndNotify(payload);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('❌ Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.log('⚠️ Connect error:', err.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
      // optionally send token to your backend here
    })();
  }, []);





  // when a lastmsg arrives from WS
  // const handleLastMsg = (payload) => {
  //   if (!payload?.uid || !payload?.last_message) return;

  //   setChats((prevChats) => {
  //     if (!Array.isArray(prevChats)) return prevChats;

  //     // 1. update the matching chat
  //     const updated = prevChats.map((chat) => {
  //       if (chat.uid === payload.uid) {
  //         return {
  //           ...chat,
  //           lastMessage: payload.last_message.message,
  //           lastMessageTime: new Date(payload.last_message.created_at),
  //         };
  //       }
  //       return chat;
  //     });

  //     // 2. find the matching chat object
  //     const target = updated.find((c) => c.uid === payload.uid);
  //     if (!target) return updated; // uid not found

  //     // 3. move it to the top
  //     const withoutTarget = updated.filter((c) => c.uid !== payload.uid);
  //     return [target, ...withoutTarget];
  //   });
  // };


  // update chat (move to top) then notify
  const handleLastMsgAndNotify = (payload) => {
    if (!payload?.uid || !payload?.last_message) return;

    // 1) update + move to top
    setChats((prevChats) => {
      if (!Array.isArray(prevChats)) return prevChats;

      // find the chat for name/phone for notification
      const match = prevChats.find(c => c.uid === payload.uid);

      // update last message/time
      const updated = prevChats.map((chat) => {
        if (chat.uid === payload.uid) {
          return {
            ...chat,
            lastMessage: payload.last_message.message,
            lastMessageTime: new Date(payload.last_message.created_at),
          };
        }
        return chat;
      });

      // move to top
      const target = updated.find((c) => c.uid === payload.uid);
      const rest = updated.filter((c) => c.uid !== payload.uid);
      const reordered = target ? [target, ...rest] : updated;

      // 2) trigger local notification (fire & forget)
      const chatName =
        (match?.name && match.name.trim()) ||
        (match?.phone && String(match.phone)) ||
        payload.uid;

      const messageText = payload.last_message?.message || 'New message';

      sendNewMessageNotification(chatName, messageText, payload.uid)
        .catch((err) => console.log('🔕 notification error:', err?.message));

      return reordered;
    });
  };



  // const reconnect = () => {
  //   if (socketRef.current && !connected) {
  //     console.log('🔁 Reconnecting…');
  //     socketRef.current.connect();
  //   }
  // };

  const handleChatSelect = async (chat) => {
    console.log('🚀 handleChatSelect: Starting with chat:', chat);

    // Validate chat object
    if (!chat) {
      console.error('❌ handleChatSelect: No chat provided');
      return;
    }

    // Get the chat identifier (prioritize UID)
    const chatIdentifier = chat.uid || chat.id || chat.chat_id;
    if (!chatIdentifier) {
      console.error('❌ handleChatSelect: No valid identifier found in chat:', chat);
      return;
    }
    setuid(chat.uid)

    console.log('🔍 handleChatSelect: Using identifier:', chatIdentifier);

    try {
      // Mark chat as read immediately when opened
      if (chat.unreadCount > 0) {
        console.log(`📖 Marking chat as read (${chat.unreadCount} unread messages)`);
        await markChatAsRead(chatIdentifier);
      }

      // Show chat immediately if there are existing messages, otherwise show loading
      if (chat.messages && chat.messages.length > 0) {
        console.log('✅ handleChatSelect: Chat has existing messages, showing immediately');
        setSelectedChat({
          ...chat,
          unreadCount: 0,
          messages: chat.messages,
          isLoading: false
        });
      } else {
        // Show loading state only if no existing messages
        setSelectedChat({
          ...chat,
          unreadCount: 0,
          messages: [],
          isLoading: true
        });
        console.log('✅ handleChatSelect: Chat opened, now loading messages...');
      }

      // CRITICAL: Ensure loading state is always cleared after a reasonable time
      const loadingFallback = setTimeout(() => {
        console.log('⚠️ handleChatSelect: Loading fallback triggered - clearing loading state');
        setSelectedChat(prev => {
          if (prev && prev.isLoading) {
            return { ...prev, isLoading: false, hasError: true, errorMessage: 'Loading failed - please retry' };
          }
          return prev;
        });
      }, 15000); // 15 second fallback

      // Add timeout fallback to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        console.log('⚠️ handleChatSelect: Loading timeout reached, showing chat with existing data');
        if (selectedChat) {
          setSelectedChat(prev => prev ? { ...prev, isLoading: false, hasError: true, errorMessage: 'Loading timeout' } : null);
        }
      }, 10000); // 10 second timeout

      // Fetch chat details with proper error handling
      console.log('🔍 handleChatSelect: Calling getChatDetail with:', chatIdentifier);
      const response = await chatAPI.getChatDetail(chatIdentifier);
      console.log('✅ handleChatSelect: API response received:', response);

      // Check for authentication errors
      if (response && response.requiresAuth) {
        console.error('❌ handleChatSelect: Authentication required, redirecting to login');
        Alert.alert(
          'Authentication Required',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear any stored credentials
                AsyncStorage.removeItem('authToken');
                AsyncStorage.removeItem('tokenExpiresAt');
                AsyncStorage.removeItem('userCredentials');
                // Redirect to login
                router.replace('/login');
              }
            }
          ]
        );
        return;
      }
      console.log('🔍 handleChatSelect: Response structure:', {
        hasResponse: !!response,
        hasData: !!(response && response.data),
        hasMessages: !!(response && response.messages),
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response && response.data ? Object.keys(response.data) : [],
        messageKeys: response && response.messages ? Object.keys(response.messages) : []
      });

      // Debug: Log the entire response for troubleshooting
      console.log('🔍 handleChatSelect: Full response object:', JSON.stringify(response, null, 2));

      // ADDITIONAL DEBUG: Check if response is null/undefined
      if (!response) {
        console.error('❌ handleChatSelect: Response is null/undefined');
        throw new Error('No response received from chat detail API');
      }

      // // ADDITIONAL DEBUG: Check response structure
      // console.log('🔍 handleChatSelect: Response type:', typeof response);
      // console.log('🔍 handleChatSelect: Response is array:', Array.isArray(response));
      // console.log('🔍 handleChatSelect: Response has status:', response.hasOwnProperty('status'));
      // console.log('🔍 handleChatSelect: Response status value:', response.status);
      // console.log('🔍 handleChatSelect: Response has data:', response.hasOwnProperty('data'));
      // console.log('🔍 handleChatSelect: Response has messages:', response.hasOwnProperty('messages'));

      // Process the response - handle both direct messages array and nested data structure
      let messages = [];
      let responseStatus = false;

      // CRITICAL: Always clear loading state regardless of response
      clearTimeout(loadingTimeout);
      clearTimeout(loadingFallback);

      if (response && response.status === true) {
        responseStatus = true;

        // Check if messages are directly available
        if (response.messages && Array.isArray(response.messages)) {
          messages = response.messages;
          console.log('🔍 handleChatSelect: Using response.messages directly, count:', messages.length);
        } else if (response.data && Array.isArray(response.data)) {
          messages = response.data;
          console.log('🔍 handleChatSelect: Using response.data as messages, count:', messages.length);
        } else if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
          messages = response.data.messages;
          console.log('🔍 handleChatSelect: Using response.data.messages, count:', messages.length);
        } else {
          console.log('⚠️ handleChatSelect: No messages found in expected locations');
          console.log('🔍 handleChatSelect: Available keys:', Object.keys(response));
          if (response.data) {
            console.log('🔍 handleChatSelect: Available keys:', Object.keys(response.data));
          }
        }
      } else if (response && Array.isArray(response)) {
        // Handle case where response is directly an array
        messages = response;
        responseStatus = true;
        console.log('🔍 handleChatSelect: Response is directly an array, using as messages, count:', messages.length);
      } else if (response && response.fallback) {
        // Handle fallback response
        console.log('⚠️ handleChatSelect: Using fallback response');
        messages = response.messages || response.data || [];
        responseStatus = response.status;
      } else {
        console.log('⚠️ handleChatSelect: Invalid response structure');
        console.log('🔍 handleChatSelect: Response structure:', response);
      }

      console.log('🔍 handleChatSelect: Final message count:', messages.length);
      if (messages.length > 0) {
        console.log('🔍 handleChatSelect: First message sample:', messages[0]);
        console.log('🔍 handleChatSelect: First message keys:', Object.keys(messages[0]));
      }

      if (messages.length > 0) {
        console.log('🔍 === MESSAGE CLASSIFICATION DEBUG ===');
        // console.log('🔍 Chat phone number:', chat.phone);
        // console.log('🔍 Total messages to process:', messages.length);
        // console.log('🔍 First message sample:', messages[0]);
        // console.log('🔍 All message keys available:', messages.map(m => Object.keys(m)));

        // Convert API messages to UI format with PROPER sender detection
        // console.log('🔍 handleChatSelect: About to classify messages with AI enabled:', globalAgentEnabled);
        const uiMessages = classifyMessages(messages, globalAgentEnabled);

        console.log('🔍 handleChatSelect: Converted', uiMessages.length, 'UI messages');
        if (uiMessages.length > 0) {
          console.log('🔍 handleChatSelect: First UI message sample:', {
            text: uiMessages[0].text?.substring(0, 50),
            sender: uiMessages[0].sender,
            isAI: uiMessages[0].isAI,
            positioning: uiMessages[0].sender === 'received' ? 'LEFT' : 'RIGHT'
          });
        }

        // Update the chat with messages
        const updatedChat = {
          ...chat,
          uid: chat.uid || chat.id || chat.chat_id, // Ensure UID is always set
          messages: uiMessages,
          lastMessage: uiMessages[uiMessages.length - 1]?.text || 'No messages yet',
          lastMessageTime: uiMessages[uiMessages.length - 1]?.createdAt || new Date(),
          unreadCount: 0,
          isLoading: false,
          hasError: false,
          errorMessage: null
        };

        console.log('🔍 handleChatSelect: Updated chat UID:', updatedChat.uid);
        console.log('🔍 handleChatSelect: Original chat UID:', chat.uid);
        console.log('🔍 handleChatSelect: Fallback UID:', chat.id || chat.chat_id);

        // Clear loading timeout since we succeeded
        clearTimeout(loadingTimeout);

        // Update UI
        setSelectedChat(updatedChat);
        setChats(prevChats => prevChats.map(c => {
          const cId = c.uid || c.id || c.chat_id;
          return cId === chatIdentifier ? updatedChat : c;
        }));

        console.log('✅ handleChatSelect: Chat updated with', uiMessages.length, 'messages');
      } else {
        console.log('⚠️ handleChatSelect: No messages found in response');

        // Update chat with empty messages but no loading state
        const updatedChat = {
          ...chat,
          uid: chat.uid || chat.id || chat.chat_id, // Ensure UID is always set
          messages: [],
          lastMessage: 'No messages yet',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isLoading: false,
          hasError: false,
          errorMessage: null
        };

        console.log('🔍 handleChatSelect: Empty chat UID:', updatedChat.uid);
        setSelectedChat(updatedChat);

        // Show notification if this was a fallback response
        // if (response && response.fallback) {
        //   setAgentNotificationMessage('Chat loaded (using fallback data)');
        //   setShowAgentNotification(true);
        //   setTimeout(() => setShowAgentNotification(false), 3000);
        // }
      }

    } catch (error) {
      // Clear all timeouts
      clearTimeout(loadingTimeout);
      clearTimeout(loadingFallback);

      console.error('❌ handleChatSelect: Failed to fetch chat details:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });

      // Handle network errors gracefully
      handleNetworkError(error, 'loading chat details');

      // Update chat with existing data and error state, but try to show existing messages
      const errorChat = {
        ...chat,
        uid: chat.uid || chat.id || chat.chat_id, // Ensure UID is always set
        unreadCount: 0,
        isLoading: false,
        hasError: true,
        errorMessage: error.message,
        messages: chat.messages || [] // Keep existing messages if any
      };

      console.log('🔍 handleChatSelect: Error chat UID:', errorChat.uid);
      setSelectedChat(errorChat);

      console.log('⚠️ handleChatSelect: Keeping chat open with error state and existing messages');

      // Show user-friendly error message
      // setAgentNotificationMessage(`Failed to load chat: ${error.message}`);
      // setShowAgentNotification(true);
      // setTimeout(() => setShowAgentNotification(false), 5000);
    }

    // After chat is loaded, check for missed messages if AI agent is enabled
    if (globalAgentEnabled && selectedChat && selectedChat.messages && selectedChat.messages.length > 0) {
      console.log('🤖 Chat selected with AI agent enabled - checking for missed user messages...');
      setTimeout(async () => {
        try {
          await checkAndRespondToMissedMessages();
        } catch (error) {
          console.error('❌ Error checking missed messages on chat select:', error);
        }
      }, 2000); // Wait 2 seconds after chat loads to check for missed messages
    }
  };

  // Removed manual new-message checks per request

  const handleToggleGlobalAgent = async () => {
    try {
      console.log('🔧 handleToggleGlobalAgent called');
      console.log('🔧 Current globalAgentEnabled:', globalAgentEnabled);

      setUpdatingAgent(true);

      const newStatus = globalAgentEnabled ? 'inactive' : 'active';
      console.log('🔧 New status to set:', newStatus);

      // Call the API to update status
      console.log('🔧 Calling chatAPI.updateAIAgentStatus...');
      const response = await chatAPI.updateAIAgentStatus(newStatus);

      console.log('🔧 API Response received:', response);

      // Enhanced response validation for the new API structure
      if (response && (
        response.status === true ||
        response.status === 'success' ||
        response.message ||
        response.data ||
        response.disable_ai_agent !== undefined ||
        response.fallback === true
      )) {
        // Parse the actual AI agent status from the API response
        let actualAiStatus = newStatus; // Default to what we sent
        let actualGlobalState = !globalAgentEnabled; // Default to what we expect

        // Check if response contains enable_ai_bot field (the actual API response format)
        if (response.data && response.data.enable_ai_bot !== undefined) {
          // API returns enable_ai_bot: "1" for enabled, "0" for disabled
          actualAiStatus = response.data.enable_ai_bot === "1" ? 'active' : 'inactive';
          actualGlobalState = response.data.enable_ai_bot === "1";
          console.log('🔧 API returned enable_ai_bot:', response.data.enable_ai_bot, '-> status:', actualAiStatus);
        }

        // Update local state based on actual API response
        setGlobalAgentEnabled(actualGlobalState);
        setAiAgentStatus(actualAiStatus);

        console.log('🔧 AI Agent status updated to:', actualGlobalState);
        console.log('🔧 Messages will be reclassified automatically...');

        // Store in AsyncStorage
        await AsyncStorage.setItem('aiAgentStatus', actualAiStatus);

        // Update UI state
        updateChatsAgentStatus(actualGlobalState);

        // Show success notification
        let successMessage = actualGlobalState ? 'AI Agent activated successfully' : 'AI Agent deactivated successfully';

        // Add fallback indicator if using mock response
        if (response.fallback === true) {
          successMessage += ' (offline mode - API endpoint not available)';
        }

        // setAgentNotificationMessage(successMessage);
        // setShowAgentNotification(true);
        // setTimeout(() => setShowAgentNotification(false), 3000);

        // If AI agent was just enabled, check for missed user messages and respond
        if (actualGlobalState && selectedChat) {
          console.log('🤖 AI Agent enabled - checking for missed user messages...');
          setTimeout(async () => {
            try {
              await checkAndRespondToMissedMessages(selectedChat);
            } catch (error) {
              console.error('❌ Error checking missed messages:', error);
            }
          }, 1000); // Wait 1 second after enabling to check for missed messages
        }

        // Status verification removed to prevent unnecessary API calls
        console.log('🔧 Status update completed successfully');

      } else {
        // Handle invalid response
        console.log('⚠️ Invalid response structure:', response);
        throw new Error('Unexpected response format from server');
      }

    } catch (error) {
      console.error('❌ Error updating AI agent status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      // Handle network errors gracefully
      handleNetworkError(error, 'updating AI agent status');

    } finally {
      setUpdatingAgent(false);
    }
  };

  // Helper function to update all chats
  const updateChatsAgentStatus = (newStatus) => {
    setChats(prev => prev.map(chat => {
      if (!chat || (!chat.id && !chat.chat_id && !chat.uid)) return chat;
      return {
        ...chat,
        agentEnabled: newStatus
      };
    }));

    if (selectedChat && (selectedChat.id || selectedChat.chat_id || selectedChat.uid)) {
      setSelectedChat(prev => ({ ...prev, agentEnabled: newStatus }));
    }
  };

  // Function to check for unresponded user messages and trigger AI response
  const checkAndRespondToMissedMessages = async (chatToCheck = null) => {
    try {
      const targetChat = chatToCheck || selectedChat;
      if (!targetChat || !targetChat.messages || targetChat.messages.length === 0) {
        console.log('🔍 checkAndRespondToMissedMessages: No chat or messages to check');
        return;
      }

      console.log('🔍 checkAndRespondToMissedMessages: Checking for unresponded user messages...');

      // Get the messages in chronological order (oldest first)
      const messages = [...targetChat.messages].sort((a, b) => {
        const timeA = new Date(a.created_at || a.updated_at || a.timestamp || 0);
        const timeB = new Date(b.created_at || b.updated_at || b.timestamp || 0);
        return timeA - timeB;
      });

      // Find the last user message that doesn't have a subsequent system/bot response
      let lastUnrespondedUserMessage = null;
      let lastUserMessageIndex = -1;

      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        const isUserMessage = message.sender === 'received'; // User messages are on left side
        const isSystemMessage = message.sender === 'user'; // System/bot messages are on right side

        if (isUserMessage) {
          // Found a user message, check if there's a system response after it
          let hasResponseAfter = false;
          for (let j = i + 1; j < messages.length; j++) {
            if (messages[j].sender === 'user') { // System/bot response found
              hasResponseAfter = true;
              break;
            }
          }

          if (!hasResponseAfter) {
            lastUnrespondedUserMessage = message;
            lastUserMessageIndex = i;
            console.log('🔍 checkAndRespondToMissedMessages: Found unresponded user message:', {
              text: message.text?.substring(0, 50),
              timestamp: message.created_at || message.updated_at,
              index: i
            });
            break;
          }
        }
      }

      if (lastUnrespondedUserMessage) {
        console.log('🤖 checkAndRespondToMissedMessages: Triggering AI response for missed message');

        // Get chat identifier
        const chatId = targetChat.uid || targetChat.id || targetChat.chat_id;

        // Send a trigger message to the backend to make the AI respond to the last user message
        // We'll send a meaningful message that the AI can respond to
        const triggerMessage = `Please respond to the previous user message: "${lastUnrespondedUserMessage.text?.substring(0, 100)}..."`;

        console.log('🤖 checkAndRespondToMissedMessages: Sending trigger message:', triggerMessage);

        // Use handleSendMessage with trigger type to bypass AI agent check
        await handleSendMessage(triggerMessage, [], 'trigger');

        console.log('🤖 checkAndRespondToMissedMessages: AI response triggered successfully');

        // Refresh the chat to get the AI response
        setTimeout(async () => {
          try {
            await handleChatSelect(targetChat);
            // setAgentNotificationMessage('AI Agent responded to missed user message');
            // setShowAgentNotification(true);
            // setTimeout(() => setShowAgentNotification(false), 3000);
          } catch (error) {
            console.error('❌ Error refreshing chat after AI response:', error);
          }
        }, 3000); // Wait 3 seconds for AI to process and respond

      } else {
        console.log('🔍 checkAndRespondToMissedMessages: No unresponded user messages found');
      }

    } catch (error) {
      console.error('❌ checkAndRespondToMissedMessages error:', error);
    }
  };



  const handleSendMessage = async (messageText, files = [], messageType = 'text') => {
    console.log('🚀 handleSendMessage: Called with:', {
      messageText: messageText?.substring(0, 50),
      filesCount: files.length,
      messageType,
      selectedChat: !!selectedChat,
      globalAgentEnabled,
      aiAgentStatus
    });

    // When AI agent is enabled, prevent system from sending messages (only bot should respond)
    // When AI agent is disabled, allow system to send messages directly to users
    console.log('🔍 handleSendMessage: Checking AI agent restrictions:', {
      globalAgentEnabled,
      messageType,
      aiAgentStatus,
      shouldBlock: globalAgentEnabled && messageType !== 'trigger'
    });

    if (globalAgentEnabled && messageType !== 'trigger') {
      console.log('🚫 handleSendMessage: AI Agent is enabled - system cannot send messages (only bot responds)');
      console.log('🚫 handleSendMessage: Blocking message - globalAgentEnabled:', globalAgentEnabled, 'messageType:', messageType);
      return;
    }

    console.log('✅ handleSendMessage: Proceeding to send message - AI agent:', globalAgentEnabled ? 'ENABLED' : 'DISABLED');

    if ((!messageText.trim() && files.length === 0) || !selectedChat) {
      console.log('❌ handleSendMessage: No message text/files or no selected chat');
      console.log('❌ handleSendMessage: messageText.trim():', messageText.trim());
      console.log('❌ handleSendMessage: files.length:', files.length);
      console.log('❌ handleSendMessage: messageType:', messageType);
      console.log('❌ handleSendMessage: selectedChat:', selectedChat);
      return;
    }

    try {
      console.log('🔍 handleSendMessage: Sending message:', messageText);
      console.log('🔍 handleSendMessage: Files to send:', files.length);
      console.log('🔍 handleSendMessage: Chat UID:', selectedChat.uid);

      // Get the chat identifier (strictly use UID)
      const chatIdentifier = selectedChat.uid;

      console.log('🔍 handleSendMessage: FULL selectedChat object:', JSON.stringify(selectedChat, null, 2));
      console.log('🔍 handleSendMessage: Chat object properties:', {
        uid: selectedChat.uid,
        id: selectedChat.id,
        chat_id: selectedChat.chat_id,
        phone: selectedChat.phone,
        name: selectedChat.name
      });
      console.log('🔍 handleSendMessage: Chat object keys:', Object.keys(selectedChat));
      console.log('🔍 handleSendMessage: Chat object values:', Object.values(selectedChat));

      if (!chatIdentifier) {
        console.error('❌ handleSendMessage: No chat identifier found');
        console.error('❌ handleSendMessage: Available chat properties:', Object.keys(selectedChat));
        console.error('❌ handleSendMessage: All chat values:', Object.entries(selectedChat));
        Alert.alert('Error', 'Unable to identify chat. Please try again.');
        return;
      }



      console.log('🔍 handleSendMessage: Using chat identifier:', chatIdentifier);
      console.log('🔍 handleSendMessage: Chat identifier type:', typeof chatIdentifier);
      console.log('🔍 handleSendMessage: Chat identifier length:', chatIdentifier ? chatIdentifier.length : 0);



      // Process files if any
      let fileAttachments = [];
      if (files.length > 0) {
        console.log('📎 Processing files for upload...');
        console.log('📎 Original files received:', files);
        fileAttachments = await processFilesForUpload(files);
        console.log('📎 Files processed:', fileAttachments);
        console.log('📎 File attachments structure:', fileAttachments.map(f => ({
          name: f.name,
          mimeType: f.mimeType,
          uri: f.uri,
          path: f.path,
          size: f.size
        })));
      }



      // Create a temporary message to show immediately (optimistic UI)
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: messageText.trim() || (fileAttachments.length > 0 ? `📎 ${fileAttachments[0].name}` : 'Message'),
        sender: 'user', // This will be a user message (right side)
        timestamp: formatTimestamp(new Date()),
        createdAt: new Date(),
        isAI: false,
        aiStatusAtSend: globalAgentEnabled, // Store current AI agent status
        status: 'sending', // Show sending status
        attachments: fileAttachments // Include file attachments
      };

      // Removed notifications to prevent extra white cards above message input

      console.log('🔍 handleSendMessage: Created temp message:', {
        id: tempMessage.id,
        text: tempMessage.text,
        sender: tempMessage.sender,
        isAI: tempMessage.isAI,
        status: tempMessage.status
      });

      // Update the chat immediately with the temporary message
      const updatedChat = {
        ...selectedChat,
        messages: [...(selectedChat.messages || []), tempMessage],
        lastMessage: tempMessage.text
      };

      console.log('🔍 handleSendMessage: Updating chat state with temp message');
      console.log('🔍 handleSendMessage: Current messages count:', selectedChat.messages?.length || 0);
      console.log('🔍 handleSendMessage: New messages count:', updatedChat.messages.length);

      setSelectedChat(updatedChat);

      // Also update the chat in the chats list (match by uid/id/chat_id)
      setChats(prevChats => {
        const targetId = selectedChat.uid;
        return prevChats.map(chat => {
          const chatId = chat.uid;
          return chatId === targetId ? updatedChat : chat;
        });
      });

      console.log('✅ handleSendMessage: Temporary message added to UI');

      // Prefer the known-working /chat/sendmsg path first; fallback to direct if needed
      // Pass the AI agent status to backend
      // When globalAgentEnabled is true (AI agent enabled), bot will respond automatically
      // When globalAgentEnabled is false (AI agent disabled), system sends direct messages
      const aiAgentStatusForAPI = globalAgentEnabled;

      console.log('📤 handleSendMessage: Primary path via sendSmartMessage (/chat/sendmsg)');
      console.log('📤 handleSendMessage: Params:', {
        chatIdentifier,
        textLen: (messageText || '').trim().length,
        fileCount: fileAttachments.length,
        globalAgentEnabled: globalAgentEnabled,
        aiAgentStatusForAPI: aiAgentStatusForAPI,
        behavior: globalAgentEnabled ? 'Bot will respond automatically' : 'Direct messages to user'
      });

      let response;
      try {
        response = await chatAPI.sendSmartMessage(chatIdentifier, (messageText || '').trim(), fileAttachments, aiAgentStatusForAPI);
        console.log('✅ handleSendMessage: sendmsg path succeeded:', response);
      } catch (apiError) {
        console.error('⚠️ handleSendMessage: sendmsg failed, trying direct path:', apiError?.message);
        try {
          response = await chatAPI.sendDirectMessage(chatIdentifier, (messageText || '').trim(), fileAttachments, aiAgentStatusForAPI);
          console.log('✅ handleSendMessage: Direct path succeeded:', response);
        } catch (directErr) {
          console.error('❌ handleSendMessage: Both send paths failed:', directErr?.message);
          throw directErr;
        }
      }

      // Update the message status to sent
      const finalMessage = {
        ...tempMessage,
        status: 'sent',
        id: response?.data?.id || response?.id || response?.messageId || tempMessage.id, // Use API response ID if available
        aiStatusAtSend: tempMessage.aiStatusAtSend // Preserve AI status at send time
      };

      // Update the chat with the final message
      const finalUpdatedChat = {
        ...updatedChat,
        messages: (updatedChat.messages || []).map(msg =>
          msg.id === tempMessage.id ? finalMessage : msg
        )
      };

      setSelectedChat(finalUpdatedChat);

      // Update the chat in the chats list
      setChats(prevChats => {
        const targetId = selectedChat.uid;
        return prevChats.map(chat => {
          const chatId = chat.uid;
          return chatId === targetId ? finalUpdatedChat : chat;
        });
      });

      console.log('✅ handleSendMessage: Message status updated to sent');

      // Show success notification
      const successMessage = fileAttachments.length > 0 ?
        `File message sent successfully` :
        `Message sent successfully`;
      // setAgentNotificationMessage(successMessage);
      // setShowAgentNotification(true);
      // setTimeout(() => setShowAgentNotification(false), 2000);

      // Debug: Show final chat state
      console.log('🔍 handleSendMessage: Final chat state:', {
        totalMessages: finalUpdatedChat.messages.length,
        lastMessage: finalUpdatedChat.lastMessage,
        lastMessageId: finalUpdatedChat.messages[finalUpdatedChat.messages.length - 1]?.id
      });

    } catch (error) {
      console.error('❌ handleSendMessage: Failed to send message:', error);

      // Show the specific error message from the API or a fallback
      const errorMessage = error.message || 'Unable to send message. Please check your connection and try again.';
      Alert.alert(
        'Send Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      // Remove the failed message from the chat
      const chatWithoutFailedMessage = {
        ...selectedChat,
        messages: (selectedChat.messages || []).filter(msg => !String(msg.id).startsWith('temp-'))
      };

      setSelectedChat(chatWithoutFailedMessage);

      // Update the chat in the chats list
      setChats(prevChats => {
        const targetId = selectedChat.uid;
        return prevChats.map(chat => {
          const chatId = chat.uid;
          return chatId === targetId ? chatWithoutFailedMessage : chat;
        });
      });
    }
  };

  const handleBack = () => {
    console.log('🔙 handleBack: Returning to chat list');
    setSelectedChat(null);
    // Reset any chat-specific states
    setSearchQuery('');
    setActiveCategory('all');
  };

  // Function to handle returning to chat list from anywhere
  const returnToChatList = async () => {
    console.log('🔄 returnToChatList: Returning to chat list view');

    setSelectedChat(null);
    setSearchQuery('');
    setActiveCategory('all');
    setError(null);
  };

  // Function to reclassify messages when AI agent status changes
  const reclassifyMessages = useCallback(() => {
    if (selectedChat && selectedChat.messages && selectedChat.messages.length > 0) {
      console.log('🔄 Reclassifying messages due to AI agent status change:', globalAgentEnabled);
      console.log('🔄 Total messages to reclassify:', selectedChat.messages.length);

      const reclassifiedMessages = selectedChat.messages.map((msg, index) => {
        // Keep the original AI status based on when the message was sent
        const shouldShowAI = msg.isAI && msg.aiStatusAtSend;

        if (msg.isAI !== shouldShowAI) {
          console.log(`🔄 Message ${index} AI status updated:`, {
            text: msg.text?.substring(0, 30),
            oldAI: msg.isAI,
            newAI: shouldShowAI,
            sender: msg.sender,
            aiStatusAtSend: msg.aiStatusAtSend,
            globalAgentEnabled
          });
        }

        return {
          ...msg,
          // Update AI status based on stored status at send time
          isAI: shouldShowAI
        };
      });

      const updatedChat = {
        ...selectedChat,
        messages: reclassifiedMessages
      };

      setSelectedChat(updatedChat);

      // Also update in chats list
      setChats(prevChats =>
        prevChats.map(chat => {
          const cId = chat.uid;
          const selectedId = selectedChat.uid;
          return cId === selectedId ? updatedChat : chat;
        })
      );

      console.log('✅ Messages reclassified with preserved AI status');
    }
  }, [selectedChat?.uid, selectedChat?.id, selectedChat?.chat_id, globalAgentEnabled]);

  // Reclassify messages only when AI agent status changes, not on every render
  const [isInitialized, setIsInitialized] = useState(false);
  const reclassifyTimeoutRef = useRef(null);

  useEffect(() => {
    // Only reclassify if we have a selected chat with messages and we're not in initialization
    if (isInitialized && selectedChat && selectedChat.messages && selectedChat.messages.length > 0) {
      // Clear any existing timeout
      if (reclassifyTimeoutRef.current) {
        clearTimeout(reclassifyTimeoutRef.current);
      }

      // Debounce reclassification to prevent rapid calls
      reclassifyTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Triggering reclassification due to AI agent status change');
        reclassifyMessages();
      }, 100); // 100ms debounce
    }

    // Cleanup timeout on unmount
    return () => {
      if (reclassifyTimeoutRef.current) {
        clearTimeout(reclassifyTimeoutRef.current);
      }
    };
  }, [globalAgentEnabled, isInitialized]); // Remove reclassifyMessages dependency to prevent infinite loop

  // Add keyboard listener to scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Set up smart refresh when data is loaded
  useEffect(() => {
    if (hasLoadedData && isMounted) {
      console.log('🔄 Setting up smart refresh after data load');
      
      // Set up smart refresh with intelligent intervals
      const setupSmartRefresh = () => {
        // Clear any existing interval
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }

        // Set up background refresh based on app state and user activity
        const interval = setInterval(async () => {
          try {
            // Only refresh if component is mounted and app is active
            if (!isMounted || !hasLoadedData || appState !== 'active') {
              console.log('🔄 Smart refresh: Skipping - component not ready or app not active');
              return;
            }

            // Check if enough time has passed since last refresh
            const timeSinceLastRefresh = lastRefreshTime ? Date.now() - lastRefreshTime : Infinity;
            const minRefreshInterval = 30000; // 30 seconds minimum

            if (timeSinceLastRefresh < minRefreshInterval) {
              console.log('🔄 Smart refresh: Skipping - too soon since last refresh');
              return;
            }

            console.log('🔄 Smart refresh: Starting background refresh...');
            await smartBackgroundRefresh(true);
          } catch (error) {
            console.error('❌ Smart refresh: Error during background refresh:', error);
          }
        }, 15000); // Check every 15 seconds

        setRefreshInterval(interval);
      };

      setupSmartRefresh();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [hasLoadedData, isMounted, appState]);

  // Removed manual refresh handler per request

  // Helper function to check if there are actual new messages
  const hasNewMessages = useCallback((currentMessages, newMessages) => {
    if (!currentMessages || currentMessages.length === 0) {
      return newMessages && newMessages.length > 0;
    }

    if (!newMessages || newMessages.length === 0) {
      return false;
    }

    // Check if there are more messages than before
    if (newMessages.length > currentMessages.length) {
      return true;
    }

    // Check if the last message is different (indicating a new message)
    const currentLastMessage = currentMessages[currentMessages.length - 1];
    const newLastMessage = newMessages[newMessages.length - 1];

    if (currentLastMessage && newLastMessage) {
      // Compare message content and timestamp
      const contentChanged = currentLastMessage.text !== newLastMessage.text;
      const timestampChanged = currentLastMessage.createdAt?.getTime() !== newLastMessage.createdAt?.getTime();

      return contentChanged || timestampChanged;
    }

    return false;
  }, []);

  // Function to mark a chat as read
  const markChatAsRead = useCallback(async (chatIdentifier) => {
    try {
      console.log('📖 Marking chat as read:', chatIdentifier);

      // Update local state immediately for better UX
      setChats(prevChats =>
        prevChats.map(chat => {
          const cId = chat.uid || chat.id || chat.chat_id;
          if (cId === chatIdentifier) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        })
      );

      // If this is the selected chat, also update it
      if (selectedChat) {
        const selectedId = selectedChat.uid || selectedChat.id || selectedChat.chat_id;
        if (selectedId === chatIdentifier) {
          setSelectedChat(prev => ({ ...prev, unreadCount: 0 }));
        }
      }

      // Call API to mark as read (if available)
      try {
        await chatAPI.markChatAsRead(chatIdentifier);
        console.log('✅ Chat marked as read via API');
      } catch (apiError) {
        console.log('⚠️ API call failed, but local state updated:', apiError.message);
      }

    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
    }
  }, [selectedChat]);



  // Function to update unread counts for all chats
  const updateUnreadCounts = useCallback(async () => {
    try {
      console.log('📊 Updating unread counts for all chats...');

      const response = await chatAPI.getChatList();
      if (response && response.data) {
        const transformedChats = response.data || response.chats || response || [];
        const validChats = Array.isArray(transformedChats) ? transformedChats.filter(chat => {
          const hasValidId = chat && (chat.id || chat.chat_id || chat.uid);
          return hasValidId;
        }) : [];

        const mappedChats = validChats.map((chat) => {
          const originalUid = chat.uid || chat.chat_id || chat.id;
          return {
            id: originalUid,
            uid: originalUid,
            chat_id: chat.chat_id || chat.id,
            name: chat.first_name && chat.last_name ? `${chat.first_name} ${chat.last_name}`.trim() :
              chat.name || chat.customer_name || chat.contact_name || 'Unknown',
            phone: chat.phone || chat.phone_number || chat.contact_number || 'N/A',
            avatar: (chat.first_name && chat.last_name ? `${chat.first_name} ${chat.last_name}`.trim() :
              chat.name || chat.customer_name || chat.contact_name || 'U').substring(0, 2).toUpperCase(),
            lastMessage: chat.last_message?.message || chat.recent_message || 'No messages yet',
            lastMessageTime: chat.last_message?.created_at ? new Date(chat.last_message.created_at) :
              chat.last_message_time ? new Date(chat.last_message_time) : new Date(),
            unreadCount: chat.unread_count || chat.unread_messages || 0,
            isMine: chat.is_mine || chat.assigned_to_me || false,
            agentEnabled: chat.agent_enabled || chat.ai_enabled || true,
            messages: chat.messages || []
          };
        });

        // Check for changes in unread counts
        const currentTotalUnread = chats.reduce((total, chat) => total + (chat?.unreadCount || 0), 0);
        const newTotalUnread = mappedChats.reduce((total, chat) => total + (chat?.unreadCount || 0), 0);

        if (newTotalUnread > currentTotalUnread) {
          const newUnreadCount = newTotalUnread - currentTotalUnread;
          console.log(`🆕 Unread count update: ${newUnreadCount} new unread messages detected!`);

          // Show notification for new unread messages
          // setAgentNotificationMessage(`You have ${newUnreadCount} new unread messages`);
          // setShowAgentNotification(true);
          // setTimeout(() => setShowAgentNotification(false), 4000);
        }

        // Update chats list
        setChats(mappedChats);
        console.log('✅ Unread counts updated for all chats');
      }
    } catch (error) {
      console.error('❌ Error updating unread counts:', error);
    }
  }, [chats]);

  // Function to handle new message notifications and update unread counts
  const handleNewMessageNotification = useCallback((chatIdentifier, newMessage) => {
    try {
      console.log('🔔 Handling new message notification for chat:', chatIdentifier);

      // Update unread count for the specific chat
      setChats(prevChats =>
        prevChats.map(chat => {
          const cId = chat.uid || chat.id || chat.chat_id;
          if (cId === chatIdentifier) {
            const newUnreadCount = (chat.unreadCount || 0) + 1;
            console.log(`📊 Updated unread count for chat ${chat.name}: ${newUnreadCount}`);
            return { ...chat, unreadCount: newUnreadCount };
          }
          return chat;
        })
      );

      // If this is the selected chat, also update it and mark as read
      if (selectedChat) {
        const selectedId = selectedChat.uid || selectedChat.id || selectedChat.chat_id;
        if (selectedId === chatIdentifier) {
          // Mark as read immediately if chat is open
          setSelectedChat(prev => ({ ...prev, unreadCount: 0 }));
          markChatAsRead(chatIdentifier);
        }
      }

      // Show notification for new message
      const senderName = newMessage.sender === 'received' ? 'User' : 'System';
      const truncatedText = newMessage.text.length > 30 ?
        newMessage.text.substring(0, 30) + '...' : newMessage.text;

      // setAgentNotificationMessage(`New message from ${senderName}: ${truncatedText}`);
      // setShowAgentNotification(true);
      // setTimeout(() => setShowAgentNotification(false), 4000);

    } catch (error) {
      console.error('❌ Error handling new message notification:', error);
    }
  }, [selectedChat, markChatAsRead]);

  // Removed periodic unread count updates



  // Function to clear chat history
  const handleClearChat = async () => {
    if (!selectedChat) return;

    try {
      console.log('🗑️ handleClearChat: Starting clear chat process...');

      // Show confirmation dialog
      Alert.alert(
        'Clear Chat History',
        'Are you sure you want to clear all messages from this chat? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🗑️ User confirmed clear chat');

                // Get chat identifier
                const chatIdentifier = selectedChat.uid || selectedChat.id || selectedChat.chat_id;
                if (!chatIdentifier) {
                  throw new Error('No valid chat identifier found');
                }

                // Call API to clear chat (if available)
                try {
                  await chatAPI.clearChat(chatIdentifier);
                  console.log('✅ Chat cleared via API');
                } catch (apiError) {
                  console.log('⚠️ API call failed, but clearing local state:', apiError.message);
                }

                // Clear local chat messages
                const clearedChat = {
                  ...selectedChat,
                  messages: [],
                  lastMessage: 'No messages yet',
                  lastMessageTime: new Date(),
                  unreadCount: 0
                };

                // Update selected chat
                setSelectedChat(clearedChat);

                // Update chat in chats list
                setChats(prevChats =>
                  prevChats.map(chat => {
                    const cId = chat.uid || chat.id || chat.chat_id;
                    if (cId === chatIdentifier) {
                      return clearedChat;
                    }
                    return chat;
                  })
                );

                // Show success notification
                // setAgentNotificationMessage('Chat history cleared successfully');
                // setShowAgentNotification(true);
                // setTimeout(() => setShowAgentNotification(false), 3000);

                console.log('✅ Chat history cleared successfully');

              } catch (error) {
                console.error('❌ Error clearing chat:', error);
                // setAgentNotificationMessage('Failed to clear chat history');
                // setShowAgentNotification(true);
                // setTimeout(() => setShowAgentNotification(false), 3000);
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('❌ Error in handleClearChat:', error);
    }
  };

  // Function to check network connectivity and handle offline state
  const checkNetworkConnectivity = useCallback(async () => {
    try {
      // Simple network check by making a lightweight API call
      const response = await chatAPI.getChatList();
      return response && response.data;
    } catch (error) {
      console.log('🌐 Network connectivity check failed:', error.message);
      return false;
    }
  }, []);

  // Function to handle network errors gracefully
  const handleNetworkError = useCallback((error, operation) => {
    console.log(`❌ Network error during ${operation}:`, error.message);

    let errorMessage = 'Network connection issue';
    let requiresAuth = false;

    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
      requiresAuth = true;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server is temporarily unavailable. Please try again.';
    } else if (!error.response) {
      errorMessage = 'No internet connection. Please check your network.';
    }

    // If authentication is required, show alert and redirect to login
    if (requiresAuth) {
      Alert.alert(
        'Authentication Required',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear stored credentials
              AsyncStorage.removeItem('authToken');
              AsyncStorage.removeItem('tokenExpiresAt');
              AsyncStorage.removeItem('userCredentials');
              // Redirect to login
              router.replace('/login');
            }
          }
        ]
      );
    } else {
      // Show regular error notification
      // setAgentNotificationMessage(errorMessage);
      // setShowAgentNotification(true);
      // setTimeout(() => setShowAgentNotification(false), 5000);
    }
  }, []);

  // Function to process files for upload
  const processFilesForUpload = async (files) => {
    const processedFiles = [];
    const rejectedFiles = [];

    // Allowed MIME types from backend mapping
    const allowedMimeTypes = new Set([
      // audio
      'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg',
      // video
      'video/mp4', 'video/3gp', 'video/mpeg',
      // images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // documents
      'text/plain', 'application/pdf', 'application/vnd.ms-powerpoint',
      'application/msword', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip'
    ]);

    // Global max size: 10 MB
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;

    for (const file of files) {
      try {
        console.log('📎 Processing file:', file.name);

        // Validate file object
        if (!file || !file.uri) {
          console.error('❌ Invalid file object:', file);
          continue;
        }

        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(file.uri);

        if (fileInfo.exists) {
          // Determine file type based on MIME type or extension
          let detectedType = file.mimeType || file.type || 'application/octet-stream';
          let messageType = 'file';

          // Enforce allowed MIME types
          if (!allowedMimeTypes.has(detectedType)) {
            rejectedFiles.push({ name: file.name, reason: 'type', mimeType: detectedType });
            console.warn(`🚫 File type not allowed: ${file.name} (${detectedType})`);
            continue;
          }

          // Auto-detect message type for better API integration
          if (detectedType.startsWith('image/')) {
            messageType = 'image';
          } else if (detectedType.startsWith('video/')) {
            messageType = 'video';
          } else if (detectedType.startsWith('audio/')) {
            messageType = 'audio';
          } else if (detectedType.includes('pdf') || detectedType.includes('document') || detectedType.includes('text')) {
            messageType = 'document';
          }

          // Validate file size (global 10MB limit)
          if (typeof file.size === 'number' && file.size > MAX_SIZE_BYTES) {
            rejectedFiles.push({ name: file.name, reason: 'size', size: file.size });
            console.warn(`🚫 File too large: ${file.name} ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
            continue;
          }

          // Preserve original file properties needed by chatService
          const processedFile = {
            name: file.name || 'Unknown File',
            size: file.size || 0,
            mimeType: detectedType,
            type: messageType, // Use detected message type
            uri: file.uri,
            path: file.path || file.name, // Ensure path is preserved for file_path in API
            // Add additional metadata for better handling
            extension: file.name ? file.name.split('.').pop()?.toLowerCase() : '',
            isImage: messageType === 'image',
            isVideo: messageType === 'video',
            isAudio: messageType === 'audio',
            isDocument: messageType === 'document'
          };

          processedFiles.push(processedFile);

          console.log('✅ File processed successfully:', {
            name: processedFile.name,
            type: processedFile.type,
            mimeType: processedFile.mimeType,
            size: processedFile.size,
            path: processedFile.path
          });
        } else {
          console.log('⚠️ File does not exist:', file.uri);
          // Try to continue with the file anyway, as it might be a temporary URI
          const processedFile = {
            name: file.name || 'Unknown File',
            size: file.size || 0,
            mimeType: file.mimeType || file.type || 'application/octet-stream',
            type: 'file',
            uri: file.uri,
            path: file.path || file.name,
            extension: file.name ? file.name.split('.').pop()?.toLowerCase() : '',
            isImage: false,
            isVideo: false,
            isAudio: false,
            isDocument: false
          };

          processedFiles.push(processedFile);
          console.log('⚠️ Added file with warning (URI may be temporary):', processedFile.name);
        }
      } catch (error) {
        console.error('❌ Error processing file:', file.name, error);
        // Continue processing other files
      }
    }

    console.log(`📎 Processed ${processedFiles.length} files out of ${files.length} total`);
    if (rejectedFiles.length > 0) {
      const tooLarge = rejectedFiles.filter(f => f.reason === 'size').map(f => f.name);
      const badType = rejectedFiles.filter(f => f.reason === 'type').map(f => f.name);
      let msg = '';
      if (tooLarge.length) msg += `Too large (>10MB): ${tooLarge.join(', ')}.\n`;
      if (badType.length) msg += `Unsupported type: ${badType.join(', ')}.`;
      if (msg) {
        Alert.alert('Some files were skipped', msg.trim());
      }
    }
    return processedFiles;
  };

  return (
    <View style={[styles.container]}>

      {!selectedChat ? (
        // Chat List View
        <View style={styles.chatListView}>
          <ExpoLinearGradient
            colors={['#FF9500', '#FF6B35', '#FF4500']}
            style={styles.chatListHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <MessageSquare size={20} color="#fff" style={styles.titleIcon} />
                <Text style={styles.chatListTitle}>Live Chat</Text>
                {/* Total unread count badge */}
                {(() => {
                  const totalUnread = chats.reduce((total, chat) => total + (chat?.unreadCount || 0), 0);
                  if (totalUnread > 0) {
                    return (
                      <View style={styles.totalUnreadBadge}>
                        <Text style={styles.totalUnreadText}>{totalUnread}</Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
              <View style={styles.headerRight}>

                {/* WhatsApp Messaging Manager Button removed (background-only) */}



                {/* Refresh Button */}
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleManualRefresh}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="refresh" size={20} color="#fff" />
                  )}
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    // Navigate back or close the page
                    if (selectedChat) {
                      setSelectedChat(null);
                    } else {
                      // Navigate back to Dashboard
                      router.push('/(tabs)/Dashboard');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>


          </ExpoLinearGradient>

          {isAdmin && (
            <View style={styles.agentControlSection}>
              <ExpoLinearGradient
                colors={globalAgentEnabled ?
                  ['rgba(255, 149, 0, 0.15)', 'rgba(255, 107, 53, 0.15)'] :
                  ['rgba(255, 149, 0, 0.08)', 'rgba(255, 107, 53, 0.08)']
                }
                style={styles.agentControlGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.agentControlContent}>
                  <View style={styles.agentControlLeft}>
                    <Bot size={20} color={globalAgentEnabled ? "#FF9500" : "#999"} />
                    <View style={styles.agentControlText}>
                      <Text style={[
                        styles.agentControlTitle,
                        { color: globalAgentEnabled ? '#333' : '#666' }
                      ]}>
                        {globalAgentEnabled ? 'AI Agent Active' : 'AI Agent Inactive'}
                      </Text>
                      <Text style={[
                        styles.agentControlSubtitle,
                        { color: globalAgentEnabled ? '#666' : '#999' }
                      ]}>
                        {globalAgentEnabled ? 'You can send messages, AI responds automatically' : 'You can send messages, AI does not respond'}
                      </Text>
                    </View>
                  </View>
                  {/* Show loading state */}
                  {updatingAgent ? (
                    <ActivityIndicator size="small" color="#FF9500" />
                  ) : (
                    <Switch
                      value={globalAgentEnabled}
                      onValueChange={handleToggleGlobalAgent}
                      trackColor={{ false: "#e0e0e0", true: "rgba(255,149,0,0.5)" }}
                      thumbColor={globalAgentEnabled ? "#FF9500" : "#f4f3f4"}
                      style={styles.agentSwitch}
                      disabled={updatingAgent}
                    />
                  )}
                </View>
              </ExpoLinearGradient>
            </View>
          )}



          <View style={styles.categoryTabs}>
            <TouchableOpacity
              style={[styles.categoryTab, activeCategory === 'all' && styles.activeCategoryTab]}
              onPress={() => setActiveCategory('all')}
              activeOpacity={0.7}
            >
              <ExpoLinearGradient
                colors={activeCategory === 'all' ? ['#FF9500', '#FF6B35'] : ['#f8f9fa', '#f8f9fa']}
                style={[styles.categoryTabGradient, activeCategory === 'all' && styles.activeCategoryTabGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.categoryText, activeCategory === 'all' && styles.activeCategoryText]}>
                  All
                </Text>
              </ExpoLinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTab, activeCategory === 'mine' && styles.activeCategoryTab]}
              onPress={() => setActiveCategory('mine')}
              activeOpacity={0.7}
            >
              <ExpoLinearGradient
                colors={activeCategory === 'mine' ? ['#FF9500', '#FF6B35'] : ['#f8f9fa', '#f8f9fa']}
                style={[styles.categoryTabGradient, activeCategory === 'mine' && styles.activeCategoryTabGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.categoryText, activeCategory === 'mine' && styles.activeCategoryText]}>
                  Mine
                </Text>
              </ExpoLinearGradient>
            </TouchableOpacity>
          </View>

          <ExpoLinearGradient
            colors={['#f8f9fa', '#ffffff']}
            style={styles.searchContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Search size={16} color="#FF9500" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="type to search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </ExpoLinearGradient>





          {loading && !error ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9500" />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>

            </View>
          ) : filteredChats.length === 0 ? (
            <View style={styles.emptyContainer}>
              {isInitialLoad ? (
                <>
                  <ActivityIndicator size="large" color="#FF9500" />
                  <Text style={styles.emptyText}>Loading your chats...</Text>
                  <Text style={styles.emptySubtext}>Please wait while we fetch your conversations</Text>
                </>
              ) : backgroundLoading ? (
                <>
                  <ActivityIndicator size="large" color="#FF9500" />
                  <Text style={styles.emptyText}>Checking for new chats...</Text>
                  <Text style={styles.emptySubtext}>Looking for new conversations</Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyText}>Ready for new chats</Text>
                  <Text style={styles.emptySubtext}>New conversations will appear here automatically</Text>
                  {backgroundLoading && (
                    <View style={styles.backgroundLoadingIndicator}>
                      <ActivityIndicator size="small" color="#FF9500" />
                      <Text style={styles.backgroundLoadingText}>Checking for updates...</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredChats}
              keyExtractor={(item, index) => (item?.id || item?.chat_id || `chat-${index}`).toString()}
              renderItem={({ item, index }) => (
                <ChatListItem
                  chat={item}
                  isSelected={false}
                  onPress={handleChatSelect}
                  isAdmin={isAdmin}
                  index={index}
                />
              )}
              style={styles.chatList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={handleManualRefresh}
                  colors={['#FF9500', '#FF6B35']}
                  tintColor="#FF9500"
                  title="Pull to refresh"
                  titleColor="#FF9500"
                />
              }
            />
          )}
        </View>
      ) : (
        // Chat View
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : -40}
          enabled={true}
        >
          <ChatHeader
            chat={selectedChat}
            isAdmin={isAdmin}
            globalAgentEnabled={globalAgentEnabled}
            onToggleGlobalAgent={handleToggleGlobalAgent}
            onBack={handleBack}
            onClearChat={handleClearChat}
          />



          {/* Loading State */}
          {selectedChat?.isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles.loadingText}>Loading chat details...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we fetch the conversation...</Text>
            </View>
          )}

          {/* Error State */}
          {selectedChat?.hasError && (
            <View style={styles.errorContainer}>
              <AlertCircle size={24} color="#FF3B30" />
              <Text style={styles.errorText}>
                {selectedChat.errorMessage || 'Failed to load chat details'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => handleChatSelect(selectedChat)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}



          {/* Messages List */}
          {!selectedChat?.isLoading && !selectedChat?.hasError && (
            <View style={styles.chatContainer}>


              {selectedChat?.messages && selectedChat.messages.length > 0 ? (
                <FlatList
                  ref={flatListRef}
                  data={selectedChat.messages}
                  // keyExtractor={(item, index) => (item?.id || `msg-${index}`).toString()}
                  keyExtractor={(item, index) => {
                    const id = item?.id ?? `msg-${index}`;
                    const timestamp = item?.created_at || item?.timestamp || '';
                    return `${id}-${timestamp}`;
                  }}

                  renderItem={({ item, index }) => {
                    // console.log('🔍 Rendering message:', {
                    //   index,
                    //   id: item.id,
                    //   sender: item.sender,
                    //   text: item.text?.substring(0, 30),
                    //   isUser: item.sender === "user",
                    //   status: item.status,
                    //   isAI: item.isAI,
                    //   positioning: item.sender === "user" ? "RIGHT (system/bot)" : "LEFT (user)"
                    // });
                    return (
                      <MessageBubble
                        message={item}
                        isUser={item.sender === "user"} // Only system/bot messages are "user" (right side)
                        index={index}
                      />
                    );
                  }}
                  style={styles.messagesList}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  automaticallyAdjustKeyboardInsets={true}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
              ) : (
                <View style={styles.emptyMessagesContainer}>
                  <Text style={styles.emptyMessagesText}>No messages yet</Text>
                  <Text style={styles.emptyMessagesSubtext}>Start a conversation!</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.inputSection}>
            {/* Inline Chat Input */}
            <View style={styles.inputContainer}>
              {/* Attachment Menu Overlay */}
              {showAttachmentMenu && (
                <TouchableOpacity
                  style={styles.menuOverlay}
                  activeOpacity={0}
                  onPress={() => setShowAttachmentMenu(false)}
                />
              )}

              {/* Attachment Menu */}
              {showAttachmentMenu && (
                <View style={styles.attachmentMenu}>
                  <TouchableOpacity
                    style={styles.attachmentMenuItem}
                    onPress={pickImages}
                  >
                    <Text style={styles.attachmentMenuText}>📸 Images</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.attachmentMenuItem}
                    onPress={pickDocument}
                  >
                    <Text style={styles.attachmentMenuText}>📄 Documents</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.attachmentMenuItem}
                    onPress={pickFolder}
                  >
                    <Text style={styles.attachmentMenuText}>📁 Files</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <View style={styles.selectedFilesContainer}>
                  <Text style={styles.selectedFilesTitle}>
                    📎 Selected Files ({selectedFiles.length}): {getMessageTypeLabel()}
                  </Text>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <Text style={styles.fileTypeLabel}>{getMessageTypeIcon()}</Text>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="tail">
                          {file.name}
                        </Text>
                        <Text style={styles.filePath} numberOfLines={1} ellipsizeMode="tail">
                          Path: {file.path || file.name}
                        </Text>
                        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeFileButton}
                        onPress={() => removeFile(index)}
                      >
                        <Text style={styles.removeFileButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Chat Input Controls */}
              <View style={styles.inputControlsContainer}>
                {/* Text Input */}
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.messageInput,
                    !globalAgentEnabled && styles.inputEnabled,
                    globalAgentEnabled && styles.inputDisabled
                  ]}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={handleTextChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  multiline
                  maxLength={1000}
                  editable={!globalAgentEnabled} // Disable when AI agent is enabled
                />

                {/* Attachment Button */}
                <TouchableOpacity
                  style={[
                    styles.attachmentButton,
                    globalAgentEnabled && styles.buttonDisabled
                  ]}
                  onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  disabled={globalAgentEnabled} // Disable when AI agent is enabled
                >
                  <Paperclip size={20} color={globalAgentEnabled ? "#ccc" : "#FF9500"} />
                </TouchableOpacity>

                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: globalAgentEnabled ? '#ccc' :
                        (message.trim() || selectedFiles.length > 0) ? '#FF9500' : '#ccc'
                    },
                    globalAgentEnabled && styles.buttonDisabled
                  ]}
                  onPress={handleSend}
                  disabled={globalAgentEnabled || (!message.trim() && selectedFiles.length === 0)} // Disable when AI agent is enabled
                  activeOpacity={0.7}
                >
                  <Send size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* WhatsApp Messaging Manager UI removed (background-only behavior) */}

      {/* REMOVE AgentNotification above input box */}
      {/* If AgentNotification is rendered above the input, remove it here. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Chat List Styles
  chatListView: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 90, // Account for fixed bottom tabs (74px height + 16px padding)
  },
  chatListHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24, // Increased height
    minHeight: 80, // Ensures taller header
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // whatsappManagerButton removed
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  agentModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
  },
  agentControlSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  agentControlGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  agentControlContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentControlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentControlText: {
    marginLeft: 12,
    flex: 1,
  },
  agentControlTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  agentControlSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  agentSwitch: {
    marginLeft: 12,
  },





  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: 8,
  },
  globalAgentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  globalSwitch: {
    marginLeft: 8,
  },
  chatListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  totalUnreadBadge: {
    backgroundColor: '#FF4500',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  totalUnreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  helpButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryTab: {
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeCategoryTabGradient: {
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.05 }],
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    maxHeight: 100,
  },
  inputEnabled: {
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#999',
    opacity: 0.6,
  },
  chatList: {
    flex: 1,
  },
  chatListItemContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    position: 'relative',
  },
  chatCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  chatListItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    position: 'relative',
  },
  selectedChatItem: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 149, 0, 0.6)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  aiIndicatorSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#333',
    flexShrink: 0,
  },
  chatSubheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatPhone: {
    fontSize: 12,
    color: '#333',
  },
  unreadBadge: {
    position: 'absolute',
    top: '50%',
    right: 4,
    transform: [{ translateY: -10 }],
    backgroundColor: '#FF4500',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  unreadCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 14,
    color: '#333',
  },
  // Chat View Styles
  chatView: {
    flex: 1,
  },
  chatHeader: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 9999,
  },
  headerGradientFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    width: '100%',
    position: 'relative',
    zIndex: 9999,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 80,
  },
  headerGradientInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 80,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  aiGlow: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255, 149, 0, 0.8)',
    borderRadius: 10,
    padding: 2,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerPhone: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
  },
  headerStatus: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
    marginTop: 2,
    fontStyle: 'italic',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  warningText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  switch: {
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 200,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 9998,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
    paddingBottom: 0,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 12,
  },
  messageContainer: {
    marginVertical: 4,
    position: 'relative',
  },
  messageCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 149, 0, 0.05)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.1)',
    position: 'relative',
  },
  userMessage: {
    backgroundColor: '#fff', // White background for user messages
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  agentMessage: {
    backgroundColor: '#fff', // White background for agent messages
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    paddingRight: 24, // Extra padding for AI icon
  },
  aiIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    padding: 2,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  aiIndicatorGradient: {
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  attachmentsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachmentTypeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
    textAlign: 'center',
    minWidth: 50,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
  },
  userMessageText: {
    color: '#333',
  },
  agentMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#333',
  },
  agentTimestamp: {
    color: '#666',
  },
  statusContainer: {
    marginLeft: 8,
    marginTop: 2,
  },
  inputSection: {
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
    paddingTop: 0,
  },
  inputContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  selectedFilesContainer: {
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  selectedFilesTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  fileTypeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
    textAlign: 'center',
    minWidth: 50,
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  filePath: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeFileButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  attachmentMenu: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 140,
  },
  attachmentMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  attachmentMenuText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  messageTypeIndicator: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#856404',
    fontFamily: 'monospace',
  },


  attachmentButton: {
    padding: 4,
    marginLeft: 8,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  inputAction: {
    padding: 8,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 4,
    maxHeight: 80,
  },
  disabledInput: {
    color: '#999',
  },
  sendButtonContainer: {
    marginLeft: 8,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#FF4500',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },

  // Agent Notification Styles
  agentNotification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardNameTime: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 60,
  },
  cardTimestamp: {
    fontSize: 11,
    color: '#666',
    flexShrink: 0,
    maxWidth: 160,
    marginRight: 70,
    marginLeft: 8,
    textAlign: 'right',
  },
  cardSecondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingRight: 60,
    minHeight: 20,
  },
  cardPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '400',
  },
  cardLastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  backgroundLoadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  backgroundLoadingText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Empty messages styles
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  inputControlsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff', // White background for text input
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff', // White background for attachment button
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Disabled state styles
  textInputDisabled: {
    color: '#999',
    borderColor: '#ccc',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  attachmentMenu: {
    position: 'absolute',
    bottom: 70,
    right: 16,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1000,
  },
  attachmentMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attachmentMenuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedFilesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedFilesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileTypeLabel: {
    fontSize: 20,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  filePath: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
  removeFileButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});

export default LiveChatScreen; 