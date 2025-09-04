// app/(tabs)/Dashboard.js - Clean & Consistent Dashboard Design
// Professional UI with cohesive color theme and better animations

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import {
  Ionicons
} from '@expo/vector-icons';
import {
  Users,
  Phone,
  Clock,
  TrendingUp,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  User,
  Activity,
  Target,
  ArrowUpRight,
  LogOut
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/authService';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

// Import contexts
import { useAgents } from '../../contexts/AgentContext';
import { useCampaigns } from '../../contexts/CampaignContext';


// Import separate components
import NotificationsModal from '../../components/NotificationsModal';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data generator
const generateMockData = (days = 7) => {
  const data = [];
  const labels = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    if (i === 0) {
      data.push(Math.floor(Math.random() * 50) + 70);
    } else {
      data.push(Math.floor(Math.random() * 10) + 2);
    }
  }

  return { data, labels };
};

// Compact Header Component
const CompactHeader = ({ userName = "John Smith", onNotifications, onProfile, onLogout, notificationCount = 0 }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(-30)).current;
  // const bellPulse = useRef(new Animated.Value(1)).current;
  // const insets = useSafeAreaInsets();

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

  //   // Bell pulse animation
  //   Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(bellPulse, {
  //         toValue: 1.2,
  //         duration: 1000,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(bellPulse, {
  //         toValue: 1,
  //         duration: 1000,
  //         useNativeDriver: true,
  //       }),
  //       Animated.delay(2000),
  //     ])
  //   ).start();
  // }, []);

  return (
    <View
      style={[
        styles.compactHeader,
        // {
        //   // opacity: fadeAnim,
        //   // transform: [{ translateY: slideAnim }],
        //   // paddingTop: Math.max(insets.top, 50) // Moderate minimum top padding
        // }
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <User size={20} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onNotifications}
            activeOpacity={0.7}
          >
            {/* <Animated.View style={{ transform: [{ scale: bellPulse }] }}> */}
            <Bell size={18} color="#FF9500" />
            {/* </Animated.View> */}
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onProfile}
            activeOpacity={0.7}
          >
            <Settings size={18} color="#FF9500" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#FF9500" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Enhanced Statistics Card
const EnhancedStatCard = ({ icon: Icon, title, value, subtitle, color, trend, delay = 0, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 30,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: false,
      }).start();

      // Icon bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: `${color}15` },
            { transform: [{ scale: bounceAnim }] }
          ]}
        >
          <Icon size={22} color={color} />
        </Animated.View>

        <View style={styles.trendBadge}>
          <ArrowUpRight size={12} color="#34C759" />
          <Text style={styles.trendText}>+12%</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.progressWrapper}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: color },
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', `${Math.random() * 30 + 70}%`]
              })
            }
          ]}
        />
      </View>
    </Animated.View>
  );
};

// Performance Overview Section
const PerformanceOverview = ({ stats, dashbordToken }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;



  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.performanceSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.headerIcon}>
          <Target size={20} color="#FF9500" />
        </View>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <Text style={styles.sectionSubtitle}>Real-time insights</Text>
      
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.gridRow}>
          <EnhancedStatCard
            icon={Users}
            title="Total"
            value={stats.totalAgents}
            color="#FF9500"
            delay={100}
            index={0}
          />
          <EnhancedStatCard
            icon={Activity}
            title="Active"
            value={stats.activeAgents}
            color="#34C759"
            delay={200}
            index={1}
          />
        </View>
        <View style={styles.gridRow}>
          <EnhancedStatCard
            icon={BarChart3}
            title="Campaigns"
            value={stats.totalCampaigns}
            color="#007AFF"
            delay={300}
            index={2}
          />
          <EnhancedStatCard
            icon={Phone}
            title="Total Calls"
            value={stats.totalCalls.toLocaleString()}
            color="#FF9500"
            delay={400}
            index={3}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Campaign Progress Section
