// app/(tabs)/HiredAgents.js - AI Agents Management Page
// Modern UI with beautiful animations and card-based design

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  Alert,
  Modal,
  Platform
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  Plus,
  Users,
  Activity,
  BarChart3,
  Phone,
  MessageSquare,
  TrendingUp,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { useAgents } from '../../contexts/AgentContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data for agents (fallback)
const fallbackAgentsData = [
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

const countryCodes = [
  { label: 'USA +1', value: '+1' },
  { label: 'India +91', value: '+91' },
  { label: 'UK +44', value: '+44' },
  // Add more as needed
];

// Animated Header Component
const AnimatedHeader = ({ onAddNew }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(-30)).current;

  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 600,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // }, []);

  return (
    <View 
      style={[
        styles.header,
        // {
        //   opacity: fadeAnim,
        //   transform: [{ translateY: slideAnim }]
        // }
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>AI Agents</Text>
          <Text style={styles.headerSubtitle}>Manage your AI sales agents and configurations</Text>
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={onAddNew}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stats Cards Component
const StatsCards = ({ agents }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(20)).current;

  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const totalCampaigns = agents.reduce((sum, agent) => sum + (agent.stats?.totalCalls || 0), 0);

  const statsData = [
    {
      title: "Total",
      value: totalAgents,
      icon: Users,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)"
    },
    {
      title: "Active",
      value: activeAgents,
      icon: Activity,
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)"
    },
    {
      title: "Campaigns",
      value: totalCampaigns,
      icon: BarChart3,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)"
    }
  ];

  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 600,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // }, []);

  return (
    <View
      style={[
        styles.statsContainer,
        // {
        //   opacity: fadeAnim,
        //   transform: [{ translateY: slideAnim }]
        // }
      ]}
    >
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <View
            key={stat.title}
            style={[
              styles.statCard,
              { backgroundColor: stat.bgColor }
            ]}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <IconComponent size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Search and Filter Component
const SearchAndFilter = ({ searchQuery, setSearchQuery, onFilterPress }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 700,
  //     useNativeDriver: true,
  //     }).start();
  // }, []);

  return (
    <View style={[styles.searchContainer, { opacity: 1 }]}>
      <View style={styles.searchInputContainer}>
        <Search size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Agents"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.8}>
        <Filter size={18} color="#FF9500" />
      </TouchableOpacity>
    </View>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.1)', icon: CheckCircle, text: 'Active' };
      case 'pending':
        return { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.1)', icon: Clock, text: 'Pending' };
      case 'inactive':
        return { color: '#FF3B30', bgColor: 'rgba(255, 59, 48, 0.1)', icon: Pause, text: 'Inactive' };
      default:
        return { color: '#666', bgColor: 'rgba(102, 102, 102, 0.1)', icon: AlertCircle, text: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <IconComponent size={12} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

// Agent Card Component
const AgentCard = ({ agent, index }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(30)).current;
  // const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const router = useRouter();
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(countryCodes[0].value);
  const [phone, setPhone] = useState('');
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);

  // useEffect(() => {
  //   const delay = index * 150;
  //   const timer = setTimeout(() => {
  //     Animated.parallel([
  //       Animated.timing(fadeAnim, {
  //         toValue: 1,
  //         duration: 600,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(slideAnim, {
  //         toValue: 0,
  //         duration: 500,
  //         useNativeDriver: true,
  //       }),
  //       Animated.spring(scaleAnim, {
  //         toValue: 1,
  //         tension: 50,
  //         friction: 8,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   }, delay);

  //   return () => clearTimeout(timer);
  // }, [index]);

  const handleCardPress = () => {
    // Animated.sequence([
    //   Animated.timing(scaleAnim, {
    //     toValue: 0.98,
    //     duration: 100,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(scaleAnim, {
    //     toValue: 1,
    //     duration: 100,
    //     useNativeDriver: true,
    //   }),
    // ]).start();

    Alert.alert(
      agent.name || 'AI Agent',
      `View details for ${agent.name || 'AI Agent'}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "View Details", onPress: () => console.log(`View ${agent.name || 'AI Agent'}`) }
      ]
    );
  };

  return (
    <View
      style={[
        styles.agentCard,
        // {
        //   opacity: fadeAnim,
        //   transform: [
        //     { translateY: slideAnim },
        //     { scale: scaleAnim }
        //   ]
        // }
      ]}
    >
      <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.agentInfo}>
            <View style={styles.agentAvatar}>
              <Text style={styles.avatarText}>
                {(agent.name || 'AI').split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{agent.name || 'AI Agent'}</Text>
              <Text style={styles.agentRole}>{agent.role || 'Assistant'}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <StatusBadge status={agent.status || 'active'} />
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
              <MoreVertical size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location and Language */}
        <View style={styles.locationSection}>
          <View style={styles.countryInfo}>
            <Text style={styles.countryFlag}>{agent.country?.flag || '🌍'}</Text>
            <Text style={styles.countryName}>{agent.country?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.languageInfo}>
            <Globe size={14} color="#666" />
            <Text style={styles.languageText}>{agent.language || 'English'}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{agent.stats?.available || 0}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF9500' }]}>{agent.stats?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{agent.stats?.consumed || 0}</Text>
            <Text style={styles.statLabel}>Consumed</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceSection}>
          <View style={styles.performanceItem}>
            <TrendingUp size={14} color="#34C759" />
            <Text style={styles.performanceText}>{agent.performance?.successRate || 0}% Success</Text>
          </View>
          <View style={styles.performanceItem}>
            <Clock size={14} color="#007AFF" />
            <Text style={styles.performanceText}>{agent.performance?.avgCallDuration || '0:00'} Avg</Text>
          </View>
        </View>

        {/* Assigned Phone Numbers */}
        {agent.assignedPhoneNumbers && agent.assignedPhoneNumbers.length > 0 && (
          <View style={styles.assignedPhoneSection}>
            <Text style={styles.assignedPhoneTitle}>Assigned Phone Numbers:</Text>
            <View style={styles.assignedPhoneList}>
              {agent.assignedPhoneNumbers.map((phoneNumber, idx) => (
                <View key={idx} style={styles.assignedPhoneItem}>
                  <Phone size={14} color="#34C759" />
                  <Text style={styles.assignedPhoneText}>{phoneNumber}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Specializations */}
        <View style={styles.specializationsSection}>
          <View style={styles.specializationsContainer}>
            {(agent.specializations || []).map((spec, idx) => (
              <View key={idx} style={styles.specializationTag}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => setShowTestModal(true)}>
            <Phone size={14} color="#FF9500" />
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => router.push({ pathname: '/AgentCampaigns', params: { agentId: agent.id } })}>
            <BarChart3 size={14} color="#FF9500" />
            <Text style={styles.actionButtonText}>Campaigns</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryActionButton} activeOpacity={0.8} onPress={() => router.push('/NewCampaign')}>
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.primaryActionButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {/* Test Call Modal */}
      <Modal
        visible={showTestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTestModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <MotiView
            from={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 400 }}
            style={styles.testModalCard}
          >
            <Text style={styles.testModalTitle}>Test Call</Text>
            <Text style={styles.testModalLabel}>Phone</Text>
            <View style={styles.testInputRow}>
              <TouchableOpacity style={styles.testDropdown} onPress={() => setShowCodeDropdown(true)}>
                <Text style={styles.testDropdownText}>{countryCodes.find(c => c.value === selectedCode)?.label}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.testInput}
                placeholder="0000000000"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
              />
            </View>
            {/* Country Code Dropdown Modal */}
            <Modal
              visible={showCodeDropdown}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCodeDropdown(false)}
            >
              <View style={styles.modalBackdrop}>
                <MotiView
                  from={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 350 }}
                  style={styles.codeDropdownCard}
                >
                  {countryCodes.map((code) => (
                    <TouchableOpacity
                      key={code.value}
                      style={styles.codeDropdownItem}
                      onPress={() => {
                        setSelectedCode(code.value);
                        setShowCodeDropdown(false);
                      }}
                    >
                      <Text style={styles.codeDropdownText}>{code.label}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.codeDropdownClose} onPress={() => setShowCodeDropdown(false)}>
                    <Text style={styles.codeDropdownCloseText}>Cancel</Text>
                  </TouchableOpacity>
                </MotiView>
              </View>
            </Modal>
            <View style={styles.testModalBtnRow}>
              <TouchableOpacity style={styles.testModalBtnClose} onPress={() => setShowTestModal(false)}>
                <Text style={styles.testModalBtnCloseText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testModalBtnSubmit} onPress={() => { setShowTestModal(false); }}>
                <Text style={styles.testModalBtnSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

// Main HiredAgents Component
const HiredAgentsScreen = () => {
  const { agents, isInitialized } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Use agents from context directly, with fallback
  const agentsToUse = agents && agents.length > 0 ? agents : fallbackAgentsData;
  const [filteredAgents, setFilteredAgents] = useState(agentsToUse);

  // Update filtered agents when agents context changes
  useEffect(() => {
    console.log('Agents context updated:', agents?.length || 0);
    console.log('Agent names:', agents?.map(a => a.name) || []);
    
    const filtered = agentsToUse.filter(agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.country && agent.country.name && agent.country.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredAgents(filtered);
  }, [searchQuery, agentsToUse]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, agents count:', agents?.length || 0);
    }, [agents])
  );

  const handleFilterPress = () => {
    Alert.alert(
      "Filter Options",
      "Choose filter criteria:",
      [
        { text: "All Agents", onPress: () => setFilteredAgents(agentsToUse) },
        { text: "Active Only", onPress: () => setFilteredAgents(agentsToUse.filter(a => a.status === 'active')) },
        { text: "Pending Only", onPress: () => setFilteredAgents(agentsToUse.filter(a => a.status === 'pending')) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      <AnimatedHeader onAddNew={() => router.push('/CreateAgent')} />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatsCards agents={agentsToUse} />
        
        <SearchAndFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onFilterPress={handleFilterPress}
        />

        <View style={styles.agentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your AI Agents</Text>
            <Text style={styles.sectionSubtitle}>{filteredAgents.length} agents found</Text>
          </View>
          
          {filteredAgents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15, // Moderate padding top
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Stats Cards Styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },

  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },

  // Agents Section Styles
  agentsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // Agent Card Styles
  agentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  agentRole: {
    fontSize: 14,
    color: '#666666',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreButton: {
    padding: 4,
  },

  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Location Section Styles
  locationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageText: {
    fontSize: 14,
    color: '#666666',
  },

  // Stats Section Styles
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },

  // Performance Section Styles
  performanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  // Assigned Phone Numbers Styles
  assignedPhoneSection: {
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  assignedPhoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
  },
  assignedPhoneList: {
    gap: 6,
  },
  assignedPhoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignedPhoneText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },

  // Specializations Styles
  specializationsSection: {
    marginBottom: 16,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  specializationTag: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specializationText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Action Buttons Styles
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    gap: 6,
    minHeight: 48,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FF9500',
    gap: 6,
    minHeight: 48,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  bottomPadding: {
    height: 20,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    minWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  testModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a4666',
    marginBottom: 18,
  },
  testModalLabel: {
    fontSize: 15,
    color: '#888',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  testInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  testDropdown: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  testDropdownText: {
    color: '#4a4666',
    fontWeight: '600',
    fontSize: 15,
  },
  testInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    fontSize: 15,
    color: '#18181B',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  testModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 18,
  },
  testModalBtnClose: {
    backgroundColor: '#888',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 10,
  },
  testModalBtnCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  testModalBtnSubmit: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  testModalBtnSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  codeDropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  codeDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    alignItems: 'center',
  },
  codeDropdownText: {
    fontSize: 16,
    color: '#18181B',
  },
  codeDropdownClose: {
    marginTop: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  codeDropdownCloseText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HiredAgentsScreen;