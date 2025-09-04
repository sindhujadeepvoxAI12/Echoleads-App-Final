// app/(tabs)/PhoneSettings.js - Phone Numbers Management Page
// Modern UI with beautiful animations and card-based design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  // Animated,
  Alert,
  Modal,
  Platform,
  RefreshControl
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  CreditCard,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  MoreVertical,
  ArrowRight,
  Settings
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
// import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAgents } from '../../contexts/AgentContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data for available phone numbers
const availablePhoneNumbers = [
  {
    id: 1,
    number: '+1 (555) 123-4567',
    country: { name: "United States", flag: "🇺🇸", code: "US" },
    price: 25,
    status: "available"
  },
  {
    id: 2,
    number: '+1 (555) 234-5678',
    country: { name: "United States", flag: "🇺🇸", code: "US" },
    price: 35,
    status: "available"
  },
  {
    id: 3,
    number: '+44 20 7946 0958',
    country: { name: "United Kingdom", flag: "🇬🇧", code: "UK" },
    price: 45,
    status: "available"
  },
  {
    id: 4,
    number: '+91 98765 43210',
    country: { name: "India", flag: "🇮🇳", code: "IN" },
    price: 20,
    status: "available"
  },
  {
    id: 5,
    number: '+1 (555) 345-6789',
    country: { name: "United States", flag: "🇺🇸", code: "US" },
    price: 25,
    status: "available"
  },
  {
    id: 6,
    number: '+49 30 12345678',
    country: { name: "Germany", flag: "🇩🇪", code: "DE" },
    price: 40,
    status: "available"
  }
];

