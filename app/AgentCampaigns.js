import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import { MotiView } from 'moti';
import { useCampaigns } from '../contexts/CampaignContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pause, Play } from 'lucide-react-native';

const CampaignCard = ({ campaign, onShowDetails, onShowAnalytics, index, onPlayPause }) => {
  let badgeStyle = styles.statusActive;
  let badgeText = styles.statusTextActive;
  if (campaign.status === 'Completed') {
    badgeStyle = styles.statusCompleted;
    badgeText = styles.statusTextCompleted;
  } else if (campaign.status === 'In Progress') {
    badgeStyle = styles.statusActive;
    badgeText = styles.statusTextActive;
  } else {
    badgeStyle = styles.statusOther;
    badgeText = styles.statusTextOther;
  }
  return (
    <View
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.campaignName}>{campaign.name}</Text>
        <View style={[styles.statusBadge, badgeStyle]}>
          <Text style={[styles.statusText, badgeText]}>{campaign.status}</Text>
        </View>
      </View>
      <Text style={styles.date}>{campaign.date}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={styles.statValue}>{campaign.progress}%</Text>
          <Ionicons name="navigate" size={24} color="#F97316" style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Contacts</Text>
          <Text style={styles.statValue}>{campaign.totalContacts}</Text>
          <FontAwesome5 name="users" size={22} color="#F97316" style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Calls</Text>
          <Text style={styles.statValue}>{campaign.completedCalls}/{campaign.totalContacts}</Text>
          <MaterialIcons name="call" size={22} color="#F97316" style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Success</Text>
          <Text style={styles.statValue}>{campaign.successRate}%</Text>
          <Ionicons name="checkmark-circle" size={22} color="#10B981" style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>Progress: {campaign.progress}%</Text>
      </View>
      <Text style={styles.assignedText}>Assigned to <Text style={{ color: '#F97316', fontWeight: 'bold' }}>{campaign.assignedTo}</Text></Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => onShowDetails(campaign)} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Call Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onShowAnalytics} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onPlayPause(campaign)}>
          {campaign.status === 'In Progress' ? (
            <Pause size={20} color="#EA580C" />
          ) : (
            <Play size={20} color="#EA580C" />
          )}
        </TouchableOpacity>
        <View style={styles.checkIconBox}>
          <Ionicons name="checkmark" size={22} color="#F97316" />
        </View>
      </View>
    </View>
  );
};

export default function AgentCampaigns() {
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { campaigns, updateCampaignStatus } = useCampaigns();
  const params = useLocalSearchParams();
  const router = useRouter();
  const agentId = params.agentId;
  const filteredCampaigns = agentId ? campaigns.filter(c => String(c.agentId) === String(agentId)) : campaigns;

  const handleShowDetails = (campaign) => {
    router.push({ pathname: '/CallDetails', params: { campaignId: campaign.id } });
  };
  const handleShowAnalytics = (campaign) => {
    router.push({ pathname: '/AgentCampaignAnalytics', params: { campaignId: campaign.id } });
  };

  const handlePlayPause = (campaign) => {
    updateCampaignStatus(campaign.id, campaign.status === 'In Progress' ? 'Paused' : 'In Progress');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Agent Campaigns</Text>
        <Text style={styles.subHeader}>Manage and monitor your agent's sales campaigns</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {filteredCampaigns.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No campaigns found.</Text>
        ) : (
          filteredCampaigns.map((campaign, idx) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              index={idx}
              onShowDetails={() => handleShowDetails(campaign)}
              onShowAnalytics={() => handleShowAnalytics(campaign)}
              onPlayPause={handlePlayPause}
            />
          ))
        )}
      </ScrollView>
      {/* Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetails(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDetails(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Call Details</Text>
            <Text style={styles.modalBody}>Details for {selectedCampaign?.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* Analytics Modal */}
      <Modal
        visible={showAnalytics}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAnalytics(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAnalytics(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Analytics</Text>
            <Text style={styles.modalBody}>Analytics for {selectedCampaign?.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowAnalytics(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 15, // Moderate padding top
    paddingHorizontal: 0,
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 22,
    marginHorizontal: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
    marginRight: 10,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  statusCompleted: {
    backgroundColor: '#34C759',
  },
  statusActive: {
    backgroundColor: '#FF9500',
  },
  statusOther: {
    backgroundColor: '#E0E7FF',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusTextCompleted: {
    color: '#fff',
  },
  statusTextActive: {
    color: '#fff',
  },
  statusTextOther: {
    color: '#3730A3',
  },
  date: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  statValue: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBarContainer: {
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFEAD5',
    borderRadius: 8,
    height: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  progressText: {
    position: 'absolute',
    left: 10,
    top: -22,
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 15,
  },
  assignedText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    borderWidth: 1.5,
    borderColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 12,
    backgroundColor: '#fff',
    shadowColor: '#FF9500',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 15,
  },
  iconBtn: {
    backgroundColor: '#FFEAD5',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  checkIconBox: {
    backgroundColor: '#FFEAD5',
    borderRadius: 8,
    padding: 8,
    marginLeft: 'auto',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    minWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 16,
    color: '#555',
    marginBottom: 18,
  },
  closeButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 