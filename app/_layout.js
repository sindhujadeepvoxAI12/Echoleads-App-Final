import React, { useEffect, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Platform, Alert, View, Text, Button, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider } from "../contexts/ThemeContext";
import { CampaignProvider } from "../contexts/CampaignContext";
import { AgentProvider } from "../contexts/AgentContext";
import { AuthProvider } from "../contexts/AuthContext";
import AuthWrapper from "../components/AuthWrapper";


import * as Notifications from "expo-notifications";
import * as Clipboard from "expo-clipboard";
import {
  registerForPushNotificationsAsync,
} from "../app/utils/notifications";
// import { chatAPI } from "./services/chatService";
import Constants from "expo-constants";
import whatsappMessagingService from "./services/whatsappMessagingService";

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Avoid registering push notifications in Expo Go
        if (Constants.appOwnership !== "expo") {
          const token = await registerForPushNotificationsAsync();
          if (token && token !== expoPushToken) setExpoPushToken(token);
        }

        // Initialize WhatsApp 24h background service (no UI)
        if (Constants.appOwnership !== "expo") {
          await whatsappMessagingService.initialize();
        }
      } catch (e) {
        console.log("WhatsApp background service init failed:", e?.message);
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received in foreground:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("📲 Notification tapped:", response);
        const data = response.notification.request.content.data;
        // Navigate to LiveChat tab for any notification (with or without chatId)
        // This ensures users always land on the chat interface when tapping notifications
        router.push('/(tabs)/LiveChat');
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <AuthProvider>
          <ThemeProvider>
            <CampaignProvider>
              <AgentProvider>
                <StatusBar style="light-content" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    // animation: "fade",
                    // Ensure standalone pages don't show tabs
                    tabBarStyle: { display: 'none' },
                  }}
                />
              </AgentProvider>
            </CampaignProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