// Main PhoneSettings Component
const PhoneSettingsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [ownedNumbers, setOwnedNumbers] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [filteredNumbers, setFilteredNumbers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { agents } = useAgents();

  console.log('PhoneSettings: Agents from context:', agents?.length || 0);
  console.log('PhoneSettings: Agent names:', agents?.map(a => a.name) || []);

  // Load owned numbers on component mount and when returning from purchase
  useEffect(() => {
    const loadOwnedNumbers = async () => {
      try {
        const ownedData = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
        if (ownedData) {
          const numbers = JSON.parse(ownedData);
          setOwnedNumbers(numbers);
        }
      } catch (error) {
        console.log('Error loading owned numbers:', error);
      }
    };

    loadOwnedNumbers();
  }, []);

  // Initialize filtered numbers when component mounts
  useEffect(() => {
    const purchasedNumbers = ownedNumbers.map(owned => owned.number);
    const filtered = availablePhoneNumbers.filter(number =>
      !purchasedNumbers.includes(number.number)
    );
    setFilteredNumbers(filtered);
  }, [ownedNumbers]);

  // Refresh owned numbers when component comes into focus
  useEffect(() => {
    const loadOwnedNumbers = async () => {
      if (refreshTrigger > 0) {
        setIsRefreshing(true);
      }
      
      try {
        const ownedData = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
        if (ownedData) {
          const numbers = JSON.parse(ownedData);
          const previousCount = ownedNumbers.length;
          
          // Check for duplicates and remove them
          const uniqueNumbers = numbers.filter((number, index, self) => 
            index === self.findIndex(n => n.id === number.id)
          );
          
          setOwnedNumbers(uniqueNumbers);
          
          // Show success message if new numbers were added and this is not the initial load
          if (uniqueNumbers.length > previousCount && previousCount > 0 && refreshTrigger > 0) {
            const newCount = uniqueNumbers.length - previousCount;
            Alert.alert(
              'Purchase Successful!',
              `You have successfully purchased ${newCount} phone number${newCount > 1 ? 's' : ''}.`,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.log('Error loading owned numbers:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Load owned numbers when component mounts and when refreshTrigger changes
    loadOwnedNumbers();
  }, [refreshTrigger]);

  // Refresh data when screen comes into focus (e.g., returning from purchase page)
  useFocusEffect(
    React.useCallback(() => {
      const checkForNewPurchases = async () => {
        try {
          const ownedData = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
          if (ownedData) {
            const numbers = JSON.parse(ownedData);
            const previousCount = ownedNumbers.length;
            
            // Check for duplicates and remove them
            const uniqueNumbers = numbers.filter((number, index, self) => 
              index === self.findIndex(n => n.id === number.id)
            );
            
            setOwnedNumbers(uniqueNumbers);
            
            // Update agents with their assigned phone numbers
            updateAgentsWithPhoneNumbers(uniqueNumbers);
            
            // Show success message if new numbers were added
            if (uniqueNumbers.length > previousCount && previousCount > 0) {
              const newCount = uniqueNumbers.length - previousCount;
              Alert.alert(
                'Purchase Successful!',
                `You have successfully purchased ${newCount} phone number${newCount > 1 ? 's' : ''}.`,
                [{ text: 'OK' }]
              );
            }
          }
        } catch (error) {
          console.log('Error checking for new purchases:', error);
        }
      };

      checkForNewPurchases();
    }, [])
  );

  // Function to update agents with their assigned phone numbers
  const updateAgentsWithPhoneNumbers = (phoneNumbers) => {
    console.log('Updating agents with phone numbers...');
    console.log('Phone numbers count:', phoneNumbers.length);
    
    try {
      // Get current agents from AsyncStorage or use default
      const updatedAgents = agents.map(agent => {
        const assignedNumbers = phoneNumbers
          .filter(phone => phone.agentId === agent.id)
          .map(phone => phone.number);
        
        console.log(`Agent ${agent.name} assigned to:`, assignedNumbers);
        
        return {
          ...agent,
          assignedPhoneNumbers: assignedNumbers
        };
      });

      console.log('Updated agents with phone numbers:', updatedAgents.length);
      
      // Save updated agents to AsyncStorage
      AsyncStorage.setItem('AGENTS_WITH_PHONES', JSON.stringify(updatedAgents))
        .then(() => console.log('Agents updated in AsyncStorage'))
        .catch(error => console.log('Error updating agents in AsyncStorage:', error));
    } catch (error) {
      console.log('Error updating agents with phone numbers:', error);
    }
  };

  // Filter numbers based on search query and remove purchased numbers
  useEffect(() => {
    // Get purchased numbers to filter them out
    const purchasedNumbers = ownedNumbers.map(owned => owned.number);
    
    const filtered = availablePhoneNumbers.filter(number =>
      // Check if number is not purchased
      !purchasedNumbers.includes(number.number) &&
      // Check search query
      (number.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
       number.country.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredNumbers(filtered);
  }, [searchQuery, ownedNumbers]);

  const handleNumberSelect = (phoneNumber) => {
    const isSelected = selectedNumbers.some(num => num.id === phoneNumber.id);
    
    if (isSelected) {
      setSelectedNumbers(selectedNumbers.filter(num => num.id !== phoneNumber.id));
    } else {
      setSelectedNumbers([...selectedNumbers, phoneNumber]);
    }
  };

  const handleFilterPress = () => {
    Alert.alert(
      "Filter Options",
      "Choose filter criteria:",
      [
        { text: "All Numbers", onPress: () => {
          const purchasedNumbers = ownedNumbers.map(owned => owned.number);
          const filtered = availablePhoneNumbers.filter(number =>
            !purchasedNumbers.includes(number.number)
          );
          setFilteredNumbers(filtered);
        }},
        { text: "US Numbers", onPress: () => {
          const purchasedNumbers = ownedNumbers.map(owned => owned.number);
          const filtered = availablePhoneNumbers.filter(number =>
            !purchasedNumbers.includes(number.number) &&
            number.country.code === 'US'
          );
          setFilteredNumbers(filtered);
        }},
        { text: "International Numbers", onPress: () => {
          const purchasedNumbers = ownedNumbers.map(owned => owned.number);
          const filtered = availablePhoneNumbers.filter(number =>
            !purchasedNumbers.includes(number.number) &&
            number.country.code !== 'US'
          );
          setFilteredNumbers(filtered);
        }},
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleBuySingle = (phoneNumber) => {
    setSelectedNumbers([phoneNumber]);
    setShowPaymentModal(true);
  };

  const handleAssignAgent = (phoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setShowAssignModal(true);
  };

  const handleAgentAssignment = async (agentId) => {
    console.log('Assigning agent:', agentId, 'to phone number:', selectedPhoneNumber?.number);
    
    if (!selectedPhoneNumber || !agentId) {
      console.log('Missing phone number or agent ID');
      return;
    }

    try {
      // First, unassign this agent from any other phone numbers
      const updatedOwnedNumbers = ownedNumbers.map(number => {
        if (number.agentId === agentId && number.id !== selectedPhoneNumber.id) {
          console.log('Unassigning agent from:', number.number);
          return { ...number, agentId: null };
        }
        return number;
      });

      // Then assign to the selected phone number
      const finalUpdatedNumbers = updatedOwnedNumbers.map(number => {
        if (number.id === selectedPhoneNumber.id) {
          console.log('Assigning agent to:', number.number);
          return { ...number, agentId: agentId };
        }
        return number;
      });

      console.log('Updated owned numbers:', finalUpdatedNumbers.length);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('PHONE_NUMBERS_DATA', JSON.stringify(finalUpdatedNumbers));
      
      // Update local state
      setOwnedNumbers(finalUpdatedNumbers);
      
      // Update agents with phone numbers in AsyncStorage
      updateAgentsWithPhoneNumbers(finalUpdatedNumbers);
      
      console.log('Agent assignment completed successfully');
      
      // Close modal
      setShowAssignModal(false);
      setSelectedPhoneNumber(null);
      
      Alert.alert('Success', 'Agent assigned successfully!');
    } catch (error) {
      console.log('Error assigning agent:', error);
      Alert.alert('Error', 'Failed to assign agent. Please try again.');
    }
  };



  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Phone Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your phone numbers and configurations</Text>
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            colors={['#FF9500']}
            tintColor="#FF9500"
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#FF9500' }]}>
                <Phone size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{ownedNumbers.length}</Text>
            </View>
            <Text style={styles.statTitle}>Owned</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#34C759' }]}>
                <Activity size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{filteredNumbers.length}</Text>
            </View>
            <Text style={styles.statTitle}>Available</Text>
          </View>
        </View>
        
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search phone numbers"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress} activeOpacity={0.8}>
            <Filter size={18} color="#FF9500" />
          </TouchableOpacity>
        </View>

        {/* Owned Phone Numbers Section */}
        {ownedNumbers.length > 0 && (
          <View style={styles.numbersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Phone Numbers</Text>
              <Text style={styles.sectionSubtitle}>{ownedNumbers.length} number{ownedNumbers.length > 1 ? 's' : ''} owned</Text>
            </View>
            
            {ownedNumbers.map((ownedNumber, index) => (
              <View key={ownedNumber.id} style={styles.ownedNumberCard}>
                <View style={styles.ownedNumberHeader}>
                  <View style={styles.phoneInfo}>
                    <View style={styles.ownedPhoneIcon}>
                      <Phone size={20} color="#34C759" />
                    </View>
                    <View style={styles.phoneDetails}>
                      <Text style={styles.phoneNumber}>{ownedNumber.number}</Text>
                      <Text style={styles.phoneType}>
                        {ownedNumber.agentId ? 'Assigned' : 'Unassigned'}
                      </Text>
                      {ownedNumber.agentId && (
                        <Text style={styles.assignedAgentName}>
                          {agents.find(agent => agent.id === ownedNumber.agentId)?.name || 'Unknown Agent'}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.assignButton}
                    onPress={() => handleAssignAgent(ownedNumber)}
                  >
                    <Text style={styles.assignButtonText}>
                      {ownedNumber.agentId ? 'Change Agent' : 'Assign'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Available Phone Numbers Section */}
        <View style={styles.numbersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Phone Numbers</Text>
            <Text style={styles.sectionSubtitle}>{filteredNumbers.length} numbers available</Text>
          </View>
          
          {filteredNumbers.map((phoneNumber, index) => (
            <PhoneNumberCard 
              key={phoneNumber.id} 
              phoneNumber={phoneNumber} 
              index={index}
              onBuy={handleBuySingle}
            />
          ))}
        </View>



        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        selectedNumbers={selectedNumbers}
        onClose={() => setShowPaymentModal(false)}
        onComplete={() => {
          setShowPaymentModal(false);
          setSelectedNumbers([]);
          // Refresh the owned numbers immediately
          const refreshOwnedNumbers = async () => {
            try {
              const ownedData = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
              if (ownedData) {
                const numbers = JSON.parse(ownedData);
                const uniqueNumbers = numbers.filter((number, index, self) => 
                  index === self.findIndex(n => n.id === number.id)
                );
                setOwnedNumbers(uniqueNumbers);
              }
            } catch (error) {
              console.log('Error refreshing owned numbers:', error);
            }
          };
          refreshOwnedNumbers();
        }}
      />

      {/* Agent Assignment Modal */}
      <AgentAssignmentModal
        visible={showAssignModal}
        phoneNumber={selectedPhoneNumber}
        agents={agents}
        ownedNumbers={ownedNumbers}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPhoneNumber(null);
        }}
        onAssign={handleAgentAssignment}
      />
    </View>
  );
};

// Phone Number Card Component
const PhoneNumberCard = ({ phoneNumber, index, onBuy }) => {
  const router = useRouter();

  const handleBuyPress = () => {
    onBuy(phoneNumber);
  };

  return (
    <View style={styles.phoneNumberCard}>
      <TouchableOpacity onPress={handleBuyPress} activeOpacity={1}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.phoneInfo}>
            <View style={styles.phoneIcon}>
              <Phone size={20} color="#FF9500" />
            </View>
            <View style={styles.phoneDetails}>
              <Text style={styles.phoneNumber}>{phoneNumber.number}</Text>
              <Text style={styles.phoneType}>Available</Text>
            </View>
          </View>
        </View>

        {/* Country and Price */}
        <View style={styles.countrySection}>
          <View style={styles.countryInfo}>
            <Text style={styles.countryFlag}>{phoneNumber.country.flag}</Text>
            <Text style={styles.countryName}>{phoneNumber.country.name}</Text>
          </View>
          <View style={styles.priceInfo}>
            <DollarSign size={14} color="#34C759" />
            <Text style={styles.priceText}>${phoneNumber.price}/month</Text>
          </View>
        </View>

        {/* Buy Button */}
        <View style={styles.buyButtonSection}>
          <TouchableOpacity 
            style={styles.buyButtonCard} 
            activeOpacity={0.8}
            onPress={handleBuyPress}
          >
            <Text style={styles.buyButtonCardText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Agent Assignment Modal Component
const AgentAssignmentModal = ({ visible, phoneNumber, agents, onClose, onAssign, ownedNumbers }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(selectedAgent.id);
    }
  };

  // Get agents that are already assigned to other phone numbers
  const getAssignedAgents = () => {
    return ownedNumbers
      .filter(number => number.id !== phoneNumber?.id && number.agentId)
      .map(number => number.agentId);
  };

  const assignedAgentIds = getAssignedAgents();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.fullScreenModalBackdrop}>
        <View style={styles.fullScreenModalContent}>
          <Text style={styles.fullScreenModalTitle}>Assign to Agent</Text>
          
          {phoneNumber && (
            <View style={styles.phoneNumberDisplay}>
              <Phone size={20} color="#FF9500" />
              <Text style={styles.phoneNumberText}>{phoneNumber.number}</Text>
            </View>
          )}

          <View style={styles.agentGrid}>
            {agents.map((agent) => {
              const isAssigned = assignedAgentIds.includes(agent.id);
              const isCurrentlyAssigned = phoneNumber?.agentId === agent.id;
              
              return (
                <TouchableOpacity
                  key={agent.id}
                  style={[
                    styles.agentGridItem,
                    selectedAgent?.id === agent.id && styles.selectedAgentGridItem,
                    isAssigned && !isCurrentlyAssigned && styles.assignedAgentGridItem
                  ]}
                  onPress={() => setSelectedAgent(agent)}
                >
                  <Text style={[
                    styles.agentGridName,
                    selectedAgent?.id === agent.id && styles.selectedAgentGridName,
                    isAssigned && !isCurrentlyAssigned && styles.assignedAgentGridName
                  ]}>
                    {agent.name}
                    {isAssigned && !isCurrentlyAssigned && ' (Currently Assigned)'}
                    {isCurrentlyAssigned && ' (Current Agent)'}
                  </Text>
                  {selectedAgent?.id === agent.id && (
                    <CheckCircle size={16} color="#34C759" style={styles.agentCheckIcon} />
                  )}
                  {isAssigned && !isCurrentlyAssigned && (
                    <AlertCircle size={16} color="#FF9500" style={styles.agentAssignedIcon} />
                  )}
                  {isCurrentlyAssigned && (
                    <CheckCircle size={16} color="#34C759" style={styles.agentCurrentIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.fullScreenModalButtons}>
            <TouchableOpacity style={styles.fullScreenCancelButton} onPress={onClose}>
              <Text style={styles.fullScreenCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fullScreenAssignButton, !selectedAgent && styles.disabledAssignButton]} 
              onPress={handleAssign}
              disabled={!selectedAgent}
            >
              <Text style={styles.fullScreenAssignButtonText}>Assign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Payment Modal Component
const PaymentModal = ({ visible, selectedNumbers, onClose, onComplete }) => {
  const router = useRouter();

  const totalPrice = selectedNumbers.reduce((sum, number) => sum + number.price, 0);

  const handlePayment = async () => {
    // Simulate payment processing
    Alert.alert(
      'Processing Payment',
      'Please wait while we process your payment...',
      [{ text: 'OK' }]
    );

    // Simulate payment delay
    setTimeout(async () => {
      try {
        // Get existing phone numbers
        const existingNumbers = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
        let phoneNumbers = existingNumbers ? JSON.parse(existingNumbers) : [];

        // Add new phone numbers with unique IDs
        const newNumbers = selectedNumbers.map((number, index) => ({
          id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          number: number.number,
          agentId: null
        }));

        const updatedNumbers = [...phoneNumbers, ...newNumbers];
        await AsyncStorage.setItem('PHONE_NUMBERS_DATA', JSON.stringify(updatedNumbers));

        // Show success message
        Alert.alert(
          'Payment Successful!',
          `Successfully purchased ${selectedNumbers.length} phone number${selectedNumbers.length > 1 ? 's' : ''}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                // Trigger refresh to show new numbers
                setTimeout(() => {
                  onComplete();
                }, 500);
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error processing payment:', error);
        Alert.alert('Error', 'Failed to process payment. Please try again.');
      }
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.paymentModalCard}>
          <Text style={styles.paymentModalTitle}>Complete Purchase</Text>
          
          {/* Selected Numbers */}
          <View style={styles.selectedNumbersSection}>
            <Text style={styles.selectedNumbersTitle}>Selected Numbers:</Text>
            {selectedNumbers.map((number, index) => (
              <View key={index} style={styles.selectedNumberItem}>
                <Phone size={16} color="#FF9500" />
                <Text style={styles.selectedNumberText}>{number.number}</Text>
                <Text style={styles.selectedNumberPrice}>${number.price}/month</Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Monthly Cost:</Text>
            <Text style={styles.totalAmount}>${totalPrice}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.paymentModalBtnRow}>
            <TouchableOpacity style={styles.paymentModalBtnClose} onPress={onClose}>
              <Text style={styles.paymentModalBtnCloseText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentModalBtnSubmit} onPress={handlePayment}>
              <Text style={styles.paymentModalBtnSubmitText}>Proceed to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
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

  // Numbers Section Styles
  numbersSection: {
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

  // Owned Number Card Styles
  ownedNumberCard: {
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
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  ownedNumberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownedPhoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  ownedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    padding: 4,
  },

  // Phone Number Card Styles
  phoneNumberCard: {
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
  selectedCard: {
    borderColor: '#FF9500',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 149, 0, 0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  selectedPhoneIcon: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  phoneDetails: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  phoneType: {
    fontSize: 14,
    color: '#666666',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },

  // Country Section Styles
  countrySection: {
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
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },



  bottomPadding: {
    height: 20,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  paymentModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '95%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  paymentModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a4666',
    marginBottom: 18,
  },
  selectedNumbersSection: {
    width: '100%',
    marginBottom: 20,
  },
  selectedNumbersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  selectedNumberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedNumberText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  selectedNumberPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  paymentModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    gap: 12,
  },
  paymentModalBtnClose: {
    backgroundColor: '#888',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentModalBtnCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  paymentModalBtnSubmit: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentModalBtnSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  // Full Screen Agent Assignment Modal Styles
  fullScreenModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  fullScreenModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  fullScreenModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneNumberDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 25,
  },
  phoneNumberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  agentGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  agentGridItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  selectedAgentGridItem: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderColor: '#34C759',
    borderWidth: 2,
  },
  agentGridName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedAgentGridName: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  agentCheckIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  fullScreenModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  fullScreenCancelButton: {
    flex: 1,
    backgroundColor: '#888',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fullScreenCancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullScreenAssignButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fullScreenAssignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledAssignButton: {
    backgroundColor: '#ccc',
  },
  assignedAgentGridItem: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: '#FF9500',
  },
  assignedAgentGridName: {
    color: '#FF9500',
    fontWeight: '600',
  },
  agentAssignedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  agentCurrentIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  // Buy Button Card Styles
  buyButtonSection: {
    marginTop: 16,
  },
  buyButtonCard: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Assign Button Styles
  assignButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assignedAgentName: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default PhoneSettingsScreen;