const CampaignProgressSection = ({ agents, campaigns }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const activeAgents = agents.filter(agent => agent.status === 'active');

  return (
    <Animated.View
      style={[
        styles.campaignProgressSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.headerIcon}>
          <Target size={20} color="#FF9500" />
        </View>
        <Text style={styles.sectionTitle}>Campaign Progress</Text>
        <Text style={styles.sectionSubtitle}>Active campaigns & agents</Text>
      </View>

      <View style={styles.campaignStats}>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatValue}>{activeCampaigns.length}</Text>
          <Text style={styles.campaignStatLabel}>Active Campaigns</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatValue}>{activeAgents.length}</Text>
          <Text style={styles.campaignStatLabel}>Active Agents</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatValue}>
            {activeAgents.reduce((sum, agent) => sum + (agent.stats?.totalCalls || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.campaignStatLabel}>Total Calls Today</Text>
        </View>
      </View>

      {activeCampaigns.length > 0 && (
        <View style={styles.campaignList}>
          <Text style={styles.campaignListTitle}>Running Campaigns</Text>
          {activeCampaigns.slice(0, 3).map((campaign, index) => (
            <View key={campaign.id} style={styles.campaignItem}>
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignStatus}>Active</Text>
              </View>
              <View style={styles.campaignProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((campaign.progress || 0), 100)}%`,
                        backgroundColor: '#FF9500'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{campaign.progress || 0}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

// Clean Chart Section
const CleanChartSection = ({ currentWeek, onWeekChange, totalWeeks, chartData, callAnalytics }) => {
  // Calculate date range for current period
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (29 - currentWeek * 7)); // Show 7 days per period
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const dateRange = getDateRange();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#FF9500"
    },
    propsForBackgroundLines: {
      stroke: "#f0f0f0"
    }
  };

  return (
    <Animated.View
      style={[
        styles.chartSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleSection}>
          <View style={styles.chartIcon}>
            <Activity size={20} color="#FF9500" />
          </View>
          <View>
            <Text style={styles.chartTitle}>Call Analytics</Text>
            <Text style={styles.chartSubtitle}>Track your performance</Text>
          </View>
        </View>

        <View style={styles.performanceBadge}>
          <Text style={styles.performanceText}>↗ {callAnalytics.successRate}% Success</Text>
        </View>
      </View>

      <View style={styles.weekSelector}>
        <TouchableOpacity
          style={[styles.weekNavBtn, currentWeek === 0 && styles.weekNavBtnDisabled]}
          onPress={() => currentWeek > 0 && onWeekChange(currentWeek - 1)}
          disabled={currentWeek === 0}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={currentWeek === 0 ? "#999" : "#FF9500"} />
        </TouchableOpacity>

        <View style={styles.weekDisplay}>
          <Text style={styles.weekNumber}>Week {currentWeek + 1} of {totalWeeks}</Text>
          <Text style={styles.weekDescription}>{dateRange.start} - {dateRange.end}</Text>
        </View>

        <TouchableOpacity
          style={[styles.weekNavBtn, currentWeek === totalWeeks - 1 && styles.weekNavBtnDisabled]}
          onPress={() => currentWeek < totalWeeks - 1 && onWeekChange(currentWeek + 1)}
          disabled={currentWeek === totalWeeks - 1}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} color={currentWeek === totalWeeks - 1 ? "#999" : "#FF9500"} />
        </TouchableOpacity>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: chartData.labels.slice(currentWeek * 7, (currentWeek + 1) * 7),
            datasets: [
              {
                data: chartData.data.slice(currentWeek * 7, (currentWeek + 1) * 7),
                color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                strokeWidth: 3
              }
            ]
          }}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </Animated.View>
  );
};

// Clean Credits Section
const CleanCreditsSection = ({ credits, onAddCredits, onPurchase }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.creditsSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.creditsHeader}>
        <View style={styles.creditsIconWrapper}>
          <Wallet size={20} color="#FF9500" />
        </View>
        <View>
          <Text style={styles.creditsTitle}>Available Credits</Text>
          <Text style={styles.creditsSubtitle}>Manage your account balance</Text>
        </View>
      </View>

      <View style={styles.creditsBody}>
        <Animated.Text
          style={[
            styles.creditsAmount,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {credits.toLocaleString()}
        </Animated.Text>
        <Text style={styles.creditsLabel}>Credits Available</Text>
      </View>

      <View style={styles.creditsFooter}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddCredits}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FF9500" />
          <Text style={styles.addBtnText}>Add Credits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.purchaseBtn}
          onPress={onPurchase}
          activeOpacity={0.8}
        >
          <Text style={styles.purchaseBtnText}>View Plans</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};



// Main Dashboard Component
const DashboardScreen = () => {
  const router = useRouter();
  const { logout, isAuthenticated, isLoading } = useAuth();
  const { agents } = useAgents();
  const { campaigns } = useCampaigns();

  const [currentWeek, setCurrentWeek] = useState(0);
  const [chartData, setChartData] = useState(generateMockData());
  const [credits, setCredits] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dashbordToken, setDashbordToken] = useState("");
  const [userName, setUserName] = useState("User");
  const [notificationCount, setNotificationCount] = useState(0);
  const totalWeeks = 4; // This will now represent 30-day periods


  useEffect(() => {
    DashboardToken()
  }, [])

  console.log(dashbordToken, "tokenNotification>>")




  async function DashboardToken() {
    const deviceToken = await registerForPushNotificationsAsync();
    console.log(deviceToken, "dashoboardtoken")
    setDashbordToken(deviceToken)
    return deviceToken;

  }





  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔐 Dashboard: User not authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Calculate dynamic stats from agents and campaigns data
  const calculateStats = () => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const totalCampaigns = campaigns.length;
    const totalCalls = agents.reduce((sum, agent) => sum + (agent.stats?.totalCalls || 0), 0);

    // Calculate average duration from all agents
    const totalDuration = agents.reduce((sum, agent) => {
      const duration = agent.performance?.avgCallDuration || "0:00";
      const [minutes, seconds] = duration.split(':').map(Number);
      return sum + (minutes * 60 + seconds);
    }, 0);

    const avgDurationSeconds = totalAgents > 0 ? Math.floor(totalDuration / totalAgents) : 0;
    const avgDurationMinutes = Math.floor(avgDurationSeconds / 60);
    const avgDurationRemainingSeconds = avgDurationSeconds % 60;
    const avgDuration = `${String(avgDurationMinutes).padStart(2, '0')}:${String(avgDurationRemainingSeconds).padStart(2, '0')}`;

    return {
      totalAgents,
      activeAgents,
      totalCampaigns,
      totalCalls,
      avgDuration
    };
  };

  const stats = calculateStats();

  // Calculate overall call analytics metrics
  const calculateCallAnalytics = () => {
    const activeAgents = agents.filter(agent => agent.status === 'active');

    // Calculate success rate across all agents
    const totalSuccessRate = activeAgents.length > 0 ?
      activeAgents.reduce((sum, agent) => sum + (agent.performance?.successRate || 0), 0) / activeAgents.length : 0;

    // Calculate conversion rate across all agents
    const totalConversionRate = activeAgents.length > 0 ?
      activeAgents.reduce((sum, agent) => sum + (agent.performance?.conversionRate || 0), 0) / activeAgents.length : 0;

    // Calculate total available calls
    const totalAvailableCalls = agents.reduce((sum, agent) => sum + (agent.stats?.available || 0), 0);

    // Calculate total consumed calls
    const totalConsumedCalls = agents.reduce((sum, agent) => sum + (agent.stats?.consumed || 0), 0);

    return {
      successRate: Math.round(totalSuccessRate),
      conversionRate: Math.round(totalConversionRate),
      availableCalls: totalAvailableCalls,
      consumedCalls: totalConsumedCalls,
      activeAgentsCount: activeAgents.length
    };
  };

  const callAnalytics = calculateCallAnalytics();

  // Calculate total available credits from all agents
  const calculateTotalCredits = () => {
    return agents.reduce((total, agent) => {
      return total + (agent.stats?.available || 0);
    }, 0);
  };

  // Update credits when agents change
  useEffect(() => {
    const totalCredits = calculateTotalCredits();
    setCredits(totalCredits);
  }, [agents]);

  // Calculate notifications based on credits and campaign progress
  const calculateNotifications = () => {
    let count = 0;

    // Check for low credits notification
    if (credits < 1000) {
      count++;
    }

    // Check for active campaigns (limit to 1 notification per campaign type)
    const activeCampaigns = campaigns.filter(campaign =>
      campaign.status === 'active' || campaign.status === 'In Progress'
    );
    if (activeCampaigns.length > 0) {
      count += Math.min(activeCampaigns.length, 3); // Max 3 campaign notifications
    }

    // Check for agents with low performance (limit to 2 notifications)
    const lowPerformanceAgents = agents.filter(agent =>
      agent.status === 'active' &&
      agent.performance?.successRate < 50
    );
    if (lowPerformanceAgents.length > 0) {
      count += Math.min(lowPerformanceAgents.length, 2); // Max 2 low performance notifications
    }

    // Check for high performance agents (limit to 1 notification)
    const highPerformanceAgents = agents.filter(agent =>
      agent.status === 'active' &&
      agent.performance?.successRate > 80
    );
    if (highPerformanceAgents.length > 0) {
      count += 1; // Only 1 high performance notification
    }

    return count;
  };

  useEffect(() => {
    // Fetch the username from AsyncStorage
    AsyncStorage.getItem('loggedInUser').then(name => {
      if (name) setUserName(name);
    });
  }, []);

  // Recalculate stats when agents or campaigns change
  useEffect(() => {
    // This will trigger a re-render when agents or campaigns change
    // The calculateStats and calculateCallAnalytics functions will be called again
  }, [agents, campaigns]);

  // Update notification count
  useEffect(() => {
    const count = calculateNotifications();
    setNotificationCount(count);
    console.log('Notification count updated:', count, 'Credits:', credits, 'Active campaigns:', campaigns.filter(c => c.status === 'active').length);
  }, [agents, campaigns, credits]);

  useEffect(() => {
    // Generate chart data based on actual call data from agents
    const generateDynamicChartData = () => {
      const data = [];
      const labels = [];
      const today = new Date();

      // Calculate daily call distribution based on active agents and their performance
      const activeAgents = agents.filter(agent => agent.status === 'active');
      const avgCallsPerAgent = activeAgents.length > 0 ?
        activeAgents.reduce((sum, agent) => sum + (agent.stats?.totalCalls || 0), 0) / activeAgents.length : 0;

      // Generate last 30 days of data based on agent performance
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Calculate realistic daily calls based on active agents and their average performance
        const baseDailyCalls = Math.floor(avgCallsPerAgent * activeAgents.length / 30);
        const variation = Math.floor(Math.random() * 40) - 20; // ±20 variation for realism
        const dailyCalls = Math.max(0, baseDailyCalls + variation);

        data.push(dailyCalls);
      }

      return { data, labels };
    };

    const newData = generateDynamicChartData();
    setChartData(newData);
  }, [agents, stats.totalCalls]); // Removed currentWeek dependency to prevent regeneration on week change

  const handleNotifications = () => {
    setShowNotifications(true);
  };

  const handleProfile = () => {
    setShowProfile(true);
  };

  const handleLogout = async () => {
    console.log('handleLogout called');
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Logout confirmed, using AuthContext…');

              // Use AuthContext to handle logout
              const logoutResult = await logout();

              if (logoutResult.success) {
                console.log('Logout successful via AuthContext');
                // Navigate to login after successful logout
                router.replace('/login');
              } else {
                throw new Error(logoutResult.error || 'Logout failed');
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleAddCredits = () => {
    // Navigate to purchase page
    router.push('/(tabs)/Purchase');
  };



  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            color: '#333333',
            marginBottom: 16
          }}>
            Checking authentication...
          </Text>
        </View>
      </View>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container} >

      {/* Compact Header */}
      <CompactHeader
        userName={userName}
        onNotifications={handleNotifications}
        onProfile={handleProfile}
        onLogout={handleLogout}
        notificationCount={notificationCount}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Performance Overview Section */}
        <PerformanceOverview stats={stats} dashbordToken={dashbordToken} />

        {/* Campaign Progress Section */}
        <CampaignProgressSection agents={agents} campaigns={campaigns} />

        {/* Chart Section */}
        <CleanChartSection
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
          totalWeeks={totalWeeks}
          chartData={chartData}
          callAnalytics={callAnalytics}
        />

        {/* Credits Section */}
        <CleanCreditsSection
          credits={credits}
          onAddCredits={handleAddCredits}
          onPurchase={() => router.push('/(tabs)/Purchase')}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>



      {/* Notifications Modal - Using separate component */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        agents={agents}
        campaigns={campaigns}
        credits={credits}
      />

      {/* Profile Settings Modal - Using separate component */}
      <ProfileSettingsModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        userName={userName}
        setUserName={setUserName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Compact Header Styles
  compactHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15, // Moderate padding top
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Performance Overview Styles
  performanceSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  statsContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  // Enhanced Stat Card Styles (2 per row)
  statCard: {
    width: (screenWidth - 64) / 2 - 6, // Account for gap between cards
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12, // Ensure consistent spacing between rows
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 2,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#999999',
  },
  progressWrapper: {
    height: 3,
    backgroundColor: '#E5E5E5',
    borderRadius: 1.5,
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },

  // Campaign Progress Section Styles
  campaignProgressSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  campaignStat: {
    alignItems: 'center',
    flex: 1,
  },
  campaignStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 4,
  },
  campaignStatLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  campaignList: {
    marginTop: 10,
  },
  campaignListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  campaignItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  campaignInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  campaignStatus: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  campaignProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    minWidth: 30,
  },

  // Chart Section Styles
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  performanceBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  performanceText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  weekNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavBtnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  weekDisplay: {
    alignItems: 'center',
  },
  weekNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  weekDescription: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },

  // Credits Section Styles
  creditsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  creditsIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  creditsSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  creditsBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creditsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  creditsLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  creditsFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  addBtnText: {
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  purchaseBtn: {
    flex: 1,
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },



  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;