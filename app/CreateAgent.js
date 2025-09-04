import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAgents } from '../contexts/AgentContext';

const AIAgentsPage = () => {
  const [showTestCallModal, setShowTestCallModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('USA +1');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const router = useRouter();
  const { addAgent } = useAgents();

  // State variables for agent creation
  const [agentName, setAgentName] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [sentimentDetection, setSentimentDetection] = useState(true);
  const [voiceMailDetection, setVoiceMailDetection] = useState(true);
  const [callRecording, setCallRecording] = useState(true);
  const [callSummary, setCallSummary] = useState(true);
  const [successParameters, setSuccessParameters] = useState('');
  const [dataPoints, setDataPoints] = useState('');
  const [summaryPrompt, setSummaryPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [useCase, setUseCase] = useState('1'); // Default to Real Estate

  const countryCodes = [
    { label: 'USA +1', value: 'USA +1' },
    { label: 'UK +44', value: 'UK +44' },
    { label: 'India +91', value: 'India +91' },
    { label: 'Canada +1', value: 'Canada +1' },
    { label: 'Australia +61', value: 'Australia +61' },
    { label: 'Germany +49', value: 'Germany +49' },
    { label: 'France +33', value: 'France +33' },
    { label: 'Japan +81', value: 'Japan +81' },
    { label: 'China +86', value: 'China +86' },
    { label: 'Brazil +55', value: 'Brazil +55' },
    { label: 'Mexico +52', value: 'Mexico +52' },
    { label: 'South Africa +27', value: 'South Africa +27' },
  ];

  const handleTestCall = () => {
    console.log('Test call button pressed!');
    setShowTestCallModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setShowTestCallModal(false);
    setShowCountryPicker(false);
    setPhoneNumber('');
  };

  const handleCountrySelect = (country) => {
    setSelectedCountryCode(country.value);
    setShowCountryPicker(false);
  };

  const toggleCountryPicker = () => {
    setShowCountryPicker(!showCountryPicker);
  };

  const handleSubmitTestCall = () => {
    // Handle test call submission logic here
    console.log('Test call submitted for:', selectedCountryCode, phoneNumber);
    handleCloseModal();
  };

  const agentsData = [
    {
      id: 1,
      name: 'AI Outbound Agent',
      type: 'Outbound Calling',
      avatar: '👩‍💼',
      availability: 'Available 24/7',
      languages: '4 Languages',
      hasTestCall: true,
      description: 'Advanced AI agent specialized in outbound calling and lead qualification. Makes intelligent calls, qualifies leads in real-time, and schedules follow-ups automatically.',
      stats: [
        { label: 'Calls per Day', value: '300+', color: '#666', icon: '📞' },
        { label: 'Success Rate', value: '94%', color: '#4CAF50', icon: '✅' },  
        { label: 'Clients Served', value: '500+', color: '#FF9500', icon: '👥' },
        { label: 'Availability', value: '24/7', color: '#FF9500', icon: '🕐' }
      ],
      supportedLanguages: ['English', 'Hindi', 'Spanish', 'Mandarin'],
      keyFeatures: [
        'Natural voice conversations',
        'Real-time lead scoring',
        'Instant call transcription',
        'Sentiment analysis',
        'Automated follow-ups',
        'Multi-language support',
        'Custom call scripts',
        'CRM integration'
      ],
      capabilities: [
        'Makes 300+ calls per day',
        'Qualifies leads in real-time',
        'Handles objections naturally',
        'Adapts conversation flow',
        'Detects buying signals',
        'Schedules follow-up calls'
      ]
    },
    {
      id: 2,
      name: 'AI WhatsApp Agent',
      type: 'WhatsApp Automation',
      avatar: '💬',
      availability: 'Available 24/7',
      languages: '4 Languages',
      hasTestCall: false,
      description: 'Advanced AI agent specialized in WhatsApp automation and customer engagement. Handles intelligent conversation, qualifies leads in real-time, and manages customer inquiries automatically with 95% satisfaction rate.',
      stats: [
        { label: 'Messages per Day', value: '1000+', color: '#666', icon: '💬' },
        { label: 'Success Rate', value: '95%', color: '#4CAF50', icon: '✅' },
        { label: 'Clients Served', value: '500+', color: '#FF9500', icon: '👥' },
        { label: 'Availability', value: '24/7', color: '#FF9500', icon: '🕐' }
      ],
      supportedLanguages: ['English', 'Hindi', 'Spanish', 'Mandarin'],
      keyFeatures: [
        'Natural conversation flow',
        'Real-time lead scoring',
        'Instant message responses',
        'Sentiment analysis',
        'Automated follow-ups',
        'Multi-language support',
        'Custom chat scripts',
        'WhatsApp Business API integration'
      ],
      capabilities: [
        'Handles 1000+ conversations simultaneously',
        'Qualifies leads in real-time',
        'Manages customer inquiries naturally',
        'Adapts conversation flow dynamically',
        'Detects buying signals automatically',
        'Schedules follow-up messages'
      ]
    },
    {
      id: 3,
      name: 'AI Inbound Agent',
      type: 'Inbound Calling',
      avatar: '📞',
      availability: 'Available 24/7',
      languages: '4 Languages',
      hasTestCall: false,
      description: 'Advanced AI agent specialized in inbound calling and lead qualification. Makes intelligent calls, qualifies leads in real-time, and schedules follow-ups automatically.',
      stats: [
        { label: 'Calls per Day', value: '300+', color: '#666', icon: '📞' },
        { label: 'Success Rate', value: '95%', color: '#4CAF50', icon: '✅' },
        { label: 'Clients Served', value: '500+', color: '#FF9500', icon: '👥' },
        { label: 'Availability', value: '24/7', color: '#FF9500', icon: '🕐' }
      ],
      supportedLanguages: ['English', 'Hindi', 'Spanish', 'Mandarin'],
      keyFeatures: [
        'Natural voice conversations',
        'Real-time lead scoring',
        'Instant call transcription',
        'Sentiment analysis',
        'Automated follow-ups',
        'Multi-language support',
        'Custom call scripts',
        'CRM integration'
      ],
      capabilities: [
        'Makes 300+ calls per day',
        'Qualifies leads in real-time',
        'Handles objections naturally',
        'Adapts conversation flow',
        'Detects buying signals',
        'Schedules follow-up calls'
      ]
    }
  ];

  const renderAgentHeader = (agent) => {
    return (
      <View style={styles.agentHeader}>
        <View style={styles.agentInfo}>
          <View style={styles.agentImageContainer}>
            <View style={styles.agentImagePlaceholder}>
              <Text style={styles.agentImageText}>{agent.avatar}</Text>
            </View>
          </View>
          <View style={styles.agentDetails}>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentType}>{agent.type}</Text>
            <View style={styles.agentTags}>
              <View style={styles.availabilityTag}>
                <Text style={styles.availabilityText}>{agent.availability}</Text>
              </View>
              <View style={styles.languageTag}>
                <Text style={styles.languageText}>{agent.languages}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          {agent.hasTestCall && (
            <TouchableOpacity style={styles.testCallButton} onPress={handleTestCall}>
              <Text style={styles.testCallText}>Test Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.hireButton}
            onPress={() => {
              router.push('/HireNow');
            }}
          >
            <Text style={styles.hireButtonText}>Hire Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCards = (stats) => {
    return (
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}
            >
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDescription = (description) => {
    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    );
  };

  const renderSupportedLanguages = (languages) => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🗣️ Supported Languages</Text>
        <View style={styles.languagesContainer}>
          {languages.map((language, index) => (
            <View key={index} style={styles.languageChip}>
              <Text style={styles.languageChipText}>{language}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderKeyFeatures = (features) => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>⚡ Key Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.checkmark}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCapabilities = (capabilities, agentType) => {
    const getCapabilityTitle = (agentType) => {
      if (agentType.includes('WhatsApp')) return '🎧 AI WhatsApp Capabilities';
      return '🎧 AI Calling Capabilities';
    };

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{getCapabilityTitle(agentType)}</Text>
        <View style={styles.capabilitiesContainer}>
          {capabilities.map((capability, index) => (
            <View key={index} style={styles.capabilityItem}>
              <Text style={styles.checkmark}>✅</Text>
              <Text style={styles.capabilityText}>{capability}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTestCallModal = () => {
    return (
      <Modal
        visible={showTestCallModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCloseModal}
          >
            <TouchableOpacity 
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Test Call</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.phoneLabel}>Phone</Text>
                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity 
                    style={styles.countryCodeContainer} 
                    onPress={toggleCountryPicker}
                  >
                    <Text style={styles.countryCodeText}>{selectedCountryCode}</Text>
                    <Text style={[styles.dropdownArrow, showCountryPicker && styles.dropdownArrowRotated]}>▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="0000000000"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                
                {showCountryPicker && (
                  <View style={styles.countryPickerContainer}>
                    <ScrollView style={styles.countryList} nestedScrollEnabled={true}>
                      {countryCodes.map((country, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.countryItem,
                            selectedCountryCode === country.value && styles.selectedCountryItem
                          ]}
                          onPress={() => handleCountrySelect(country)}
                        >
                          <Text style={[
                            styles.countryItemText,
                            selectedCountryCode === country.value && styles.selectedCountryItemText
                          ]}>
                            {country.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.closeModalButton} onPress={handleCloseModal}>
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTestCall}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const renderAgent = (agent) => {
    return (
      <View key={agent.id} style={styles.agentContainer}>
        {renderAgentHeader(agent)}
        {renderStatsCards(agent.stats)}
        {renderDescription(agent.description)}
        
        <View style={styles.sectionsContainer}>
          {renderSupportedLanguages(agent.supportedLanguages)}
          {renderKeyFeatures(agent.keyFeatures)}
          {renderCapabilities(agent.capabilities, agent.type)}
        </View>
      </View>
    );
  };

  const handleCreateBot = async () => {
    if (!agentName.trim()) {
      Alert.alert('Required Field', 'Please enter the agent name');
      return;
    }
    if (!destinationCountry.trim()) {
      Alert.alert('Required Field', 'Please enter the destination country');
      return;
    }
    
    // Get use case details for role and specializations
    const getUseCaseDetails = (useCaseId) => {
      switch (useCaseId) {
        case '1': // Real Estate
          return {
            role: 'Real Estate Specialist',
            specializations: ['Property Consultation', 'Lead Generation', 'Site Visits'],
            country: { name: destinationCountry, flag: '🏠', code: 'RE' },
            language: selectedLanguage || 'English'
          };
        case '2': // Alex HR
          return {
            role: 'HR Executive',
            specializations: ['Recruitment', 'Interview Scheduling', 'Employee Support'],
            country: { name: destinationCountry, flag: '👥', code: 'HR' },
            language: selectedLanguage || 'English'
          };
        case '3': // Hospital Booking
          return {
            role: 'Healthcare Assistant',
            specializations: ['Appointment Booking', 'Department Info', 'Patient Support'],
            country: { name: destinationCountry, flag: '🏥', code: 'HC' },
            language: selectedLanguage || 'English'
          };
        case '4': // Restaurants Booking
          return {
            role: 'Restaurant Assistant',
            specializations: ['Reservation Management', 'Menu Information', 'Customer Service'],
            country: { name: destinationCountry, flag: '🍽️', code: 'RS' },
            language: selectedLanguage || 'English'
          };
        default:
          return {
            role: 'AI Assistant',
            specializations: ['General Support', 'Customer Service'],
            country: { name: destinationCountry, flag: '🤖', code: 'AI' },
            language: selectedLanguage || 'English'
          };
      }
    };

    const useCaseDetails = getUseCaseDetails(useCase);
    
    const newAgent = {
      name: agentName,
      role: useCaseDetails.role,
      country: useCaseDetails.country,
      language: useCaseDetails.language,
      specializations: useCaseDetails.specializations,
      // Additional configuration data
      greetingMessage: greetingMessage,
      agentPrompt: agentPrompt,
      destinationCountry: destinationCountry,
      sentimentDetection: sentimentDetection,
      voiceMailDetection: voiceMailDetection,
      callRecording: callRecording,
      callSummary: callSummary,
      successParameters: successParameters,
      dataPoints: dataPoints,
      summaryPrompt: summaryPrompt,
      uploadedFiles: uploadedFiles,
    };
    
    await addAgent(newAgent);
    Alert.alert('Success', 'Bot created successfully!', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/PhoneSettings')
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.backgroundGradient}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>AI Sales Agents</Text>
            <Text style={styles.pageSubtitle}>
              Choose your AI sales agent to automate lead generation and qualification
            </Text>
          </View>

          {agentsData.map(agent => renderAgent(agent))}
        </ScrollView>
        
        {renderTestCallModal()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15, // Reduced from 30 to 15 to match Dashboard.js
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  agentContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  agentHeader: {
    marginBottom: 20,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  agentImageContainer: {
    marginRight: 15,
  },
  agentImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  agentImageText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  agentType: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  agentTags: {
    flexDirection: 'row',
    gap: 10,
  },
  availabilityTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  languageTag: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  testCallButton: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  testCallButtonInner: {
    // This style is no longer needed as it's directly applied to the TouchableOpacity
  },
  testCallText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  hireButton: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hireButtonInner: {
    // This style is no longer needed as it's directly applied to the TouchableOpacity
  },
  hireButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconText: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  sectionsContainer: {
    gap: 20,
  },
  sectionContainer: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageChipText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  featuresGrid: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  checkmark: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  capabilitiesContainer: {
    gap: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  capabilityText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  modalContent: {
    padding: 20,
  },
  phoneLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    minWidth: 100,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666666',
    marginLeft: 8,
  },
  dropdownArrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  countryPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countryList: {
    maxHeight: 200,
  },
  countryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCountryItem: {
    backgroundColor: '#E3F2FD',
  },
  countryItemText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  selectedCountryItemText: {
    color: '#FF9500',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  closeModalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AIAgentsPage;