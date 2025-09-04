import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatAPI } from './chatService';
import { sendNewMessageNotification } from '../utils/notifications';

// WhatsApp Business API constants
const WHATSAPP_24H_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const TEMPLATE_MESSAGE_TYPES = {
  FOLLOW_UP: 'follow_up_reminder',
  ENGAGEMENT: 'engagement_prompt',
  OFFER: 'special_offer',
  NEWS: 'news_update',
  SURVEY: 'quick_survey',
  CUSTOMER_SERVICE: 'customer_service_followup'
};

// Template message configurations
const TEMPLATE_MESSAGES = {
  [TEMPLATE_MESSAGE_TYPES.FOLLOW_UP]: {
    name: 'follow_up_reminder',
    language: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Customer name
          { type: 'text', text: '{{2}}' }  // Days since last contact
        ]
      }
    ]
  },
  [TEMPLATE_MESSAGE_TYPES.ENGAGEMENT]: {
    name: 'engagement_prompt',
    language: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' } // Customer name
        ]
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: 0,
        parameters: [
          { type: 'text', text: 'Yes, I\'m interested' }
        ]
      }
    ]
  },
  [TEMPLATE_MESSAGE_TYPES.OFFER]: {
    name: 'special_offer',
    language: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Customer name
          { type: 'text', text: '{{2}}' }  // Offer details
        ]
      }
    ]
  }
};

class WhatsAppMessagingService {
  constructor() {
    this.userEngagementCache = new Map();
    this.templateMessageQueue = [];
    this.isProcessingQueue = false;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }

  // Initialize the service
  async initialize() {
    try {
      console.log('🚀 WhatsAppMessagingService: Initializing...');
      
      // Load cached user engagement data
      await this.loadUserEngagementCache();
      
      // Start background processing
      this.startBackgroundProcessing();
      
      console.log('✅ WhatsAppMessagingService: Initialized successfully');
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Initialization failed:', error);
    }
  }

  // Check if user is within 24-hour messaging window
  async isWithinMessagingWindow(chatId) {
    try {
      const lastActivity = await this.getLastUserActivity(chatId);
      if (!lastActivity) return false;

      const timeSinceLastActivity = Date.now() - lastActivity.timestamp;
      const isWithinWindow = timeSinceLastActivity <= WHATSAPP_24H_WINDOW;

      console.log(`⏰ WhatsAppMessagingService: Chat ${chatId} - Time since last activity: ${Math.round(timeSinceLastActivity / (1000 * 60 * 60))} hours, Within window: ${isWithinWindow}`);

      return isWithinWindow;
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error checking messaging window:', error);
      return false; // Default to false for safety
    }
  }

