import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCampaigns } from '../contexts/CampaignContext';
// import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView as RNScrollView } from 'react-native';

// Mock call data for demonstration; in real app, fetch from context or backend
const mockCallsByCampaign = {
  '1': [
    { sentiment: 'neutral', duration: 66, status: 'ended', evaluation: false },
    { sentiment: 'positive', duration: 80, status: 'ended', evaluation: true },
    { sentiment: 'negative', duration: 45, status: 'ended', evaluation: false },
    { sentiment: 'neutral', duration: 70, status: 'ended', evaluation: false },
  ],
  // Add more campaignId: [calls] as needed
};
const mockRecommendations = [
  { text: 'Optimize afternoon calls for positive sentiment with effective follow-ups.', impact: 'LOW IMPACT' },
  { text: 'Optimize call outcomes by analyzing afternoon engagement for duration and effectiveness.', impact: 'LOW IMPACT' },
  { text: 'Optimize afternoon follow-ups to boost engagement and call outcomes.', impact: 'MEDIUM IMPACT' },
  { text: 'Optimize afternoon calls for higher engagement and positive sentiment.', impact: 'LOW IMPACT' },
];
const sentimentColors = {
  positive: '#22C55E',
  neutral: '#EA580C',
  negative: '#EF4444',
};

function percent(val, total) {
  if (!total) return '0%';
  return Math.round((val / total) * 100) + '%';
}

