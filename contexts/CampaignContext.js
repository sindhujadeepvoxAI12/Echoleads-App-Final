import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CampaignContext = createContext();
const STORAGE_KEY = 'CAMPAIGNS_DATA';

// Sample campaign data for testing
const sampleCampaigns = [
  {
    id: '1',
    name: 'Q4 Sales Campaign',
    status: 'In Progress',
    date: '2024-01-15 10:30:00',
    progress: 65,
    totalContacts: 500,
    completedCalls: 325,
    successRate: 78,
    assignedTo: 'Sarah Wilson',
    agentId: 1,
    description: 'End of year sales push for enterprise clients',
    timezone: 'America/New_York'
  },
  {
    id: '2',
    name: 'Lead Generation 2024',
    status: 'active',
    date: '2024-01-20 14:15:00',
    progress: 45,
    totalContacts: 300,
    completedCalls: 135,
    successRate: 82,
    assignedTo: 'Marcus Chen',
    agentId: 2,
    description: 'New lead generation campaign for tech startups',
    timezone: 'America/Toronto'
  }
];

export function CampaignProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);

  // Load campaigns from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCampaigns(JSON.parse(stored));
        } else {
          // If no stored campaigns, use sample data for testing
          setCampaigns(sampleCampaigns);
        }
      } catch (e) {
        // If error, use sample data
        setCampaigns(sampleCampaigns);
      }
    })();
  }, []);

  // Save campaigns to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const addCampaign = (campaign) => {
    setCampaigns((prev) => [...prev, campaign]);
  };

  const getCampaignsByAgent = (agentId) => {
    return campaigns.filter((c) => c.agentId === agentId);
  };

  const updateCampaignStatus = (campaignId, status) => {
    setCampaigns((prev) => prev.map(c => c.id === campaignId ? { ...c, status } : c));
  };

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, getCampaignsByAgent, updateCampaignStatus }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  return useContext(CampaignContext);
} 