  // Get last user activity timestamp
  async getLastUserActivity(chatId) {
    try {
      // Check cache first
      if (this.userEngagementCache.has(chatId)) {
        return this.userEngagementCache.get(chatId);
      }

      // Try to get from chat details
      const chatDetails = await chatAPI.getChatDetail(chatId);
      if (chatDetails?.messages && chatDetails.messages.length > 0) {
        // Find the last incoming message (from user)
        const lastIncomingMessage = chatDetails.messages
          .filter(msg => msg.sender === 'received' || msg.is_incoming_message === 1)
          .sort((a, b) => new Date(b.timestamp || b.updated_at || b.created_at) - new Date(a.timestamp || a.updated_at || a.created_at))[0];

        if (lastIncomingMessage) {
          const timestamp = new Date(lastIncomingMessage.timestamp || lastIncomingMessage.updated_at || lastIncomingMessage.created_at).getTime();
          const activityData = {
            timestamp,
            messageId: lastIncomingMessage.id,
            messageType: lastIncomingMessage.message_type || 'text'
          };

          // Cache the result
          this.userEngagementCache.set(chatId, activityData);
          await this.saveUserEngagementCache();

          return activityData;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error getting last user activity:', error);
      return null;
    }
  }

  // Smart message sender that automatically handles 24-hour window
  async sendSmartMessage(chatId, messageText, files = [], options = {}) {
    try {
      console.log(`📤 WhatsAppMessagingService: sendSmartMessage called for chat ${chatId}`);

      const isWithinWindow = await this.isWithinMessagingWindow(chatId);
      
      if (isWithinWindow) {
        // User is within 24-hour window - send regular message
        console.log(`✅ WhatsAppMessagingService: Chat ${chatId} within messaging window, sending regular message`);
        return await chatAPI.sendSmartMessage(chatId, messageText, files, options.aiAgentEnabled !== false);
      } else {
        // User is outside 24-hour window - send template message
        console.log(`⚠️ WhatsAppMessagingService: Chat ${chatId} outside messaging window, sending template message`);
        return await this.sendTemplateMessage(chatId, messageText, options);
      }
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: sendSmartMessage failed:', error);
      throw error;
    }
  }

  // Send template message when user is outside 24-hour window
  async sendTemplateMessage(chatId, messageText, options = {}) {
    try {
      const templateType = options.templateType || this.determineTemplateType(messageText);
      const template = TEMPLATE_MESSAGES[templateType];

      if (!template) {
        console.warn(`⚠️ WhatsAppMessagingService: No template found for type ${templateType}, falling back to follow_up`);
        return await this.sendTemplateMessage(chatId, messageText, { ...options, templateType: TEMPLATE_MESSAGE_TYPES.FOLLOW_UP });
      }

      // Get user details for personalization
      const userDetails = await this.getUserDetails(chatId);
      
      // Prepare template parameters
      const parameters = this.prepareTemplateParameters(templateType, messageText, userDetails);
      
      // Create template message payload
      const templatePayload = {
        type: 'template',
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: this.buildTemplateComponents(template, parameters)
        }
      };

      console.log(`📋 WhatsAppMessagingService: Sending template message ${templateType} to chat ${chatId}`);
      
      // Send via template endpoint (if available) or fallback to regular endpoint
      const response = await this.sendTemplateMessageToAPI(chatId, templatePayload);
      
      // Update engagement tracking
      await this.updateUserEngagement(chatId, 'template_sent', templateType);
      
      // Queue follow-up actions
      this.queueFollowUpActions(chatId, templateType, options);
      
      return response;
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: sendTemplateMessage failed:', error);
      
      // Fallback: try to send as regular message (might fail due to 24h window)
      console.log('🔄 WhatsAppMessagingService: Template message failed, trying fallback...');
      try {
        return await chatAPI.sendSmartMessage(chatId, messageText, [], false);
      } catch (fallbackError) {
        console.error('❌ WhatsAppMessagingService: Fallback also failed:', fallbackError);
        throw new Error(`Template message failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
      }
    }
  }

  // Determine appropriate template type based on message content
  determineTemplateType(messageText) {
    const text = messageText.toLowerCase();
    
    if (text.includes('follow up') || text.includes('reminder')) {
      return TEMPLATE_MESSAGE_TYPES.FOLLOW_UP;
    } else if (text.includes('offer') || text.includes('discount') || text.includes('deal')) {
      return TEMPLATE_MESSAGE_TYPES.OFFER;
    } else if (text.includes('survey') || text.includes('feedback') || text.includes('question')) {
      return TEMPLATE_MESSAGE_TYPES.SURVEY;
    } else if (text.includes('news') || text.includes('update') || text.includes('announcement')) {
      return TEMPLATE_MESSAGE_TYPES.NEWS;
    } else {
      return TEMPLATE_MESSAGE_TYPES.ENGAGEMENT; // Default
    }
  }

  // Prepare template parameters
  prepareTemplateParameters(templateType, messageText, userDetails) {
    const params = {};
    
    switch (templateType) {
      case TEMPLATE_MESSAGE_TYPES.FOLLOW_UP:
        params.name = userDetails.name || 'Valued Customer';
        params.daysSince = Math.ceil((Date.now() - (userDetails.lastActivity || Date.now())) / (1000 * 60 * 60 * 24));
        break;
      
      case TEMPLATE_MESSAGE_TYPES.ENGAGEMENT:
        params.name = userDetails.name || 'Valued Customer';
        break;
      
      case TEMPLATE_MESSAGE_TYPES.OFFER:
        params.name = userDetails.name || 'Valued Customer';
        params.offer = messageText || 'Special offer available';
        break;
      
      default:
        params.name = userDetails.name || 'Valued Customer';
    }
    
    return params;
  }

  // Build template components with parameters
  buildTemplateComponents(template, parameters) {
    return template.components.map(component => {
      if (component.type === 'body' && component.parameters) {
        return {
          ...component,
          parameters: component.parameters.map((param, index) => ({
            ...param,
            text: parameters[Object.keys(parameters)[index]] || param.text || ''
          }))
        };
      }
      return component;
    });
  }

  // Send template message to API
  async sendTemplateMessageToAPI(chatId, templatePayload) {
    try {
      // Try template-specific endpoint first
      const templateUrl = `/chat/template/${encodeURIComponent(chatId)}`;
      
      try {
        const response = await chatAPI.chatApi.post(templateUrl, templatePayload);
        console.log('✅ WhatsAppMessagingService: Template message sent via template endpoint');
        return response.data;
      } catch (templateError) {
        console.log('⚠️ WhatsAppMessagingService: Template endpoint failed, trying regular endpoint with template flag');
        
        // Fallback: send via regular endpoint with template flag
        const fallbackPayload = {
          ...templatePayload,
          is_template_message: true,
          template_type: templatePayload.template.name
        };
        
        const response = await chatAPI.sendMessage(chatId, JSON.stringify(fallbackPayload), 'template');
        console.log('✅ WhatsAppMessagingService: Template message sent via fallback endpoint');
        return response;
      }
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Failed to send template message:', error);
      throw error;
    }
  }

  // Get user details for personalization
  async getUserDetails(chatId) {
    try {
      const chatDetails = await chatAPI.getChatDetail(chatId);
      if (chatDetails?.data) {
        return {
          name: chatDetails.data.name || chatDetails.data.contact_name || 'Valued Customer',
          lastActivity: chatDetails.data.last_message_time || Date.now(),
          phone: chatDetails.data.phone || chatDetails.data.contact_phone
        };
      }
      return { name: 'Valued Customer', lastActivity: Date.now() };
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error getting user details:', error);
      return { name: 'Valued Customer', lastActivity: Date.now() };
    }
  }

  // Update user engagement tracking
  async updateUserEngagement(chatId, action, details = {}) {
    try {
      const now = Date.now();
      const engagement = this.userEngagementCache.get(chatId) || {};
      
      engagement.lastEngagement = now;
      engagement.lastAction = action;
      engagement.actionDetails = details;
      engagement.engagementCount = (engagement.engagementCount || 0) + 1;
      
      this.userEngagementCache.set(chatId, engagement);
      await this.saveUserEngagementCache();
      
      console.log(`📊 WhatsAppMessagingService: Updated engagement for chat ${chatId}:`, action);
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error updating user engagement:', error);
    }
  }

  // Queue follow-up actions
  queueFollowUpActions(chatId, templateType, options) {
    const followUp = {
      chatId,
      templateType,
      timestamp: Date.now(),
      scheduledTime: Date.now() + (options.followUpDelay || 24 * 60 * 60 * 1000), // Default: 24 hours
      action: 'follow_up_message',
      options
    };
    
    this.templateMessageQueue.push(followUp);
    console.log(`📋 WhatsAppMessagingService: Queued follow-up action for chat ${chatId}`);
  }

  // Start background processing for queued actions
  startBackgroundProcessing() {
    // Process queue every 5 minutes
    setInterval(() => {
      this.processTemplateMessageQueue();
    }, 5 * 60 * 1000);
    
    // Clean up old engagement data daily
    setInterval(() => {
      this.cleanupOldEngagementData();
    }, 24 * 60 * 60 * 1000);
    
    console.log('🔄 WhatsAppMessagingService: Background processing started');
  }



  // Process queued template messages
  async processTemplateMessageQueue() {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    const now = Date.now();
    
    try {
      const readyActions = this.templateMessageQueue.filter(action => action.scheduledTime <= now);
      
      for (const action of readyActions) {
        try {
          await this.executeFollowUpAction(action);
          
          // Remove completed action
          this.templateMessageQueue = this.templateMessageQueue.filter(a => a !== action);
        } catch (error) {
          console.error(`❌ WhatsAppMessagingService: Failed to execute follow-up action for chat ${action.chatId}:`, error);
          
          // Increment retry count
          const retryCount = this.retryAttempts.get(action.chatId) || 0;
          if (retryCount < this.maxRetries) {
            this.retryAttempts.set(action.chId, retryCount + 1);
            action.scheduledTime = now + (5 * 60 * 1000); // Retry in 5 minutes
          } else {
            // Remove failed action after max retries
            this.templateMessageQueue = this.templateMessageQueue.filter(a => a !== action);
            this.retryAttempts.delete(action.chatId);
          }
        }
      }
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error processing template message queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Execute follow-up action
  async executeFollowUpAction(action) {
    try {
      console.log(`🔄 WhatsAppMessagingService: Executing follow-up action for chat ${action.chatId}`);
      
      // Check if user is now within messaging window
      const isWithinWindow = await this.isWithinMessagingWindow(action.chatId);
      
      if (isWithinWindow) {
        // User is back within window - send regular follow-up
        const followUpMessage = this.generateFollowUpMessage(action.templateType);
        await chatAPI.sendSmartMessage(action.chatId, followUpMessage, [], true);
        console.log(`✅ WhatsAppMessagingService: Sent regular follow-up to chat ${action.chatId}`);
      } else {
        // Still outside window - send another template message
        const templateMessage = this.generateFollowUpTemplate(action.templateType);
        await this.sendTemplateMessage(action.chatId, templateMessage, { templateType: action.templateType });
        console.log(`✅ WhatsAppMessagingService: Sent template follow-up to chat ${action.chatId}`);
      }
      
      // Update engagement
      await this.updateUserEngagement(action.chatId, 'follow_up_sent', { templateType: action.templateType });
      
    } catch (error) {
      console.error(`❌ WhatsAppMessagingService: Failed to execute follow-up action for chat ${action.chatId}:`, error);
      throw error;
    }
  }

  // Generate follow-up message content
  generateFollowUpMessage(templateType) {
    const messages = {
      [TEMPLATE_MESSAGE_TYPES.FOLLOW_UP]: "Hi! I wanted to follow up on our previous conversation. How can I help you today?",
      [TEMPLATE_MESSAGE_TYPES.ENGAGEMENT]: "Great to hear from you again! Is there anything specific you'd like to discuss?",
      [TEMPLATE_MESSAGE_TYPES.OFFER]: "I have some exciting updates and offers to share with you. Would you like to hear more?",
      [TEMPLATE_MESSAGE_TYPES.SURVEY]: "I'd love to get your feedback on our recent interaction. Would you mind sharing your thoughts?",
      [TEMPLATE_MESSAGE_TYPES.NEWS]: "I have some important updates to share. Are you available for a quick chat?",
      [TEMPLATE_MESSAGE_TYPES.CUSTOMER_SERVICE]: "I wanted to check if everything was resolved to your satisfaction. Is there anything else you need help with?"
    };
    
    return messages[templateType] || messages[TEMPLATE_MESSAGE_TYPES.ENGAGEMENT];
  }

  // Generate follow-up template message
  generateFollowUpTemplate(templateType) {
    const messages = {
      [TEMPLATE_MESSAGE_TYPES.FOLLOW_UP]: "We haven't heard from you in a while. Would you like to continue our conversation?",
      [TEMPLATE_MESSAGE_TYPES.ENGAGEMENT]: "It's been a while since we last spoke. I'd love to reconnect and see how I can help!",
      [TEMPLATE_MESSAGE_TYPES.OFFER]: "I have some exclusive offers that might interest you. Would you like to learn more?",
      [TEMPLATE_MESSAGE_TYPES.SURVEY]: "Your feedback is valuable to us. Could you spare a moment to share your thoughts?",
      [TEMPLATE_MESSAGE_TYPES.NEWS]: "I have some exciting news to share. Would you like to be the first to know?",
      [TEMPLATE_MESSAGE_TYPES.CUSTOMER_SERVICE]: "I wanted to ensure you're completely satisfied with our service. Is there anything else I can help with?"
    };
    
    return messages[templateType] || messages[TEMPLATE_MESSAGE_TYPES.ENGAGEMENT];
  }

  // Load user engagement cache from storage
  async loadUserEngagementCache() {
    try {
      const cached = await AsyncStorage.getItem('whatsapp_user_engagement_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        this.userEngagementCache = new Map(Object.entries(parsed));
        console.log(`📊 WhatsAppMessagingService: Loaded ${this.userEngagementCache.size} cached user engagements`);
      }
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error loading user engagement cache:', error);
    }
  }

  // Save user engagement cache to storage
  async saveUserEngagementCache() {
    try {
      const cacheObject = Object.fromEntries(this.userEngagementCache);
      await AsyncStorage.setItem('whatsapp_user_engagement_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error saving user engagement cache:', error);
    }
  }

  // Clean up old engagement data
  cleanupOldEngagementData() {
    try {
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      let cleanedCount = 0;
      for (const [chatId, engagement] of this.userEngagementCache.entries()) {
        if (engagement.lastEngagement && engagement.lastEngagement < thirtyDaysAgo) {
          this.userEngagementCache.delete(chatId);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        this.saveUserEngagementCache();
        console.log(`🧹 WhatsAppMessagingService: Cleaned up ${cleanedCount} old engagement records`);
      }
    } catch (error) {
      console.error('❌ WhatsAppMessagingService: Error cleaning up old engagement data:', error);
    }
  }

  // Get messaging statistics
  getMessagingStats() {
    const stats = {
      totalUsers: this.userEngagementCache.size,
      templateMessagesSent: 0,
      regularMessagesSent: 0,
      usersOutsideWindow: 0,
      usersInsideWindow: 0
    };
    
    for (const [chatId, engagement] of this.userEngagementCache.entries()) {
      if (engagement.lastAction === 'template_sent') {
        stats.templateMessagesSent++;
      } else if (engagement.lastAction === 'regular_sent') {
        stats.regularMessagesSent++;
      }
      
      const timeSinceLastActivity = Date.now() - (engagement.timestamp || Date.now());
      if (timeSinceLastActivity > WHATSAPP_24H_WINDOW) {
        stats.usersOutsideWindow++;
      } else {
        stats.usersInsideWindow++;
      }
    }
    
    return stats;
  }

  // Reset service state (for testing/debugging)
  async reset() {
    this.userEngagementCache.clear();
    this.templateMessageQueue = [];
    this.retryAttempts.clear();
    await AsyncStorage.removeItem('whatsapp_user_engagement_cache');
    console.log('🔄 WhatsAppMessagingService: Service state reset');
  }
}

// Create singleton instance
const whatsappMessagingService = new WhatsAppMessagingService();

// Export the service
export default whatsappMessagingService;

// Export constants for external use
export { TEMPLATE_MESSAGE_TYPES, WHATSAPP_24H_WINDOW };
