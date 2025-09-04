import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAgents } from '../contexts/AgentContext';

const AgentConfigPage = () => {
  const { useCase, selectedLanguage, selectedAccent } = useLocalSearchParams();
  const { addAgent } = useAgents();
  const router = useRouter();
  const getGreetingAndPrompt = (useCaseId) => {
    switch (useCaseId) {
      case '1': // Real Estate
        return {
          greeting: 'We are calling from Global real estate real estate, we have serious buyers and investors, and we are looking for collaboration',
          prompt: `#About Us\n-Global real estate is a boutique real estate firm specializing in end-to-end portfolio management for international buyers.\n-From off-plan and secondary properties to plots and commercial spaces, we offer a seamless investment experience.\n-With a diverse property portfolio, personalized assistance, and cutting-edge technology,\n-We ensure every client finds their perfect opportunity in Dubai's thriving real estate market.\n\n#Guidelines:-\n-You are an AI assistant for Global real estate.\n-You need to start by telling the benefits of this collaboration and after user's acknowledgement to proceed, start collecting below information\n-Do not ask anything apart from these prompts.\n-Don't repeat the user's name.\n\n#Call opening/flow:-\nMay i know if you are you more focused on off-plan, Rentals or secondary market deals?\n(wait for user response and then ask other details below)\n-Current Direct Inventory for example :- existing plots, villas, flats, lands etc.\n(wait for user response)\n-Name\n(wait for user response)\n-Alternate Phone number.\n(wait for user response)\n\n#Confirm/Recall all the details:   \n- Property Type Specialization: [User's Choice]  \n- Current Direct Inventory: [Yes/No + Listing Details if applicable]  \n- Alternate Phone Number: [User's Number]  \n\n#Closing    \nThank you for your time, [User's Name]. It was a pleasure speaking with you. \nOne of our team members will be in touch soon to discuss how we can work together.  \nHave a fantastic day ahead, [User's Name]! We're excited to work with you.`
        };
      case '2': // Alex HR
        return {
          greeting: 'We are calling from Alex HR, your smart HR assistant.',
          prompt: `#About Us\n-Alex HR is a smart HR assistant to streamline recruitment, schedule interviews, answer employee queries, and manage HR tasks effortlessly.\n\n#Guidelines:-\n-You are an AI assistant for Alex HR.\n-Start by explaining the benefits of using Alex HR for recruitment and HR management.\n-After user agrees, collect the following: open positions, preferred interview times, and contact details.\n-Do not ask anything apart from these prompts.\n-Don\'t repeat the user\'s name.\n\n#Call opening/flow:-\nMay I know what positions you are looking to fill currently?\n(wait for user response and then ask other details below)\n-Preferred interview times\n(wait for user response)\n-Contact details\n(wait for user response)\n\n#Confirm/Recall all the details:   \n- Open Positions: [User's Input]  \n- Interview Times: [User's Input]  \n- Contact Details: [User's Input]  \n\n#Closing    \nThank you for your time, [User's Name]. We will follow up soon!`
        };
      case '3': // Hospital Booking
        return {
          greeting: 'We are calling from Hospital Booking, your intelligent AI assistant for healthcare.',
          prompt: `#About Us\n-Hospital Booking is an intelligent AI assistant to book doctor appointments, provide department info, and answer patient queries 24/7.\n\n#Guidelines:-\n-You are an AI assistant for Hospital Booking.\n-Start by explaining the benefits of using our hospital booking service.\n-After user agrees, collect the following: department needed, preferred appointment time, and patient details.\n-Do not ask anything apart from these prompts.\n-Don\'t repeat the user\'s name.\n\n#Call opening/flow:-\nWhich department do you need an appointment for?\n(wait for user response and then ask other details below)\n-Preferred appointment time\n(wait for user response)\n-Patient details\n(wait for user response)\n\n#Confirm/Recall all the details:   \n- Department: [User's Input]  \n- Appointment Time: [User's Input]  \n- Patient Details: [User's Input]  \n\n#Closing    \nThank you for your time, [User's Name]. Your appointment is being scheduled!`
        };
      case '4': // Restaurants Booking
        return {
          greeting: 'We are calling from Restaurants Booking, your AI-powered reservation assistant.',
          prompt: `#About Us\n-Restaurants Booking is an AI-powered assistant to handle reservations, menus, and book your table in seconds.\n\n#Guidelines:-\n-You are an AI assistant for Restaurants Booking.\n-Start by explaining the benefits of using our reservation service.\n-After user agrees, collect the following: reservation date, time, and number of guests.\n-Do not ask anything apart from these prompts.\n-Don\'t repeat the user\'s name.\n\n#Call opening/flow:-\nFor what date and time would you like to book a table?\n(wait for user response and then ask other details below)\n-Number of guests\n(wait for user response)\n-Contact details\n(wait for user response)\n\n#Confirm/Recall all the details:   \n- Date & Time: [User's Input]  \n- Number of Guests: [User's Input]  \n- Contact Details: [User's Input]  \n\n#Closing    \nThank you for your time, [User's Name]. Your reservation is confirmed!`
        };
      default:
        return {
          greeting: 'Default greeting message',
          prompt: 'Default agent prompt'
        };
    }
  };
  const { greeting, prompt } = getGreetingAndPrompt(useCase);
  const [agentName, setAgentName] = useState('');
  const [greetingMessage, setGreetingMessage] = useState(greeting);
  const [agentPrompt, setAgentPrompt] = useState(prompt);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦' },
    { name: 'United Kingdom', code: 'UK', flag: '🇬🇧' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪' },
    { name: 'France', code: 'FR', flag: '🇫🇷' },
    { name: 'Spain', code: 'ES', flag: '🇪🇸' },
    { name: 'Italy', code: 'IT', flag: '🇮🇹' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵' },
    { name: 'India', code: 'IN', flag: '🇮🇳' },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
    { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
    { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
    { name: 'Norway', code: 'NO', flag: '🇳🇴' },
    { name: 'Denmark', code: 'DK', flag: '🇩🇰' },
    { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
    { name: 'China', code: 'CN', flag: '🇨🇳' },
  ];
  const [successParameters, setSuccessParameters] = useState('Response accuracy, Conversion Rate');
  const [dataPoints, setDataPoints] = useState('Sentiment score, Resolution status, Call duration');
  const [summaryPrompt, setSummaryPrompt] = useState('Summarize the conversation focusing on customer satisfaction and key insights.');
  
  // Toggle states
  const [sentimentDetection, setSentimentDetection] = useState(true);
  const [voiceMailDetection, setVoiceMailDetection] = useState(true);
  const [callRecording, setCallRecording] = useState(true);
  const [callSummary, setCallSummary] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/rtf',
          'text/rtf'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newFile = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          uri: file.uri,
        };
        setUploadedFiles([...uploadedFiles, newFile]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
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
    
    console.log('Creating bot with name:', agentName);
    
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
    
    console.log('About to add agent:', newAgent);
    await addAgent(newAgent);
    console.log('Agent added successfully, redirecting to PhoneSettings');
    
    Alert.alert('Success', 'Bot created successfully!', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/PhoneSettings')
      }
    ]);
  };

  const CustomToggle = ({ value, onValueChange, disabled = false }) => {
    return (
      <TouchableOpacity
        style={[
          styles.toggleContainer,
          value ? styles.toggleActive : styles.toggleInactive,
          disabled && styles.toggleDisabled
        ]}
        onPress={() => !disabled && onValueChange(!value)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.toggleThumb,
          value ? styles.thumbActive : styles.thumbInactive
        ]} />
      </TouchableOpacity>
    );
  };

  const InfoIcon = () => (
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>i</Text>
    </View>
  );

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
            <Text style={styles.pageTitle}>Agent Configuration</Text>
            <Text style={styles.pageSubtitle}>
              Configure your AI agent's behavior and settings
            </Text>
          </View>

          {/* Agent Name */}
          <View style={[styles.formSection, { marginTop: 10 }]}>
            <Text style={styles.fieldLabel}>
              Name of the Agent<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              value={agentName}
              onChangeText={setAgentName}
              placeholderTextColor="#999999"
            />
          </View>

          {/* Agent Greeting Message */}
          <View style={styles.formSection}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.fieldLabel}>Agent Greeting Message</Text>
              <InfoIcon />
            </View>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Enter greeting message"
              value={greetingMessage}
              onChangeText={setGreetingMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Agent Prompt */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>
              Agent Prompt<Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.promptContainer}>
              <TextInput
                style={[styles.textInput, styles.largeMultilineInput, styles.promptInput]}
                placeholder="Enter agent prompt"
                value={agentPrompt}
                onChangeText={setAgentPrompt}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#999999"
              />
                             <TouchableOpacity style={styles.botButton} onPress={() => Alert.alert('Bot Assistant', 'AI assistance available')}>
                 <Text style={styles.botIcon}>🤖</Text>
               </TouchableOpacity>
            </View>
          </View>

          {/* Upload Training Document */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Upload Training Document (Optional)</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={handleFileUpload}>
              {uploadedFiles.length === 0 ? (
                <Text style={styles.uploadText}>Drop files here to upload</Text>
              ) : (
                <View style={styles.uploadedFilesContainer}>
                  {uploadedFiles.map((file) => (
                    <View key={file.id} style={styles.fileCard}>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                        <Text style={styles.fileName}>{truncateFileName(file.name)}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeFileButton}
                        onPress={() => handleRemoveFile(file.id)}
                      >
                        <Text style={styles.removeFileIcon}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addMoreButton} onPress={handleFileUpload}>
                    <Text style={styles.addMoreText}>+ Add More Files</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Destination Country */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>
              Destination Country<Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.countryDropdown} 
              onPress={() => setShowCountryDropdown(true)}
            >
              {destinationCountry ? (
                <Text style={styles.countryDropdownText}>{destinationCountry}</Text>
              ) : (
                <Text style={styles.countryDropdownPlaceholder}>Select destination country</Text>
              )}
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            
            {/* Country Dropdown Modal */}
            <Modal
              visible={showCountryDropdown}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCountryDropdown(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.countryDropdownCard}>
                  <Text style={styles.countryDropdownTitle}>Select Country</Text>
                  <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
                    {countries.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={styles.countryItem}
                        onPress={() => {
                          setDestinationCountry(country.name);
                          setShowCountryDropdown(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{country.flag}</Text>
                        <Text style={styles.countryName}>{country.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.countryDropdownClose} 
                    onPress={() => setShowCountryDropdown(false)}
                  >
                    <Text style={styles.countryDropdownCloseText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* Analysis Options */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Analysis Options</Text>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>Enable Sentiment Detection</Text>
                <InfoIcon />
              </View>
              <CustomToggle
                value={sentimentDetection}
                onValueChange={setSentimentDetection}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>Voice Mail Detection</Text>
                <InfoIcon />
              </View>
              <CustomToggle
                value={voiceMailDetection}
                onValueChange={setVoiceMailDetection}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>Enable Call Recording</Text>
                <InfoIcon />
              </View>
              <CustomToggle
                value={callRecording}
                onValueChange={setCallRecording}
              />
            </View>
          </View>

          {/* Success Parameters */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Success Parameters</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Enter success parameters"
              value={successParameters}
              onChangeText={setSuccessParameters}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Important Data Points */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Important Data Points to Extract</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Enter data points to extract"
              value={dataPoints}
              onChangeText={setDataPoints}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
          </View>

          {/* Call Summary */}
          <View style={styles.formSection}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>Enable Call Summary</Text>
                <InfoIcon />
              </View>
              <CustomToggle
                value={callSummary}
                onValueChange={setCallSummary}
              />
            </View>

            {callSummary && (
              <View style={styles.summarySection}>
                <Text style={styles.fieldLabel}>Summary Prompt</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder="Enter summary prompt"
                  value={summaryPrompt}
                  onChangeText={setSummaryPrompt}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#999999"
                />
              </View>
            )}
          </View>

          {/* Create Bot Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateBot}>
            <Text style={styles.createButtonText}>Create Bot</Text>
          </TouchableOpacity>
        </ScrollView>
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
    // paddingTop: 20, // Commented out to remove extra spacing
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15, // Reduced from 30 to 15 to match Dashboard.js
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#FF4444',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
  },
  largeMultilineInput: {
    height: 150,
    paddingTop: 12,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadText: {
    color: '#999999',
    fontSize: 16,
  },
  uploadedFilesContainer: {
    width: '100%',
    paddingTop: 10,
  },
  fileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  fileInfo: {
    flex: 1,
    marginRight: 10,
  },
  fileSize: {
    fontSize: 12,
    color: '#666666',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  removeFileButton: {
    padding: 5,
  },
  removeFileIcon: {
    fontSize: 20,
    color: '#FF4444',
  },
  addMoreButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF9500',
    borderRadius: 8,
  },
  addMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  toggleContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#E0E0E0',
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  summarySection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  promptContainer: {
    position: 'relative',
  },
  promptInput: {
    paddingRight: 40, // Make space for the bot button
  },
  botButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  botIcon: {
    fontSize: 28,
    color: '#FF9500',
  },
  
  // Country Dropdown Styles
  countryDropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryDropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  countryDropdownPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  countryDropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  countryDropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  countryDropdownClose: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  countryDropdownCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
});

export default AgentConfigPage;