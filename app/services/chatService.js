import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendNewMessageNotification } from '../utils/notifications';
import { authAPI, tokenManager } from './authService';

// Base API configuration
const API_BASE_URL = 'https://agents.echoleads.ai/api';

// Create axios instance with default config
const chatApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token with automatic refresh
chatApi.interceptors.request.use(
  async (config) => {
    try {
      // Get a valid token (this will automatically refresh if needed)
      const token = await authAPI.getValidToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔧 Request interceptor: Valid token added to headers');
        console.log('🔧 Request interceptor: Token length:', token.length);
        console.log('🔧 Request interceptor: Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('🔧 Request interceptor: No valid token available');
        // If no token is available, the request will likely fail with 401
        // This is expected behavior when user needs to re-authenticate
      }
      
      console.log('🔧 Request interceptor: Making request to:', config.url);
      console.log('🔧 Request interceptor: Full URL:', config.baseURL + config.url);
      console.log('🔧 Request interceptor: Headers:', config.headers);
    } catch (error) {
      console.error('🔧 Request interceptor: Error getting valid token:', error);
      // Continue with request even if token retrieval fails
      // The API will return 401 if authentication is required
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors and token refresh
chatApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔐 Response interceptor: 401 Unauthorized received');
      
      // Try to refresh the token
      try {
        console.log('🔐 Response interceptor: Attempting token refresh...');
        const newToken = await tokenManager.refreshToken();
        
        if (newToken && !originalRequest._retry) {
          console.log('🔐 Response interceptor: Token refreshed successfully, retrying request');
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with new token
          return chatApi(originalRequest);
        } else {
          console.log('🔐 Response interceptor: Token refresh failed or request already retried');
          // Clear stored credentials and let the app handle re-authentication
          await tokenManager.clearTokens();
        }
      } catch (refreshError) {
        console.error('🔐 Response interceptor: Token refresh failed:', refreshError);
        // Clear stored credentials
        await tokenManager.clearTokens();
      }
      
      // Return the original error if refresh failed or request already retried
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx server errors
    if (!originalRequest._retry &&
      (error.code === 'ECONNABORTED' ||
        (error.response && error.response.status >= 500))) {

      originalRequest._retry = true;
      console.log('🔄 Response interceptor: Retrying failed request:', originalRequest.url);

      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));

      return chatApi(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Track last message per chat
let previousLastMessageIds = {};

// Chat API functions
export const chatAPI = {
  // Get chat list
  // getChatList: async () => {
  //   try {
  //     console.log('📋 chatService: getChatList called');
  //     const response = await chatApi.get('/chat/list');
  //     console.log('📋 chatService: Chat list response received:', response.status);
  //     console.log('📋 chatService: Chat list data:', response.data);

  //     // Validate response structure
  //     if (response.data && response.data.status === true && Array.isArray(response.data.data)) {
  //       console.log('📋 chatService: Chat list validation successful, count:', response.data.data.length);
  //     } else {
  //       console.warn('📋 chatService: Unexpected response structure:', response.data);
  //     }

  //     return response.data;
  //   } catch (error) {
  //     console.error('📋 chatService: getChatList failed:', error.message);
  //     console.error('📋 chatService: Error status:', error.response?.status);
  //     console.error('📋 chatService: Error data:', error.response?.data);
  //     throw error;
  //   }
  // },

  getChatList: async () => {
    try {
      // Check if we have a valid token before making the request
      try {
        const token = await authAPI.getValidToken();
        if (!token) {
          console.error('📋 chatService: No valid token available for chat list request');
          return {
            status: false,
            message: 'Authentication required. Please log in again.',
            data: [],
            requiresAuth: true
          };
        }
      } catch (tokenError) {
        console.error('📋 chatService: Error getting valid token:', tokenError);
        return {
          status: false,
          message: 'Authentication error. Please log in again.',
          data: [],
          requiresAuth: true
        };
      }

      const response = await chatApi.get('/chat/list');
      const chats = response.data.data || [];

      // Check for new messages
      chats.forEach(async (chat) => {
        const chatId = chat.id;
        const lastMessage = chat.last_message;
        const lastMessageId = lastMessage?.id;

        // if (lastMessageId && previousLastMessageIds[chatId] !== lastMessageId) {
        //   if (previousLastMessageIds[chatId]) {
        //     // New message arrived → send notification
        //     await sendNewMessageNotification(chat.name, lastMessage.message, chatId);
        //     console.log('📩 New message notification sent for chat:', chatId);
        //   }
        //   previousLastMessageIds[chatId] = lastMessageId;
        // }
      });

      return response.data;
    } catch (error) {
      console.error('📋 chatService: getChatList failed:', error.message);
      console.error('📋 chatService: Error status:', error.response?.status);
      console.error('📋 chatService: Error data:', error.response?.data);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.error('📋 chatService: Authentication error (401) - token may be expired');
        return {
          status: false,
          message: 'Authentication failed. Please log in again.',
          data: [],
          requiresAuth: true
        };
      }

      // Handle other HTTP errors
      if (error.response?.status >= 400) {
        console.error('📋 chatService: HTTP error:', error.response.status);
        return {
          status: false,
          message: `Request failed (${error.response.status}). Please try again.`,
          data: [],
          httpError: true
        };
      }

      // Return a fallback response instead of throwing
      return {
        status: false,
        message: 'Failed to load chat list. Please check your connection and try again.',
        data: [],
        error: error.message,
        fallback: true
      };
    }
  },

  // Get chat messages for a specific chat
  getChatMessages: async (chatId) => {
    try {
      const response = await chatApi.get(`/chat/${chatId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get detailed chat/conversation by UID or ID
  getChatDetail: async (chatUidOrId) => {
    try {
      console.log('🔍 chatService: getChatDetail called with:', chatUidOrId);
      const url = `/chat/detail/${encodeURIComponent(chatUidOrId)}`;
      console.log('🔍 chatService: Making request to:', url);
      console.log('🔍 chatService: Full URL:', API_BASE_URL + url);

      // Check if we have a valid token before making the request
      try {
        const token = await authAPI.getValidToken();
        console.log('🔍 chatService: Valid auth token available:', !!token);
        console.log('🔍 chatService: Token length:', token ? token.length : 0);
        
        if (!token) {
          console.error('🔍 chatService: No valid token available for chat detail request');
          return {
            status: false,
            message: 'Authentication required. Please log in again.',
            data: [],
            messages: [],
            error: 'No valid authentication token',
            requiresAuth: true
          };
        }
      } catch (tokenError) {
        console.error('🔍 chatService: Error getting valid token:', tokenError);
        return {
          status: false,
          message: 'Authentication error. Please log in again.',
          data: [],
          messages: [],
          error: 'Token retrieval failed',
          requiresAuth: true
        };
      }

      const response = await chatApi.get(url);
      console.log('🔍 chatService: Response received:', response.status);
      console.log('🔍 chatService: Response data:', response.data);

      // ADDITIONAL DEBUG: Log response headers and structure
      console.log('🔍 chatService: Response headers:', response.headers);
      console.log('🔍 chatService: Response status text:', response.statusText);
      console.log('🔍 chatService: Response config:', response.config);

      // Validate response structure
      if (response.data && response.data.status === true && Array.isArray(response.data.data)) {
        console.log('🔍 chatService: Chat detail validation successful, message count:', response.data.data.length);

        // Transform API response to match expected format
        const transformedData = {
          ...response.data,
          messages: response.data.data.map((msg, index) => {
            console.log(`🔍 chatService: Processing message ${index}:`, {
              id: msg.id,
              message: msg.message,
              is_incoming_message: msg.is_incoming_message,
              original_sender: msg.sender,
              whatsappbot_id: msg.whatsappbot_id,
              contacts_id: msg.contacts_id,
              user_id: msg.user_id
            });

            const transformedMessage = {
              id: msg.id,
              text: msg.message || msg.text || '',
              // CRITICAL: Set sender based on is_incoming_message field
              // is_incoming_message === 1 -> 'received' (LEFT side - user messages)
              // is_incoming_message === 0 -> 'user' (RIGHT side - system/bot messages)
              sender: (msg.is_incoming_message === 1) ? 'received' : 'user',
              from: msg.from || 'contact',
              // Use created_at as primary timestamp for message creation
              timestamp: msg.created_at || msg.timestamp || new Date(),
              // Preserve both timestamp fields from API
              created_at: msg.created_at || msg.timestamp || new Date(),
              updated_at: msg.updated_at || msg.created_at || new Date(),
              // Add fields that the UI expects
              // CRITICAL: Preserve API direction field for left/right placement
              is_incoming_message: (msg.is_incoming_message !== undefined ? msg.is_incoming_message : (msg.status === 'received' ? 1 : 0)),
              message_type: msg.message_type || 'text',
              status: msg.status || 'sent',
              // Preserve original fields
              whatsappbot_id: msg.whatsappbot_id,
              contacts_id: msg.contacts_id,
              user_id: msg.user_id
            };

            console.log(`🔍 chatService: Transformed message ${index}:`, {
              original_is_incoming_message: msg.is_incoming_message,
              transformed_sender: transformedMessage.sender,
              positioning: transformedMessage.sender === 'received' ? 'LEFT (user)' : 'RIGHT (system/bot)'
            });

            return transformedMessage;
          })
        };

        console.log('🔍 chatService: Transformed data structure:', {
          messageCount: transformedData.messages.length,
          firstMessage: transformedData.messages[0],
          availableFields: transformedData.messages[0] ? Object.keys(transformedData.messages[0]) : []
        });

        return transformedData;
      } else {
        console.warn('🔍 chatService: Unexpected response structure:', response.data);

        // Return a fallback structure if the response doesn't match expected format
        return {
          status: true,
          message: 'Chat Detail (fallback)',
          data: response.data?.data || response.data || [],
          messages: response.data?.data || response.data || [],
          fallback: true
        };
      }
    } catch (error) {
      console.error('🔍 chatService: getChatDetail failed:', error.message);
      console.error('🔍 chatService: Error status:', error.response?.status);
      console.error('🔍 chatService: Error data:', error.response?.data);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.error('🔍 chatService: Authentication error (401) - token may be expired');
        return {
          status: false,
          message: 'Authentication failed. Please log in again.',
          data: [],
          messages: [],
          error: 'Authentication required',
          requiresAuth: true
        };
      }

      // Handle other HTTP errors
      if (error.response?.status >= 400) {
        console.error('🔍 chatService: HTTP error:', error.response.status);
        return {
          status: false,
          message: `Request failed (${error.response.status}). Please try again.`,
          data: [],
          messages: [],
          error: `HTTP ${error.response.status}`,
          httpError: true
        };
      }

      // ADDITIONAL DEBUG: Log more error details
      if (error.response) {
        console.error('🔍 chatService: Response headers:', error.response.headers);
        console.error('🔍 chatService: Response config:', error.response.config);
      }
      if (error.request) {
        console.error('🔍 chatService: Request was made but no response received');
        console.error('🔍 chatService: Request details:', error.request);
      }
      console.error('🔍 chatService: Error code:', error.code);
      console.error('🔍 chatService: Error message:', error.message);

      // Return a fallback response instead of throwing
      return {
        status: false,
        message: 'Failed to fetch chat details. Please check your connection and try again.',
        data: [],
        messages: [],
        error: error.message,
        fallback: true
      };
    }
  },

  // Mark chat as read
  markChatAsRead: async (chatUidOrId) => {
    try {
      console.log('📖 chatService: markChatAsRead called with:', chatUidOrId);
      const url = `/chat/read/${encodeURIComponent(chatUidOrId)}`;
      console.log('📖 chatService: Making request to:', url);
      console.log('📖 chatService: Full URL:', API_BASE_URL + url);

      const response = await chatApi.post(url);
      console.log('📖 chatService: Mark as read response received:', response.status);
      console.log('📖 chatService: Mark as read response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('📖 chatService: markChatAsRead failed:', error.message);
      console.error('📖 chatService: Error status:', error.response?.status);
      console.error('📖 chatService: Error data:', error.response?.data);
      throw error;
    }
  },

  // Clear chat history
  clearChat: async (chatUidOrId) => {
    try {
      console.log('🗑️ chatService: clearChat called with:', chatUidOrId);
      const url = `/chat/clear/${encodeURIComponent(chatUidOrId)}`;
      console.log('🗑️ chatService: Making request to:', url);
      console.log('🗑️ chatService: Full URL:', API_BASE_URL + url);

      const response = await chatApi.post(url);
      console.log('🗑️ chatService: Clear chat response received:', response.status);
      console.log('🗑️ chatService: Clear chat response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('🗑️ chatService: clearChat failed:', error.message);
      console.error('🗑️ chatService: Error status:', error.response?.status);
      console.error('🗑️ chatService: Error data:', error.response?.data);
      throw error;
    }
  },

  // Send a message to a specific chat
  sendMessage: async (chatUidOrId, messageText, messageType = 'text', aiAgentEnabled = true) => {
    try {
      console.log('🔍 chatService: sendMessage called with:', { chatUidOrId, messageText, messageType, aiAgentEnabled });
      const url = `/chat/sendmsg/${encodeURIComponent(chatUidOrId)}`;
      console.log('🔍 chatService: Making request to:', url);
      console.log('🔍 chatService: Full URL:', API_BASE_URL + url);

      // Backend expects multipart form-data with AI agent status
      const formData = new FormData();
      formData.append('message', messageText || '');
      formData.append('message_type', messageType || 'text');
      // CRITICAL: Include AI agent status so backend knows whether to let bot respond
      // "1" = AI agent ENABLED (bot will respond automatically)
      // "0" = AI agent DISABLED (bot will NOT respond, only system messages)
      formData.append('enable_ai_bot', aiAgentEnabled ? "1" : "0");

      console.log('🔍 chatService: Request body (FormData, text-only):', { 
        message: messageText, 
        message_type: messageType,
        enable_ai_bot: aiAgentEnabled ? "1" : "0",
        aiBehavior: aiAgentEnabled ? "Bot responds automatically" : "Bot does not respond"
      });

      const response = await chatApi.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('🔍 chatService: Send message response received:', response.status);
      console.log('🔍 chatService: Send message response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('🔍 chatService: sendMessage failed:', error.message);
      console.error('🔍 chatService: Error status:', error.response?.status);
      console.error('🔍 chatService: Error data:', error.response?.data);
      throw error;
    }
  },

  // Send a message with file attachments
  sendMessageWithFiles: async (chatUidOrId, messageText, files, messageType = 'file', aiAgentEnabled = true) => {
    try {
      console.log('📎 chatService: sendMessageWithFiles called with:', { chatUidOrId, messageText, fileCount: files.length, messageType, aiAgentEnabled });
      const url = `/chat/sendmsg/${encodeURIComponent(chatUidOrId)}`;
      console.log('📎 chatService: Making request to:', url);
      console.log('📎 chatService: Full URL:', API_BASE_URL + url);

      // Backend accepts message, message_type, file_path (binary), and AI agent status
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('message_type', messageType);
      // CRITICAL: Include AI agent status so backend knows whether to let bot respond
      // "1" = AI agent ENABLED (bot will respond automatically)
      // "0" = AI agent DISABLED (bot will NOT respond, only system messages)
      formData.append('enable_ai_bot', aiAgentEnabled ? "1" : "0");

      // Handle multiple files - append each file to file_path
      if (files.length === 0) {
        throw new Error('No files provided');
      }

      // Add all files to the form data
      files.forEach((file, index) => {
        const fileData = {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        };

        // For multiple files, we can either append with index or use the same key
        // Based on your API example showing "▲ 2 files", it seems to accept multiple files under the same key
        formData.append('file_path', fileData);
        console.log(`📎 Sending file ${index + 1}/${files.length} as file_path:`, file.name, file.mimeType, file.uri);
      });
      console.log('📎 AI Agent Status:', aiAgentEnabled ? "1" : "0");
      console.log('📎 AI Behavior:', aiAgentEnabled ? "Bot responds automatically" : "Bot does not respond");

      // Debug: Log the actual FormData contents
      console.log('📎 chatService: FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`📎 ${key}:`, value);
      }

      console.log('📎 chatService: Request body (FormData):', formData);

      // Test: Try to log FormData contents to see if it's working
      try {
        console.log('📎 FormData test - entries count:', formData.getParts ? formData.getParts().length : 'getParts not available');
        if (formData.getParts) {
          const parts = formData.getParts();
          console.log('📎 FormData parts:', parts);
        }
      } catch (e) {
        console.log('📎 FormData test failed:', e.message);
      }

      const response = await chatApi.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📎 chatService: Send message with files response received:', response.status);
      console.log('📎 chatService: Send message with files response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('📎 chatService: sendMessageWithFiles failed:', error.message);
      console.error('📎 chatService: Error status:', error.response?.status);
      console.error('📎 chatService: Error data:', error.response?.data);
      throw error;
    }
  },

  // Send a message with specific file type and path
  sendMessageWithFileType: async (chatUidOrId, messageText, file, messageType, aiAgentEnabled = true) => {
    try {
      console.log('📁 chatService: sendMessageWithFileType called with:', { chatUidOrId, messageText, fileName: file.name, messageType, aiAgentEnabled });
      const url = `/chat/sendmsg/${encodeURIComponent(chatUidOrId)}`;
      console.log('📁 chatService: Making request to:', url);
      console.log('📁 chatService: Full URL:', API_BASE_URL + url);

      // Backend accepts message, message_type, file_path (binary), and AI agent status
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('message_type', messageType);
      // CRITICAL: Include AI agent status so backend knows whether to let bot respond
      // "1" = AI agent ENABLED (bot will respond automatically)
      // "0" = AI agent DISABLED (bot will NOT respond, only system messages)
      formData.append('enable_ai_bot', aiAgentEnabled ? "1" : "0");

      const fileData = {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      };

      formData.append('file_path', fileData);
      console.log('📁 Sending file as file_path:', file.name, file.mimeType, file.uri);
      console.log('📁 AI Agent Status:', aiAgentEnabled ? "1" : "0");
      console.log('📁 AI Behavior:', aiAgentEnabled ? "Bot responds automatically" : "Bot does not respond");

      console.log('📁 chatService: Request body (FormData):', formData);

      const response = await chatApi.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📁 chatService: Send message with file type response received:', response.status);
      console.log('📁 chatService: Send message with file type response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('📁 chatService: sendMessageWithFileType failed:', error.message);
      console.error('📁 chatService: Error status:', error.response?.status);
      console.error('📁 chatService: Error data:', error.response?.data);
      throw error;
    }
  },

  // Mark chat as read
  markAsRead: async (chatId) => {
    try {
      const response = await chatApi.post(`/chat/${chatId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear chat history
  clearChat: async (chatId) => {
    try {
      const response = await chatApi.delete(`/chat/${chatId}/clear`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Discover available endpoints (for debugging)
  discoverEndpoints: async () => {
    try {
      console.log('🔍 chatService: Discovering available endpoints...');

      // Try common discovery endpoints
      const discoveryEndpoints = [
        '/api/routes',
        '/routes',
        '/api/endpoints',
        '/endpoints',
        '/api/documentation',
        '/documentation',
        '/api/swagger',
        '/swagger',
        '/api/openapi',
        '/openapi'
      ];

      for (const endpoint of discoveryEndpoints) {
        try {
          const response = await chatApi.get(endpoint);
          console.log(`🔍 chatService: Found discovery endpoint: ${endpoint}`, response.data);
          return response.data;
        } catch (error) {
          console.log(`🔍 chatService: Discovery endpoint ${endpoint} failed:`, error.response?.status);
        }
      }

      console.log('🔍 chatService: No discovery endpoints found');
      return null;
    } catch (error) {
      console.error('🔍 chatService: Discovery failed:', error.message);
      return null;
    }
  },

  // Get AI Agent Status
  getAIAgentStatus: async () => {
    try {
      console.log('🔧 chatService: getAIAgentStatus called');

      // Try the primary endpoint first
      let endpoint = '/aiagent/status';
      let response;

      try {
        response = await chatApi.get(endpoint);
        console.log('🔧 chatService: getAIAgentStatus response received:', response);
        console.log('🔧 chatService: Response status:', response.status);
        console.log('🔧 chatService: Response data:', response.data);
      } catch (primaryError) {
        console.log('🔧 chatService: Primary endpoint /aiagent/status not available (404 expected)');

        // Try alternative endpoints if the primary one fails
        const alternativeEndpoints = [
          '/aiagent/current',
          '/aiagent/info',
          '/aiagent',
          '/bot/status',
          '/bot/aiagent/status'
        ];

        for (const altEndpoint of alternativeEndpoints) {
          try {
            console.log(`🔧 chatService: Trying alternative endpoint: ${altEndpoint}`);
            response = await chatApi.get(altEndpoint);
            console.log(`🔧 chatService: Alternative endpoint ${altEndpoint} succeeded`);
            break;
          } catch (altError) {
            // Don't log 404 errors as they're expected when endpoints don't exist
            if (altError.response?.status !== 404) {
              console.log(`🔧 chatService: Alternative endpoint ${altEndpoint} failed with status:`, altError.response?.status);
            }
          }
        }

        if (!response) {
          console.log('🔧 chatService: All AI agent status endpoints are not available (expected for this API)');
          // Don't throw error, just return fallback
        }
      }

      // Parse the response to determine if AI agent is enabled or disabled
      // Based on the API response structure where enable_ai_bot field indicates:
      // "1" = AI agent ENABLED (active)
      // "0" = AI agent DISABLED (inactive)
      let aiStatus = 'inactive'; // default to inactive (safer default)

      if (response && response.data && response.data.enable_ai_bot !== undefined) {
        aiStatus = response.data.enable_ai_bot === "1" ? 'active' : 'inactive';
        console.log('🔧 chatService: Parsed AI agent status (enable_ai_bot):', aiStatus);
      } else if (response && response.data && response.data.status !== undefined) {
        // Fallback to status field if enable_ai_bot is not present
        aiStatus = response.data.status;
        console.log('🔧 chatService: Using status field:', aiStatus);
      } else if (response && response.data && response.data.enabled !== undefined) {
        // Another possible field name
        aiStatus = response.data.enabled ? 'active' : 'inactive';
        console.log('🔧 chatService: Using enabled field:', aiStatus);
      } else {
        console.log('🔧 chatService: No AI agent status fields found, using default: inactive');
      }

      return {
        status: aiStatus,
        rawData: response?.data || { fallback: true, message: 'Using default status' }
      };

    } catch (error) {
      console.log('🔧 chatService: getAIAgentStatus encountered unexpected error:', error.message);

      // Return a default status instead of throwing an error
      console.log('🔧 chatService: Returning default status due to API unavailability');
      return {
        status: 'inactive', // Default to inactive (safer default)
        rawData: {
          error: 'API endpoints not available',
          fallback: true,
          message: 'Using default inactive status'
        }
      };
    }
  },

  // Update AI Agent Status
  updateAIAgentStatus: async (status) => {
    try {
      console.log('🔧 chatService: updateAIAgentStatus called with status:', status);

      // API uses enable_ai_bot field where:
      // "1" = AI agent ENABLED (active)
      // "0" = AI agent DISABLED (inactive)
      const enableAiBot = status === 'active' ? "1" : "0";

      console.log('🔧 chatService: Setting enable_ai_bot to:', enableAiBot);

      // Try the primary endpoint first
      let endpoint = '/aiagent/update';
      let response;

      try {
        response = await chatApi.post(endpoint, {
          enable_ai_bot: enableAiBot
        });
        console.log('🔧 chatService: Primary endpoint succeeded');
      } catch (primaryError) {
        console.log('🔧 chatService: Primary endpoint /aiagent/update not available (404 expected)');

        // Try alternative endpoints if the primary one fails
        const alternativeEndpoints = [
          '/aiagent/set',
          '/aiagent/configure',
          '/bot/update',
          '/bot/aiagent/update'
        ];

        for (const altEndpoint of alternativeEndpoints) {
          try {
            console.log(`🔧 chatService: Trying alternative endpoint: ${altEndpoint}`);
            response = await chatApi.post(altEndpoint, {
              enable_ai_bot: enableAiBot
            });
            console.log(`🔧 chatService: Alternative endpoint ${altEndpoint} succeeded`);
            break;
          } catch (altError) {
            // Don't log 404 errors as they're expected when endpoints don't exist
            if (altError.response?.status !== 404) {
              console.log(`🔧 chatService: Alternative endpoint ${altEndpoint} failed with status:`, altError.response?.status);
            }
          }
        }

        if (!response) {
          console.log('🔧 chatService: All AI agent update endpoints are not available (expected for this API)');
          // Don't throw error, just return fallback
        }
      }

      if (response) {
        console.log('🔧 chatService: API response received:', response);
        console.log('🔧 chatService: Response status:', response.status);
        console.log('🔧 chatService: Response data:', response.data);

        return response.data;
      } else {
        // Return a mock success response when all endpoints fail
        console.log('🔧 chatService: Returning mock success response due to API endpoint unavailability');
        return {
          status: 'success',
          message: 'AI agent status updated (mock response - API endpoints not available)',
          data: {
            enable_ai_bot: enableAiBot,
            status: status,
            fallback: true
          }
        };
      }

    } catch (error) {
      console.log('🔧 chatService: updateAIAgentStatus encountered unexpected error:', error.message);

      // Return a mock success response instead of throwing an error
      console.log('🔧 chatService: Returning mock success response due to unexpected error');
      return {
        status: 'success',
        message: 'AI agent status updated (mock response - error occurred)',
        data: {
          enable_ai_bot: status === 'active' ? "1" : "0",
          status: status,
          fallback: true,
          error: error.message
        }
      };
    }
  },

  // Test chat detail API functionality
  testChatDetailAPI: async (chatUidOrId) => {
    try {
      console.log('🧪 chatService: Testing chat detail API with:', chatUidOrId);

      const result = await chatAPI.getChatDetail(chatUidOrId);
      console.log('🧪 chatService: Test result:', result);

      return {
        success: true,
        message: 'Chat detail API test successful',
        data: result,
        messageCount: result.messages ? result.messages.length : 0,
        hasFallback: result.fallback === true
      };
    } catch (error) {
      console.error('🧪 chatService: Chat detail API test failed:', error);
      return {
        success: false,
        message: 'Chat detail API test failed',
        error: error.message
      };
    }
  },

  // Test chat detail API endpoint
  testChatDetailEndpoint: async (chatUidOrId) => {
    try {
      console.log('🧪 chatService: Testing chat detail endpoint with:', chatUidOrId);
      const url = `/chat/detail/${encodeURIComponent(chatUidOrId)}`;
      console.log('🧪 chatService: Test URL:', url);
      console.log('🧪 chatService: Full test URL:', API_BASE_URL + url);

      // Check if we have a valid token
      const token = await authAPI.getValidToken();
      console.log('🧪 chatService: Test - Valid auth token available:', !!token);
      console.log('🧪 chatService: Test - Token length:', token ? token.length : 0);

      if (!token) {
        return {
          success: false,
          error: 'No valid authentication token',
          requiresAuth: true
        };
      }

      // Make a simple HEAD request to test endpoint accessibility
      const testResponse = await chatApi.head(url);
      console.log('🧪 chatService: Test HEAD response status:', testResponse.status);
      console.log('🧪 chatService: Test HEAD response headers:', testResponse.headers);

      return {
        success: true,
        status: testResponse.status,
        message: 'Endpoint is accessible'
      };
    } catch (error) {
      console.error('🧪 chatService: Test failed:', error.message);
      console.error('🧪 chatService: Test error status:', error.response?.status);
      console.error('🧪 chatService: Test error data:', error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required',
          requiresAuth: true
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  // Function to check if a token is about to expire and refresh if needed
  checkAndRefreshToken: async () => {
    try {
      console.log('🔄 chatService: Checking token expiration...');
      const token = await authAPI.getValidToken();
      
      if (token) {
        console.log('✅ chatService: Token is valid');
        return { valid: true, token };
      } else {
        console.log('⚠️ chatService: No valid token available');
        return { valid: false, requiresAuth: true };
      }
    } catch (error) {
      console.error('❌ chatService: Error checking token:', error);
      return { valid: false, error: error.message, requiresAuth: true };
    }
  },

  // Send a message directly to user (bypass AI agent)
  sendDirectMessage: async (chatUidOrId, messageText, files = [], aiAgentEnabled = false) => {
    try {
      const targetId = typeof chatUidOrId === 'string' || typeof chatUidOrId === 'number'
        ? String(chatUidOrId)
        : (chatUidOrId?.toString?.() || '');
      console.log('📤 chatService: sendDirectMessage called with:', {
        chatUidOrId: targetId,
        textLen: (messageText || '').length,
        fileCount: files.length,
        aiAgentEnabled
      });

      // Direct endpoint preferred path
      const url = `/chat/direct/${encodeURIComponent(targetId)}`;

      // Helper to post one file with message using backend's common field names
      const postOneFile = async (file, detectedType) => {
        const formData = new FormData();
        formData.append('message', messageText || '');
        formData.append('message_type', detectedType || 'file');
        formData.append('direct_message', '1');

        const fileData = {
          uri: file.uri,
          type: file.mimeType || file.type,
          name: file.name,
        };
        // Align with sendmsg convention used by backend
        formData.append('file_path', fileData);

        console.log('📤 sendDirectMessage: Posting one file:', {
          name: file.name,
          type: fileData.type,
          message_type: detectedType
        });

        const res = await chatApi.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res;
      };

      // No files → send text only
      if (!files || files.length === 0) {
        const res = await chatApi.post(url, {
          message: (messageText || '').trim(),
          message_type: 'text',
          direct_message: '1'
        });
        console.log('✅ sendDirectMessage: Text sent OK via direct');
        return res.data;
      }

      // With files → send sequentially (server often expects single file per request)
      let lastResponseData = null;
      for (const file of files) {
        const mime = file.mimeType || file.type || 'application/octet-stream';
        let messageType = 'file';
        if (mime.startsWith('image/')) messageType = 'image';
        else if (mime.startsWith('video/')) messageType = 'video';
        else if (mime.startsWith('audio/')) messageType = 'audio';
        else if (mime.includes('pdf') || mime.includes('document') || mime.includes('text')) messageType = 'document';

        const res = await postOneFile(file, messageType);
        lastResponseData = res.data;
      }
      console.log('✅ sendDirectMessage: All files sent OK via direct');
      return lastResponseData;
    } catch (directError) {
      console.log('⚠️ sendDirectMessage: Direct path failed:', directError?.response?.status, directError?.message);
      // Fallback to regular sendmsg with AI disabled
      if (files && files.length > 0) {
        return await chatAPI.sendMessageWithFiles(chatUidOrId, messageText || '', files, 'file', false);
      }
      return await chatAPI.sendMessage(chatUidOrId, (messageText || '').trim(), 'text', false);
    }
  },

  // Check available messaging endpoints
  checkMessagingEndpoints: async () => {
    try {
      console.log('🔍 chatService: Checking available messaging endpoints...');
      
      const endpoints = [
        '/chat/sendmsg',
        '/chat/direct',
        '/chat/user-message',
        '/chat/human-message'
      ];
      
      const availableEndpoints = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await chatApi.head(endpoint);
          if (response.status === 200 || response.status === 405) { // 405 = Method Not Allowed (endpoint exists)
            availableEndpoints.push(endpoint);
            console.log(`✅ Endpoint available: ${endpoint}`);
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.log(`⚠️ Endpoint ${endpoint} returned status: ${error.response?.status}`);
          }
        }
      }
      
      console.log('🔍 Available messaging endpoints:', availableEndpoints);
      return availableEndpoints;
    } catch (error) {
      console.error('❌ checkMessagingEndpoints failed:', error.message);
      return [];
    }
  },

  // Test function to debug send message issues
  testSendMessage: async (chatUidOrId, messageText = 'Test message') => {
    try {
      console.log('🧪 chatService: testSendMessage called with:', { chatUidOrId, messageText });
      
      // Test basic send message
      const result = await chatAPI.sendMessage(chatUidOrId, messageText, 'text', false);
      console.log('🧪 chatService: testSendMessage result:', result);
      
      return {
        success: true,
        message: 'Test message sent successfully',
        result
      };
    } catch (error) {
      console.error('🧪 chatService: testSendMessage failed:', error);
      return {
        success: false,
        message: 'Test message failed',
        error: error.message,
        fullError: error
      };
    }
  },

  // Debug function to check contact/chat validity
  debugContactInfo: async (chatUidOrId) => {
    try {
      console.log('🔍 chatService: debugContactInfo called with:', { chatUidOrId });
      
      // Try to get chat details to validate the contact exists
      const chatDetails = await chatAPI.getChatDetail(chatUidOrId);
      console.log('🔍 chatService: debugContactInfo - chat details:', chatDetails);
      
      return {
        success: true,
        message: 'Contact found and valid',
        chatDetails,
        contactId: chatUidOrId
      };
    } catch (error) {
      console.error('🔍 chatService: debugContactInfo failed:', error);
      
      // Check if it's a contact not found error
      if (error.response?.status === 500 && 
          error.response?.data?.message?.includes('No query results for model [App\\Http\\Model\\Contacts]')) {
        return {
          success: false,
          message: 'Contact not found in database',
          error: 'The contact ID provided does not exist in the database',
          status: 500,
          contactId: chatUidOrId
        };
      }
      
      return {
        success: false,
        message: 'Error checking contact info',
        error: error.message,
        status: error.response?.status,
        contactId: chatUidOrId
      };
    }
  },

  // Smart send message function that automatically detects type and handles both text and files
  sendSmartMessage: async (chatUidOrId, messageText, files = [], aiAgentEnabled = true) => {
    try {
      console.log('🧠 chatService: sendSmartMessage called with:', { 
        chatUidOrId, 
        messageText, 
        fileCount: files.length, 
        aiAgentEnabled 
      });

      // Validate inputs
      if (!chatUidOrId) {
        throw new Error('Chat identifier is required');
      }

      // If no files, send as text message
      if (!files || files.length === 0) {
        if (!messageText || !messageText.trim()) {
          throw new Error('Message text is required when no files are provided');
        }
        console.log('🧠 chatService: Sending text message with AI agent status:', aiAgentEnabled ? "1" : "0");
        return await chatAPI.sendMessage(chatUidOrId, messageText.trim(), 'text', aiAgentEnabled);
      }

      // If files are provided, determine the message type
      let messageType = 'file';
      const primaryFile = files[0];
      
      if (primaryFile) {
        const mimeType = primaryFile.mimeType || primaryFile.type || '';
        const fileType = primaryFile.type || '';
        
        // Use the detected file type from the frontend if available
        if (fileType === 'image' || mimeType.startsWith('image/')) {
          messageType = 'image';
        } else if (fileType === 'video' || mimeType.startsWith('video/')) {
          messageType = 'video';
        } else if (fileType === 'audio' || mimeType.startsWith('audio/')) {
          messageType = 'audio';
        } else if (fileType === 'document' || mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
          messageType = 'document';
        } else if (fileType === 'archive' || mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
          messageType = 'archive';
        } else if (fileType === 'folder') {
          messageType = 'folder';
        } else {
          messageType = 'file';
        }
      }

      console.log('🧠 chatService: Detected message type:', messageType);
      console.log('🧠 chatService: Primary file:', {
        name: primaryFile.name,
        mimeType: primaryFile.mimeType || primaryFile.type,
        size: primaryFile.size
      });
      console.log('🧠 chatService: Sending file message with AI agent status:', aiAgentEnabled ? "1" : "0");

      // Send message with files
      return await chatAPI.sendMessageWithFiles(chatUidOrId, messageText || '', files, messageType, aiAgentEnabled);

    } catch (error) {
      console.error('🧠 chatService: sendSmartMessage failed:', error.message);
      throw error;
    }
  },
};

export default chatApi;
