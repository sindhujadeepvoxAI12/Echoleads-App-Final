import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PROJECT_ID =
  (Constants?.expoConfig?.extra?.eas?.projectId) ||
  '3299e7d7-3dc9-4a5f-835d-44695c672e1d'; // fallback

// Foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register device for push notifications
export async function registerForPushNotificationsAsync() {
  try {
    console.log('📱 Notifications: Starting device token registration...');
    
    if (!Device.isDevice) {
      console.log('📱 Notifications: Not a physical device, cannot get push token');
      alert('Must use physical device for Push Notifications');
      return null;
    }

    console.log('📱 Notifications: Physical device detected, checking permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📱 Notifications: Existing permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('📱 Notifications: Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📱 Notifications: New permission status:', finalStatus);
    }
    
    if (finalStatus !== 'granted') {
      console.log('📱 Notifications: Permission denied');
      alert('Failed to get push permission!');
      return null;
    }

    if (Platform.OS === 'android') {
      console.log('📱 Notifications: Setting up Android notification channel...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log('📱 Notifications: Getting Expo push token...');
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });

    console.log('📱 Notifications: Expo Push Token received:', data);
    console.log('📱 Notifications: Token type:', typeof data);
    console.log('📱 Notifications: Token length:', data ? data.length : 0);
    
    return data; // Return the actual token string
  } catch (e) {
    console.log('❌ registerForPushNotificationsAsync error:', e);
    console.log('❌ Error details:', {
      message: e.message,
      stack: e.stack,
      name: e.name
    });
    alert('Error setting up notifications. Check logs.');
    return null;
  }
}



// Trigger notification for new chat message
export async function sendNewMessageNotification(chatName, messageText, chatId) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: ` ${chatName || 'Chat'}`,
      body: messageText || 'You have a new message',
      data: { chatId },
      sound: 'default',
    },
    trigger: null,
  });
}

// Default export for the notifications module
export default {
  registerForPushNotificationsAsync,
  sendNewMessageNotification,
};
