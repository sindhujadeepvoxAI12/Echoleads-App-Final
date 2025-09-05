import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// IMPORTANT: This layout ONLY applies to screens within the (tabs) directory
// Standalone pages outside this directory will NOT show bottom navigation tabs
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,

        keyboardHidesTabBar: false,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        // Ensure tabs are only shown on tab screens
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: false,
        // Fixed bottom navigation tabs
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 10,
          paddingTop: 8,
          height: 74,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          zIndex: 1000,
        },
      }}
      initialRouteName="Dashboard"
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'grid' : 'grid-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="HireAgents"
        options={{
          title: 'Agents',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="PhoneSettings"
        options={{
          title: 'Phone',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'call' : 'call-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="Calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="Purchase"
        options={{
          href: null, // This hides the tab from the tab bar
          title: 'Purchase',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'card' : 'card-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      /> 
      
      <Tabs.Screen
        name="LiveChat"
        options={{
          title: 'Live Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}