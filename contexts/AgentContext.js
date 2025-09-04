import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialAgents = [
  {
    id: 1,
    name: "Sarah Wilson",
    role: "Sales Specialist",
    status: "active",
    country: { name: "United States", flag: "🇺🇸", code: "US" },
    language: "English",
    stats: { available: 15, pending: 8, consumed: 42, totalCalls: 65 },
    performance: { successRate: 87, avgCallDuration: "4:32", conversionRate: 23 },
    specializations: ["Call Summary", "Sentiment Analysis", "Auto Follow-up"],
    joinedDate: "2024-01-15",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Lead Generator",
    status: "active",
    country: { name: "Canada", flag: "🇨🇦", code: "CA" },
    language: "English",
    stats: { available: 22, pending: 5, consumed: 38, totalCalls: 60 },
    performance: { successRate: 92, avgCallDuration: "3:45", conversionRate: 28 },
    specializations: ["Lead Qualification", "Product Demo", "Follow-up"],
    joinedDate: "2024-02-20",
    lastActive: "1 hour ago"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Customer Support",
    status: "pending",
    country: { name: "Spain", flag: "🇪🇸", code: "ES" },
    language: "Spanish",
    stats: { available: 8, pending: 12, consumed: 25, totalCalls: 33 },
    performance: { successRate: 78, avgCallDuration: "5:18", conversionRate: 19 },
    specializations: ["Customer Service", "Technical Support", "Retention"],
    joinedDate: "2024-03-10",
    lastActive: "5 minutes ago"
  },
  {
    id: 4,
    name: "James Mitchell",
    role: "Sales Specialist",
    status: "inactive",
    country: { name: "United Kingdom", flag: "🇬🇧", code: "UK" },
    language: "English",
    stats: { available: 0, pending: 0, consumed: 156, totalCalls: 156 },
    performance: { successRate: 85, avgCallDuration: "4:12", conversionRate: 25 },
    specializations: ["Enterprise Sales", "Consultation", "Closing"],
    joinedDate: "2023-11-08",
    lastActive: "2 days ago"
  },
  {
    id: 5,
    name: "Yuki Tanaka",
    role: "Technical Specialist",
    status: "active",
    country: { name: "Japan", flag: "🇯🇵", code: "JP" },
    language: "Japanese",
    stats: { available: 18, pending: 3, consumed: 29, totalCalls: 47 },
    performance: { successRate: 94, avgCallDuration: "6:22", conversionRate: 31 },
    specializations: ["Technical Demo", "Integration Support", "Training"],
    joinedDate: "2024-01-25",
    lastActive: "30 minutes ago"
  }
];

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agents, setAgents] = useState(initialAgents);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize agents from AsyncStorage on app start
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        console.log('Initializing agents from AsyncStorage...');
        const agentsData = await AsyncStorage.getItem('AGENTS_WITH_PHONES');
        if (agentsData) {
          const parsedAgents = JSON.parse(agentsData);
          console.log('Found agents in AsyncStorage:', parsedAgents.length);
          setAgents(parsedAgents);
        } else {
          console.log('No agents in AsyncStorage, using initial agents');
          // If no data in AsyncStorage, save initial agents
          await AsyncStorage.setItem('AGENTS_WITH_PHONES', JSON.stringify(initialAgents));
          setAgents(initialAgents);
        }
      } catch (error) {
        console.log('Error initializing agents from AsyncStorage:', error);
        setAgents(initialAgents);
      } finally {
        setIsInitialized(true);
        console.log('AgentContext initialized');
      }
    };

    initializeAgents();
  }, []);

  const addAgent = async (newAgent) => {
    console.log('Adding new agent:', newAgent.name);
    
    const agentWithDefaults = {
      ...newAgent,
      id: Date.now(),
      status: "active",
      stats: { available: 20, pending: 0, consumed: 0, totalCalls: 0 },
      performance: { successRate: 0, avgCallDuration: "0:00", conversionRate: 0 },
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: "Just now"
    };
    
    const updatedAgents = [...agents, agentWithDefaults];
    console.log('Updated agents array:', updatedAgents.length);
    
    // Update context state
    setAgents(updatedAgents);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('AGENTS_WITH_PHONES', JSON.stringify(updatedAgents));
      console.log('Agent added successfully to AsyncStorage:', agentWithDefaults.name);
    } catch (error) {
      console.log('Error saving agents to AsyncStorage:', error);
    }
  };

  return (
    <AgentContext.Provider value={{ agents, setAgents, addAgent, isInitialized }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  return useContext(AgentContext);
} 