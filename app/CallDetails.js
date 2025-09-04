import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, FlatList, Animated, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCampaigns } from '../contexts/CampaignContext';

const { width } = Dimensions.get('window');

// Mock call details data
const mockCalls = [
  {
    id: 1,
    phone: '917889491152',
    date: '2025-07-18 15:32:22',
    duration: 66,
    status: 'ended',
    reason: 'customer-ended-call',
    sentiment: 'neutral',
    evaluation: 'false',
    cost: 0.1007,
  },
  // Add more calls as needed
];

const filterOptions = {
  status: ['All', 'ended', 'in-progress'],
  reason: ['All', 'customer-ended-call', 'agent-ended-call'],
  sentiment: ['All', 'neutral', 'positive', 'negative'],
  evaluation: ['All', 'true', 'false'],
};

function callsToCSV(calls) {
  const header = ['NO', 'PHONE NUMBER', 'DATE & TIME', 'DURATION (SECS)', 'STATUS', 'CALL ENDED REASON', 'SENTIMENT', 'EVALUATION', 'COST'];
  const rows = calls.map((call, idx) => [
    idx + 1,
    call.phone,
    call.date,
    call.duration,
    call.status,
    call.reason,
    call.sentiment,
    call.evaluation,
    call.cost
  ]);
  return [header, ...rows].map(row => row.join(',')).join('\n');
}

const sentimentColors = {
  neutral: '#A3A3A3',
  positive: '#22C55E',
  negative: '#EF4444',
};
const evaluationColors = {
  true: '#22C55E',
  false: '#EF4444',
};

const COLUMN_WIDTHS = [50, 140, 160, 90, 90, 150, 90, 90, 70, 90];

