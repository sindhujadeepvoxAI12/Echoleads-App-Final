import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  Animated,
  Platform
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Upload,
  FileText,
  Clock,
  Calendar,
  User,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
  Globe,
  RefreshCw,
  Download,
  Play,
  ArrowLeft,
  ChevronDown,
  Folder,
  File,
  CheckCircle,
  X
} from 'lucide-react-native';
import { useCampaigns } from '../contexts/CampaignContext';
import { useRouter } from 'expo-router';
import { useAgents } from '../contexts/AgentContext';

const { width, height } = Dimensions.get('window');

const CampaignCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Animation values
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(50)).current;
  // const scaleAnim = useRef(new Animated.Value(0.8)).current;
  // const progressAnim = useRef(new Animated.Value(0)).current;
  // const modalScaleAnim = useRef(new Animated.Value(0)).current;
  // const successScaleAnim = useRef(new Animated.Value(0)).current;
  
  const [formData, setFormData] = useState({
    agentName: "",
    selectedAgent: null,
    contactFile: null,
    greetingMessage: "Hi, I won't take much of your time—We have serious buyers and investors looking for properties in Dubai, and we're connecting with top agents to collaborate. Could you please tell me your name?",
    campaignName: "",
    description: "",
    timezone: "",
    schedule: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "--:--", end: "--:--" },
      sunday: { enabled: false, start: "--:--", end: "--:--" }
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { agents } = useAgents();

  const steps = [
    { title: "Agent", icon: User },
    { title: "Details", icon: MessageSquare },
    { title: "Schedule", icon: Calendar },
    { title: "Review", icon: Play }
  ];

  const timezones = [
    { value: "UTC", label: "UTC - Coordinated Universal Time" },
    { value: "EST", label: "EST - Eastern Standard Time" },
    { value: "PST", label: "PST - Pacific Standard Time" },
    { value: "GMT", label: "GMT - Greenwich Mean Time" },
    { value: "IST", label: "IST - India Standard Time" },
    { value: "JST", label: "JST - Japan Standard Time" },
    { value: "CET", label: "CET - Central European Time" }
  ];

  const weekDays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const { addCampaign } = useCampaigns();
  const router = useRouter();

  useEffect(() => {
    // Animate progress bar only
    // Animated.timing(progressAnim, {
    //   toValue: (currentStep + 1) / steps.length,
    //   duration: 800,
    //   useNativeDriver: false,
    // }).start();
  }, [currentStep]);

  // Initialize animations once
  useEffect(() => {
    // fadeAnim.setValue(1);
    // slideAnim.setValue(0);
    // scaleAnim.setValue(1);
  }, []);

  const validateStep = useCallback((stepIndex) => {
    const stepErrors = {};
    
    if (stepIndex === 0) {
      if (!formData.selectedAgent) stepErrors.selectedAgent = 'Please select an agent';
      if (!formData.greetingMessage.trim()) stepErrors.greetingMessage = 'Greeting message is required';
    }
    
    if (stepIndex === 1) {
      if (!formData.campaignName.trim()) stepErrors.campaignName = 'Campaign name is required';
      if (!formData.description.trim()) stepErrors.description = 'Description is required';
    }
    
    if (stepIndex === 2) {
      if (!formData.timezone) stepErrors.timezone = 'Timezone is required';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Text input handlers with useCallback to prevent re-renders
  const handleGreetingMessageChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, greetingMessage: text }));
  }, []);

  const handleCampaignNameChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, campaignName: text }));
  }, []);

  const handleDescriptionChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handleScheduleTimeChange = useCallback((day, timeType, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [timeType]: value
        }
      }
    }));
  }, []);

  const selectAgent = (agent) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedAgent: agent,
      agentName: agent?.name || 'Unknown Agent'
    }));
    setShowAgentDropdown(false);
    setErrors(prev => ({ ...prev, selectedAgent: undefined }));
    
    // Success animation
    // Animated.sequence([
    //   Animated.timing(scaleAnim, {
    //     toValue: 1.05,
    //     duration: 150,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(scaleAnim, {
    //     toValue: 1,
    //     duration: 150,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
  };

  const selectTimezone = (timezone) => {
    setFormData(prev => ({ ...prev, timezone: timezone.value }));
    setShowTimezoneDropdown(false);
    setErrors(prev => ({ ...prev, timezone: undefined }));
  };

  const simulateFileUpload = useCallback((type, fileName) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress without interval
    const simulateProgress = () => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          setIsUploading(false);
          
          const mockFile = {
            name: fileName,
            type: type,
            size: '2.5MB'
          };
          
          setFormData(prev => ({ ...prev, contactFile: mockFile }));
          setShowFileUploadModal(false);
          
          // Show success modal
          setShowSuccessModal(true);
          // Animated.spring(successScaleAnim, {
          //   toValue: 1,
          //   tension: 50,
          //   friction: 3,
          //   useNativeDriver: true,
          // }).start();
          
          setTimeout(() => {
            setShowSuccessModal(false);
            // successScaleAnim.setValue(0);
          }, 2000);
          
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
      
      if (uploadProgress < 100) {
        setTimeout(simulateProgress, 100);
      }
    };
    
    simulateProgress();
  }, []);

  const handleFileUpload = useCallback(() => {
    setShowFileUploadModal(true);
    // Animated.spring(modalScaleAnim, {
    //   toValue: 1,
    //   tension: 50,
    //   friction: 3,
    //   useNativeDriver: true,
    // }).start();
  }, []);

  const closeFileUploadModal = useCallback(() => {
    // Animated.timing(modalScaleAnim, {
    //   toValue: 0,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start(() => {
    //   setShowFileUploadModal(false);
    // });
    setShowFileUploadModal(false);
  }, []);

  const toggleScheduleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          enabled: !prev.schedule[day].enabled,
          start: prev.schedule[day].enabled ? "--:--" : "09:00",
          end: prev.schedule[day].enabled ? "--:--" : "17:00"
        }
      }
    }));
  };

  const updateScheduleTime = (day, timeType, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [timeType]: value
        }
      }
    }));
  };

  const startCampaign = useCallback(async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Add campaign to context with dynamic date/time and status
      addCampaign({
        id: Date.now().toString(),
        name: formData.campaignName,
        status: 'In Progress',
        date: new Date().toLocaleString(),
        progress: 0,
        totalContacts: formData.contactFile ? 1 : 0, // or actual count
        completedCalls: 0,
        successRate: 0,
        assignedTo: formData.selectedAgent?.name,
        agentId: formData.selectedAgent?.id,
        description: formData.description,
        timezone: formData.timezone,
      });
      Alert.alert('Success', 'Campaign started successfully!');
      // Navigate to AgentCampaigns for this agent
      router.push({ pathname: '/AgentCampaigns', params: { agentId: formData.selectedAgent?.id } });
    }, 2000);
  }, [formData, addCampaign, router]);

  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[
              styles.progressBarFill,
              {
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              },
            ]} />
          </View>
        </View>
      
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepContent}>
                <View style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent
                ]}>
                  {isCompleted ? (
                    <Check size={14} color="white" />
                  ) : (
                    <Icon size={14} color={isCurrent ? "white" : "#9CA3AF"} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  isCurrent && styles.stepLabelCurrent,
                  isCompleted && styles.stepLabelCompleted
                ]}>
                  {step.title}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const AgentContactStep = useMemo(() => (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Agent & Contact Setup</Text>
          <Text style={styles.stepDescription}>Configure your agent and upload contact list</Text>
        </View>

        {/* Agent Selection */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Select Agent <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              errors.selectedAgent && styles.dropdownButtonError
            ]}
            onPress={() => setShowAgentDropdown(true)}
          >
            <View style={styles.dropdownContent}>
              {formData.selectedAgent ? (
                <View style={styles.selectedAgentInfo}>
                  <View style={styles.agentAvatarSmall}>
                    <Text style={styles.agentAvatarTextSmall}>
                      {formData.selectedAgent.name ? formData.selectedAgent.name.split(' ').map(n => n[0]).join('') : 'A'}
                    </Text>
                  </View>
                  <View style={styles.agentDetailsSmall}>
                    <Text style={styles.selectedAgentName}>{formData.selectedAgent.name || 'Unknown Agent'}</Text>
                    <Text style={styles.selectedAgentType}>{formData.selectedAgent.role || 'Assistant'}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select an agent</Text>
              )}
              <ChevronDown size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          {errors.selectedAgent && (
            <Text style={styles.errorText}>{errors.selectedAgent}</Text>
          )}
        </View>

        {/* File Upload */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Upload Contact List <Text style={styles.required}>*</Text>
          </Text>
          
          <TouchableOpacity
            style={[
              styles.uploadArea,
              formData.contactFile && styles.uploadAreaSuccess
            ]}
            onPress={handleFileUpload}
          >
            {formData.contactFile ? (
              <View style={styles.uploadSuccess}>
                <View style={styles.uploadIconSuccess}>
                  {formData.contactFile.type === 'folder' ? (
                    <Folder size={24} color="white" />
                  ) : (
                    <FileText size={24} color="white" />
                  )}
                </View>
                <Text style={styles.uploadSuccessText}>{formData.contactFile.name}</Text>
                <Text style={styles.uploadSuccessSubtext}>
                  {formData.contactFile.type === 'folder' ? 'Folder' : 'File'} uploaded • {formData.contactFile.size}
                </Text>
              </View>
            ) : (
              <View style={styles.uploadContent}>
                <View style={styles.uploadIcon}>
                  <Upload size={24} color="#9CA3AF" />
                </View>
                <Text style={styles.uploadText}>Tap to upload file or folder</Text>
                <Text style={styles.uploadSubtext}>XLSX, CSV files or folders supported</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting Message */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Greeting Message <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea,
              errors.greetingMessage && styles.textInputError
            ]}
            placeholder="Enter your greeting message..."
            value={formData.greetingMessage}
            onChangeText={handleGreetingMessageChange}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
          {errors.greetingMessage && (
            <Text style={styles.errorText}>{errors.greetingMessage}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  ), [formData.selectedAgent, formData.contactFile, formData.greetingMessage, errors, handleGreetingMessageChange]);

  const CampaignDetailsStep = useMemo(() => (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Campaign Details</Text>
          <Text style={styles.stepDescription}>Provide basic information about your campaign</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Campaign Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              errors.campaignName && styles.textInputError
            ]}
            placeholder="Enter campaign name"
            value={formData.campaignName}
            onChangeText={handleCampaignNameChange}
            placeholderTextColor="#9CA3AF"
          />
          {errors.campaignName && (
            <Text style={styles.errorText}>{errors.campaignName}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description && styles.textInputError
            ]}
            placeholder="Describe your campaign goals and objectives..."
            value={formData.description}
            onChangeText={handleDescriptionChange}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  ), [formData.campaignName, formData.description, errors, handleCampaignNameChange, handleDescriptionChange]);

  const ScheduleStep = useMemo(() => (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Schedule & Timezone</Text>
          <Text style={styles.stepDescription}>Set your calling schedule and timezone</Text>
        </View>

        {/* Timezone Selection */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Select Timezone <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              errors.timezone && styles.dropdownButtonError
            ]}
            onPress={() => setShowTimezoneDropdown(true)}
          >
            <View style={styles.dropdownContent}>
              <Globe size={16} color="#9CA3AF" />
              <Text style={[
                styles.dropdownText,
                !formData.timezone && styles.dropdownPlaceholder
              ]}>
                {formData.timezone || "Select timezone"}
              </Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          {errors.timezone && (
            <Text style={styles.errorText}>{errors.timezone}</Text>
          )}
        </View>

        {/* Dialer Schedule */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Weekly Schedule</Text>
          
          <View style={styles.scheduleContainer}>
            {weekDays.map(({ key, label }) => {
              const dayData = formData.schedule[key];
              
              return (
                <View key={key} style={[
                  styles.scheduleRow,
                  !dayData.enabled && styles.scheduleRowDisabled
                ]}>
                  <View style={styles.scheduleDay}>
                    <Text style={styles.scheduleDayText}>{label}</Text>
                    <TouchableOpacity
                      onPress={() => toggleScheduleDay(key)}
                      style={[
                        styles.toggleSwitch,
                        dayData.enabled && styles.toggleSwitchActive
                      ]}
                    >
                      <View style={[
                        styles.toggleThumb,
                        dayData.enabled && styles.toggleThumbActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                  
                  {dayData.enabled ? (
                    <View style={styles.timeRow}>
                      <View style={styles.timeInputWrapper}>
                        <TextInput
                          style={styles.timeInput}
                          placeholder="09:00"
                          value={dayData.start}
                          onChangeText={(text) => handleScheduleTimeChange(key, 'start', text)}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <Text style={styles.timeSeparator}>-</Text>
                      <View style={styles.timeInputWrapper}>
                        <TextInput
                          style={styles.timeInput}
                          placeholder="17:00"
                          value={dayData.end}
                          onChangeText={(text) => handleScheduleTimeChange(key, 'end', text)}
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.timeRow}>
                      <Text style={styles.offText}>Off</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  ), [formData.timezone, formData.schedule, errors, toggleScheduleDay, handleScheduleTimeChange]);

  const ReviewStep = useMemo(() => (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Review & Launch</Text>
          <Text style={styles.stepDescription}>Review your campaign settings before launching</Text>
        </View>

        {/* Campaign Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Campaign Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Agent:</Text>
              <Text style={styles.summaryValue}>{formData.selectedAgent?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Campaign:</Text>
              <Text style={styles.summaryValue}>{formData.campaignName || 'Not set'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Timezone:</Text>
              <Text style={styles.summaryValue}>{formData.timezone || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Contacts:</Text>
              <Text style={styles.summaryValue}>{formData.contactFile ? formData.contactFile.name : 'Not uploaded'}</Text>
            </View>
          </View>
        </View>

        {/* Schedule Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Schedule Summary</Text>
          <View style={styles.scheduleGrid}>
            {weekDays.map(({ key, label }) => {
              const dayData = formData.schedule[key];
              return (
                <View key={key} style={styles.scheduleSummaryItem}>
                  <Text style={styles.scheduleSummaryDay}>{label}</Text>
                  <Text style={[
                    styles.scheduleSummaryTime,
                    dayData.enabled ? styles.scheduleEnabled : styles.scheduleDisabled
                  ]}>
                    {dayData.enabled ? `${dayData.start}-${dayData.end}` : 'Off'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Launch Button */}
        <View style={styles.launchContainer}>
          <TouchableOpacity
            onPress={startCampaign}
            disabled={isLoading}
            style={[
              styles.launchButton,
              isLoading && styles.launchButtonDisabled
            ]}
          >
            {isLoading ? (
              <View style={styles.launchButtonContent}>
                <ActivityIndicator size="small" color="white" style={styles.launchLoader} />
                <Text style={styles.launchButtonText}>Launching...</Text>
              </View>
            ) : (
              <View style={styles.launchButtonContent}>
                <Play size={20} color="white" />
                <Text style={styles.launchButtonText}>Start Campaign</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  ), [formData, isLoading, startCampaign]);

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 0: return AgentContactStep;
      case 1: return CampaignDetailsStep;
      case 2: return ScheduleStep;
      case 3: return ReviewStep;
      default: return null;
    }
  }, [currentStep, AgentContactStep, CampaignDetailsStep, ScheduleStep, ReviewStep]);

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Create New Campaign</Text>
          <Text style={styles.headerSubtitle}>Step {currentStep + 1} of {steps.length}</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <View style={styles.main}>
        <View style={styles.card}>
          {renderCurrentStep()}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={prevStep}
            disabled={currentStep === 0}
            style={[
              styles.navButton,
              styles.prevButton,
              currentStep === 0 && styles.navButtonDisabled
            ]}
          >
            <ChevronLeft size={16} color={currentStep === 0 ? "#9CA3AF" : "#6B7280"} />
            <Text style={[
              styles.navButtonText,
              currentStep === 0 && styles.navButtonTextDisabled
            ]}>Previous</Text>
          </TouchableOpacity>

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              onPress={nextStep}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={16} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Agent Dropdown Modal */}
      <Modal
        visible={showAgentDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgentDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              transform: [{ scale: showAgentDropdown ? 1 : 0 }]
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Agent</Text>
              <TouchableOpacity onPress={() => setShowAgentDropdown(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={agents}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.agentItem,
                    item.status === 'inactive' && styles.agentItemInactive
                  ]}
                  onPress={() => selectAgent(item)}
                  disabled={item.status === 'inactive'}
                >
                  <View style={styles.agentItemContent}>
                    <View style={styles.agentAvatar}>
                      <Text style={styles.agentAvatarText}>
                        {item.name ? item.name.split(' ').map(n => n[0]).join('') : 'A'}
                      </Text>
                    </View>
                    <View style={styles.agentDetails}>
                      <Text style={styles.agentName}>{item.name || 'Unknown Agent'}</Text>
                      <Text style={styles.agentType}>{item.role || 'Assistant'}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'active' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
                      ]}>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Timezone Dropdown Modal */}
      <Modal
        visible={showTimezoneDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimezoneDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              transform: [{ scale: showTimezoneDropdown ? 1 : 0 }]
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity onPress={() => setShowTimezoneDropdown(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={timezones}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timezoneItem}
                  onPress={() => selectTimezone(item)}
                >
                  <Text style={styles.timezoneText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* File Upload Modal */}
      <Modal
        visible={showFileUploadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFileUploadModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.fileUploadModal,
            {
              transform: [{ scale: showFileUploadModal ? 1 : 0 }]
            }
          ]}>
            <View style={styles.fileUploadHeader}>
              <Text style={styles.fileUploadTitle}>Upload Files</Text>
              <TouchableOpacity onPress={closeFileUploadModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.fileUploadDescription}>
              Choose the type of content you want to upload
            </Text>

            {isUploading ? (
              <View style={styles.uploadProgressContainer}>
                <View style={styles.uploadProgressBar}>
                  <View style={[
                    styles.uploadProgressFill,
                    { width: `${uploadProgress}%` }
                  ]} />
                </View>
                <Text style={styles.uploadProgressText}>
                  Uploading... {Math.round(uploadProgress)}%
                </Text>
              </View>
            ) : (
              <View style={styles.fileUploadOptions}>
                <TouchableOpacity
                  style={styles.fileUploadOption}
                  onPress={() => simulateFileUpload('file', 'contacts.xlsx')}
                >
                  <View style={styles.fileUploadIcon}>
                    <FileText size={32} color="#F97316" />
                  </View>
                  <Text style={styles.fileUploadOptionTitle}>Upload File</Text>
                  <Text style={styles.fileUploadOptionDescription}>
                    Select XLSX or CSV files
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fileUploadOption}
                  onPress={() => simulateFileUpload('folder', 'contact_files/')}
                >
                  <View style={styles.fileUploadIcon}>
                    <Folder size={32} color="#F97316" />
                  </View>
                  <Text style={styles.fileUploadOptionTitle}>Upload Folder</Text>
                  <Text style={styles.fileUploadOptionDescription}>
                    Select entire folder
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={[
            styles.successModal,
            {
              transform: [{ scale: showSuccessModal ? 1 : 0 }]
            }
          ]}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Upload Successful!</Text>
            <Text style={styles.successDescription}>
              Your file has been uploaded successfully
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    // paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  stepIndicatorContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCompleted: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  stepCurrent: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  stepLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: '#FF9500',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#FF9500',
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    height: 100,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
  },
  dropdownButton: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownButtonError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
    marginLeft: 10,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  selectedAgentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentAvatarSmall: {
    width: 28,
    height: 28,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  agentAvatarTextSmall: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  agentDetailsSmall: {
    flex: 1,
  },
  selectedAgentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  selectedAgentType: {
    fontSize: 13,
    color: '#6B7280',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
  },
  uploadAreaSuccess: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF7ED',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIconSuccess: {
    width: 48,
    height: 48,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadSuccess: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  uploadSuccessText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF9500',
    marginBottom: 4,
  },
  uploadSuccessSubtext: {
    fontSize: 13,
    color: '#C2410C',
  },
  scheduleContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  scheduleRowDisabled: {
    backgroundColor: '#F1F5F9',
  },
  scheduleDay: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  scheduleDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 10,
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#FF9500',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 16 }],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeInputWrapper: {
    marginHorizontal: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#374151',
    width: 65,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#6B7280',
    fontSize: 13,
    marginHorizontal: 6,
  },
  offText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: height * 0.7,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  agentItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  agentItemInactive: {
    opacity: 0.5,
  },
  agentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  agentAvatarText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  agentType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#DC2626',
  },
  timezoneItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timezoneText: {
    fontSize: 15,
    color: '#1F2937',
  },
  fileUploadModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  fileUploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  fileUploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileUploadDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    lineHeight: 22,
  },
  uploadProgressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  uploadProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  uploadProgressText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  fileUploadOptions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  fileUploadOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  fileUploadIcon: {
    marginBottom: 12,
  },
  fileUploadOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  fileUploadOptionDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#9A3412',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '500',
    fontSize: 14,
    color: '#7C2D12',
    flex: 1,
    textAlign: 'right',
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scheduleSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
  },
  scheduleSummaryDay: {
    color: '#9A3412',
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleSummaryTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleEnabled: {
    color: '#166534',
  },
  scheduleDisabled: {
    color: '#9CA3AF',
  },
  launchContainer: {
    alignItems: 'center',
    paddingTop: 28,
  },
  launchButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  launchButtonDisabled: {
    opacity: 0.7,
  },
  launchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  launchButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  launchLoader: {
    marginRight: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prevButton: {
    backgroundColor: '#F1F5F9',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    backgroundColor: '#FF9500',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 6,
  },
});

export default CampaignCreationFlow;