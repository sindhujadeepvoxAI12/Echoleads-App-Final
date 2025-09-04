import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Dimensions
} from 'react-native';
import { 
  Clock, 
  MessageCircle, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Send,
  Template,
  BarChart3,
  Zap,
  Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useWhatsAppMessaging from '../hooks/useWhatsAppMessaging';

const { width: screenWidth } = Dimensions.get('window');

const WhatsAppMessagingManager = ({ visible, onClose, selectedChatId = null }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateMessage, setTemplateMessage] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState('engagement_prompt');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  
  const {
    isInitialized,
    isLoading,
    error,
    messagingStats,
    userEngagementStatus,
    checkMessagingWindow,
    sendSmartMessage,
    sendTemplateMessage,
    getUserEngagement,
    refreshStats,
    getUsersOutsideWindow,
    sendBulkTemplateMessages,
    clearError,
    resetService,
    getChatEngagementStatus,
    areAllChatsWithinWindow,
    getEngagementSummary,
    TEMPLATE_MESSAGE_TYPES
  } = useWhatsAppMessaging();

  // Check engagement status when chat is selected
  useEffect(() => {
    if (selectedChatId && isInitialized) {
      getUserEngagement(selectedChatId);
    }
  }, [selectedChatId, isInitialized, getUserEngagement]);

  // Refresh stats periodically
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        refreshStats();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, refreshStats]);

  const handleSendTemplateMessage = async () => {
    if (!templateMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      if (selectedChatId) {
        // Send to specific chat
        await sendTemplateMessage(selectedChatId, templateMessage, {
          templateType: selectedTemplateType
        });
        Alert.alert('Success', 'Template message sent successfully!');
        setShowTemplateModal(false);
        setTemplateMessage('');
      } else if (isBulkMode) {
        // Send bulk message
        const result = await sendBulkTemplateMessages(bulkMessage, selectedTemplateType);
        Alert.alert('Success', result.message);
        setShowTemplateModal(false);
        setBulkMessage('');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to send message: ${error.message}`);
    }
  };

  const handleRefresh = async () => {
    try {
      if (selectedChatId) {
        await getUserEngagement(selectedChatId);
      }
      await refreshStats();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  const getStatusIcon = (isWithinWindow) => {
    return isWithinWindow ? (
      <CheckCircle size={20} color="#10B981" />
    ) : (
      <AlertTriangle size={20} color="#F59E0B" />
    );
  };

  const getStatusColor = (isWithinWindow) => {
    return isWithinWindow ? '#10B981' : '#F59E0B';
  };

  const getStatusText = (isWithinWindow) => {
    return isWithinWindow ? 'Within Window' : 'Outside Window';
  };

  const renderChatStatus = () => {
    if (!selectedChatId) return null;

    const status = getChatEngagementStatus(selectedChatId);
    if (!status) return null;

    return (
      <View style={styles.chatStatusContainer}>
        <Text style={styles.sectionTitle}>Current Chat Status</Text>
        <View style={[styles.statusCard, { borderColor: getStatusColor(status.isWithinWindow) }]}>
          <View style={styles.statusHeader}>
            {getStatusIcon(status.isWithinWindow)}
            <Text style={[styles.statusText, { color: getStatusColor(status.isWithinWindow) }]}>
              {getStatusText(status.isWithinWindow)}
            </Text>
          </View>
          
          {status.lastActivity && (
            <View style={styles.statusDetails}>
              <Text style={styles.statusDetailText}>
                Last activity: {status.daysSinceLastActivity || 0} days ago
              </Text>
              <Text style={styles.statusDetailText}>
                Hours since: {status.hoursSinceLastActivity || 0} hours
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => checkMessagingWindow(selectedChatId)}
            disabled={isLoading}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.checkButtonText}>Check Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMessagingStats = () => {
    if (!messagingStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Messaging Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#6366F1" />
            <Text style={styles.statNumber}>{messagingStats.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={styles.statNumber}>{messagingStats.usersInsideWindow || 0}</Text>
            <Text style={styles.statLabel}>Within Window</Text>
          </View>
          
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{messagingStats.usersOutsideWindow || 0}</Text>
            <Text style={styles.statLabel}>Outside Window</Text>
          </View>
          
          <View style={styles.statCard}>
            <Template size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>{messagingStats.templateMessagesSent || 0}</Text>
            <Text style={styles.statLabel}>Templates Sent</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEngagementSummary = () => {
    const summary = getEngagementSummary();
    
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Engagement Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Chats:</Text>
            <Text style={styles.summaryValue}>{summary.total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Within Window:</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{summary.withinWindow}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Outside Window:</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{summary.outsideWindow}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Percentage Within:</Text>
            <Text style={styles.summaryValue}>{summary.percentageWithinWindow}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTemplateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Template Message</Text>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.templateTypeContainer}>
            <Text style={styles.inputLabel}>Template Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(TEMPLATE_MESSAGE_TYPES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.templateTypeButton,
                    selectedTemplateType === value && styles.templateTypeButtonActive
                  ]}
                  onPress={() => setSelectedTemplateType(value)}
                >
                  <Text style={[
                    styles.templateTypeButtonText,
                    selectedTemplateType === value && styles.templateTypeButtonTextActive
                  ]}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Bulk Mode:</Text>
            <Switch
              value={isBulkMode}
              onValueChange={setIsBulkMode}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor={isBulkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {isBulkMode ? 'Bulk Message:' : 'Message:'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={isBulkMode ? bulkMessage : templateMessage}
              onChangeText={isBulkMode ? setBulkMessage : setTemplateMessage}
              placeholder={isBulkMode ? "Enter message for all users outside window..." : "Enter your message..."}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendTemplateMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>
                  {isBulkMode ? 'Send Bulk Message' : 'Send Template'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>WhatsApp Messaging Manager</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <RefreshCw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        >
          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
                <Text style={styles.clearErrorButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isInitialized ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Initializing WhatsApp Messaging Service...</Text>
            </View>
          ) : (
            <>
              {renderChatStatus()}
              {renderMessagingStats()}
              {renderEngagementSummary()}
              
              <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowTemplateModal(true)}
                  >
                    <Template size={24} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>Send Template</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={refreshStats}
                    disabled={isLoading}
                  >
                    <BarChart3 size={24} color="#10B981" />
                    <Text style={styles.actionButtonText}>Refresh Stats</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={resetService}
                    disabled={isLoading}
                  >
                    <Zap size={24} color="#F59E0B" />
                    <Text style={styles.actionButtonText}>Reset Service</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.sectionTitle}>How It Works</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Clock size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      WhatsApp allows free-form messages only within 24 hours of user's last message
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Template size={16} color="#8B5CF6" />
                    <Text style={styles.infoText}>
                      Template messages can be sent outside the 24-hour window
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Zap size={16} color="#F59E0B" />
                    <Text style={styles.infoText}>
                      This service automatically detects window status and sends appropriate message types
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {renderTemplateModal()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  clearErrorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearErrorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  chatStatusContainer: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (screenWidth - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (screenWidth - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: screenWidth - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    padding: 4,
  },
  templateTypeContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  templateTypeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  templateTypeButtonActive: {
    backgroundColor: '#6366F1',
  },
  templateTypeButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  templateTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WhatsAppMessagingManager;