export default function CallDetails() {
  const params = useLocalSearchParams();
  const campaignId = params.campaignId;
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find(c => String(c.id) === String(campaignId));
  const [filters, setFilters] = useState({
    status: 'All',
    reason: 'All',
    sentiment: 'All',
    evaluation: 'All',
    dateRange: '',
    search: '',
  });
  const [showExportAnim] = useState(new Animated.Value(1));
  const [toast, setToast] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const stickyHeaderRef = useRef(null);

  const filteredCalls = mockCalls.filter(call => {
    return (
      (filters.status === 'All' || call.status === filters.status) &&
      (filters.reason === 'All' || call.reason === filters.reason) &&
      (filters.sentiment === 'All' || call.sentiment === filters.sentiment) &&
      (filters.evaluation === 'All' || String(call.evaluation) === filters.evaluation) &&
      (filters.search === '' || call.phone.includes(filters.search))
    );
  });

  const handleExport = async () => {
    Animated.sequence([
      Animated.timing(showExportAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(showExportAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    try {
      const csv = callsToCSV(filteredCalls);
      const fileUri = FileSystem.cacheDirectory + `call_details_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Call Details' });
      setToast('Exported successfully!');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export call details.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    setToast('Refreshed!');
    setTimeout(() => setToast(''), 1500);
  };

  const handleRowPress = (id) => {
    setHighlightedRow(id);
    setTimeout(() => setHighlightedRow(null), 400);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.campaignName}>{campaign?.name || 'Campaign'}</Text>
        <Animated.View style={{ transform: [{ scale: showExportAnim }] }}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.85}>
            <Text style={styles.exportBtnText}>Export Call Details</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.filterCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={styles.filtersRow}>
            <View style={styles.filterCol}>
              <Text style={styles.filterLabel}>Filter by Status:</Text>
              <FilterDropdown
                value={filters.status}
                options={filterOptions.status}
                onChange={v => setFilters(f => ({ ...f, status: v }))}
                animated
              />
            </View>
            <View style={styles.filterCol}>
              <Text style={styles.filterLabel}>Call Ended Reason:</Text>
              <FilterDropdown
                value={filters.reason}
                options={filterOptions.reason}
                onChange={v => setFilters(f => ({ ...f, reason: v }))}
                animated
              />
            </View>
            <View style={styles.filterCol}>
              <Text style={styles.filterLabel}>Sentiment:</Text>
              <FilterDropdown
                value={filters.sentiment}
                options={filterOptions.sentiment}
                onChange={v => setFilters(f => ({ ...f, sentiment: v }))}
                animated
              />
            </View>
            <View style={styles.filterCol}>
              <Text style={styles.filterLabel}>Evaluation:</Text>
              <FilterDropdown
                value={filters.evaluation}
                options={filterOptions.evaluation}
                onChange={v => setFilters(f => ({ ...f, evaluation: v }))}
                animated
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
        <View style={[styles.tableCard, { minWidth: COLUMN_WIDTHS.reduce((a, b) => a + b, 0) }]}>
          {/* Sticky Table Header */}
          <View ref={stickyHeaderRef} style={styles.tableHeaderRow}>
            {['NO', 'PHONE NUMBER', 'DATE & TIME', 'DURATION (SECS)', 'STATUS', 'CALL ENDED REASON', 'SENTIMENT', 'EVALUATION', 'COST', 'ACTION'].map((header, i) => (
              <Text key={header} style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS[i] }]}>{header}</Text>
            ))}
          </View>
          {filteredCalls.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Ionicons name="call-outline" size={48} color="#FF9500" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyStateText}>No call details found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCalls}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[styles.tableRow, highlightedRow === item.id && styles.tableRowHighlight]}
                >
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} activeOpacity={0.95} onPress={() => handleRowPress(item.id)}>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[0] }]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[1] }]}>{item.phone}</Text>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[2] }]}>{item.date}</Text>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[3] }]}>{item.duration}</Text>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[4] }]}>{item.status}</Text>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[5] }]}>{item.reason}</Text>
                    <View style={[styles.badge, { backgroundColor: sentimentColors[item.sentiment] || '#A3A3A3', width: COLUMN_WIDTHS[6] - 16 }]}>
                      <Text style={styles.badgeText}>{item.sentiment}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: evaluationColors[item.evaluation] || '#A3A3A3', width: COLUMN_WIDTHS[7] - 16 }]}>
                      <Text style={styles.badgeText}>{item.evaluation}</Text>
                    </View>
                    <Text style={[styles.tableCell, { width: COLUMN_WIDTHS[8] }]}>{item.cost}</Text>
                    <TouchableOpacity style={[styles.viewBtn, { width: COLUMN_WIDTHS[9] - 16 }]}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ minWidth: COLUMN_WIDTHS.reduce((a, b) => a + b, 0), paddingVertical: 8 }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button for Refresh */}
      <TouchableOpacity style={styles.fab} onPress={handleRefresh} activeOpacity={0.85}>
        <Ionicons name={refreshing ? 'refresh' : 'refresh-outline'} size={28} color="#fff" />
      </TouchableOpacity>
      {/* Toast */}
      {toast ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function FilterDropdown({ value, options, onChange, animated }) {
  const [show, setShow] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    if (animated) {
      Animated.timing(anim, {
        toValue: show ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    setShow(s => !s);
  };

  return (
    <View style={styles.dropdownWrap}>
      <TouchableOpacity style={styles.dropdownBtn} onPress={toggle}>
        <Text style={styles.dropdownText}>{value}</Text>
        <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
      </TouchableOpacity>
      {show && (
        <Animated.View style={animated ? {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
        } : {}}>
          <View style={styles.dropdownList}>
            {options.map(opt => (
              <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { onChange(opt); setShow(false); }}>
                <Text style={styles.dropdownItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
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
  exportBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
    marginTop: 8,
  },
  filterCol: {
    minWidth: 200,
    marginRight: 18,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: '#EEE',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    color: '#888',
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#FF9500',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
    marginBottom: 2,
    borderRadius: 10,
  },
  tableCell: {
    color: '#444',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginLeft: 8,
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#888',
    fontSize: 14,
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    zIndex: 10,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    color: '#444',
    fontSize: 14,
  },
  tableRowHighlight: {
    backgroundColor: '#E3F2FD',
    shadowColor: '#007AFF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minWidth: 60,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#FF9500',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 100,
  },
  toastWrap: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  toastText: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    fontWeight: 'bold',
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#FF9500',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
}); 