export default function AgentCampaignAnalytics() {
  const params = useLocalSearchParams();
  const campaignId = params.campaignId;
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find(c => String(c.id) === String(campaignId));
  // Fetch calls for this campaign (mocked for now)
  const calls = mockCallsByCampaign[campaignId] || [];
  const totalCalls = calls.length;
  const successCalls = calls.filter(c => c.evaluation === true).length;
  const responseCalls = calls.filter(c => c.status === 'ended').length; // Example: ended = responded
  const avgDuration = totalCalls ? Math.round(calls.reduce((a, b) => a + b.duration, 0) / totalCalls) : 0;
  const avgDurationStr = `${String(Math.floor(avgDuration / 60)).padStart(2, '0')}:${String(avgDuration % 60).padStart(2, '0')}`;
  const sentimentCounts = {
    positive: calls.filter(c => c.sentiment === 'positive').length,
    neutral: calls.filter(c => c.sentiment === 'neutral').length,
    negative: calls.filter(c => c.sentiment === 'negative').length,
  };
  // Dynamic insights
  const insights = [
    {
      title: 'Response Rate',
      value: percent(responseCalls, totalCalls),
      trend: responseCalls > 0 ? 1 : -1,
      desc: `The meaningful conversation rate of ${percent(responseCalls, totalCalls)} is...`,
      color: '#EA580C',
    },
    {
      title: 'Lead Quality',
      value: percent(successCalls, totalCalls),
      trend: successCalls > 0 ? 1 : -1,
      desc: `Observation: The lead quality rate is ${percent(successCalls, totalCalls)}...`,
      color: '#22C55E',
    },
    {
      title: 'Follow-up Rate',
      value: '0%',
      trend: -1,
      desc: 'The 0% follow-up rate indicates a missed...',
      color: '#EA580C',
    },
    {
      title: 'Peak Performance Time',
      value: '0%',
      trend: 0,
      desc: 'No positive sentiment calls found (last ...',
      color: '#A3A3A3',
    },
  ];
  // Dynamic recommendations (example logic)
  const recommendations = [];
  if (sentimentCounts.positive === 0) {
    recommendations.push({ text: 'Try to improve positive sentiment with better follow-ups.', impact: 'MEDIUM IMPACT' });
  }
  if (successCalls === 0) {
    recommendations.push({ text: 'Increase lead quality by targeting more engaged contacts.', impact: 'HIGH IMPACT' });
  }
  if (avgDuration < 60) {
    recommendations.push({ text: 'Optimize call duration for more meaningful conversations.', impact: 'LOW IMPACT' });
  }
  if (recommendations.length === 0) {
    recommendations.push({ text: 'Your campaign is performing well. Keep it up!', impact: 'LOW IMPACT' });
  }

  const HEADER_BG = '#FFF7ED';
  const CAMPAIGN_NAME_COLOR = '#FDBA74';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Animated Header with light orange background (scrolls with page) */}
        <View style={styles.headerBg}>
          <View style={styles.headerRowNew}>
            <Text style={styles.campaignNameNew}>{campaign?.name || 'Campaign'}</Text>
            <View style={[styles.statusBadge, campaign?.status === 'Completed' ? styles.statusCompleted : styles.statusActive]}>
              <Text style={[styles.statusText, campaign?.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextActive]}>{campaign?.status || ''}</Text>
            </View>
          </View>
        </View>
        {/* 2x2 Animated Stat Card Grid (scrolls with page) */}
        <View style={styles.statsGrid2x2}>
          <View style={[styles.statCard2, styles.statCardCalls2]}>
            <View style={styles.statIconCircleCalls}><Ionicons name="call-outline" size={28} color="#fff" /></View>
            <Text style={styles.statValueBig2}>{totalCalls}</Text>
            <Text style={styles.statLabel2}>Total Calls</Text>
            <Text style={styles.statTrendRed2}>▼ 0% last week</Text>
          </View>
          <View style={[styles.statCard2, styles.statCardSuccess2]}>
            <View style={styles.statIconCircleSuccess}><Ionicons name="checkmark-circle-outline" size={28} color="#fff" /></View>
            <Text style={styles.statValueBig2}>0</Text>
            <Text style={styles.statLabel2}>Success Rate</Text>
            <Text style={styles.statTrendGreen2}>▲ 0% conversion</Text>
          </View>
          <View style={[styles.statCard2, styles.statCardDuration2]}>
            <View style={styles.statIconCircleDuration}><Ionicons name="time-outline" size={28} color="#fff" /></View>
            <Text style={styles.statValueBig2}>{avgDurationStr}</Text>
            <Text style={styles.statLabel2}>Avg Duration</Text>
            <Text style={styles.statSub2}>min/call</Text>
          </View>
          <View style={[styles.statCard2, styles.statCardResponse2]}>
            <View style={styles.statIconCircleResponse}><Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" /></View>
            <Text style={styles.statValueBig2}>0</Text>
            <Text style={styles.statLabel2}>Response Rate</Text>
            <Text style={styles.statTrendRed2}>▼ 0% engagement</Text>
          </View>
        </View>
        {/* Sentiment Distribution */}
        <View style={styles.sentimentCard}>
          <Text style={styles.sentimentTitle}>Sentiment Distribution</Text>
          {['positive', 'neutral', 'negative'].map((sentiment, i) => (
            <View key={sentiment} style={styles.sentimentRow}>
              <View style={styles.sentimentEmojiLabelRow}>
                <Text
                  style={styles.sentimentEmoji}
                >
                  {sentiment === 'positive' ? '😊' : sentiment === 'neutral' ? '😐' : '😞'}
                </Text>
                <Text style={styles.sentimentLabel}>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</Text>
              </View>
              <Text style={styles.sentimentPercent}>{percent(sentimentCounts[sentiment], totalCalls)}</Text>
              <View style={styles.sentimentBarBg}>
                <View
                  style={[styles.sentimentBar, { backgroundColor: sentimentColors[sentiment] }]}
                />
              </View>
            </View>
          ))}
        </View>
        {/* Key Insights Heading */}
        <Text style={styles.insightsTitle}>Key Insights</Text>
        {/* Key Insights */}
        <View style={styles.insightsRow}>
          {insights.map((insight, i) => (
            <View key={insight.title} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc}>{insight.desc}</Text>
              <View style={styles.insightFooter}>
                <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
                <Text style={[insight.trend >= 0 ? styles.insightTrendGreen : styles.insightTrendRed]}>{insight.trend >= 0 ? `▲ ${Math.abs(insight.trend)}%` : `▼ ${Math.abs(insight.trend)}%`}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* AI Recommendations */}
        <View style={styles.recommendCard}>
          <Text style={styles.recommendTitle}>AI Recommendations</Text>
          <View style={styles.recommendGrid}>
            {recommendations.map((rec, i) => (
              <View key={i} style={styles.recommendItem}>
                <Text style={styles.recommendText}>{rec.text}</Text>
                <View style={[styles.impactBadge, rec.impact === 'HIGH IMPACT' ? styles.impactHigh : rec.impact === 'MEDIUM IMPACT' ? styles.impactMedium : styles.impactLow]}>
                  <Text style={styles.impactBadgeText}>{rec.impact}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 15, // Moderate padding top
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  campaignName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusActive: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusTextCompleted: {
    color: '#fff',
  },
  statusTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 2,
  },
  statTrendRed: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 2,
  },
  statTrendGreen: {
    color: '#34C759',
    fontSize: 13,
    marginTop: 2,
  },
  statSub: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  sentimentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sentimentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sentimentLabel: {
    flex: 2,
    fontSize: 15,
    color: '#4B5563',
  },
  sentimentPercent: {
    flex: 1,
    fontSize: 15,
    color: '#FF9500',
    textAlign: 'right',
    marginRight: 10,
  },
  sentimentBarBg: {
    flex: 6,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginLeft: 10,
  },
  sentimentBar: {
    height: 10,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  insightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  insightCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  insightTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
  },
  insightDesc: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  insightTrendRed: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  insightTrendGreen: {
    color: '#34C759',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recommendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recommendTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  recommendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recommendItem: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  recommendText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 10,
  },
  impactBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
  },
  impactLow: {
    backgroundColor: '#FF9500',
  },
  impactMedium: {
    backgroundColor: '#FF9500',
  },
  impactBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statsScroll: {
    marginBottom: 18,
  },
  statCard: {
    width: 180,
    minHeight: 160,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginRight: 0,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    justifyContent: 'center',
  },
  statCardCalls: {
    backgroundColor: '#F3F4F6',
  },
  statCardSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statCardDuration: {
    backgroundColor: '#E0F2FE',
  },
  statCardResponse: {
    backgroundColor: '#FFF7ED',
  },
  statValueBig: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 2,
  },
  statLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
    fontWeight: '600',
  },
  impactHigh: {
    backgroundColor: '#FF9500',
  },
  insightsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 8,
  },
  headerBg: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15, // Moderate padding top
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  campaignNameNew: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9500',
    letterSpacing: 1,
  },
  // 2x2 stat grid
  statsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  statCard2: {
    width: '47%',
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  statCardCalls2: { backgroundColor: '#F3F4F6' },
  statCardSuccess2: { backgroundColor: '#ECFDF5' },
  statCardDuration2: { backgroundColor: '#E0F2FE' },
  statCardResponse2: { backgroundColor: '#FFF7ED' },
  statIconCircleCalls: {
    backgroundColor: '#FF9500', borderRadius: 24, padding: 10, marginBottom: 8,
  },
  statIconCircleSuccess: {
    backgroundColor: '#34C759', borderRadius: 24, padding: 10, marginBottom: 8,
  },
  statIconCircleDuration: {
    backgroundColor: '#007AFF', borderRadius: 24, padding: 10, marginBottom: 8,
  },
  statIconCircleResponse: {
    backgroundColor: '#FF9500', borderRadius: 24, padding: 10, marginBottom: 8,
  },
  statValueBig2: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 2,
  },
  statLabel2: {
    color: '#FF9500',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '700',
    marginTop: 2,
  },
  statTrendRed2: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  statTrendGreen2: {
    color: '#34C759',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  statSub2: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  sentimentEmoji: {
    fontSize: 22,
    marginRight: 6,
  },
  sentimentEmojiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 90,
  },
}); 