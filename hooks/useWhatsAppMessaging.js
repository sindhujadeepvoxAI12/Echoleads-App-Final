import { useState, useEffect, useCallback, useRef } from 'react';
import whatsappMessagingService, { TEMPLATE_MESSAGE_TYPES } from '../app/services/whatsappMessagingService';

export const useWhatsAppMessaging = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messagingStats, setMessagingStats] = useState(null);
  const [userEngagementStatus, setUserEngagementStatus] = useState(new Map());
  
  const serviceRef = useRef(whatsappMessagingService);

  // Initialize the service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await serviceRef.current.initialize();
        setIsInitialized(true);
        
        // Load initial stats
        const stats = serviceRef.current.getMessagingStats();
        setMessagingStats(stats);
        
        console.log('✅ useWhatsAppMessaging: Service initialized successfully');
      } catch (err) {
        console.error('❌ useWhatsAppMessaging: Service initialization failed:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized]);

  // Check if a user is within the 24-hour messaging window
  const checkMessagingWindow = useCallback(async (chatId) => {
    try {
      setError(null);
      const isWithinWindow = await serviceRef.current.isWithinMessagingWindow(chatId);
      
      // Update engagement status
      setUserEngagementStatus(prev => new Map(prev).set(chatId, {
        isWithinWindow,
        lastChecked: Date.now()
      }));
      
      return isWithinWindow;
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error checking messaging window:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Send a smart message that automatically handles the 24-hour window
  const sendSmartMessage = useCallback(async (chatId, messageText, files = [], options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await serviceRef.current.sendSmartMessage(chatId, messageText, files, options);
      
      // Update stats after sending
      const updatedStats = serviceRef.current.getMessagingStats();
      setMessagingStats(updatedStats);
      
      // Update engagement status
      await checkMessagingWindow(chatId);
      
      return result;
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error sending smart message:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkMessagingWindow]);

  // Send a template message specifically
  const sendTemplateMessage = useCallback(async (chatId, messageText, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await serviceRef.current.sendTemplateMessage(chatId, messageText, options);
      
      // Update stats after sending
      const updatedStats = serviceRef.current.getMessagingStats();
      setMessagingStats(updatedStats);
      
      // Update engagement status
      await checkMessagingWindow(chatId);
      
      return result;
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error sending template message:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkMessagingWindow]);

  // Get user engagement details
  const getUserEngagement = useCallback(async (chatId) => {
    try {
      setError(null);
      const lastActivity = await serviceRef.current.getLastUserActivity(chatId);
      const isWithinWindow = await serviceRef.current.isWithinMessagingWindow(chatId);
      
      const engagement = {
        lastActivity,
        isWithinWindow,
        timeSinceLastActivity: lastActivity ? Date.now() - lastActivity.timestamp : null,
        hoursSinceLastActivity: lastActivity ? Math.round((Date.now() - lastActivity.timestamp) / (1000 * 60 * 60)) : null,
        daysSinceLastActivity: lastActivity ? Math.round((Date.now() - lastActivity.timestamp) / (1000 * 60 * 60 * 24)) : null
      };
      
      // Update engagement status
      setUserEngagementStatus(prev => new Map(prev).set(chatId, {
        ...engagement,
        lastChecked: Date.now()
      }));
      
      return engagement;
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error getting user engagement:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Refresh messaging statistics
  const refreshStats = useCallback(() => {
    try {
      const stats = serviceRef.current.getMessagingStats();
      setMessagingStats(stats);
      return stats;
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error refreshing stats:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Get all users outside the messaging window
  const getUsersOutsideWindow = useCallback(async () => {
    try {
      setError(null);
      const usersOutside = [];
      
      // This would need to be implemented based on your chat list structure
      // For now, we'll return the stats we have
      const stats = serviceRef.current.getMessagingStats();
      return {
        count: stats?.usersOutsideWindow || 0,
        stats
      };
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error getting users outside window:', err);
      setError(err.message);
      return { count: 0, stats: null };
    }
  }, []);

  // Send bulk template messages to users outside the window
  const sendBulkTemplateMessages = useCallback(async (messageText, templateType = TEMPLATE_MESSAGE_TYPES.ENGAGEMENT, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would need to be implemented based on your chat list structure
      // For now, we'll return a placeholder
      console.log('📤 useWhatsAppMessaging: Bulk template message functionality would be implemented here');
      
      return {
        success: true,
        message: 'Bulk template message functionality needs to be implemented based on your chat list structure'
      };
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error sending bulk template messages:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset service state (for testing/debugging)
  const resetService = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await serviceRef.current.reset();
      
      // Reset local state
      setMessagingStats(null);
      setUserEngagementStatus(new Map());
      setIsInitialized(false);
      
      // Re-initialize
      await serviceRef.current.initialize();
      setIsInitialized(true);
      
      const stats = serviceRef.current.getMessagingStats();
      setMessagingStats(stats);
      
      console.log('✅ useWhatsAppMessaging: Service reset successfully');
    } catch (err) {
      console.error('❌ useWhatsAppMessaging: Error resetting service:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get engagement status for a specific chat
  const getChatEngagementStatus = useCallback((chatId) => {
    return userEngagementStatus.get(chatId) || null;
  }, [userEngagementStatus]);

  // Check if all chats are within messaging window
  const areAllChatsWithinWindow = useCallback(() => {
    if (userEngagementStatus.size === 0) return true;
    
    for (const [chatId, status] of userEngagementStatus.entries()) {
      if (!status.isWithinWindow) {
        return false;
      }
    }
    return true;
  }, [userEngagementStatus]);

  // Get summary of engagement status
  const getEngagementSummary = useCallback(() => {
    const total = userEngagementStatus.size;
    const withinWindow = Array.from(userEngagementStatus.values()).filter(status => status.isWithinWindow).length;
    const outsideWindow = total - withinWindow;
    
    return {
      total,
      withinWindow,
      outsideWindow,
      percentageWithinWindow: total > 0 ? Math.round((withinWindow / total) * 100) : 0
    };
  }, [userEngagementStatus]);

  return {
    // Service state
    isInitialized,
    isLoading,
    error,
    messagingStats,
    
    // Core functionality
    checkMessagingWindow,
    sendSmartMessage,
    sendTemplateMessage,
    getUserEngagement,
    
    // Utility functions
    refreshStats,
    getUsersOutsideWindow,
    sendBulkTemplateMessages,
    clearError,
    resetService,
    
    // Engagement status
    userEngagementStatus,
    getChatEngagementStatus,
    areAllChatsWithinWindow,
    getEngagementSummary,
    
    // Constants
    TEMPLATE_MESSAGE_TYPES
  };
};

export default useWhatsAppMessaging;
