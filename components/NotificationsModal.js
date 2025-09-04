// components/NotificationsModal.js
import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import {
  X,
  Check,
  AlertTriangle,
  Info,
  Bell,
  Settings,
  Calendar,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const NotificationsModal = ({ visible, onClose, agents = [], campaigns = [], credits = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Generate dynamic notifications based on current state - using useMemo for performance
  const notifications = useMemo(() => {
    const notifications = [];
    let id = 1;

    // Low credits notification
    if (credits < 1000) {
      notifications.push({
        id: id++,
        title: "Low Credits Warning",
        message: `Your account balance is running low (${credits} credits remaining). Consider adding credits to avoid interruption.`,
        time: "Just now",
        type: "warning",
        icon: AlertTriangle,
        isRead: false
      });
    }

    // Active campaigns notifications - check for both 'active' and 'In Progress' status
    const activeCampaigns = campaigns.filter(campaign => 
      campaign.status === 'active' || campaign.status === 'In Progress'
    );
    // Limit to max 3 campaign notifications
    activeCampaigns.slice(0, 3).forEach(campaign => {
      notifications.push({
        id: id++,
        title: "Campaign Running",
        message: `Campaign '${campaign.name}' is currently active with ${campaign.progress || 0}% completion.`,
        time: "Active now",
        type: "success",
        icon: Check,
        isRead: false
      });
    });

    // Low performance agents notifications - limit to 2
    const lowPerformanceAgents = agents.filter(agent => 
      agent.status === 'active' && 
      agent.performance?.successRate < 50
    );
    lowPerformanceAgents.slice(0, 2).forEach(agent => {
      notifications.push({
        id: id++,
        title: "Agent Performance Alert",
        message: `Agent '${agent.name}' has low performance (${agent.performance?.successRate || 0}% success rate). Consider reviewing their settings.`,
        time: "Recently",
        type: "warning",
        icon: AlertTriangle,
        isRead: false
      });
    });

    // High performance agents notifications - limit to 1
    const highPerformanceAgents = agents.filter(agent => 
      agent.status === 'active' && 
      agent.performance?.successRate > 80
    );
    if (highPerformanceAgents.length > 0) {
      const bestAgent = highPerformanceAgents[0]; // Take the first one
      notifications.push({
        id: id++,
        title: "Excellent Performance",
        message: `Agent '${bestAgent.name}' is performing excellently with ${bestAgent.performance?.successRate || 0}% success rate!`,
        time: "Recently",
        type: "success",
        icon: TrendingUp,
        isRead: false
      });
    }

    // If no dynamic notifications, show a default one
    if (notifications.length === 0) {
      notifications.push({
        id: id++,
        title: "All Systems Normal",
        message: "All your agents and campaigns are running smoothly. No immediate action required.",
        time: "Just now",
        type: "info",
        icon: Check,
        isRead: false
      });
    }

    return notifications;
  }, [agents, campaigns, credits]); // Recalculate when these props change

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return '#34C759';
      case 'warning': return '#FF9500';
      case 'info': return '#007AFF';
      default: return '#666';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    // Implementation for marking individual notification as read
    console.log(`Mark notification ${notificationId} as read`);
  };

  const handleMarkAllRead = () => {
    // Implementation for marking all notifications as read
    console.log('Mark all notifications as read');
  };

  const handleNotificationPress = (notification) => {
    // Implementation for handling notification press
    console.log('Notification pressed:', notification.title);
    handleMarkAsRead(notification.id);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.fullScreenContainer}>
        <Animated.View 
          style={[
            styles.modal,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#FF9500" />
              </View>
              <View>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>
                  {notifications.filter(n => !n.isRead).length} unread messages
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView 
            style={styles.notificationsList} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No notifications available</Text>
              </View>
            ) : (
              notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.isRead && styles.unreadNotification
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.notificationIcon, 
                      { backgroundColor: `${getNotificationColor(notification.type)}15` }
                    ]}>
                      <IconComponent size={16} color={getNotificationColor(notification.type)} />
                    </View>
                    
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.isRead && styles.unreadTitle
                        ]}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && <View style={styles.unreadBadge} />}
                      </View>
                      
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.markAllReadBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.markAllReadText}>Mark All as Read</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
  },
  notificationsList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadNotification: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#000000',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  footer: {
    paddingTop: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  markAllReadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  settingsText: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default NotificationsModal;